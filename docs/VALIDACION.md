# Validación ejecutada

Fecha: 22 de octubre de 2026. Entorno: Windows, Node.js 26.8.1.

## Resultado automatizado

- `npm run setup`: base SQLite creada, usuarios y estudiante de prueba persistidos, 6 archivos Solidity compilados correctamente.
- `npm test`: **8 pruebas de contrato y 15 casos de integración aprobados**, sin fallos. El runner de Node informa 16 tests porque cuenta también el contenedor del flujo integral.
- `npm run build`: compilación Vite 6.4.5 correcta, 1590 módulos transformados.
- `npm audit --omit=dev`: **0 vulnerabilidades reportadas** en dependencias de producción al ejecutar la revisión. La auditoría completa mantiene avisos transitivos en herramientas de desarrollo; no se afirma que el código haya pasado una auditoría externa.

El registro íntegro de la última suite se conserva en [pruebas-ejecucion.txt](pruebas-ejecucion.txt).

## Comprobaciones realizadas

| Requisito | Evidencia ejecutada |
| --- | --- |
| Frontend inicia | Servidor Vite y páginas utilizadas en navegador |
| Backend responde | `/api/health` retorna API y base disponibles |
| SQLite se crea | Migración, semilla y pruebas sobre archivo persistente |
| Autenticación | Login en navegador; API acepta credenciales válidas y rechaza incorrectas |
| Estudiantes | Alta desde navegador; integración comprueba edición y duplicado de documento |
| Emisión | Dos certificados emitidos desde la interfaz |
| Registro Blockchain | Recibos exitosos y lectura de ambos hashes desde contrato real |
| PDF | Generación, SHA-256 coincidente, descarga autenticada por API y botón del navegador |
| QR | Decodificación de la imagen extraída del PDF y comprobación de URL y código |
| Válido | Resultado `VALIDO` de API y «CERTIFICADO VÁLIDO» en navegador |
| Revocado | Revocación desde navegador, transacción confirmada y resultado público «CERTIFICADO REVOCADO» |
| Inexistente | `NO_ENCONTRADO` en prueba de API |
| Modificado | Se alteran bytes del PDF y el verificador responde `MODIFICADO` |
| Persistencia | Cierre y reapertura de SQLite/API y restauración real de transacciones en nueva red Hardhat |
| Caída Blockchain | Se detiene el nodo de prueba: respuesta `ERROR_BLOCKCHAIN`; emisión queda en `error` |
| Recuperación parcial | Estado interrumpido recuperado mediante consulta al contrato e integridad del archivo |
| Roles | Acceso privado, administración, propiedad del certificado y desactivación inmediata comprobados |
| CSV | Una fila válida emite; una inválida devuelve error individual |
| Interfaz móvil | Portal revisado a 390 × 844; medición DOM sin desbordamiento horizontal |
| Diseño PDF | Renderizado con PDFium y revisión visual del certificado |

No se probó un escaneo con cámara física de teléfono, ni se desplegó en Sepolia o AWS. El README explica la configuración de LAN para el QR del celular. Los procesos permanecen locales.

## Demostración disponible

- URL: http://localhost:5173
- API: http://localhost:3001/api/health
- RPC: http://127.0.0.1:8545
- Red: Hardhat, chain ID 31337.
- Contrato: `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
- Bloque observado en la comprobación final: 4.

| Titular ficticio | Código | Resultado |
| --- | --- | --- |
| Ana Lucía Quispe Mamani | UMSA-FC38E502-0EC6-4C73-9C19-91C7EB932349 | VÁLIDO |
| Diego Andrés Flores Condori | UMSA-96C280EE-0612-465E-A6C1-74757FF748F8 | REVOCADO |

Transacción de emisión de Ana: `0xb3837aab1b04540b1af01b8ccd955eec72a7b7e92766b7d11ad98bc9df18371c`.

Transacción de emisión de Diego: `0x278141cb9d22f22528d049758a2e2e5a2ce8e43efa49691621466aaf203f46cf`.

Transacción de revocación de Diego: `0x652ba9b3ccb017d3dcbff8680b5934bec1098a869c4212a4128d5fdd48be20a9`.

Los PDFs de prueba están en `runtime/pdf`, fuera de la carpeta pública. La interfaz autoriza sus descargas. Las credenciales están en `runtime/ACCESO_LOCAL.md` y `.env`; no forman parte de las evidencias públicas.

Captura del panel: [evidencias/panel.jpg](evidencias/panel.jpg). Render del PDF revisado: [evidencias/certificado.png](evidencias/certificado.png).
