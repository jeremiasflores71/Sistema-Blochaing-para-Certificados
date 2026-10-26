# Estructura MVC del proyecto

El proyecto utiliza MVC adaptado a una API REST y una interfaz React. Los modelos encapsulan las consultas SQLite; los controladores reciben las solicitudes HTTP; React proporciona las vistas. Los servicios coordinan PDF, criptografía y Blockchain. Se conserva un único backend modular.

## Organización

```text
Nube 2/
├── backend/
│   ├── app.cjs                    Configura Express y sus middleware
│   ├── server.cjs                 Punto de entrada de la API
│   ├── config/
│   │   └── environment.cjs        Variables de entorno y rutas privadas
│   ├── controllers/               Solicitudes y respuestas HTTP
│   ├── models/                    Acceso a SQLite por entidad
│   ├── routes/                    URL, método y permisos por recurso
│   ├── middleware/                Autenticación, roles, archivos y errores
│   ├── services/                  Reglas de emisión, Blockchain, PDF y sesión
│   ├── validators/                Esquemas Zod
│   ├── utils/                     Fechas, SHA-256 y JSON canónico
│   └── database/
│       ├── connection.cjs         Conexión SQLite y aplicación del esquema
│       ├── seed.cjs               Datos iniciales sin duplicar usuarios
│       └── migrations/001.sql     Esquema existente
├── frontend/
│   ├── public/                    Plantilla CSV descargable
│   └── src/
│       ├── main.jsx               Montaje de React
│       ├── App.jsx                Sesión y rutas principales
│       ├── views/                 Una pantalla por archivo
│       ├── components/            Campos, tablas, avisos y componentes comunes
│       ├── layouts/               Menú lateral y barra institucional
│       ├── context/               Contexto de sesión
│       ├── hooks/                 Carga de datos
│       ├── services/              Cliente HTTP de la API
│       ├── styles/                Diseño existente
│       └── utils/                 Formato de fecha y estados
├── contracts/                     Contrato Solidity existente
├── scripts/
│   ├── setup.cjs                  Preparación inicial
│   ├── dev.cjs                    Lanzador de los tres procesos
│   └── deploy.cjs                 Despliegue del contrato
├── tests/                         Pruebas HTTP y del contrato
├── docs/
│   ├── referencias/               Informe original
│   ├── diagramas/                 Diagramas del sistema
│   └── evidencias/                Evidencias de la demostración
├── runtime/                       Base, PDF, transacciones y credenciales
├── output/                        Documentos entregables
└── Archivos de configuración y dependencias
```

Las carpetas `node_modules`, `artifacts` y `cache` contienen dependencias y resultados necesarios de las herramientas. `dist` se crea al ejecutar `npm run build` y puede eliminarse cuando no se utiliza la compilación de producción. Los archivos de configuración de Vite, Tailwind, PostCSS y Hardhat permanecen en la raíz para respetar su descubrimiento y los comandos habituales. `runtime` conserva exactamente su ubicación para mantener los documentos y los registros existentes.

## Flujo de una operación

```text
Vista React
  → cliente frontend/src/services/api.js
  → router de Express
  → middleware de sesión y permisos
  → controlador
  → servicio de negocio
  → modelos SQLite y servicios PDF / Blockchain
  → respuesta HTTP
  → actualización de la vista
```

Por ejemplo, emitir un certificado utiliza `views/Issue.jsx`, `routes/certificate.routes.cjs`, `controllers/certificate.controller.cjs` y `services/certificate.service.cjs`. El servicio utiliza `models/certificate.model.cjs`, `services/pdf.service.cjs` y `services/blockchain.service.cjs`.

## Pantallas

| Pantalla | Archivo dentro de frontend/src/views |
| --- | --- |
| Inicio de sesión | Login.jsx |
| Panel general | Dashboard.jsx |
| Estudiantes | Students.jsx |
| Emisión | Issue.jsx |
| Listado de certificados | Certificates.jsx |
| Detalle y revocación | Detail.jsx |
| Portal público | Verification.jsx |
| Usuarios | UsersPage.jsx |
| Historial | Audit.jsx |

`layouts/InstitutionalLayout.jsx` conserva el menú lateral, la barra superior, los permisos de navegación y las rutas del panel. `App.jsx` conserva la recuperación de sesión y las rutas públicas. Los componentes extraídos mantienen el mismo contenido y comportamiento visual.

## Equivalencia con los archivos anteriores

| Antes | Ubicación o responsabilidad actual |
| --- | --- |
| frontend/main.jsx | frontend/src con vistas, componentes, sesión, rutas y API separadas |
| frontend/style.css | frontend/src/styles/app.css |
| public/ejemplo-lote.csv | frontend/public/ejemplo-lote.csv; la URL sigue siendo /ejemplo-lote.csv |
| backend/server.cjs con toda la lógica | server.cjs inicia; app.cjs configura; routes y controllers gestionan HTTP |
| backend/db.cjs | database/connection.cjs, database/seed.cjs y models |
| backend/migrations/001.sql | backend/database/migrations/001.sql, mismo esquema |
| backend/config.cjs | backend/config/environment.cjs |
| backend/certificates.cjs | backend/services/certificate.service.cjs y models |
| backend/blockchain.cjs | backend/services/blockchain.service.cjs |
| backend/pdf.cjs | backend/services/pdf.service.cjs |
| scripts auxiliares de informes Word | Eliminados después de entregar los documentos terminados en output/documentos |
| Informe original en la raíz | docs/referencias |

Los documentos Word existentes conservan la descripción de la versión en la que se generaron. Esta tabla permite ubicar sus referencias al código en la organización nueva.

## Contratos de funcionamiento conservados

- Los comandos `npm install`, `npm run setup`, `npm run dev`, `npm test` y `npm run build` siguen siendo los mismos.
- Las rutas `/api`, las URL de las pantallas, el puerto 5173 y el contrato Solidity permanecen iguales.
- No se cambia el esquema, se reinicia la base ni se regeneran las credenciales.
- Los hashes, los PDF y el journal de transacciones existentes se conservan.
- No se agregan dependencias de ejecución para la reorganización.

Antes de modificar el código se guardó un respaldo del código y una copia consistente de SQLite en `runtime/backups`. El manifiesto de integridad permite comprobar las credenciales, los documentos, la dirección del contrato y el journal al terminar.
