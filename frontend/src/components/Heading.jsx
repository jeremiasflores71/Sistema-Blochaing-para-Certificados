function Heading({
  eyebrow,
  title,
  description,
  action
}) {
  return <div className="heading"><div><p className="eyebrow">{eyebrow || 'REGISTRO ACADÉMICO'}</p><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
export { Heading };
