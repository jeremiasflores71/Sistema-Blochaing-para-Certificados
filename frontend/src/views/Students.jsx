import { useLoad } from "../hooks/useLoad.js";
import { useState } from "react";
import { api, json } from "../services/api.js";
import { Heading } from "../components/Heading.jsx";
import { Plus, Search } from "lucide-react";
import { ErrorBox } from "../components/ErrorBox.jsx";
import { Field } from "../components/Field.jsx";
function Students() {
  const {
    data,
    error,
    refresh
  } = useLoad('/students');
  const [q, setQ] = useState(''),
    [editing, setEditing] = useState(null),
    [open, setOpen] = useState(false),
    [failure, setFailure] = useState(''),
    [busy, setBusy] = useState(false);
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setFailure('');
    try {
      const body = Object.fromEntries(new FormData(e.currentTarget));
      await api('/students' + (editing ? '/' + editing.id : ''), json(editing ? 'PUT' : 'POST', body));
      setOpen(false);
      refresh();
    } catch (e) {
      setFailure(e.message);
    } finally {
      setBusy(false);
    }
  }
  return <><Heading title="Estudiantes" description="Administra los datos de la comunidad estudiantil." action={<button className="btn" onClick={() => {
      setEditing(null);
      setFailure('');
      setOpen(true);
    }}><Plus size={17} /> Registrar estudiante</button>} /><ErrorBox error={error} /><section className="card"><div className="toolbar"><div className="search"><Search size={18} /><input placeholder="Buscar por nombre o documento…" value={q} onChange={e => setQ(e.target.value)} /></div><span className="muted">{data?.length || 0} estudiantes</span></div><div className="table-wrap"><table><thead><tr><th>ESTUDIANTE</th><th>DOCUMENTO</th><th>CARRERA</th><th>CORREO</th><th /></tr></thead><tbody>{data?.filter(s => (s.nombres + ' ' + s.apellidos + ' ' + s.documento).toLowerCase().includes(q.toLowerCase())).map(s => <tr key={s.id}><td><strong>{s.nombres} {s.apellidos}</strong></td><td>{s.documento}</td><td>{s.carrera}</td><td>{s.email || '—'}</td><td><button className="text-link" onClick={() => {
                  setEditing(s);
                  setFailure('');
                  setOpen(true);
                }}>Editar</button></td></tr>)}</tbody></table></div>{data?.length === 0 && <div className="empty">Registra tu primer estudiante.</div>}</section>{open && <div className="modal-back"><section className="modal"><h2>{editing ? 'Editar' : 'Registrar'} estudiante</h2><p>El documento de identidad debe ser único.</p><form onSubmit={save}><div className="form-grid">{[['nombres', 'Nombres'], ['apellidos', 'Apellidos'], ['documento', 'Documento de identidad'], ['carrera', 'Carrera'], ['email', 'Correo electrónico (opcional)']].map(([name, label]) => <Field key={name} label={label} name={name} type={name === 'email' ? 'email' : 'text'} defaultValue={editing?.[name] || ''} required={name !== 'email'} maxLength={name === 'documento' ? 40 : 150} />)}</div><ErrorBox error={failure} /><div className="form-actions"><button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancelar</button><button className="btn" disabled={busy}>{busy ? 'Guardando…' : 'Guardar estudiante'}</button></div></form></section></div>}</>;
}
export { Students };
