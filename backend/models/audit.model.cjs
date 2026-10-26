const crypto = require('node:crypto');
const {
  db
} = require('../database/connection.cjs');
const {
  now
} = require('../utils/date.cjs');
function record(user, action, detail) {
  db.prepare('INSERT INTO bitacora VALUES(?,?,?,?,?)').run(crypto.randomUUID(), user, action, detail, now());
}
function list() {
  return db.prepare('SELECT b.*,u.nombre AS usuario FROM bitacora b LEFT JOIN usuarios u ON u.id=b.usuario_id ORDER BY b.created_at DESC LIMIT 500').all();
}
module.exports = {
  record,
  list
};
