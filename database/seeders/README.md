# 🌱 Seeders - Datos de Prueba

Este directorio contiene seeders para poblar la base de datos con datos de prueba.

## 📋 Seeders Disponibles

### `20251115000000-demo-people.js`

Crea **50 personas/pacientes** con datos variados.

#### Datos generados:
- **50 Personas** (tabla `PeopleAttendeds`)
  - Nombres y apellidos en español
  - Documentos únicos (Cédula, RIF, Pasaporte, Otro)
  - Fechas de nacimiento (18-80 años)
  - Géneros variados (M, F, O)
  - Teléfonos, emails y direcciones generados
  - Contactos de emergencia
  - 20% con alergias registradas
  - 90% activos, 10% inactivos

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

### `20251116000000-demo-care-units.js`

Crea **10 unidades de atención** médica.

#### Datos generados:
- **10 Unidades** (tabla `CareUnits`)
  - Nombres descriptivos
  - Tipos variados (Consulta Externa, Emergencia, Hospitalización, etc.)
  - Direcciones completas
  - Teléfonos de contacto
  - Horarios de atención
  - Todas activas

### `20251119000000-demo-schedules.js`

Crea **10 agendas** para profesionales.

#### Datos generados:
- **10 Agendas** (tabla `Schedules`)
  - Distribuidas entre profesionales (1-10)
  - Asignadas a unidades (1-10)
  - Fechas en diciembre 2025
  - Horarios variados (7:00 - 19:00)
  - Capacidades entre 8-30 personas
  - Estados: abierta, cerrada, reservada

### `20251120000000-demo-appointments.js` ✨ **NUEVO**

Crea **30 citas** con **9 registros de historial** de cambios.

#### Datos generados:
- **30 Citas** (tabla `Appointments`)
  - Distribuidas en el tiempo (pasadas, presentes, futuras)
  - Relacionadas con personas (1-50), profesionales (1-10), unidades (1-10)
  - 70% vinculadas a agendas
  - 20 motivos diferentes de consulta
  - Observaciones variadas (traer exámenes, ayunas, etc.)
  - Canales: Presencial y Virtual
  - Estados variados según temporalidad:
    - **Citas pasadas**: Cumplida, Cancelada, No asistió
    - **Citas próximas/futuras**: Solicitada, Confirmada
  - Duración: 30 minutos cada una
  - Horarios: 8:00 - 16:00

- **9 Registros de Historial** (tabla `AppointmentHistories`)
  - Cambios de estado (Solicitada → Confirmada → Cumplida)
  - Cambios de horario (reagendamientos)
  - Cancelaciones con motivo
  - Registros de inasistencia
  - Múltiples cambios en algunas citas
  - Razones detalladas de cada cambio

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

### Cita (Appointment):
```json
{
  "id": 1,
  "peopleId": 1,
  "professionalId": 1,
  "unitId": 1,
  "scheduleId": 1,
  "startTime": "2025-12-15T10:00:00.000Z",
  "endTime": "2025-12-15T10:30:00.000Z",
  "channel": "Presencial",
  "status": "Confirmada",
  "reason": "Consulta general de control",
  "observations": "Paciente en ayunas"
}
```

### Historial de Cita (AppointmentHistory):
```json
{
  "id": 1,
  "appointmentId": 1,
  "oldStatus": "Solicitada",
  "newStatus": "Confirmada",
  "oldStartTime": null,
  "newStartTime": null,
  "oldEndTime": null,
  "newEndTime": null,
  "changeReason": "Confirmación del paciente vía telefónica",
  "changedAt": "2025-12-10T15:30:00.000Z"
}
```

## ⚠️ Importante

### Orden de Ejecución Correcto

Los seeders **deben ejecutarse en este orden** debido a las dependencias de claves foráneas:

1. ✅ `20251115000000-demo-people.js` - Personas/Pacientes (sin dependencias)
2. ✅ `20241116000000-demo-professionals.js` - Profesionales (crea usuarios primero)
3. ✅ `20251116000000-demo-care-units.js` - Unidades de Atención (sin dependencias)
4. ✅ `20251119000000-demo-schedules.js` - Agendas (depende de profesionales y unidades)
5. ✅ `20251120000000-demo-appointments.js` - Citas e Historial (depende de todo lo anterior)

### Rollback

- El `down` de cada seeder **elimina en orden inverso** las dependencias
- Para `appointments`: elimina historial primero, luego citas
- Para `professionals`: elimina profesionales primero, luego usuarios

### Notas Adicionales

- **Emails únicos**: Los emails de profesionales terminan en `@hospital.com` para facilitar el rollback
- **Registros únicos**: Todos los registros profesionales comienzan con `MP-` para facilitar el rollback
- **No usar en producción**: Los datos son de prueba, las contraseñas son hashes de ejemplo
- **Múltiples ejecuciones**: Algunos seeders pueden generar duplicados si se ejecutan múltiples veces

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
