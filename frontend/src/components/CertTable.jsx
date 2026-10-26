import { Files, Plus, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { date } from "../utils/format.js";
import { Badge } from "./Badge.jsx";
function CertTable({
  rows
}) {
  if (!rows?.length) return <div className="empty"><Files size={30} /><h3>Aún no hay certificados</h3><p>Emite el primero para registrar su huella en Blockchain.</p><Link className="btn" to="/emitir"><Plus size={16} /> Emitir certificado</Link></div>;
  return <div className="table-wrap"><table><thead><tr><th>ESTUDIANTE / CERTIFICADO</th><th>FECHA DE EMISIÓN</th><th>ESTADO</th><th /></tr></thead><tbody>{rows.map(c => {
          const d = JSON.parse(c.datos);
          return <tr key={c.id}><td><div className="person"><span className="avatar">{d.nombres[0]}{d.apellidos[0]}</span><div><strong>{d.nombres} {d.apellidos}</strong><small title={c.codigo}>{c.codigo.slice(0, 23)}… · {d.tipo}</small></div></div></td><td>{date(c.fecha)}</td><td><Badge state={c.estado} /></td><td><Link className="table-link" to={'/certificados/' + c.id}>Ver detalle <ChevronRight size={15} /></Link></td></tr>;
        })}</tbody></table></div>;
}
export { CertTable };
