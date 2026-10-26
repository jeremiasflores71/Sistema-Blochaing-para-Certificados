const {PDFDocument,StandardFonts,rgb}=require('pdf-lib');
const QRCode=require('qrcode');
const config=require('./config.cjs');
async function createPdf(data){
 const doc=await PDFDocument.create();doc.setTitle(`Certificado ${data.codigo}`);doc.setSubject(data.id);doc.setKeywords(['UMSA',data.id]);
 const page=doc.addPage([842,595]);const font=await doc.embedFont(StandardFonts.Helvetica);const bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const navy=rgb(.06,.16,.30),gold=rgb(.67,.51,.25);
 page.drawRectangle({x:22,y:22,width:798,height:551,borderWidth:2,borderColor:gold});
 page.drawRectangle({x:34,y:34,width:774,height:527,borderWidth:1,borderColor:navy});
 function center(text,y,size=14,face=font,color=navy){size=Math.min(size,690/face.widthOfTextAtSize(text,1));const width=face.widthOfTextAtSize(text,size);page.drawText(text,{x:(842-width)/2,y,size,font:face,color});}
 center('UNIVERSIDAD MAYOR DE SAN ANDRÉS',510,23,bold);center('FACULTAD DE CIENCIAS PURAS Y NATURALES · CARRERA DE INFORMÁTICA',483,10);
 center('CERTIFICADO ACADÉMICO',423,28,bold);center(data.tipo,390,16);center('Se certifica que',350,12);
 const name=`${data.nombres} ${data.apellidos}`;center(name,309,Math.min(26,680/bold.widthOfTextAtSize(name,1)),bold);
 center(data.grado,269,Math.min(16,680/font.widthOfTextAtSize(data.grado,1)));center(`Carrera: ${data.carrera}`,240,12);
 center(`Institución: ${data.institucion}`,217,11);center(`Fecha de emisión: ${data.fecha}`,194,11);
 const url=`${config.publicUrl}/verificar/${data.codigo}`;
 const qr=await doc.embedPng(await QRCode.toBuffer(url,{width:200,margin:1,errorCorrectionLevel:'M'}));page.drawImage(qr,{x:670,y:64,width:100,height:100});
 page.drawText(`Código: ${data.codigo}`,{x:65,y:143,size:11,font:bold,color:navy});
 page.drawText('Documento verificable digitalmente mediante el código QR.',{x:65,y:122,size:10,font,color:navy});
 page.drawText('Prototipo académico - Sin validez oficial',{x:65,y:82,size:12,font:bold,color:gold});
 return Buffer.from(await doc.save());
}
module.exports={createPdf};
