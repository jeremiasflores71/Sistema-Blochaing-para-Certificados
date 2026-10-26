const crypto=require('node:crypto');const fs=require('node:fs');const path=require('node:path');
const {db,now,audit}=require('./db.cjs');const config=require('./config.cjs');const chain=require('./blockchain.cjs');const {createPdf}=require('./pdf.cjs');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const canonical=data=>JSON.stringify(Object.fromEntries(Object.keys(data).sort().map(k=>[k,data[k]])));
const get=id=>db.prepare('SELECT * FROM certificados WHERE id=? OR codigo=?').get(id,id);
const own=(c,u)=>u.rol==='ADMIN'||c.emisor_id===u.id;
function tx(c,type,hash,state){db.prepare('INSERT INTO transacciones VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(),c.id,type,hash,state,now());}
async function issue(input,user){
 const student=db.prepare('SELECT * FROM estudiantes WHERE id=?').get(input.estudiante_id);if(!student)throw Object.assign(Error('Estudiante no encontrado'),{status:404});
 const id=crypto.randomUUID(),salt=crypto.randomBytes(16).toString('hex'),codigo='UMSA-'+id.toUpperCase();
 const data={id,codigo,nombres:student.nombres,apellidos:student.apellidos,documento:student.documento,carrera:student.carrera,tipo:input.tipo,grado:input.grado,fecha:input.fecha,institucion:input.institucion,salt};
 const hash=sha(canonical(data));
 db.prepare('INSERT INTO certificados(id,codigo,estudiante_id,emisor_id,datos,salt,hash,estado,fecha,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id,codigo,student.id,user.id,canonical(data),salt,hash,'pendiente',data.fecha,now());
 try{
  const pdf=await createPdf(data),pdfHash=sha(pdf),pdfPath=path.join(config.data,'pdf',id+'.pdf');
  fs.writeFileSync(pdfPath,pdf,{flag:'wx'});
  db.prepare('UPDATE certificados SET pdf_hash=?,pdf_path=? WHERE id=?').run(pdfHash,pdfPath,id);
  const hashTx=await chain.mutate('issue',['0x'+hash,'0x'+pdfHash],h=>{db.prepare('UPDATE certificados SET tx_hash=? WHERE id=?').run(h,id);tx({id},'emision',h,'enviada');});
  db.prepare("UPDATE certificados SET estado='emitido',tx_hash=?,error=NULL WHERE id=?").run(hashTx,id);
  db.prepare("UPDATE transacciones SET estado='confirmada' WHERE hash=?").run(hashTx);
  audit(user.id,'EMISION',codigo);return get(id);
 }catch(e){db.prepare("UPDATE certificados SET estado='error',error=? WHERE id=?").run('No se completó la emisión. Consultar recuperación.',id);audit(user.id,'ERROR_EMISION',codigo);throw Object.assign(Error('No se completó la emisión. El registro permanece en error para reconciliarlo con la cadena.'),{status:503,cause:e});}
}
async function verify(id,fileHash){
 const c=get(id);if(!c)return {estado:'NO_ENCONTRADO'};
 const data=JSON.parse(c.datos);
 if(sha(canonical(data))!==c.hash)return {estado:'MODIFICADO'};
 const on=await chain.contract().verify('0x'+c.hash);
 if(!on.exists)return {estado:'NO_ENCONTRADO'};
 if(!c.pdf_hash||on.pdfHash.toLowerCase()!=='0x'+c.pdf_hash || (fileHash && '0x'+fileHash!==on.pdfHash.toLowerCase()))return {estado:'MODIFICADO'};
 if(c.estado!=='emitido' && c.estado!=='revocado')return {estado:'PENDIENTE'};
 return {estado:on.revoked?'REVOCADO':'VALIDO',certificado:{codigo:c.codigo,titular:`${data.nombres} ${data.apellidos}`,carrera:data.carrera,tipo:data.tipo,grado:data.grado,fecha:data.fecha,institucion:data.institucion},blockchain:{contrato:chain.address(),red:config.chainId,hash:c.hash,pdfHash:c.pdf_hash,transaccion:c.tx_hash}};
}
async function revoke(c,motivo,user){
 if(!own(c,user))throw Object.assign(Error('No puede revocar certificados de otro emisor'),{status:403});
 if(c.estado!=='emitido')throw Object.assign(Error('Solo se revocan certificados emitidos'),{status:409});
 db.prepare('UPDATE certificados SET motivo=? WHERE id=?').run(motivo,c.id);
 const h=await chain.mutate('revoke',['0x'+c.hash],h=>{db.prepare('UPDATE certificados SET revoke_tx=? WHERE id=?').run(h,c.id);tx(c,'revocacion',h,'enviada');});
 db.prepare("UPDATE certificados SET estado='revocado',revoke_tx=?,revoked_at=? WHERE id=?").run(h,now(),c.id);
 db.prepare("UPDATE transacciones SET estado='confirmada' WHERE hash=?").run(h);audit(user.id,'REVOCACION',`${c.codigo}: ${motivo}`);return get(c.id);
}
async function reconcile(){
 await chain.check();
 for(const c of db.prepare('SELECT * FROM certificados WHERE tx_hash IS NOT NULL').all()){
  const on=await chain.contract().verify('0x'+c.hash);
  if(!on.exists)continue;
  if(!c.pdf_path||!fs.existsSync(c.pdf_path)||'0x'+sha(fs.readFileSync(c.pdf_path))!==on.pdfHash.toLowerCase())continue;
  db.prepare('UPDATE certificados SET estado=?,error=NULL,revoked_at=? WHERE id=?').run(on.revoked?'revocado':'emitido',on.revoked?(c.revoked_at||now()):null,c.id);
  db.prepare("UPDATE transacciones SET estado='confirmada' WHERE certificado_id=?").run(c.id);
 }
}
module.exports={sha,canonical,get,own,issue,verify,revoke,reconcile};
