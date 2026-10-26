const crypto = require('node:crypto');
const {
  db
} = require('../database/connection.cjs');
const {
  now
} = require('../utils/date.cjs');
function findByEmail(email) {
  return db.prepare('SELECT * FROM usuarios WHERE email=?').get(email);
}
function findSessionUser(id) {
  return db.prepare('SELECT id,nombre,email,rol,activo FROM usuarios WHERE id=?').get(id);
}
function list() {
  return db.prepare('SELECT id,nombre,email,rol,activo,created_at FROM usuarios ORDER BY created_at DESC').all();
}
function create(user) {
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO usuarios VALUES(?,?,?,?,?,?,?)').run(id, user.nombre, user.email, user.password, user.rol, 1, now());
  return id;
}
function setActive(id, active) {
  return db.prepare('UPDATE usuarios SET activo=? WHERE id=?').run(active ? 1 : 0, id).changes;
}
module.exports = {
  findByEmail,
  findSessionUser,
  list,
  create,
  setActive
};
