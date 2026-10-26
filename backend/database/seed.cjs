const bcrypt = require('bcryptjs');
const users = require('../models/user.model.cjs');
const students = require('../models/student.model.cjs');
function seed() {
  for (const [email, nombre, rol, password] of [['admin@umsa.local', 'Administrador UMSA', 'ADMIN', process.env.ADMIN_PASSWORD], ['emisor@umsa.local', 'Registro académico', 'EMISOR', process.env.ISSUER_PASSWORD]]) {
    if (!users.findByEmail(email)) {
      if (!password) throw Error('Ejecute npm run setup para generar las credenciales.');
      users.create({
        email,
        nombre,
        rol,
        password: bcrypt.hashSync(password, 12)
      });
    }
  }
  if (!students.first()) students.create({
    nombres: 'Ana Lucía',
    apellidos: 'Quispe Mamani',
    documento: 'DEMO-1001',
    carrera: 'Informática',
    email: 'ana@example.test'
  });
}
module.exports = {
  seed
};
