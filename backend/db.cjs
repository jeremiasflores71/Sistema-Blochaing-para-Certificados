const {DatabaseSync} = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const config = require('./config.cjs');
const db = new DatabaseSync(path.join(config.data,'academic.sqlite'));
db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
db.exec(fs.readFileSync(path.join(__dirname,'migrations/001.sql'),'utf8'));
const now=()=>new Date().toISOString();
const audit=(user,action,detail)=>db.prepare('INSERT INTO bitacora VALUES(?,?,?,?,?)').run(crypto.randomUUID(),user,action,detail,now());
function seed(){
 for(const [email,nombre,rol,password] of [['admin@umsa.local','Administrador UMSA','ADMIN',process.env.ADMIN_PASSWORD],['emisor@umsa.local','Registro académico','EMISOR',process.env.ISSUER_PASSWORD]]) {
  if(!db.prepare('SELECT id FROM usuarios WHERE email=?').get(email)) {
   if(!password) throw Error('Ejecute npm run setup para generar las credenciales.');
   db.prepare('INSERT INTO usuarios VALUES(?,?,?,?,?,?,?)').run(crypto.randomUUID(),nombre,email,bcrypt.hashSync(password,12),rol,1,now());
  }
 }
 if(!db.prepare('SELECT id FROM estudiantes LIMIT 1').get()) db.prepare('INSERT INTO estudiantes VALUES(?,?,?,?,?,?,?)').run(crypto.randomUUID(),'Ana Lucía','Quispe Mamani','DEMO-1001','Informática','ana@example.test',now());
}
module.exports={db,now,audit,seed};
