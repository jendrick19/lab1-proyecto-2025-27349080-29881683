# Database

Esta carpeta contiene toda la configuración y gestión de la base de datos del proyecto.

## Estructura

```
database/
├── config/
│   └── database.js          # Configuración de conexión a BD (dev, test, prod)
├── models/
│   └── index.js             # Inicialización de Sequelize y registro de modelos
├── migrations/              # Migraciones de Sequelize (cambios en esquema)
└── seeders/                 # Seeders para datos de prueba
```

## Descripción

### `/config/`
Contiene la configuración de conexión a la base de datos para diferentes entornos (development, test, production).

### `/models/`
- **index.js**: Inicializa Sequelize, carga todos los modelos de los módulos y configura las asociaciones.
- Los modelos individuales están en sus respectivos módulos (`src/modules/`).

### `/migrations/`
Scripts de migración generados por Sequelize CLI para crear y modificar la estructura de la base de datos.

### `/seeders/`
Scripts para poblar la base de datos con datos iniciales o de prueba.

## Uso

### Ejecutar migraciones
```bash
npx sequelize-cli db:migrate
```

### Revertir última migración
```bash
npx sequelize-cli db:migrate:undo
```

### Ejecutar seeders
```bash
npx sequelize-cli db:seed:all
```

### Crear nueva migración
```bash
npx sequelize-cli migration:generate --name nombre-de-la-migracion
```

### Crear nuevo seeder
```bash
npx sequelize-cli seed:generate --name nombre-del-seeder
```

## Notas

- La configuración de Sequelize CLI está en el archivo `.sequelizerc` en la raíz del proyecto.
- Los modelos se definen en los módulos respectivos (`src/modules/`) pero se registran centralmente aquí.
- Las variables de entorno para la configuración de BD están en el archivo `.env`.

