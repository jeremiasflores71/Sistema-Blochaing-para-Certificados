const crypto = require('node:crypto');
const {
  db
} = require('../database/connection.cjs');
const {
  now
} = require('../utils/date.cjs');
function list(search = '') {
  const q = '%' + String(search) + '%';
  return db.prepare('SELECT * FROM estudiantes WHERE nombres LIKE ? OR apellidos LIKE ? OR documento LIKE ? ORDER BY created_at DESC').all(q, q, q);
}
function findById(id) {
  return db.prepare('SELECT * FROM estudiantes WHERE id=?').get(id);
}
function findByDocument(document) {
  return db.prepare('SELECT id FROM estudiantes WHERE documento=?').get(document);
}
function first() {
  return db.prepare('SELECT id FROM estudiantes LIMIT 1').get();
}
function count() {
  return db.prepare('SELECT count(*) AS total FROM estudiantes').get().total;
}
function create(student) {
  const id = crypto.randomUUID();
  db.prepare('INSERT INTO estudiantes VALUES(?,?,?,?,?,?,?)').run(id, student.nombres, student.apellidos, student.documento, student.carrera, student.email || null, now());
  return id;
}
function update(id, student) {
  return db.prepare('UPDATE estudiantes SET nombres=?,apellidos=?,documento=?,carrera=?,email=? WHERE id=?').run(student.nombres, student.apellidos, student.documento, student.carrera, student.email || null, id).changes;
}
module.exports = {
  list,
  findById,
  findByDocument,
  first,
  count,
  create,
  update
};
