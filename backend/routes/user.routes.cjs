const {
  Router
} = require('express');
const {
  admin
} = require('../middleware/auth.cjs');
const {
  wrap
} = require('../middleware/errors.cjs');
const users = require('../controllers/user.controller.cjs');
const router = Router();
router.use(admin);
router.get('/', users.list);
router.post('/', wrap(users.create));
router.patch('/:id', users.update);
module.exports = router;
