const audit = require('../models/audit.model.cjs');
function list(req, res) {
  res.json(audit.list());
}
module.exports = {
  list
};
