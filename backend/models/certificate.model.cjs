const {
  db
} = require('../database/connection.cjs');
const {
  now
} = require('../utils/date.cjs');
function find(id) {
  return db.prepare('SELECT * FROM certificados WHERE id=? OR codigo=?').get(id, id);
}
function scope(user) {
  return user.rol === 'ADMIN' ? {
    clause: '',
    args: []
  } : {
    clause: ' WHERE emisor_id=?',
    args: [user.id]
  };
}
function list(user) {
  const {
    clause,
    args
  } = scope(user);
  return db.prepare('SELECT * FROM certificados' + clause + ' ORDER BY created_at DESC').all(...args);
}
function dashboard(user) {
  const {
    clause,
    args
  } = scope(user);
  return {
    counts: db.prepare('SELECT estado,count(*) AS total FROM certificados' + clause + ' GROUP BY estado').all(...args),
    recent: db.prepare('SELECT * FROM certificados' + clause + ' ORDER BY created_at DESC LIMIT 5').all(...args)
  };
}
function createPending(c) {
  db.prepare('INSERT INTO certificados(id,codigo,estudiante_id,emisor_id,datos,salt,hash,estado,fecha,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run(c.id, c.codigo, c.estudiante_id, c.emisor_id, c.datos, c.salt, c.hash, 'pendiente', c.fecha, now());
}
function setPdf(id, hash, file) {
  db.prepare('UPDATE certificados SET pdf_hash=?,pdf_path=? WHERE id=?').run(hash, file, id);
}
function setIssueTransaction(id, hash) {
  db.prepare('UPDATE certificados SET tx_hash=? WHERE id=?').run(hash, id);
}
function markIssued(id, hash) {
  db.prepare("UPDATE certificados SET estado='emitido',tx_hash=?,error=NULL WHERE id=?").run(hash, id);
}
function markError(id, message) {
  db.prepare("UPDATE certificados SET estado='error',error=? WHERE id=?").run(message, id);
}
function setReason(id, reason) {
  db.prepare('UPDATE certificados SET motivo=? WHERE id=?').run(reason, id);
}
function setRevokeTransaction(id, hash) {
  db.prepare('UPDATE certificados SET revoke_tx=? WHERE id=?').run(hash, id);
}
function markRevoked(id, hash) {
  db.prepare("UPDATE certificados SET estado='revocado',revoke_tx=?,revoked_at=? WHERE id=?").run(hash, now(), id);
}
function submitted() {
  return db.prepare('SELECT * FROM certificados WHERE tx_hash IS NOT NULL').all();
}
function recover(c, revoked) {
  db.prepare('UPDATE certificados SET estado=?,error=NULL,revoked_at=? WHERE id=?').run(revoked ? 'revocado' : 'emitido', revoked ? c.revoked_at || now() : null, c.id);
}
module.exports = {
  find,
  list,
  dashboard,
  createPending,
  setPdf,
  setIssueTransaction,
  markIssued,
  markError,
  setReason,
  setRevokeTransaction,
  markRevoked,
  submitted,
  recover
};
