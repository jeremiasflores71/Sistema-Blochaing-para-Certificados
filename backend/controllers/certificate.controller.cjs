const fs = require('node:fs');
const {
  parse
} = require('csv-parse/sync');
const certificates = require('../models/certificate.model.cjs');
const students = require('../models/student.model.cjs');
const transactions = require('../models/transaction.model.cjs');
const audit = require('../models/audit.model.cjs');
const service = require('../services/certificate.service.cjs');
const {
  issueSchema,
  revokeSchema
} = require('../validators/schemas.cjs');
function list(req, res) {
  res.json(certificates.list(req.user));
}
async function create(req, res) {
  res.status(201).json(await service.issue(issueSchema.parse(req.body), req.user));
}
async function batch(req, res) {
  if (!req.file) return res.status(400).json({
    error: 'Seleccione CSV'
  });
  const rows = parse(req.file.buffer, {
    columns: true,
    skip_empty_lines: true,
    bom: true,
    trim: true
  });
  if (rows.length > 30) return res.status(400).json({
    error: 'Máximo 30 filas por lote'
  });
  const results = [];
  for (const [index, row] of rows.entries()) {
    try {
      const student = students.findByDocument(String(row.documento).toUpperCase());
      const certificate = await service.issue(issueSchema.parse({
        ...row,
        estudiante_id: student?.id
      }), req.user);
      results.push({
        fila: index + 2,
        id: certificate.id,
        estado: certificate.estado
      });
    } catch (error) {
      results.push({
        fila: index + 2,
        estado: 'error',
        error: error.message
      });
    }
  }
  res.json(results);
}
function detail(req, res) {
  const certificate = service.get(req.params.id);
  if (!certificate) return res.status(404).json({
    error: 'Certificado no encontrado'
  });
  if (!service.own(certificate, req.user)) return res.status(403).json({
    error: 'Acceso denegado'
  });
  res.json({
    ...certificate,
    transacciones: transactions.listForCertificate(certificate.id)
  });
}
async function download(req, res) {
  const certificate = service.get(req.params.id);
  if (!certificate) return res.sendStatus(404);
  if (!service.own(certificate, req.user)) return res.sendStatus(403);
  if (!['emitido', 'revocado'].includes(certificate.estado)) return res.status(409).json({
    error: 'Emisión incompleta'
  });
  const result = await service.verify(certificate.id);
  if (!['VALIDO', 'REVOCADO'].includes(result.estado)) return res.status(409).json({
    error: 'Documento no confirmado en Blockchain'
  });
  if (!certificate.pdf_path || !fs.existsSync(certificate.pdf_path) || service.sha(fs.readFileSync(certificate.pdf_path)) !== certificate.pdf_hash) return res.status(409).json({
    error: 'Archivo local no coincide con el hash registrado'
  });
  res.download(certificate.pdf_path, certificate.codigo + '.pdf');
}
async function revoke(req, res) {
  const certificate = service.get(req.params.id);
  if (!certificate) return res.sendStatus(404);
  const {
    motivo
  } = revokeSchema.parse(req.body);
  res.json(await service.revoke(certificate, motivo, req.user));
}
async function reconcile(req, res) {
  await service.reconcile();
  audit.record(req.user.id, 'RECONCILIACION', 'Estados contrastados con Blockchain');
  res.json({
    ok: true
  });
}
module.exports = {
  list,
  create,
  batch,
  detail,
  download,
  revoke,
  reconcile
};
