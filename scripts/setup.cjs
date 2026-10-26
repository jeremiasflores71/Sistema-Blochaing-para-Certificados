const fs=require('node:fs');const crypto=require('node:crypto');const {spawnSync}=require('node:child_process');
if(!fs.existsSync('.env')){
 let env=fs.readFileSync('.env.example','utf8').replace('JWT_SECRET=','JWT_SECRET='+crypto.randomBytes(48).toString('hex')).replace('ADMIN_PASSWORD=','ADMIN_PASSWORD='+crypto.randomBytes(12).toString('base64url')).replace('ISSUER_PASSWORD=','ISSUER_PASSWORD='+crypto.randomBytes(12).toString('base64url'));
 fs.writeFileSync('.env',env);console.log('Configuración privada .env creada.');
}
require('dotenv').config({quiet:true});
require('../backend/db.cjs').seed();
fs.mkdirSync('runtime',{recursive:true});
fs.writeFileSync('runtime/ACCESO_LOCAL.md',`# Acceso local de demostración\n\nURL: http://localhost:5173\n\n| Rol | Correo | Contraseña inicial |\n| --- | --- | --- |\n| Administrador | admin@umsa.local | ${process.env.ADMIN_PASSWORD} |\n| Emisor | emisor@umsa.local | ${process.env.ISSUER_PASSWORD} |\n\nEstas credenciales se generaron para este prototipo local. No publicar este archivo ni .env.\n`);
const r=spawnSync(process.execPath,['node_modules/hardhat/internal/cli/cli.js','compile'],{stdio:'inherit'});if(r.status)process.exit(r.status);
console.log('Preparado. Credenciales locales en .env: ADMIN_PASSWORD e ISSUER_PASSWORD.');
