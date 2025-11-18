# 🌱 Seeders - Datos de Prueba

Este directorio contiene seeders para poblar la base de datos con datos de prueba.

## 📋 Seeders Disponibles

### `20241116000000-demo-professionals.js`

Crea **20 profesionales** con sus usuarios asociados.

#### Datos generados:
- **20 Usuarios** (tabla `Users`)
  - Usernames únicos (ej: `juangarcia1`, `mariarodriguez2`)
  - Emails únicos (ej: `juan.garcia1@hospital.com`)
  - Contraseñas hasheadas (hash de ejemplo)
  - Estado activo

- **20 Profesionales** (tabla `Professionals`)
  - Nombres y apellidos variados
  - Registros profesionales únicos (`MP-00001` a `MP-00020`)
  - 10 especialidades diferentes (duplicadas para cubrir 20 registros):
    - Cardiología
    - Pediatría
    - Traumatología
    - Dermatología
    - Neurología
    - Oftalmología
    - Ginecología
    - Psiquiatría
    - Medicina General
    - Odontología
  - Emails únicos
  - Teléfonos venezolanos de ejemplo
  - 2 de cada 3 tienen agenda habilitada
  - Estado activo

## 🚀 Cómo Ejecutar los Seeders

### Ejecutar todos los seeders:
```bash
npx sequelize-cli db:seed:all
```

### Ejecutar un seeder específico:
```bash
npx sequelize-cli db:seed --seed 20241116000000-demo-professionals.js
```

### Ver estado de los seeders:
```bash
npx sequelize-cli db:seed:status
```

### Deshacer el último seeder:
```bash
npx sequelize-cli db:seed:undo
```

### Deshacer un seeder específico:
```bash
npx sequelize-cli db:seed:undo --seed 20241116000000-demo-professionals.js
```

### Deshacer todos los seeders:
```bash
npx sequelize-cli db:seed:undo:all
```

## 📊 Ejemplo de Datos Generados

### Usuario:
```json
{
  "id": 1,
  "username": "juangarcia1",
  "email": "juan.garcia1@hospital.com",
  "status": true
}
```

### Profesional:
```json
{
  "id": 1,
  "userId": 1,
  "names": "Juan",
  "surNames": "García Pérez",
  "professionalRegister": "MP-00001",
  "specialty": "Cardiología",
  "email": "juan.garcia1@hospital.com",
  "phone": "+584121000000",
  "scheduleEnabled": true,
  "status": true
}
```

## ⚠️ Importante

- **Orden de ejecución**: El seeder crea primero los usuarios, luego los profesionales (por la clave foránea)
- **Rollback**: El `down` elimina primero profesionales, luego usuarios (orden inverso)
- **Emails únicos**: Todos los emails terminan en `@hospital.com` para facilitar el rollback
- **Registros únicos**: Todos los registros profesionales comienzan con `MP-` para facilitar el rollback
- **No usar en producción**: Los datos son de prueba, las contraseñas son hashes de ejemplo

## 🔧 Crear Nuevos Seeders

Para crear un nuevo seeder:

```bash
npx sequelize-cli seed:generate --name demo-appointments
```

Esto creará un archivo en `database/seeders/` con la estructura básica.

## 📝 Notas de Desarrollo

- Los seeders se ejecutan en orden alfabético por defecto
- El timestamp en el nombre del archivo controla el orden de ejecución
- Los seeders pueden ejecutarse múltiples veces (usa condiciones para evitar duplicados)
- Usa `bulkInsert` para insertar múltiples registros de una vez
- Usa `bulkDelete` en el método `down` para limpiar los datos
