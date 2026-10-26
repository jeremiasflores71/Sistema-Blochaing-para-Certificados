function ErrorBox({
  error
}) {
  return error ? <div className="error" role="alert">{error}</div> : null;
}
export { ErrorBox };
