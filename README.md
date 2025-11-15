# Plataforma Clínica - Laboratorio 1

Este proyecto aplica la arquitectura modular propuesta en `estructura carpetas.md`, separando responsabilidades por dominios (Operative, Clinic, Bussines, Platform) y manteniendo componentes compartidos en `src/shared`.

## Cómo ejecutar

```bash
npm install
npm run dev
```

El servidor se inicia en `http://localhost:3000`.

## Estructura principal

- `src/app.js`: configuración de Express.
- `src/routes.js`: registro central de rutas y módulos.
- `src/modules/`: módulos de dominio (clinic, operative, bussines, platform).
- `src/shared/`: componentes reutilizables (config, middleware, utils, database).
- `database/`: migraciones y seeders de Sequelize.
- `docs/`: documentación de API, base de datos, arquitectura y despliegue.
- `tests/`: carpetas preparadas para pruebas unitarias, de integración y e2e.

## Scripts

- `npm start`: ejecuta el servidor en modo producción.
- `npm run dev`: ejecuta el servidor usando `nodemon`.

## Configuración

Copia `.env.example` a `.env` y completa las variables de entorno necesarias para la base de datos y el puerto del servidor.

