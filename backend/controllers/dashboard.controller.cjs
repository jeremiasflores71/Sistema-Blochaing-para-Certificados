const certificates = require('../models/certificate.model.cjs');
const students = require('../models/student.model.cjs');
function summary(req, res) {
  const {
    counts,
    recent
  } = certificates.dashboard(req.user);
  res.json({
    counts,
    students: students.count(),
    recent
  });
}
module.exports = {
  summary
};
