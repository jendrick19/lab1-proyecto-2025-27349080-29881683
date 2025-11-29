── src/
│ ├── shared/ Componentes compartidos entre módulos
│ │ ├── config/ Configuraciones (DB, JWT, env)
│ │ ├── middleware/ Middleware común (auth, validación, errores)
│ │ ├── utils/ Utilidades y helpers
│ │ └── database/ Base repository y transacciones
│ │
│ ├── modules/ Módulos
│ │ ├── nombre modulo/
│ │ │ ├── nombre modulo especifico/
│ │ │ │ ├── controllers/
│ │ │ │ ├── services/
│ │ │ │ ├── repositories/
│ │ │ │ ├── models/
│ │ │ │ ├── validators/
│ │ │ │ ├── routes/
│ │ │ │ └── index.js
│ │ │
│ ├── routes.js Registro central de rutas
│ └── app.js Configuración de Express
│
├── database/
│ ├── migrations/ Migraciones de base de datos
│ └── seeders/ Datos iniciales
│
├── tests/
│ ├── unit/ Tests unitarios por módulo
│ ├── integration/ Tests de integración
│ └── e2e/ Tests end-to-end
│
├── docs/
│ ├── api/ Documentación API (OpenAPI)
│ ├── database/ Esquemas y diagramas DB
│ ├── architecture/ Documentación de arquitectura
│ └── deployment/ Docker y despliegue
│
├── scripts/ Scripts de utilidad
│
├── .env.example
├── package.json
├── git.ignore
├── README.md
└── server.js Punto de entrada 

estos son los modulos
Operative: Agrupa la logística diaria pacientes, profesionales, agenda y citas.
 Clinic: Registra la atención médica y el proceso asistencial. Aquí vive todo lo que tiene
que ver con historias clínicas, diagnósticos, consentimientos y resultados.
 Bussines: Conecta lo clínico con lo económico, aseguradoras, planes, facturación y pagos.
Este módulo define cómo se monetiza y se controla la cobertura.
 Plataform: Servicios comunes del sistema, como autenticación, usuarios, roles o
notificaciones.
 Shared: Componentes que pueden ser usados por cualquier capa o dominio. 
