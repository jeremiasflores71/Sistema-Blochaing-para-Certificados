import { useParams, Link } from "react-router-dom";
import React, { useState, useContext, useEffect } from "react";
import { Session } from "../context/SessionContext.jsx";
import { api } from "../services/api.js";
import { GraduationCap, ArrowUpRight, ShieldCheck, Search, Upload, CheckCircle2, XCircle } from "lucide-react";
import { Field } from "../components/Field.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { date } from "../utils/format.js";
function Verification() {
  const {
    code
  } = useParams();
  const [value, setValue] = useState(code || ''),
    [result, setResult] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const {
    user
  } = useContext(Session);
  async function verify(c) {
    setBusy(true);
    setError('');
    setResult(null);
    try {
      setResult(await api('/verify/' + encodeURIComponent(c.trim())));
    } catch (e) {
      if (e.data?.estado) setResult(e.data);else setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (code) verify(code);
  }, [code]);
  async function file(e) {
    e.preventDefault();
    setBusy(true);
    setResult(null);
    setError('');
    try {
      setResult(await api('/verify/file', {
        method: 'POST',
        body: new FormData(e.currentTarget)
      }));
    } catch (e) {
      if (e.data?.estado) setResult(e.data);else setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const states = {
    VALIDO: ['CERTIFICADO VÁLIDO', 'La integridad y vigencia han sido confirmadas en Blockchain.'],
    REVOCADO: ['CERTIFICADO REVOCADO', 'Este certificado fue revocado por la institución emisora.'],
    NO_ENCONTRADO: ['CERTIFICADO NO ENCONTRADO', 'No existe un registro verificable para este código o archivo.'],
    MODIFICADO: ['DOCUMENTO MODIFICADO O NO COINCIDENTE', 'El contenido no coincide con las huellas registradas.'],
    ERROR_BLOCKCHAIN: ['ERROR DE CONEXIÓN CON BLOCKCHAIN', 'No se ha podido confirmar la validez. Intenta de nuevo cuando la red esté disponible.'],
    PENDIENTE: ['EMISIÓN PENDIENTE', 'La emisión requiere recuperación antes de habilitar su verificación.']
  };
  return <div className="public-page"><header className="public-header"><Link className="brand dark" to="/verificar"><GraduationCap size={30} /><span>UMSA <small>CERTIFICACIÓN ACADÉMICA</small></span></Link><Link className="btn secondary" to={user ? '/' : '/login'}>{user ? 'Volver al panel' : 'Acceso institucional'} <ArrowUpRight size={15} /></Link></header><main className="verification"><span className="public-icon"><ShieldCheck size={34} /></span><p className="eyebrow">PORTAL PÚBLICO DE VERIFICACIÓN</p><h1>La confianza se puede verificar.</h1><p className="lead">Comprueba la autenticidad de un certificado académico.<br />Sin cuentas, sin intermediarios.</p><section className="card verify-card"><h3>Verificar por código</h3><p>Escanea el QR del documento o ingresa su código único.</p><form onSubmit={e => {
          e.preventDefault();
          verify(value);
        }}><Field label="Código del certificado" value={value} onChange={e => setValue(e.target.value)} placeholder="UMSA-…" required /><button disabled={busy} className="btn full">{busy ? 'Consultando Blockchain…' : <><Search size={17} /> Verificar certificado</>}</button></form><div className="divider"><span>o verifica el archivo original</span></div><form onSubmit={file}><label className="upload"><Upload size={23} /><span>Selecciona el certificado PDF</span><small>Se comparará el SHA-256 del archivo · Máximo 10 MB</small><input type="file" name="file" accept="application/pdf" required /></label><button className="btn secondary full" disabled={busy}>Comprobar integridad del PDF</button></form></section><ErrorBox error={error} />{result && <section aria-live="polite" className={'card result ' + (result.estado === 'VALIDO' ? 'valid' : 'invalid')}>{result.estado === 'VALIDO' ? <CheckCircle2 size={35} /> : <XCircle size={35} />}<h2>{states[result.estado]?.[0]}</h2><p>{states[result.estado]?.[1]}</p>{result.certificado && <dl>{Object.entries({
            Titular: result.certificado.titular,
            Certificado: result.certificado.tipo,
            Reconocimiento: result.certificado.grado,
            Institución: result.certificado.institucion,
            Fecha: date(result.certificado.fecha)
          }).map(([k, v]) => <React.Fragment key={k}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>}{result.blockchain && <details><summary>Evidencia Blockchain</summary><p>Red {result.blockchain.red} · Contrato</p><p className="hash">{result.blockchain.contrato}</p><p>SHA-256 del PDF</p><p className="hash">{result.blockchain.pdfHash}</p><p>Transacción</p><p className="hash">{result.blockchain.transaccion}</p></details>}</section>}<p className="prototype">Prototipo académico - Sin validez oficial</p><p className="muted">Universidad Mayor de San Andrés · Carrera de Informática<br />Computación en la Nube</p></main></div>;
}
export { Verification };
