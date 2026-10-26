const students = require('../models/student.model.cjs');
const audit = require('../models/audit.model.cjs');
const {
  studentSchema
} = require('../validators/schemas.cjs');
function list(req, res) {
  res.json(students.list(req.query.q));
}
function create(req, res) {
  const student = studentSchema.parse(req.body);
  const id = students.create(student);
  audit.record(req.user.id, 'ALTA_ESTUDIANTE', id);
  res.status(201).json({
    id,
    ...student
  });
}
function update(req, res) {
  const student = studentSchema.parse(req.body);
  if (!students.update(req.params.id, student)) return res.status(404).json({
    error: 'Estudiante no encontrado'
  });
  audit.record(req.user.id, 'EDICION_ESTUDIANTE', req.params.id);
  res.json({
    id: req.params.id,
    ...student
  });
}
module.exports = {
  list,
  create,
  update
};
