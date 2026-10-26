const jwt = require('jsonwebtoken');
const config = require('../config/environment.cjs');
const users = require('../models/user.model.cjs');
function auth(req, res, next) {
  try {
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    const payload = jwt.verify(token, config.secret, {
      algorithms: ['HS256'],
      issuer: 'umsa-api',
      audience: 'umsa-web'
    });
    req.user = users.findSessionUser(payload.sub);
    if (!req.user?.activo) throw Error();
    next();
  } catch {
    res.status(401).json({
      error: 'Sesión inválida o expirada. Inicie sesión.'
    });
  }
}
function admin(req, res, next) {
  if (req.user.rol !== 'ADMIN') return res.status(403).json({
    error: 'Acceso reservado al administrador'
  });
  next();
}
module.exports = {
  auth,
  admin
};
