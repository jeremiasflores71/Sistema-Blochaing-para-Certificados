async function api(url, options = {}) {
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  const token = sessionStorage.getItem('token');
  const unavailable = 'No se puede conectar con el servidor. Inicia el sistema con npm run dev y mantén la terminal abierta. Después recarga esta página.';
  let res;
  try {
    res = await fetch(apiBase + url, {
      ...options,
      headers: {
        ...(options.body instanceof FormData ? {} : {
          'Content-Type': 'application/json'
        }),
        ...(token ? {
          Authorization: 'Bearer ' + token
        } : {}),
        ...options.headers
      }
    });
  } catch {
    throw Error(unavailable);
  }
  let data;
  try {
    data = await res.json();
  } catch {
    throw Error(unavailable);
  }
  if (!res.ok) {
    if (res.status === 401 && !url.includes('/auth/')) {
      sessionStorage.removeItem('token');
      window.dispatchEvent(new Event('session-expired'));
    }
    const e = Error(data.error || 'No se pudo completar la operación');
    e.data = data;
    throw e;
  }
  if (options.method && options.method !== 'GET' && !url.startsWith('/verify') && !url.startsWith('/auth')) window.dispatchEvent(new CustomEvent('notice', {
    detail: url.endsWith('/revoke') ? 'Revocación confirmada en Blockchain' : url === '/certificates' ? 'Certificado emitido y confirmado en Blockchain' : 'Operación completada correctamente'
  }));
  return data;
}
const json = (method, body) => ({
  method,
  body: JSON.stringify(body)
});
export { api, json };
