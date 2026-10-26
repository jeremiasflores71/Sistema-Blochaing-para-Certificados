const bcrypt = require('bcryptjs');
const users = require('../models/user.model.cjs');
const audit = require('../models/audit.model.cjs');
const {
  userSchema,
  activeSchema
} = require('../validators/schemas.cjs');
function list(req, res) {
  res.json(users.list());
}
async function create(req, res) {
  const user = userSchema.parse(req.body);
  const id = users.create({
    ...user,
    password: await bcrypt.hash(user.password, 12)
  });
  audit.record(req.user.id, 'ALTA_USUARIO', user.email);
  res.status(201).json({
    id
  });
}
function update(req, res) {
  const {
    activo
  } = activeSchema.parse(req.body);
  if (req.params.id === req.user.id) return res.status(400).json({
    error: 'No puede desactivar su propia cuenta'
  });
  if (!users.setActive(req.params.id, activo)) return res.sendStatus(404);
  audit.record(req.user.id, 'ESTADO_USUARIO', `${req.params.id}: ${activo}`);
  res.json({
    ok: true
  });
}
module.exports = {
  list,
  create,
  update
};
