// Punto de entrada estable para npm y las pruebas de integración.
const {
  app
} = require('./app.cjs');
const config = require('./config/environment.cjs');
const certificates = require('./services/certificate.service.cjs');
if (require.main === module) {
  app.listen(config.port, '127.0.0.1', () => console.log(`API en http://localhost:${config.port}`));
  certificates.reconcile().catch(error => console.error('Reconciliación al iniciar:', error.message));
}
module.exports = {
  app
};
