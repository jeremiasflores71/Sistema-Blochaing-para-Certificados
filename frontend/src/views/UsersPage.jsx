import { useLoad } from "../hooks/useLoad.js";
import { useContext, useState } from "react";
import { Session } from "../context/SessionContext.jsx";
import { api, json } from "../services/api.js";
import { Heading } from "../components/Heading.jsx";
import { Plus } from "lucide-react";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Field } from "../components/Field.jsx";
import { Select } from "../components/Select.jsx";
function UsersPage() {
  const {
    data,
    error,
    refresh
  } = useLoad('/users');
  const {
    user
  } = useContext(Session);
  const [open, setOpen] = useState(false),
    [failure, setFailure] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/users', json('POST', Object.fromEntries(new FormData(e.currentTarget))));
      setOpen(false);
      refresh();
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <><Heading title="Usuarios y acceso" description="Autoriza emisores y administra el acceso institucional." action={<button className="btn" onClick={() => {
      setFailure('');
      setOpen(true);
    }}><Plus size={17} /> Crear usuario</button>} /><ErrorBox error={error || failure} /><section className="card table-wrap"><table><thead><tr><th>NOMBRE</th><th>CORREO</th><th>ROL</th><th>ACCESO</th><th /></tr></thead><tbody>{data?.map(u => <tr key={u.id}><td><strong>{u.nombre}</strong></td><td>{u.email}</td><td>{u.rol}</td><td>{u.activo ? 'Autorizado' : 'Desactivado'}</td><td><button className="text-link" disabled={u.id === user.id} onClick={async () => {
                try {
                  await api('/users/' + u.id, json('PATCH', {
                    activo: !u.activo
                  }));
                  refresh();
                } catch (e) {
                  setFailure(e.message);
                }
              }}>{u.activo ? 'Desactivar' : 'Autorizar'}</button></td></tr>)}</tbody></table></section>{open && <div className="modal-back"><section className="modal"><h2>Crear usuario institucional</h2><form onSubmit={save}><Field label="Nombre" name="nombre" required minLength={2} /><Field label="Correo electrónico" name="email" type="email" required /><Field label="Contraseña (mínimo 10 caracteres)" name="password" type="password" minLength={10} required /><Select label="Rol" name="rol"><option value="EMISOR">Emisor institucional</option><option value="ADMIN">Administrador</option></Select><ErrorBox error={failure} /><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancelar</button><button disabled={busy} className="btn">Crear y autorizar</button></div></form></section></div>}</>;
}
export { UsersPage };
