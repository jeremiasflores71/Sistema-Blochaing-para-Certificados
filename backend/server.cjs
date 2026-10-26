const express=require('express');const helmet=require('helmet');const {rateLimit}=require('express-rate-limit');const jwt=require('jsonwebtoken');const bcrypt=require('bcryptjs');const crypto=require('node:crypto');const multer=require('multer');const {z}=require('zod');const {PDFDocument}=require('pdf-lib');const {parse}=require('csv-parse/sync');
const config=require('./config.cjs');const {db,seed,now,audit}=require('./db.cjs');const cert=require('./certificates.cjs');const chain=require('./blockchain.cjs');
if(!config.secret||config.secret.length<32)throw Error('JWT_SECRET debe tener al menos 32 caracteres. Ejecute npm run setup.');
seed();const app=express();app.disable('x-powered-by');app.use(helmet());app.use(express.json({limit:'100kb'}));
app.use('/api',rateLimit({windowMs:60000,limit:300}));
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:10*1024*1024,files:1}});
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const text=z.string().trim().min(2).max(150).regex(/^[\u0020-\u007e\u00a0-\u00ff]+$/,'Use caracteres latinos sin saltos de línea');
const studentSchema=z.object({nombres:text,apellidos:text,documento:z.string().trim().min(3).max(40).transform(v=>v.toUpperCase()),carrera:text,email:z.union([z.email(),z.literal('')]).optional()});
const issueSchema=z.object({estudiante_id:z.uuid(),tipo:text,grado:text,fecha:z.iso.date(),institucion:text});
function auth(req,res,next){try{const token=(req.headers.authorization||'').replace(/^Bearer /,'');const p=jwt.verify(token,config.secret,{algorithms:['HS256'],issuer:'umsa-api',audience:'umsa-web'});req.user=db.prepare('SELECT id,nombre,email,rol,activo FROM usuarios WHERE id=?').get(p.sub);if(!req.user?.activo)throw Error();next();}catch{res.status(401).json({error:'Sesión inválida o expirada. Inicie sesión.'});}}
function admin(req,res,next){if(req.user.rol!=='ADMIN')return res.status(403).json({error:'Acceso reservado al administrador'});next();}
app.get('/api/health',wrap(async(req,res)=>{try{res.json({api:true,database:true,blockchain:await chain.check()});}catch{res.status(503).json({api:true,database:true,error:'Blockchain no disponible'});}}));
app.post('/api/auth/login',rateLimit({windowMs:15*60000,limit:30}),wrap(async(req,res)=>{
 const body=z.object({email:z.email(),password:z.string().min(1).max(200)}).parse(req.body);const user=db.prepare('SELECT * FROM usuarios WHERE email=?').get(body.email.toLowerCase());
 if(!user?.activo || !await bcrypt.compare(body.password,user.password))return res.status(401).json({error:'Credenciales incorrectas'});
 audit(user.id,'LOGIN','Inicio de sesión');res.json({token:jwt.sign({sub:user.id},config.secret,{expiresIn:'1h',algorithm:'HS256',issuer:'umsa-api',audience:'umsa-web'}),user:{id:user.id,nombre:user.nombre,email:user.email,rol:user.rol}});
}));
app.get('/api/verify/:id',wrap(async(req,res)=>{try{await chain.check();res.json(await cert.verify(req.params.id));}catch{res.status(503).json({estado:'ERROR_BLOCKCHAIN',error:'No se pudo consultar Blockchain. No es posible confirmar la validez.'});}}));
app.post('/api/verify/file',upload.single('file'),wrap(async(req,res)=>{
 if(!req.file)return res.status(400).json({error:'Seleccione un archivo PDF'});
 let id;try{const doc=await PDFDocument.load(req.file.buffer);id=doc.getSubject();}catch{return res.json({estado:'MODIFICADO'});}
 if(!id)return res.json({estado:'MODIFICADO'});
 const c=cert.get(id);if(!c)return res.json({estado:'NO_ENCONTRADO'});
 try{await chain.check();res.json(await cert.verify(id,cert.sha(req.file.buffer)));}catch{res.status(503).json({estado:'ERROR_BLOCKCHAIN'});}
}));
app.use('/api',auth);
app.get('/api/me',(req,res)=>res.json(req.user));
app.get('/api/students',(req,res)=>{const q='%'+String(req.query.q||'')+'%';res.json(db.prepare('SELECT * FROM estudiantes WHERE nombres LIKE ? OR apellidos LIKE ? OR documento LIKE ? ORDER BY created_at DESC').all(q,q,q));});
app.post('/api/students',(req,res)=>{const s=studentSchema.parse(req.body),id=crypto.randomUUID();db.prepare('INSERT INTO estudiantes VALUES(?,?,?,?,?,?,?)').run(id,s.nombres,s.apellidos,s.documento,s.carrera,s.email||null,now());audit(req.user.id,'ALTA_ESTUDIANTE',id);res.status(201).json({id,...s});});
app.put('/api/students/:id',(req,res)=>{const s=studentSchema.parse(req.body);const r=db.prepare('UPDATE estudiantes SET nombres=?,apellidos=?,documento=?,carrera=?,email=? WHERE id=?').run(s.nombres,s.apellidos,s.documento,s.carrera,s.email||null,req.params.id);if(!r.changes)return res.status(404).json({error:'Estudiante no encontrado'});audit(req.user.id,'EDICION_ESTUDIANTE',req.params.id);res.json({id:req.params.id,...s});});
app.get('/api/dashboard',(req,res)=>{const clause=req.user.rol==='ADMIN'?'':' WHERE emisor_id=?';const args=req.user.rol==='ADMIN'?[]:[req.user.id];res.json({counts:db.prepare('SELECT estado,count(*) AS total FROM certificados'+clause+' GROUP BY estado').all(...args),students:db.prepare('SELECT count(*) AS total FROM estudiantes').get().total,recent:db.prepare('SELECT * FROM certificados'+clause+' ORDER BY created_at DESC LIMIT 5').all(...args)});});
app.get('/api/certificates',(req,res)=>{const clause=req.user.rol==='ADMIN'?'':' WHERE emisor_id=?';res.json(db.prepare('SELECT * FROM certificados'+clause+' ORDER BY created_at DESC').all(...(req.user.rol==='ADMIN'?[]:[req.user.id])));});
app.post('/api/certificates',wrap(async(req,res)=>res.status(201).json(await cert.issue(issueSchema.parse(req.body),req.user))));
app.post('/api/certificates/batch',upload.single('file'),wrap(async(req,res)=>{
 if(!req.file)return res.status(400).json({error:'Seleccione CSV'});
 const rows=parse(req.file.buffer,{columns:true,skip_empty_lines:true,bom:true,trim:true});if(rows.length>30)return res.status(400).json({error:'Máximo 30 filas por lote'});
 const results=[];for(const [i,row] of rows.entries()){try{const s=db.prepare('SELECT id FROM estudiantes WHERE documento=?').get(String(row.documento).toUpperCase());const c=await cert.issue(issueSchema.parse({...row,estudiante_id:s?.id}),req.user);results.push({fila:i+2,id:c.id,estado:c.estado});}catch(e){results.push({fila:i+2,estado:'error',error:e.message});}}
 res.json(results);
}));
app.get('/api/certificates/:id',(req,res)=>{const c=cert.get(req.params.id);if(!c)return res.status(404).json({error:'Certificado no encontrado'});if(!cert.own(c,req.user))return res.status(403).json({error:'Acceso denegado'});res.json({...c,transacciones:db.prepare('SELECT * FROM transacciones WHERE certificado_id=?').all(c.id)});});
app.get('/api/certificates/:id/pdf',wrap(async(req,res)=>{const c=cert.get(req.params.id);if(!c)return res.sendStatus(404);if(!cert.own(c,req.user))return res.sendStatus(403);if(!['emitido','revocado'].includes(c.estado))return res.status(409).json({error:'Emisión incompleta'});const result=await cert.verify(c.id);if(!['VALIDO','REVOCADO'].includes(result.estado))return res.status(409).json({error:'Documento no confirmado en Blockchain'});const fs=require('node:fs');if(!c.pdf_path||!fs.existsSync(c.pdf_path)||cert.sha(fs.readFileSync(c.pdf_path))!==c.pdf_hash)return res.status(409).json({error:'Archivo local no coincide con el hash registrado'});res.download(c.pdf_path,c.codigo+'.pdf');}));
app.post('/api/certificates/:id/revoke',wrap(async(req,res)=>{const c=cert.get(req.params.id);if(!c)return res.sendStatus(404);const {motivo}=z.object({motivo:text.min(5).max(150)}).parse(req.body);res.json(await cert.revoke(c,motivo,req.user));}));
app.post('/api/reconcile',admin,wrap(async(req,res)=>{await cert.reconcile();audit(req.user.id,'RECONCILIACION','Estados contrastados con Blockchain');res.json({ok:true});}));
app.get('/api/users',admin,(req,res)=>res.json(db.prepare('SELECT id,nombre,email,rol,activo,created_at FROM usuarios ORDER BY created_at DESC').all()));
app.post('/api/users',admin,wrap(async(req,res)=>{const s=z.object({nombre:text,email:z.email().transform(v=>v.toLowerCase()),password:z.string().min(10).max(100),rol:z.enum(['ADMIN','EMISOR'])}).parse(req.body);const id=crypto.randomUUID();db.prepare('INSERT INTO usuarios VALUES(?,?,?,?,?,?,?)').run(id,s.nombre,s.email,await bcrypt.hash(s.password,12),s.rol,1,now());audit(req.user.id,'ALTA_USUARIO',s.email);res.status(201).json({id});}));
app.patch('/api/users/:id',admin,(req,res)=>{const {activo}=z.object({activo:z.boolean()}).parse(req.body);if(req.params.id===req.user.id)return res.status(400).json({error:'No puede desactivar su propia cuenta'});const r=db.prepare('UPDATE usuarios SET activo=? WHERE id=?').run(activo?1:0,req.params.id);if(!r.changes)return res.sendStatus(404);audit(req.user.id,'ESTADO_USUARIO',`${req.params.id}: ${activo}`);res.json({ok:true});});
app.get('/api/audit',admin,(req,res)=>res.json(db.prepare('SELECT b.*,u.nombre AS usuario FROM bitacora b LEFT JOIN usuarios u ON u.id=b.usuario_id ORDER BY b.created_at DESC LIMIT 500').all()));
app.use('/api',(req,res)=>res.status(404).json({error:'Ruta no encontrada'}));
app.use((err,req,res,next)=>{if(err instanceof z.ZodError)return res.status(400).json({error:err.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')});if(err.code==='LIMIT_FILE_SIZE')return res.status(413).json({error:'Archivo demasiado grande (máximo 10 MB)'});if(String(err.message).includes('UNIQUE constraint'))return res.status(409).json({error:'El documento o correo ya está registrado'});console.error(err.message);res.status(err.status||500).json({error:err.status?err.message:'No se pudo completar la operación. Revise la conexión y los datos.'});});
if(require.main===module){app.listen(config.port,'127.0.0.1',()=>console.log(`API en http://localhost:${config.port}`));cert.reconcile().catch(e=>console.error('Reconciliación al iniciar:',e.message));}
module.exports={app};
