const {
  Router
} = require('express');
const {
  auth,
  admin
} = require('../middleware/auth.cjs');
const {
  wrap
} = require('../middleware/errors.cjs');
const authController = require('../controllers/auth.controller.cjs');
const dashboard = require('../controllers/dashboard.controller.cjs');
const certificates = require('../controllers/certificate.controller.cjs');
const audit = require('../controllers/audit.controller.cjs');
const router = Router();
router.use(require('./public.routes.cjs'));
router.use(auth);
router.get('/me', authController.me);
router.get('/dashboard', dashboard.summary);
router.use('/students', require('./student.routes.cjs'));
router.use('/certificates', require('./certificate.routes.cjs'));
router.use('/users', require('./user.routes.cjs'));
router.post('/reconcile', admin, wrap(certificates.reconcile));
router.get('/audit', admin, audit.list);
module.exports = router;
