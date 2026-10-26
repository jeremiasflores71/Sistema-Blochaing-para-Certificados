const {
  Router
} = require('express');
const {
  rateLimit
} = require('express-rate-limit');
const {
  wrap
} = require('../middleware/errors.cjs');
const {
  upload
} = require('../middleware/upload.cjs');
const auth = require('../controllers/auth.controller.cjs');
const verification = require('../controllers/verification.controller.cjs');
const health = require('../controllers/health.controller.cjs');
const router = Router();
router.get('/health', wrap(health.health));
router.post('/auth/login', rateLimit({
  windowMs: 15 * 60000,
  limit: 30
}), wrap(auth.login));
router.get('/verify/:id', wrap(verification.byCode));
router.post('/verify/file', upload.single('file'), wrap(verification.byFile));
module.exports = router;
