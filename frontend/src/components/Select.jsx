function Select({
  label,
  children,
  ...props
}) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>;
}
export { Select };
