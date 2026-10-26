const {
  Router
} = require('express');
const students = require('../controllers/student.controller.cjs');
const router = Router();
router.get('/', students.list);
router.post('/', students.create);
router.put('/:id', students.update);
module.exports = router;
