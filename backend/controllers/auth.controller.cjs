const auth = require('../services/auth.service.cjs');
const {
  loginSchema
} = require('../validators/schemas.cjs');
async function login(req, res) {
  res.json(await auth.login(loginSchema.parse(req.body)));
}
function me(req, res) {
  res.json(req.user);
}
module.exports = {
  login,
  me
};
