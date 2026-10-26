import { useParams, Link } from "react-router-dom";
import { useLoad } from "../hooks/useLoad.js";
import { useState } from "react";
import { api, json } from "../services/api.js";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { ArrowLeft, GraduationCap, Download, ExternalLink } from "lucide-react";
import { Heading } from "../components/Heading.jsx";
import { Badge } from "../components/Badge.jsx";
import { date } from "../utils/format.js";
import { Field } from "../components/Field.jsx";
function Detail() {
  const {
    id
  } = useParams();
  const {
    data: c,
    error,
    refresh
  } = useLoad('/certificates/' + id);
  const [failure, setFailure] = useState(''),
    [modal, setModal] = useState(false),
    [busy, setBusy] = useState(false);
  async function download() {
    setFailure('');
    setBusy(true);
    try {
      const r = await fetch((import.meta.env.VITE_API_BASE_URL || '/api') + '/certificates/' + id + '/pdf', {
        headers: {
          Authorization: 'Bearer ' + sessionStorage.getItem('token')
        }
      });
      if (!r.ok) throw Error((await r.json()).error || 'No se pudo descargar');
      const url = URL.createObjectURL(await r.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = c.codigo + '.pdf';
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function revoke(e) {
    e.preventDefault();
    setBusy(true);
    setFailure('');
    try {
      await api('/certificates/' + id + '/revoke', json('POST', Object.fromEntries(new FormData(e.currentTarget))));
      setModal(false);
      refresh();
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (!c) return <ErrorBox error={error || 'Cargando certificado…'} />;
  const d = JSON.parse(c.datos);
  return <><Link className="text-link back" to="/certificados"><ArrowLeft size={16} /> Volver a certificados</Link><Heading title="Detalle del certificado" description={c.codigo} action={<Badge state={c.estado} />} /><ErrorBox error={failure} /><div className="issue-layout"><section className="card form-card"><div className="cert-preview"><GraduationCap size={35} /><p className="eyebrow">UNIVERSIDAD MAYOR DE SAN ANDRÉS</p><p>Carrera de Informática</p><h2>{d.tipo}</h2><p>Se certifica que</p><h2 className="student-name">{d.nombres} {d.apellidos}</h2><p>{d.grado}</p><p className="muted">{d.carrera} · {date(d.fecha)}</p><span className="prototype">Prototipo académico - Sin validez oficial</span></div><div className="form-actions"><button className="btn" disabled={busy || !['emitido', 'revocado'].includes(c.estado)} onClick={download}><Download size={16} /> Descargar PDF</button><Link className="btn secondary" to={'/verificar/' + c.codigo}><ExternalLink size={16} /> Verificar</Link></div></section><aside className="card form-card"><h3>Registro criptográfico</h3><dl><dt>SHA-256 de los datos</dt><dd className="hash">{c.hash}</dd><dt>SHA-256 del PDF</dt><dd className="hash">{c.pdf_hash || 'Pendiente'}</dd><dt>Transacción de emisión</dt><dd className="hash">{c.tx_hash || 'Sin confirmar'}</dd><dt>Transacción de revocación</dt><dd className="hash">{c.revoke_tx || '—'}</dd><dt>Documento del estudiante</dt><dd>{d.documento}</dd></dl>{c.motivo && <div className="info"><p>Motivo de revocación: {c.motivo}</p></div>}{c.error && <ErrorBox error={c.error} />}<h3 className="mt">Historial de transacciones</h3>{c.transacciones?.map(t => <p key={t.id} className="muted">{t.tipo} · {t.estado} · {date(t.created_at)}</p>)}{c.estado === 'emitido' && <button className="btn danger full mt" onClick={() => setModal(true)}>Revocar certificado</button>}</aside></div>{modal && <div className="modal-back"><section className="modal"><h2>Revocar certificado</h2><p>La revocación es definitiva y quedará registrada en Blockchain. El documento y su historial se conservarán.</p><form onSubmit={revoke}><Field label="Justificación de la revocación" name="motivo" minLength={5} maxLength={150} required /><ErrorBox error={failure} /><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setModal(false)} disabled={busy}>Cancelar</button><button className="btn danger" disabled={busy}>{busy ? 'Registrando…' : 'Confirmar revocación'}</button></div></form></section></div>}</>;
}
export { Detail };
