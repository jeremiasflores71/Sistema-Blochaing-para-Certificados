import { useContext, useState, useEffect } from "react";
import { Session } from "../context/SessionContext.jsx";
import { api } from "../services/api.js";
import { Navigate, Link, NavLink, Routes, Route } from "react-router-dom";
import { LayoutDashboard, Users, FilePlus2, Files, GraduationCap, ShieldCheck, ArrowUpRight, History, Menu, LogOut } from "lucide-react";
import { Dashboard } from "../views/Dashboard.jsx";
import { Students } from "../views/Students.jsx";
import { Issue } from "../views/Issue.jsx";
import { Certificates } from "../views/Certificates.jsx";
import { Detail } from "../views/Detail.jsx";
import { UsersPage } from "../views/UsersPage.jsx";
import { Audit } from "../views/Audit.jsx";
function Layout() {
  const {
    user,
    setUser
  } = useContext(Session);
  const [menu, setMenu] = useState(false),
    [health, setHealth] = useState(null);
  useEffect(() => {
    const run = () => api('/health').then(setHealth).catch(() => setHealth(false));
    run();
    const i = setInterval(run, 20000);
    return () => clearInterval(i);
  }, []);
  if (!user) return <Navigate to="/login" />;
  const links = [[LayoutDashboard, 'Panel general', '/'], [Users, 'Estudiantes', '/estudiantes'], [FilePlus2, 'Emitir certificado', '/emitir'], [Files, 'Certificados', '/certificados']];
  return <div className="app"><aside className={'sidebar ' + (menu ? 'open' : '')}><Link className="brand" to="/"><GraduationCap size={34} /><span>UMSA<small>CERTIFICACIÓN ACADÉMICA</small></span></Link><div className="sidebar-divider" /><p className="nav-label">ESPACIO INSTITUCIONAL</p><nav>{links.map(([Icon, t, to]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenu(false)}><Icon size={19} />{t}</NavLink>)}<p className="nav-label">VERIFICACIÓN</p><Link to="/verificar"><ShieldCheck size={19} />Portal público <ArrowUpRight size={14} /></Link>{user.rol === 'ADMIN' && <><p className="nav-label">ADMINISTRACIÓN</p><NavLink to="/usuarios" onClick={() => setMenu(false)}><Users size={19} />Usuarios</NavLink><NavLink to="/historial" onClick={() => setMenu(false)}><History size={19} />Historial de operaciones</NavLink></>}</nav><div className="sidebar-bottom"><div className="network"><i className={health?.blockchain ? 'online' : ''} /><div><strong>{health?.blockchain ? 'Blockchain conectada' : 'Blockchain no disponible'}</strong><small>{health?.blockchain ? `Red ${health.blockchain.chainId} · Bloque ${health.blockchain.block}` : 'Verificación no confirmable'}</small></div></div><p>Prototipo académico<br />Sin validez oficial</p></div></aside><div className="workspace"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Abrir menú" onClick={() => setMenu(!menu)}><Menu /></button><span>Sistema de certificación académica</span><span className="env-tag">PROTOTIPO LOCAL</span></div><div className="account"><span className="avatar">{user.nombre[0]}</span><div><strong>{user.nombre}</strong><small>{user.rol === 'ADMIN' ? 'Administrador' : 'Emisor institucional'}</small></div><button aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => {
            sessionStorage.removeItem('token');
            setUser(null);
          }}><LogOut size={18} /></button></div></header><main className="content"><Routes><Route path="/" element={<Dashboard />} /><Route path="/estudiantes" element={<Students />} /><Route path="/emitir" element={<Issue />} /><Route path="/certificados" element={<Certificates />} /><Route path="/certificados/:id" element={<Detail />} /><Route path="/usuarios" element={user.rol === 'ADMIN' ? <UsersPage /> : <Navigate to="/" />} /><Route path="/historial" element={user.rol === 'ADMIN' ? <Audit /> : <Navigate to="/" />} /><Route path="*" element={<Navigate to="/" />} /></Routes><footer>UMSA · Carrera de Informática <span>Certificación académica mediante Blockchain</span></footer></main></div></div>;
}
export { Layout };
