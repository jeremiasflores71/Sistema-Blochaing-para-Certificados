import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
function Toast() {
  const [message, setMessage] = useState('');
  useEffect(() => {
    let timer;
    const show = e => {
      setMessage(e.detail);
      clearTimeout(timer);
      timer = setTimeout(() => setMessage(''), 4500);
    };
    window.addEventListener('notice', show);
    return () => {
      window.removeEventListener('notice', show);
      clearTimeout(timer);
    };
  }, []);
  return message ? <div className="toast" role="status"><CheckCircle2 size={19} />{message}<button aria-label="Cerrar notificación" onClick={() => setMessage('')}>×</button></div> : null;
}
export { Toast };
