CREATE TABLE IF NOT EXISTS migrations(version INTEGER PRIMARY KEY);
CREATE TABLE IF NOT EXISTS usuarios(id TEXT PRIMARY KEY, nombre TEXT NOT NULL, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, rol TEXT NOT NULL CHECK(rol IN ('ADMIN','EMISOR')), activo INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS estudiantes(id TEXT PRIMARY KEY,nombres TEXT NOT NULL,apellidos TEXT NOT NULL,documento TEXT NOT NULL UNIQUE,carrera TEXT NOT NULL,email TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS certificados(id TEXT PRIMARY KEY,codigo TEXT UNIQUE NOT NULL,estudiante_id TEXT NOT NULL REFERENCES estudiantes(id),emisor_id TEXT NOT NULL REFERENCES usuarios(id),datos TEXT NOT NULL,salt TEXT NOT NULL,hash TEXT UNIQUE NOT NULL,pdf_hash TEXT,pdf_path TEXT,estado TEXT NOT NULL CHECK(estado IN ('pendiente','emitido','revocado','error')),tx_hash TEXT,revoke_tx TEXT,fecha TEXT NOT NULL,revoked_at TEXT,motivo TEXT,error TEXT,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS transacciones(id TEXT PRIMARY KEY,certificado_id TEXT NOT NULL REFERENCES certificados(id),tipo TEXT NOT NULL,hash TEXT NOT NULL,estado TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS bitacora(id TEXT PRIMARY KEY,usuario_id TEXT REFERENCES usuarios(id),accion TEXT NOT NULL,detalle TEXT NOT NULL,created_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS cert_estado ON certificados(estado);
INSERT OR IGNORE INTO migrations VALUES(1);
