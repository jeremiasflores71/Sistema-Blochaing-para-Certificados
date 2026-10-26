const {
  PDFDocument
} = require('pdf-lib');
const certificates = require('../services/certificate.service.cjs');
const chain = require('../services/blockchain.service.cjs');
async function byCode(req, res) {
  try {
    await chain.check();
    res.json(await certificates.verify(req.params.id));
  } catch {
    res.status(503).json({
      estado: 'ERROR_BLOCKCHAIN',
      error: 'No se pudo consultar Blockchain. No es posible confirmar la validez.'
    });
  }
}
async function byFile(req, res) {
  if (!req.file) return res.status(400).json({
    error: 'Seleccione un archivo PDF'
  });
  let id;
  try {
    const document = await PDFDocument.load(req.file.buffer);
    id = document.getSubject();
  } catch {
    return res.json({
      estado: 'MODIFICADO'
    });
  }
  if (!id) return res.json({
    estado: 'MODIFICADO'
  });
  if (!certificates.get(id)) return res.json({
    estado: 'NO_ENCONTRADO'
  });
  try {
    await chain.check();
    res.json(await certificates.verify(id, certificates.sha(req.file.buffer)));
  } catch {
    res.status(503).json({
      estado: 'ERROR_BLOCKCHAIN'
    });
  }
}
module.exports = {
  byCode,
  byFile
};
