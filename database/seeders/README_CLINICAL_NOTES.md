# 📝 Seeder de Notas Clínicas y Versiones

## Descripción

Este seeder crea **versiones de contenido SOAP** para las 20 primeras notas clínicas existentes en la base de datos. Simula un escenario real de evolución médica con consulta inicial, seguimiento y alta.

## 📋 ¿Qué Crea?

El seeder `20251122000000-demo-clinical-note-versions.js` genera:

- **Versiones de notas clínicas** con contenido SOAP completo
- **3 tipos de evolución médica**:
  - ✅ Consulta Inicial
  - ✅ Seguimiento (opcional)
  - ✅ Alta Médica (opcional)

### Distribución de Versiones

Cada nota clínica recibirá **1, 2 o 3 versiones** de forma aleatoria:

| Versiones | Descripción | Cantidad Aproximada |
|-----------|-------------|---------------------|
| 1 versión | Solo consulta inicial | ~7 notas |
| 2 versiones | Consulta inicial + Seguimiento | ~7 notas |
| 3 versiones | Consulta inicial + Seguimiento + Alta | ~6 notas |

## 🔗 Dependencias

Este seeder **REQUIERE** que los siguientes seeders hayan sido ejecutados previamente:

1. ✅ `20251115000000-demo-people.js` - Pacientes
2. ✅ `20241116000000-demo-professionals.js` - Profesionales
3. ✅ `20251121000000-demo-episodes.js` - Episodios y Notas Clínicas

## 🚀 Ejecución

### Opción 1: Ejecutar solo este seeder

```bash
npx sequelize-cli db:seed --seed 20251122000000-demo-clinical-note-versions.js
```

### Opción 2: Ejecutar todos los seeders en orden

```bash
npx sequelize-cli db:seed:all
```

### Opción 3: Ejecutar desde el script personalizado

```bash
cd database/seeders
bash run-seeders.sh
```

## 📊 Datos Generados

### Contenido SOAP Realista

Cada versión incluye campos SOAP (Subjective, Objective, Assessment, Plan) con contenido médico realista:

#### **S - Subjetivo (Subjective)**
Síntomas referidos por el paciente:
- Dolor abdominal con características detalladas
- Cefalea con factores asociados
- Problemas respiratorios
- Dolor lumbar y ciática
- Vértigo y mareos

#### **O - Objetivo (Objective)**
Hallazgos de la exploración física:
- Signos vitales completos (PA, FC, FR, Temp, Sat O2)
- Examen físico por sistemas
- Maniobras especiales (Murphy, Lasègue, Romberg)
- Estado general del paciente

#### **A - Análisis (Assessment/Analysis)**
Impresión diagnóstica:
- Diagnóstico principal
- Diagnósticos diferenciales
- Factores de riesgo
- Hallazgos relevantes

#### **P - Plan (Plan)**
Plan terapéutico detallado:
- Medicación con dosis y vías de administración
- Estudios complementarios
- Interconsultas
- Seguimiento
- Signos de alarma

### Especialidades Simuladas

El contenido SOAP cubre diferentes cuadros clínicos:
- 🩺 Colecistitis aguda
- 🧠 Migraña
- 🫁 Bronquitis aguda
- 🦴 Lumbociatalgia / Hernia discal
- 👂 Vértigo posicional paroxístico benigno

## 🔄 Evolución Temporal

Las versiones se crean con fechas secuenciales:

```
Consulta Inicial (Día 0)
    ↓
Seguimiento (Día +3)
    ↓
Alta Médica (Día +7)
```

## 📝 Ejemplo de Salida

```bash
📋 Encontradas 20 notas clínicas para agregar versiones
✅ Seeder ejecutado exitosamente:
   - 20 notas clínicas procesadas
   - 42 versiones creadas
   - Distribución de versiones:
     • 7 notas con 1 versión (inicial)
     • 6 notas con 2 versiones (inicial + seguimiento)
     • 7 notas con 3 versiones (inicial + seguimiento + alta)
```

## 🗄️ Estructura en Base de Datos

### Tabla: ClinicalNoteVersions

```sql
CREATE TABLE ClinicalNoteVersions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  noteId INT NOT NULL,                    -- FK a ClinicalNotes
  versionDate DATETIME NOT NULL,
  subjective TEXT NOT NULL,               -- Campo S de SOAP
  objective TEXT NOT NULL,                -- Campo O de SOAP
  analysis TEXT NOT NULL,                 -- Campo A de SOAP
  plan TEXT NOT NULL,                     -- Campo P de SOAP
  attachments VARCHAR(500),
  createdAt DATETIME NOT NULL,
  updatedAt DATETIME NOT NULL,
  FOREIGN KEY (noteId) REFERENCES ClinicalNotes(id)
);
```

## 🔙 Rollback

Para revertir los cambios:

```bash
npx sequelize-cli db:seed:undo --seed 20251122000000-demo-clinical-note-versions.js
```

Esto eliminará **SOLO las versiones** de las primeras 20 notas clínicas, manteniendo intactas las notas mismas.

## 🧪 Validación

Después de ejecutar el seeder, puedes verificar los datos:

```sql
-- Ver cantidad de versiones por nota
SELECT 
  cn.id AS nota_id,
  COUNT(cnv.id) AS total_versiones,
  MIN(cnv.versionDate) AS primera_version,
  MAX(cnv.versionDate) AS ultima_version
FROM ClinicalNotes cn
LEFT JOIN ClinicalNoteVersions cnv ON cn.id = cnv.noteId
GROUP BY cn.id
ORDER BY cn.id
LIMIT 20;

-- Ver contenido de una nota con todas sus versiones
SELECT 
  cnv.id,
  cnv.versionDate,
  LEFT(cnv.subjective, 100) AS subjetivo_preview,
  LEFT(cnv.plan, 100) AS plan_preview
FROM ClinicalNoteVersions cnv
WHERE cnv.noteId = 1
ORDER BY cnv.versionDate ASC;
```

## 📊 Casos de Uso

Este seeder es ideal para:

1. **Testing de la API**: Probar endpoints con datos realistas
2. **Desarrollo del Frontend**: Visualizar evolución de pacientes
3. **Demostración del Sistema**: Mostrar funcionalidad completa
4. **Capacitación**: Entrenar usuarios con casos clínicos reales

## ⚠️ Notas Importantes

1. El seeder es **idempotente** - puedes ejecutarlo múltiples veces
2. Solo procesa las **primeras 20 notas clínicas**
3. El contenido SOAP es **ficticio pero realista**
4. Las fechas respetan el orden cronológico del episodio
5. No modifica datos existentes, solo agrega versiones

## 🔗 Archivos Relacionados

- **Repository**: `src/modules/clinic/repositories/ClinicalNoteRepository.js`
- **Service**: `src/modules/clinic/services/ClinicalNoteService.js`
- **Controller**: `src/modules/clinic/controllers/ClinicalNoteController.js`
- **Routes**: `src/modules/clinic/routes/clinicalNote.routes.js`
- **Validator**: `src/modules/clinic/validators/ClinicalNoteValidator.js`

## 🎯 Próximos Pasos

Después de ejecutar este seeder, puedes:

1. Probar la API en `/api/clinic/notas-clinicas`
2. Ver el historial de versiones con `GET /api/clinic/notas-clinicas/:id/versiones`
3. Comparar versiones con `GET /api/clinic/notas-clinicas/:id/comparar?version1=X&version2=Y`
4. Listar notas por episodio con `GET /api/clinic/notas-clinicas/episodio/:id`

---

**Creado por**: Sistema de Gestión Médica
**Fecha**: 2024-11-22
**Versión**: 1.0.0

