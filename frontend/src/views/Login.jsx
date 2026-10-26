import { useContext, useState } from "react";
import { Session } from "../context/SessionContext.jsx";
import { Navigate, Link } from "react-router-dom";
import { api, json } from "../services/api.js";
import { GraduationCap, Blocks, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Field } from "../components/Field.jsx";
import { ErrorBox } from "../components/ErrorBox.jsx";
function Login() {
  const {
    user,
    setUser
  } = useContext(Session);
  const [error, setError] = useState(''),
    [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/" />;
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api('/auth/login', json('POST', Object.fromEntries(new FormData(e.currentTarget))));
      sessionStorage.setItem('token', r.token);
      setUser(r.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <div className="login"><section className="login-story"><div className="brand"><GraduationCap size={36} /><span>UMSA<small>UNIVERSIDAD MAYOR DE SAN ANDRÉS</small></span></div><div><p className="eyebrow">CONOCIMIENTO QUE TRASCIENDE</p><h1>Logros académicos.<br />Confianza verificable.</h1><p>Una nueva forma de proteger la autenticidad<br />de cada certificado, mediante Blockchain.</p><div className="login-chain"><Blocks size={90} strokeWidth={.7} /><ShieldCheck size={100} strokeWidth={.7} /></div></div><small>Carrera de Informática · Computación en la Nube</small></section><section className="login-form"><div><p className="eyebrow">ACCESO INSTITUCIONAL</p><h1>Bienvenido de nuevo</h1><p>Ingresa a tu espacio de certificación académica.</p><form onSubmit={submit}><Field label="Correo electrónico" name="email" type="email" placeholder="usuario@umsa.local" required autoComplete="username" /><Field label="Contraseña" name="password" type="password" required autoComplete="current-password" /><ErrorBox error={error} /><button className="btn full" disabled={busy}>{busy ? 'Ingresando…' : 'Iniciar sesión'} <ArrowUpRight size={17} /></button></form><div className="login-note"><ShieldCheck size={20} /><p>Acceso exclusivo para administradores y emisores autorizados.</p></div><Link className="text-link" to="/verificar">Verificar un certificado sin iniciar sesión <ArrowUpRight size={15} /></Link><p className="prototype">Prototipo académico - Sin validez oficial</p></div></section></div>;
}
export { Login };
