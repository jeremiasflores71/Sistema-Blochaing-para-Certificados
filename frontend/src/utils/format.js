const labels = {
  emitido: 'Emitido',
  revocado: 'Revocado',
  pendiente: 'Pendiente',
  error: 'Error'
};
const date = v => new Date(v).toLocaleDateString('es-BO', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC'
});
export { labels, date };
