const fs=require('node:fs');const path=require('node:path');const {ethers}=require('ethers');const chain=require('../backend/services/blockchain.service.cjs');const config=require('../backend/config/environment.cjs');
async function deploy(){
 const p=chain.provider();
 if(Number(await p.send('eth_chainId',[]))!==config.chainId)throw Error('CHAIN_ID no corresponde al RPC');
 if(chain.address() && await p.getCode(chain.address())!=='0x'){await chain.check();return chain.address();}
 if(process.env.CONTRACT_ADDRESS)throw Error('CONTRACT_ADDRESS no contiene un contrato');
 const admin=chain.wallet(true);const a=chain.artifact();const factory=new ethers.ContractFactory(a.abi,a.bytecode,admin);
 const nonce=await p.getTransactionCount(admin.address);const address=ethers.getCreateAddress({from:admin.address,nonce});
 fs.writeFileSync(path.join(config.data,'deployment.json'),JSON.stringify({address,chainId:config.chainId},null,2));
 await chain.send(admin,await factory.getDeployTransaction(chain.wallet().address));
 console.log('AcademicCertRegistry desplegado:',address);return address;
}
if(require.main===module)deploy().catch(e=>{console.error(e.message);process.exit(1)});module.exports={deploy};
