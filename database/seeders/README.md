# Seeders - Orden de Ejecución

Este documento describe el orden correcto para ejecutar los seeders debido a las dependencias entre tablas.

## Orden de Ejecución

Los seeders deben ejecutarse en el siguiente orden:

1. **Personas (PeopleAttended)**
   ```bash
   npx sequelize-cli db:seed --seed 20251115000000-demo-people.js
   ```

2. **Profesionales (Professionals y Users)**
   ```bash
   npx sequelize-cli db:seed --seed 20241116000000-demo-professionals.js
   ```

3. **Unidades de Atención (CareUnits)**
   ```bash
   npx sequelize-cli db:seed --seed 20251116000000-demo-care-units.js
   ```

4. **Agendas (Schedules)**
   ```bash
   npx sequelize-cli db:seed --seed 20251119000000-demo-schedules.js
   ```

5. **Citas (Appointments)**
   ```bash
   npx sequelize-cli db:seed --seed 20251120000000-demo-appointments.js
   ```

6. **Episodios con Notas Clínicas y Diagnósticos** ⭐ NUEVO
   ```bash
   npx sequelize-cli db:seed --seed 20251121000000-demo-episodes.js
   ```

7. **Diagnósticos (Opcional - Seeder Independiente)** 🆕
   ```bash
   npx sequelize-cli db:seed --seed 20251123000000-demo-diagnosis.js
   ```
   > ⚠️ **Nota**: Este seeder es opcional. El seeder de episodios (paso 6) ya crea diagnósticos básicos.
   > Usa este seeder si quieres reemplazar o agregar más diagnósticos con códigos CIE-10 completos.

## Ejecutar Todos los Seeders

Para ejecutar todos los seeders en orden:

```bash
npx sequelize-cli db:seed:all
```

## Revertir Seeders

Para revertir el último seeder:

```bash
npx sequelize-cli db:seed:undo
```

Para revertir todos los seeders:

```bash
npx sequelize-cli db:seed:undo:all
```

## Datos Generados por el Seeder de Episodios

El seeder `20251121000000-demo-episodes.js` crea:

- **30 Episodios** con diferentes estados (70% abiertos, 30% cerrados)
- **1-3 Notas Clínicas por episodio** (promedio 60 notas)
- **1-2 Diagnósticos por episodio** (promedio 45 diagnósticos)

### Tipos de Episodios
- Consulta
- Procedimiento
- Control
- Urgencia

### Estados
- Abierto
- Cerrado

### Diagnósticos Incluidos
Se utilizan códigos CIE-10 reales para diagnósticos comunes:
- J06.9 - Infección aguda de las vías respiratorias superiores
- R10.4 - Dolores abdominales
- I10 - Hipertensión esencial
- E11.9 - Diabetes mellitus
- M54.5 - Dolor lumbar
- Y muchos más...

## Seeder Independiente de Diagnósticos

El seeder `20251123000000-demo-diagnosis.js` es un seeder especializado que:

### Características:
- ✅ **40+ códigos CIE-10** organizados por categoría
- ✅ **Diagnósticos principales y secundarios** (solo 1 principal por episodio)
- ✅ **Tipos**: Presuntivo o Definitivo
- ✅ **1-3 diagnósticos por episodio** (aleatorio)
- ✅ **Sin duplicados** por episodio

### Categorías de CIE-10 incluidas:
- 🫁 **Respiratorias**: J06.9, J00, J18.9, J45.9...
- ❤️ **Cardiovasculares**: I10, I20.9, I25.1, I50.9...
- 🩺 **Metabólicas**: E11.9, E78.5, E66.9...
- 😣 **Dolor/Síntomas**: R10.4, R51, M54.5, R07.4...
- 🍽️ **Gastrointestinales**: K21.9, K29.7, K59.0...
- 🧠 **Salud Mental**: F41.9, F32.9...
- 👁️ **Oftalmología**: H52.1, H52.4...
- 🏥 **Controles**: Z00.0, Z09, Z01.8...

### Cuándo usar este seeder:

**Opción 1 - Datos completos desde el inicio:**
```bash
# Ejecutar seeder de episodios (incluye diagnósticos básicos)
npx sequelize-cli db:seed --seed 20251121000000-demo-episodes.js
```

**Opción 2 - Reemplazar con diagnósticos completos:**
```bash
# 1. Ejecutar seeder de episodios SIN ejecutar el de diagnósticos
# 2. Borrar diagnósticos básicos
DELETE FROM Diagnoses;

# 3. Ejecutar seeder de diagnósticos completo
npx sequelize-cli db:seed --seed 20251123000000-demo-diagnosis.js
```

**Opción 3 - Solo diagnósticos (episodios ya existen):**
```bash
# Si ya tienes episodios y quieres agregarles diagnósticos
npx sequelize-cli db:seed --seed 20251123000000-demo-diagnosis.js
```

## Notas Importantes

⚠️ **Dependencias:**
- El seeder de episodios requiere que existan:
  - Al menos 30 personas activas (de `demo-people.js`)
  - Al menos 15 profesionales activos (de `demo-professionals.js`)

⚠️ **Orden de Eliminación:**
Al revertir seeders, se debe respetar el orden inverso de creación para evitar errores de integridad referencial.

## Verificación de Datos

Después de ejecutar los seeders, puedes verificar los datos:

```sql
-- Contar episodios
SELECT COUNT(*) FROM Episodes;

-- Contar notas clínicas
SELECT COUNT(*) FROM ClinicalNotes;

-- Contar diagnósticos
SELECT COUNT(*) FROM Diagnoses;

-- Ver episodios con sus relaciones
SELECT 
  e.id,
  e.type,
  e.status,
  p.names,
  p.surNames,
  COUNT(DISTINCT cn.id) as num_notas,
  COUNT(DISTINCT d.id) as num_diagnosticos
FROM Episodes e
JOIN PeopleAttendeds p ON e.peopleId = p.id
LEFT JOIN ClinicalNotes cn ON e.id = cn.episodeId
LEFT JOIN Diagnoses d ON e.id = d.episodeId
GROUP BY e.id;
```
