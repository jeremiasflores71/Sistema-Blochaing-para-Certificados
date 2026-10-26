const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const certificates = require('../models/certificate.model.cjs');
const students = require('../models/student.model.cjs');
const transactions = require('../models/transaction.model.cjs');
const {
  record: audit
} = require('../models/audit.model.cjs');
const {
  sha,
  canonical
} = require('../utils/crypto.cjs');
const config = require('../config/environment.cjs');
const chain = require('./blockchain.service.cjs');
const {
  createPdf
} = require('./pdf.service.cjs');
const get = certificates.find;
const own = (c, u) => u.rol === 'ADMIN' || c.emisor_id === u.id;
function tx(c, type, hash, state) {
  transactions.create(c.id, type, hash, state);
}
async function issue(input, user) {
  const student = students.findById(input.estudiante_id);
  if (!student) throw Object.assign(Error('Estudiante no encontrado'), {
    status: 404
  });
  const id = crypto.randomUUID(),
    salt = crypto.randomBytes(16).toString('hex'),
    codigo = 'UMSA-' + id.toUpperCase();
  const data = {
    id,
    codigo,
    nombres: student.nombres,
    apellidos: student.apellidos,
    documento: student.documento,
    carrera: student.carrera,
    tipo: input.tipo,
    grado: input.grado,
    fecha: input.fecha,
    institucion: input.institucion,
    salt
  };
  const hash = sha(canonical(data));
  certificates.createPending({
    id,
    codigo,
    estudiante_id: student.id,
    emisor_id: user.id,
    datos: canonical(data),
    salt,
    hash,
    fecha: data.fecha
  });
  try {
    const pdf = await createPdf(data),
      pdfHash = sha(pdf),
      pdfPath = path.join(config.data, 'pdf', id + '.pdf');
    fs.writeFileSync(pdfPath, pdf, {
      flag: 'wx'
    });
    certificates.setPdf(id, pdfHash, pdfPath);
    const hashTx = await chain.mutate('issue', ['0x' + hash, '0x' + pdfHash], h => {
      certificates.setIssueTransaction(id, h);
      tx({
        id
      }, 'emision', h, 'enviada');
    });
    certificates.markIssued(id, hashTx);
    transactions.confirm(hashTx);
    audit(user.id, 'EMISION', codigo);
    return get(id);
  } catch (e) {
    certificates.markError(id, 'No se completó la emisión. Consultar recuperación.');
    audit(user.id, 'ERROR_EMISION', codigo);
    throw Object.assign(Error('No se completó la emisión. El registro permanece en error para reconciliarlo con la cadena.'), {
      status: 503,
      cause: e
    });
  }
}
async function verify(id, fileHash) {
  const c = get(id);
  if (!c) return {
    estado: 'NO_ENCONTRADO'
  };
  const data = JSON.parse(c.datos);
  if (sha(canonical(data)) !== c.hash) return {
    estado: 'MODIFICADO'
  };
  const on = await chain.contract().verify('0x' + c.hash);
  if (!on.exists) return {
    estado: 'NO_ENCONTRADO'
  };
  if (!c.pdf_hash || on.pdfHash.toLowerCase() !== '0x' + c.pdf_hash || fileHash && '0x' + fileHash !== on.pdfHash.toLowerCase()) return {
    estado: 'MODIFICADO'
  };
  if (c.estado !== 'emitido' && c.estado !== 'revocado') return {
    estado: 'PENDIENTE'
  };
  return {
    estado: on.revoked ? 'REVOCADO' : 'VALIDO',
    certificado: {
      codigo: c.codigo,
      titular: `${data.nombres} ${data.apellidos}`,
      carrera: data.carrera,
      tipo: data.tipo,
      grado: data.grado,
      fecha: data.fecha,
      institucion: data.institucion
    },
    blockchain: {
      contrato: chain.address(),
      red: config.chainId,
      hash: c.hash,
      pdfHash: c.pdf_hash,
      transaccion: c.tx_hash
    }
  };
}
async function revoke(c, motivo, user) {
  if (!own(c, user)) throw Object.assign(Error('No puede revocar certificados de otro emisor'), {
    status: 403
  });
  if (c.estado !== 'emitido') throw Object.assign(Error('Solo se revocan certificados emitidos'), {
    status: 409
  });
  certificates.setReason(c.id, motivo);
  const h = await chain.mutate('revoke', ['0x' + c.hash], h => {
    certificates.setRevokeTransaction(c.id, h);
    tx(c, 'revocacion', h, 'enviada');
  });
  certificates.markRevoked(c.id, h);
  transactions.confirm(h);
  audit(user.id, 'REVOCACION', `${c.codigo}: ${motivo}`);
  return get(c.id);
}
async function reconcile() {
  await chain.check();
  for (const c of certificates.submitted()) {
    const on = await chain.contract().verify('0x' + c.hash);
    if (!on.exists) continue;
    if (!c.pdf_path || !fs.existsSync(c.pdf_path) || '0x' + sha(fs.readFileSync(c.pdf_path)) !== on.pdfHash.toLowerCase()) continue;
    certificates.recover(c, on.revoked);
    transactions.confirmForCertificate(c.id);
  }
}
module.exports = {
  sha,
  canonical,
  get,
  own,
  issue,
  verify,
  revoke,
  reconcile
};
