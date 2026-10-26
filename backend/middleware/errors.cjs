const {
  z
} = require('zod');
const wrap = handler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
function notFound(req, res) {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
}
function errorHandler(err, req, res, next) {
  if (err instanceof z.ZodError) return res.status(400).json({
    error: err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')
  });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({
    error: 'Archivo demasiado grande (máximo 10 MB)'
  });
  if (String(err.message).includes('UNIQUE constraint')) return res.status(409).json({
    error: 'El documento o correo ya está registrado'
  });
  console.error(err.message);
  res.status(err.status || 500).json({
    error: err.status ? err.message : 'No se pudo completar la operación. Revise la conexión y los datos.'
  });
}
module.exports = {
  wrap,
  notFound,
  errorHandler
};
