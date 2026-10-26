const {
  ethers
} = require('ethers');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../config/environment.cjs');
const artifact = () => require('../../artifacts/contracts/AcademicCertRegistry.sol/AcademicCertRegistry.json');
// Cuentas públicas de Hardhat: exclusivamente para la red local 31337.
const localKeys = ['0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d'];
let rpcProvider;
function provider() {
  return rpcProvider ||= new ethers.JsonRpcProvider(config.rpc, {
    chainId: config.chainId,
    name: 'academic-network'
  }, {
    cacheTimeout: -1,
    staticNetwork: true
  });
}
function wallet(admin = false) {
  const key = process.env[admin ? 'ADMIN_PRIVATE_KEY' : 'PRIVATE_KEY'] || (config.chainId === 31337 && /^http:\/\/(127\.0\.0\.1|localhost):/.test(config.rpc) ? localKeys[admin ? 0 : 1] : null);
  if (!key) throw Error('Falta clave privada de la wallet de pruebas.');
  return new ethers.Wallet(key, provider());
}
function address() {
  const f = path.join(config.data, 'deployment.json');
  return process.env.CONTRACT_ADDRESS || (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f)).address : null);
}
function contract(signer) {
  const a = address();
  if (!a) throw Error('Contrato no desplegado. Ejecute npm run dev.');
  return new ethers.Contract(a, artifact().abi, signer || provider());
}
async function check() {
  const p = provider();
  if (Number(await p.send('eth_chainId', [])) !== config.chainId) throw Error('Red Blockchain incorrecta');
  const a = address();
  if (!a || (await p.getCode(a)) === '0x') throw Error('Contrato no disponible');
  return {
    chainId: config.chainId,
    address: a,
    block: await p.getBlockNumber()
  };
}
let queue = Promise.resolve();
function serial(fn) {
  const result = queue.then(fn);
  queue = result.catch(() => {});
  return result;
}
async function send(signer, request, onSent) {
  const tx = await signer.populateTransaction(request);
  const raw = await signer.signTransaction(tx);
  // Journal de transacciones firmadas: restaura la red local, no simula Blockchain.
  if (config.chainId === 31337) fs.appendFileSync(path.join(config.data, 'chain.jsonl'), JSON.stringify({
    raw
  }) + '\n');
  if (onSent) onSent(ethers.keccak256(raw));
  const pending = await signer.provider.broadcastTransaction(raw);
  const receipt = await pending.wait();
  if (!receipt || receipt.status !== 1) throw Error('Transacción rechazada');
  return receipt.hash;
}
async function mutate(method, args, onSent) {
  return serial(async () => {
    await check();
    const w = wallet();
    const req = await contract(w)[method].populateTransaction(...args);
    return send(w, req, onSent);
  });
}
module.exports = {
  provider,
  wallet,
  address,
  artifact,
  contract,
  check,
  send,
  serial,
  mutate
};
