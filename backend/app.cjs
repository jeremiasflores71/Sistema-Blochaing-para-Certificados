const express = require('express');
const helmet = require('helmet');
const {
  rateLimit
} = require('express-rate-limit');
const config = require('./config/environment.cjs');
const {
  seed
} = require('./database/seed.cjs');
const {
  notFound,
  errorHandler
} = require('./middleware/errors.cjs');
if (!config.secret || config.secret.length < 32) throw Error('JWT_SECRET debe tener al menos 32 caracteres. Ejecute npm run setup.');
seed();
const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(express.json({
  limit: '100kb'
}));
app.use('/api', rateLimit({
  windowMs: 60000,
  limit: 300
}));
app.use('/api', require('./routes/index.cjs'));
app.use('/api', notFound);
app.use(errorHandler);
module.exports = {
  app
};
