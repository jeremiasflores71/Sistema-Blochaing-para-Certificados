import { useLoad } from "../hooks/useLoad.js";
import { useContext, useState } from "react";
import { Session } from "../context/SessionContext.jsx";
import { Heading } from "../components/Heading.jsx";
import { Link } from "react-router-dom";
import { Plus, Search, RefreshCw } from "lucide-react";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { labels } from "../utils/format.js";
import { api } from "../services/api.js";
import { CertTable } from "../components/CertTable.jsx";
function Certificates() {
  const {
    data,
    error,
    refresh
  } = useLoad('/certificates');
  const {
    user
  } = useContext(Session);
  const [q, setQ] = useState(''),
    [state, setState] = useState(''),
    [day, setDay] = useState(''),
    [msg, setMsg] = useState('');
  const rows = data?.filter(c => (!state || c.estado === state) && (!day || c.fecha === day) && (c.codigo + ' ' + c.datos).toLowerCase().includes(q.toLowerCase()));
  return <><Heading title="Certificados" description="Consulta los documentos y su historial de emisión." action={<Link className="btn" to="/emitir"><Plus size={17} /> Emitir certificado</Link>} /><ErrorBox error={error || msg} /><section className="card"><div className="toolbar"><div className="search"><Search size={18} /><input placeholder="Buscar estudiante o código…" value={q} onChange={e => setQ(e.target.value)} /></div><select aria-label="Filtrar por estado" value={state} onChange={e => setState(e.target.value)}><option value="">Todos los estados</option>{Object.entries(labels).map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select><input type="date" aria-label="Filtrar por fecha" value={day} onChange={e => setDay(e.target.value)} />{user.rol === 'ADMIN' && <button title="Consultar Blockchain y recuperar emisiones incompletas" className="btn secondary" onClick={async () => {
          try {
            await api('/reconcile', {
              method: 'POST'
            });
            refresh();
          } catch (e) {
            setMsg(e.message);
          }
        }}><RefreshCw size={16} /> Reconciliar</button>}</div><CertTable rows={rows} /></section></>;
}
export { Certificates };
