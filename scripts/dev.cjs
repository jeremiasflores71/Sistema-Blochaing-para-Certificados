const {spawn}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
require('dotenv').config({quiet:true});const config=require('../backend/config.cjs');const chain=require('../backend/blockchain.cjs');const children=[];
function run(file,args=[],quiet=false){const p=spawn(process.execPath,[file,...args],{stdio:quiet?['ignore','ignore','pipe']:'inherit',windowsHide:true});children.push(p);if(quiet)p.stderr.on('data',b=>process.stderr.write(b));p.on('exit',code=>{if(code && !stopping){console.error('Proceso finalizado',file,code);stop(code);}});return p;}
let stopping=false;function stop(code=0){if(stopping)return;stopping=true;for(const c of children)c.kill();setTimeout(()=>process.exit(code),500);}
process.on('SIGINT',()=>stop());process.on('SIGTERM',()=>stop());
async function main(){
 if(config.chainId===31337){
  try{await chain.provider().getBlockNumber();throw Error('El puerto RPC ya está ocupado. Detenga la otra red antes de npm run dev.');}catch(e){if(e.message.includes('ocupado'))throw e;}
  run('node_modules/hardhat/internal/cli/cli.js',['node','--hostname','127.0.0.1'],true);
  let ready=false;for(let i=0;i<80;i++){try{await chain.provider().getBlockNumber();ready=true;break;}catch{await new Promise(r=>setTimeout(r,250));}}
  if(!ready)throw Error('Hardhat no pudo iniciar');
  const journal=path.join(config.data,'chain.jsonl');
  if(fs.existsSync(journal)){const rows=fs.readFileSync(journal,'utf8').split('\n').filter(Boolean);for(const row of rows){const tx=await chain.provider().broadcastTransaction(JSON.parse(row).raw);await tx.wait();}console.log(`Red local restaurada: ${rows.length} transacciones firmadas.`);}
 }
 await require('./deploy.cjs').deploy();
 run('backend/server.cjs');run('node_modules/vite/bin/vite.js',['--host',config.host]);
 console.log('\nSistema UMSA: http://localhost:5173\nCredenciales en .env. Ctrl+C detiene los tres procesos.');
}
main().catch(e=>{console.error(e);stop(1)});
