const {
  z
} = require('zod');
const text = z.string().trim().min(2).max(150).regex(/^[\u0020-\u007e\u00a0-\u00ff]+$/, 'Use caracteres latinos sin saltos de línea');
const studentSchema = z.object({
  nombres: text,
  apellidos: text,
  documento: z.string().trim().min(3).max(40).transform(v => v.toUpperCase()),
  carrera: text,
  email: z.union([z.email(), z.literal('')]).optional()
});
const issueSchema = z.object({
  estudiante_id: z.uuid(),
  tipo: text,
  grado: text,
  fecha: z.iso.date(),
  institucion: text
});
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200)
});
const userSchema = z.object({
  nombre: text,
  email: z.email().transform(v => v.toLowerCase()),
  password: z.string().min(10).max(100),
  rol: z.enum(['ADMIN', 'EMISOR'])
});
const activeSchema = z.object({
  activo: z.boolean()
});
const revokeSchema = z.object({
  motivo: text.min(5).max(150)
});
module.exports = {
  studentSchema,
  issueSchema,
  loginSchema,
  userSchema,
  activeSchema,
  revokeSchema
};
