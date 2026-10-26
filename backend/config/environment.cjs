require('dotenv').config({
  quiet: true
});
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '../..');
const data = path.resolve(process.env.DATA_DIR || path.join(root, 'runtime'));
fs.mkdirSync(path.join(data, 'pdf'), {
  recursive: true
});
module.exports = {
  root,
  data,
  host: process.env.HOST || '127.0.0.1',
  port: Number(process.env.PORT || 3001),
  publicUrl: process.env.PUBLIC_URL || 'http://localhost:5173',
  rpc: process.env.RPC_URL || 'http://127.0.0.1:8545',
  chainId: Number(process.env.CHAIN_ID || 31337),
  secret: process.env.JWT_SECRET
};
