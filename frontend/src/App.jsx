import { useState, useEffect } from "react";
import { api } from "./services/api.js";
import { Session } from "./context/SessionContext.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./views/Login.jsx";
import { Verification } from "./views/Verification.jsx";
import { Layout } from "./layouts/InstitutionalLayout.jsx";
function App() {
  const [user, setUser] = useState(null),
    [ready, setReady] = useState(false);
  useEffect(() => {
    const expired = () => setUser(null);
    window.addEventListener('session-expired', expired);
    if (sessionStorage.getItem('token')) api('/me').then(setUser).catch(() => sessionStorage.removeItem('token')).finally(() => setReady(true));else setReady(true);
    return () => window.removeEventListener('session-expired', expired);
  }, []);
  if (!ready) return <div className="empty">Cargando sesión…</div>;
  return <Session.Provider value={{
    user,
    setUser
  }}><BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}><Routes><Route path="/login" element={<Login />} /><Route path="/verificar" element={<Verification />} /><Route path="/verificar/:code" element={<Verification />} /><Route path="*" element={<Layout />} /></Routes></BrowserRouter></Session.Provider>;
}
export { App };
