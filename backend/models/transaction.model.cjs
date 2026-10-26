const crypto = require('node:crypto');
const {
  db
} = require('../database/connection.cjs');
const {
  now
} = require('../utils/date.cjs');
function create(certificateId, type, hash, state) {
  db.prepare('INSERT INTO transacciones VALUES(?,?,?,?,?,?)').run(crypto.randomUUID(), certificateId, type, hash, state, now());
}
function confirm(hash) {
  db.prepare("UPDATE transacciones SET estado='confirmada' WHERE hash=?").run(hash);
}
function confirmForCertificate(id) {
  db.prepare("UPDATE transacciones SET estado='confirmada' WHERE certificado_id=?").run(id);
}
function listForCertificate(id) {
  return db.prepare('SELECT * FROM transacciones WHERE certificado_id=?').all(id);
}
module.exports = {
  create,
  confirm,
  confirmForCertificate,
  listForCertificate
};
