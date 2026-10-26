import { useLoad } from "../hooks/useLoad.js";
import { useState } from "react";
import { Heading } from "../components/Heading.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Search } from "lucide-react";
function Audit() {
  const {
    data,
    error
  } = useLoad('/audit');
  const [q, setQ] = useState('');
  return <><Heading title="Historial de operaciones" description="Trazabilidad de las acciones del sistema institucional." /><ErrorBox error={error} /><section className="card"><div className="toolbar search"><Search size={18} /><input placeholder="Buscar acción, usuario o detalle…" value={q} onChange={e => setQ(e.target.value)} /></div><div className="table-wrap"><table><thead><tr><th>FECHA</th><th>USUARIO</th><th>ACCIÓN</th><th>DETALLE</th></tr></thead><tbody>{data?.filter(r => JSON.stringify(r).toLowerCase().includes(q.toLowerCase())).map(r => <tr key={r.id}><td>{new Date(r.created_at).toLocaleString('es-BO')}</td><td>{r.usuario || 'Sistema'}</td><td><span className="audit-action">{r.accion}</span></td><td className="hash">{r.detalle}</td></tr>)}</tbody></table></div></section></>;
}
export { Audit };
