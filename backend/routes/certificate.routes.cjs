const {
  Router
} = require('express');
const {
  wrap
} = require('../middleware/errors.cjs');
const {
  upload
} = require('../middleware/upload.cjs');
const certificates = require('../controllers/certificate.controller.cjs');
const router = Router();
router.get('/', certificates.list);
router.post('/', wrap(certificates.create));
router.post('/batch', upload.single('file'), wrap(certificates.batch));
router.get('/:id', certificates.detail);
router.get('/:id/pdf', wrap(certificates.download));
router.post('/:id/revoke', wrap(certificates.revoke));
module.exports = router;
