import { useLoad } from "../hooks/useLoad.js";
import { useContext } from "react";
import { Session } from "../context/SessionContext.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Heading } from "../components/Heading.jsx";
import { Link } from "react-router-dom";
import { Plus, Blocks, ArrowUpRight, ShieldCheck, CheckCircle2, Files, XCircle, Clock3, Users, ChevronRight } from "lucide-react";
import { CertTable } from "../components/CertTable.jsx";
function Dashboard() {
  const {
    data,
    error
  } = useLoad('/dashboard');
  const {
    user
  } = useContext(Session);
  if (!data) return <ErrorBox error={error || 'Cargando resumen…'} />;
  const counts = Object.fromEntries(data.counts.map(r => [r.estado, r.total]));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return <><Heading title="Panel general" description={`Bienvenido, ${user.nombre}. Este es el estado de tus certificaciones.`} action={<Link className="btn" to="/emitir"><Plus size={17} /> Emitir certificado</Link>} /><div className="hero"><div><span className="hero-tag"><Blocks size={14} /> CERTIFICACIÓN CON BLOCKCHAIN</span><h2>El conocimiento deja huella.<br />Su autenticidad, también.</h2><p>Emite, protege y verifica logros académicos con un<br className="desktop" /> registro transparente e inmutable.</p><Link to="/verificar">Ir al portal de verificación <ArrowUpRight size={16} /></Link></div><div className="hero-art"><div className="orbit o1" /><div className="orbit o2" /><div className="shield"><ShieldCheck size={82} strokeWidth={1} /></div><span className="art-label"><CheckCircle2 size={15} /> Integridad verificable</span></div></div><div className="stats">{[[Files, 'Total de certificados', total, 'Todos los registros', 'blue'], [ShieldCheck, 'Certificados válidos', counts.emitido || 0, 'Emisiones confirmadas', 'green'], [XCircle, 'Certificados revocados', counts.revocado || 0, 'Historial conservado', 'red'], [Clock3, 'Pendientes y errores', (counts.pendiente || 0) + (counts.error || 0), 'Requieren seguimiento', 'gold']].map(([Icon, label, value, note, color]) => <div className="stat" key={label}><div className="stat-top"><span>{label}</span><span className={'icon-box ' + color}><Icon size={19} /></span></div><b>{value}</b><small>{note}</small></div>)}</div><section className="card"><div className="card-head"><div><h3>Últimos certificados</h3><p>Las emisiones más recientes del registro académico.</p></div><Link className="text-link" to="/certificados">Ver todos <ArrowUpRight size={15} /></Link></div><CertTable rows={data.recent} /></section><div className="quick-grid"><Link className="card quick" to="/estudiantes"><span className="icon-box blue"><Users size={22} /></span><div><h3>Comunidad estudiantil</h3><p>{data.students} estudiantes registrados</p></div><ChevronRight size={18} /></Link><Link className="card quick" to="/verificar"><span className="icon-box green"><ShieldCheck size={22} /></span><div><h3>Verificación pública</h3><p>Consulta por código o documento PDF</p></div><ArrowUpRight size={18} /></Link></div><p className="muted footnote">Los indicadores reflejan los estados guardados. La verificación pública consulta el contrato en tiempo real.</p></>;
}
export { Dashboard };
