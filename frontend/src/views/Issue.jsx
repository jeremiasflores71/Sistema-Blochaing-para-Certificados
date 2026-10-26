import { useLoad } from "../hooks/useLoad.js";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { api, json } from "../services/api.js";
import { Heading } from "../components/Heading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Select } from "../components/Select.jsx";
import { ArrowUpRight, ShieldCheck, RefreshCw, FilePlus2 } from "lucide-react";
import { Field } from "../components/Field.jsx";
function Issue() {
  const {
    data: students,
    error
  } = useLoad('/students');
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false),
    [failure, setFailure] = useState(''),
    [batch, setBatch] = useState(null);
  async function submit(e) {
    e.preventDefault();
    setFailure('');
    setBusy(true);
    try {
      const c = await api('/certificates', json('POST', Object.fromEntries(new FormData(e.currentTarget))));
      navigate('/certificados/' + c.id);
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(e) {
    e.preventDefault();
    setBusy(true);
    setFailure('');
    try {
      setBatch(await api('/certificates/batch', {
        method: 'POST',
        body: new FormData(e.currentTarget)
      }));
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <><Heading title="Emitir certificado" description="Convierte un logro académico en una credencial verificable." /><ErrorBox error={error || failure} /><div className="issue-layout"><section className="card form-card"><div className="section-number">01 <span>Información académica</span></div><form onSubmit={submit}><Select label="Estudiante" name="estudiante_id" required><option value="">Seleccionar estudiante registrado</option>{students?.map(s => <option value={s.id} key={s.id}>{s.nombres} {s.apellidos} · {s.documento}</option>)}</Select><Link className="text-link inline" to="/estudiantes">Registrar o editar estudiante <ArrowUpRight size={14} /></Link><div className="form-grid"><Select label="Tipo de certificado" name="tipo"><option>Certificado de aprobación</option><option>Certificado de egreso</option><option>Reconocimiento académico</option><option>Certificado de participación</option></Select><Field label="Fecha de emisión" name="fecha" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /><Field label="Grado o reconocimiento académico" name="grado" placeholder="Ej. Aprobación de Computación en la Nube" required maxLength={150} minLength={2} /><Field label="Institución emisora" name="institucion" defaultValue="Universidad Mayor de San Andrés" required maxLength={150} /></div><div className="info"><ShieldCheck size={20} /><p>Se generará un PDF con QR. Sus hashes se registrarán en el contrato y se esperará la confirmación antes de habilitar la descarga.</p></div><button className="btn full" disabled={busy || !students?.length}>{busy ? <><RefreshCw size={17} className="spin" /> Procesando transacción…</> : <><FilePlus2 size={17} /> Emitir y registrar en Blockchain</>}</button></form></section><aside><div className="card process"><p className="eyebrow">TRAZABILIDAD DIGITAL</p><h3>Una emisión, cuatro garantías</h3>{[['1', 'Identidad única', 'UUID y salt criptográfico aleatorio.'], ['2', 'Integridad documental', 'SHA-256 de datos y archivo PDF.'], ['3', 'Registro en Blockchain', 'Transacción real y confirmada.'], ['4', 'Verificación accesible', 'Código QR y consulta pública.']].map(([n, t, d]) => <div className="step" key={n}><span>{n}</span><div><strong>{t}</strong><p>{d}</p></div></div>)}<p className="prototype">Prototipo académico - Sin validez oficial</p></div><details className="card batch"><summary>Emisión por lote (CSV)</summary><p>Máximo 30 filas. Los estudiantes deben estar registrados.</p><a href="/ejemplo-lote.csv" download className="text-link">Descargar plantilla CSV</a><form onSubmit={upload}><input type="file" name="file" accept=".csv" required /><button disabled={busy} className="btn secondary full">Procesar lote</button></form>{batch && <ul>{batch.map(r => <li key={r.fila}>Fila {r.fila}: {r.id ? <Link to={'/certificados/' + r.id}>{r.estado}</Link> : r.error}</li>)}</ul>}</details></aside></div></>;
}
export { Issue };
