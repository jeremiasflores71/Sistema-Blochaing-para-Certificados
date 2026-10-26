# Validación de la reorganización MVC

Fecha: 26 de octubre de 2026.

## Cambios realizados

- Backend separado en modelos, controladores, rutas, middleware, validadores y servicios.
- Inicialización de Express en `backend/app.cjs` y punto de entrada estable en `backend/server.cjs`.
- Cada pantalla React en su propio archivo dentro de `frontend/src/views`.
- Componentes, layout, sesión, cliente HTTP, estilos y utilidades separados.
- Informe original agrupado en `docs/referencias`; informes terminados en `output/documentos`.
- Instrucciones y mapa de equivalencias en `ESTRUCTURA_MVC.md` y README actualizado.

## Pruebas ejecutadas

| Comprobación | Resultado |
| --- | --- |
| Pruebas antes de reorganizar | 8 del contrato y 15 casos de integración aprobados |
| Pruebas después de reorganizar | 8 del contrato y 15 casos de integración aprobados |
| Compilación de frontend | Correcta con 1612 módulos transformados |
| npm run setup con datos existentes | Correcto, sin necesidad de recompilar el contrato |
| Comparación de componentes y funciones de React | 24 definiciones originales equivalentes después de separar archivos |
| Estilos de la interfaz | Conservados al mover el mismo archivo CSS |
| Inicio completo de los tres procesos | Correcto, con restauración del journal existente |
| Estado de API, SQLite y Blockchain | HTTP 200 a través de la URL del frontend |
| Contrato y dirección desplegada | Código Solidity intacto y misma dirección local |
| Login con administrador existente | Correcto, sin regenerar credenciales |
| Navegación de las nueve pantallas | Login, panel, estudiantes, emisión, listado, detalle, verificación, usuarios e historial comprobados |
| Certificado válido existente | Continúa verificándose como CERTIFICADO VÁLIDO |
| Consola del navegador | Sin errores detectados durante la revisión |
| Descarga de plantilla CSV | Mismo contenido y misma URL pública |

Las pruebas de integración utilizan datos aislados y abarcan emisión real, recibos y hashes on-chain, descarga privada del PDF, QR, detección de modificaciones, revocación, usuarios, roles, CSV, reconciliación y reinicio con persistencia.

## Integridad de la instalación existente

Se compararon los archivos privados mediante SHA-256 y los registros de SQLite por identificador y contenido contra un respaldo consistente realizado antes de cambiar el código.

| Tabla | Antes | Después |
| --- | --- | --- |
| usuarios | 2 | 2 |
| estudiantes | 2 | 2 |
| certificados | 4 | 4 |
| transacciones | 7 | 7 |
| bitacora | 18 | 19 |

Todos los registros anteriores conservaron su contenido. La entrada adicional de bitácora corresponde al inicio de sesión realizado para verificar el panel. No se emitieron ni revocaron certificados de la instalación real durante la reorganización.

Se conservaron sin modificaciones `.env`, `runtime/deployment.json`, `runtime/chain.jsonl` y todos los PDF existentes. El código Solidity también coincide con el respaldo anterior. La dirección sigue siendo `0x5FbDB2315678afecb367f032d93F642f64180aa3` en la red local 31337.

## Respaldo

El respaldo está en `runtime/backups/mvc-20261026-094531` e incluye `codigo-anterior.zip`, la copia SQLite y `integridad.json`. Las herramientas temporales de migración y generación de informes se retiraron en la limpieza posterior; no eran necesarias para el arranque.

El sistema se dejó ejecutándose en http://localhost:5173. Los comandos habituales y las credenciales continúan siendo los mismos. La captura de revisión está en `docs/evidencias/panel-mvc.jpg`.
