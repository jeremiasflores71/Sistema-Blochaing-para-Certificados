const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/environment.cjs');
const users = require('../models/user.model.cjs');
const audit = require('../models/audit.model.cjs');
async function login(body) {
  const user = users.findByEmail(body.email.toLowerCase());
  if (!user?.activo || !(await bcrypt.compare(body.password, user.password))) throw Object.assign(Error('Credenciales incorrectas'), {
    status: 401
  });
  audit.record(user.id, 'LOGIN', 'Inicio de sesión');
  return {
    token: jwt.sign({
      sub: user.id
    }, config.secret, {
      expiresIn: '1h',
      algorithm: 'HS256',
      issuer: 'umsa-api',
      audience: 'umsa-web'
    }),
    user: {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol
    }
  };
}
module.exports = {
  login
};
