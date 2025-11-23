# 📝 Ejemplos de API - Notas Clínicas

Guía completa con ejemplos para probar todos los endpoints de notas clínicas.

**Base URL**: `http://localhost:3000/api/clinic/notas-clinicas`

---

## 📋 Tabla de Contenidos

1. [CRUD Básico](#crud-básico)
2. [Búsquedas Especializadas](#búsquedas-especializadas)
3. [Gestión de Versiones](#gestión-de-versiones)
4. [Filtros y Paginación](#filtros-y-paginación)

---

## CRUD Básico

### 1️⃣ Listar Todas las Notas Clínicas

**GET** `/api/clinic/notas-clinicas`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas?page=1&limit=10"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Lista de notas clínicas obtenida exitosamente",
  "data": [
    {
      "id": 1,
      "episodio": {
        "id": 5,
        "fechaApertura": "2024-11-01T10:00:00.000Z",
        "fechaCierre": null,
        "estado": "Abierto"
      },
      "profesional": {
        "id": 3,
        "nombres": "Juan",
        "apellidos": "García Pérez",
        "especialidad": "Cardiología"
      },
      "fechaNota": "2024-11-01T10:30:00.000Z",
      "versiones": [
        {
          "id": 1,
          "fechaVersion": "2024-11-01T10:30:00.000Z",
          "subjetivo": "Paciente refiere dolor abdominal...",
          "objetivo": "PA: 125/80 mmHg...",
          "analisis": "Colecistitis aguda...",
          "plan": "1. NPO 2. SSN 0.9% IV..."
        }
      ],
      "totalVersiones": 1,
      "createdAt": "2024-11-01T10:30:00.000Z",
      "updatedAt": "2024-11-01T10:30:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 20,
    "itemsPerPage": 10
  }
}
```

---

### 2️⃣ Obtener Nota Clínica por ID

**GET** `/api/clinic/notas-clinicas/:id`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/1"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Nota clínica encontrada",
  "data": {
    "id": 1,
    "episodio": {
      "id": 5,
      "fechaApertura": "2024-11-01T10:00:00.000Z",
      "fechaCierre": null,
      "estado": "Abierto"
    },
    "profesional": {
      "id": 3,
      "nombres": "Juan",
      "apellidos": "García Pérez",
      "especialidad": "Cardiología"
    },
    "fechaNota": "2024-11-01T10:30:00.000Z",
    "versiones": [
      {
        "id": 3,
        "fechaVersion": "2024-11-08T10:30:00.000Z",
        "subjetivo": "Paciente asintomático...",
        "objetivo": "Excelente estado general...",
        "analisis": "Resolución completa...",
        "plan": "1. ALTA MÉDICA..."
      },
      {
        "id": 2,
        "fechaVersion": "2024-11-04T10:30:00.000Z",
        "subjetivo": "Mejoría significativa...",
        "objetivo": "PA: 120/75...",
        "analisis": "Evolución favorable...",
        "plan": "1. Continuar dieta blanda..."
      },
      {
        "id": 1,
        "fechaVersion": "2024-11-01T10:30:00.000Z",
        "subjetivo": "Dolor abdominal tipo cólico...",
        "objetivo": "PA: 125/80, Murphy positivo...",
        "analisis": "Colecistitis aguda...",
        "plan": "1. NPO 2. Hidratación IV..."
      }
    ],
    "totalVersiones": 3
  }
}
```

---

### 3️⃣ Crear Nueva Nota Clínica

**POST** `/api/clinic/notas-clinicas`

**Body**:
```json
{
  "episodioId": 5,
  "profesionalId": 3,
  "fechaNota": "2024-11-22T14:30:00Z",
  "subjetivo": "Paciente refiere dolor abdominal tipo cólico de 48 horas de evolución, localizado en epigastrio e hipocondrio derecho, que se irradia a la espalda. Intensidad 7/10. Asociado a náuseas y vómitos ocasionales. Niega fiebre, diarrea o sangrado digestivo.",
  "objetivo": "PA: 125/80 mmHg, FC: 78 lpm, FR: 18 rpm, Temp: 36.8°C, Sat O2: 98%. Paciente consciente, orientado, colaborador. Abdomen: blando, depresible, doloroso a la palpación profunda en epigastrio e hipocondrio derecho, Murphy positivo. Ruidos hidroaéreos presentes. No se palpan masas ni visceromegalias.",
  "analisis": "Paciente masculino de 45 años con cuadro clínico compatible con COLECISTITIS AGUDA. Hallazgos sugestivos de inflamación vesicular. Factores de riesgo: antecedentes de colelitiasis. Diagnóstico diferencial: úlcera péptica perforada, pancreatitis aguda.",
  "plan": "1. Ayuno absoluto NPO\n2. Hidratación parenteral: SSN 0.9% 1000cc IV c/8h\n3. Analgesia: Metamizol 1g IV c/8h\n4. Antiemético: Metoclopramida 10mg IV c/8h\n5. Estudios complementarios: Hemograma completo, perfil hepático, amilasa, lipasa, Ecografía abdominal\n6. Interconsulta con Cirugía General\n7. Control de signos vitales c/6h\n8. Revaloración en 24 horas",
  "adjuntos": null
}
```

**cURL**:
```bash
curl -X POST "http://localhost:3000/api/clinic/notas-clinicas" \
  -H "Content-Type: application/json" \
  -d '{
    "episodioId": 5,
    "profesionalId": 3,
    "fechaNota": "2024-11-22T14:30:00Z",
    "subjetivo": "Paciente refiere dolor abdominal tipo cólico de 48 horas de evolución...",
    "objetivo": "PA: 125/80 mmHg, FC: 78 lpm...",
    "analisis": "Colecistitis aguda...",
    "plan": "1. NPO 2. Hidratación IV..."
  }'
```

**Respuesta**:
```json
{
  "codigo": 201,
  "mensaje": "Nota clínica creada exitosamente",
  "data": {
    "id": 21,
    "episodio": { ... },
    "profesional": { ... },
    "fechaNota": "2024-11-22T14:30:00.000Z",
    "versiones": [
      {
        "id": 43,
        "fechaVersion": "2024-11-22T14:30:00.000Z",
        "subjetivo": "Paciente refiere dolor abdominal...",
        "objetivo": "PA: 125/80 mmHg...",
        "analisis": "Colecistitis aguda...",
        "plan": "1. NPO 2. Hidratación IV..."
      }
    ],
    "totalVersiones": 1
  }
}
```

---

### 4️⃣ Actualizar Nota Clínica (Crear Nueva Versión)

**PATCH** `/api/clinic/notas-clinicas/:id`

**Body**:
```json
{
  "subjetivo": "Paciente refiere mejoría significativa del dolor abdominal, ahora de intensidad 3/10. Tolera vía oral con líquidos claros sin náuseas ni vómitos. Niega fiebre o escalofríos. Afebril las últimas 24 horas.",
  "objetivo": "PA: 120/75 mmHg, FC: 72 lpm, Temp: 36.5°C. Paciente en mejor estado general. Abdomen: blando, depresible, levemente doloroso a la palpación superficial en hipocondrio derecho, Murphy negativo. Ruidos hidroaéreos presentes y normales.",
  "analisis": "Evolución FAVORABLE de colecistitis aguda. Respuesta adecuada al tratamiento médico. Persiste leve dolor residual compatible con proceso inflamatorio en resolución. Ecografía reporta: vesícula con paredes engrosadas sin cálculos visibles.",
  "plan": "1. Continuar dieta blanda, fraccionada\n2. Omeprazol 20mg VO c/12h por 14 días\n3. Analgesia: Paracetamol 500mg VO c/8h PRN\n4. Suspender hidratación parenteral\n5. Control ambulatorio en 7 días\n6. Si presenta nuevamente dolor intenso, fiebre o vómitos: acudir a emergencias\n7. Valorar colecistectomía programada según evolución"
}
```

**cURL**:
```bash
curl -X PATCH "http://localhost:3000/api/clinic/notas-clinicas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "subjetivo": "Paciente refiere mejoría significativa...",
    "objetivo": "PA: 120/75 mmHg...",
    "analisis": "Evolución favorable...",
    "plan": "1. Continuar dieta blanda..."
  }'
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Nota clínica actualizada exitosamente (nueva versión creada)",
  "data": {
    "id": 1,
    "versiones": [
      {
        "id": 44,
        "fechaVersion": "2024-11-22T15:00:00.000Z",
        "subjetivo": "Paciente refiere mejoría...",
        "objetivo": "PA: 120/75 mmHg...",
        "analisis": "Evolución favorable...",
        "plan": "1. Continuar dieta blanda..."
      },
      {
        "id": 1,
        "fechaVersion": "2024-11-22T14:30:00.000Z",
        "subjetivo": "Paciente refiere dolor...",
        "objetivo": "PA: 125/80 mmHg...",
        "analisis": "Colecistitis aguda...",
        "plan": "1. NPO 2. Hidratación IV..."
      }
    ],
    "totalVersiones": 2
  }
}
```

---

## Búsquedas Especializadas

### 5️⃣ Listar Notas por Episodio

**GET** `/api/clinic/notas-clinicas/episodio/:episodeId`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/episodio/5?page=1&limit=10"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Notas clínicas del episodio obtenidas exitosamente",
  "data": [
    {
      "id": 1,
      "profesional": {
        "id": 3,
        "nombres": "Juan",
        "apellidos": "García Pérez",
        "especialidad": "Cardiología"
      },
      "fechaNota": "2024-11-01T10:30:00.000Z",
      "versiones": [ ... ],
      "totalVersiones": 2
    },
    {
      "id": 5,
      "profesional": {
        "id": 7,
        "nombres": "María",
        "apellidos": "López Díaz",
        "especialidad": "Medicina General"
      },
      "fechaNota": "2024-11-03T14:00:00.000Z",
      "versiones": [ ... ],
      "totalVersiones": 1
    }
  ],
  "pagination": { ... }
}
```

---

### 6️⃣ Listar Notas por Profesional

**GET** `/api/clinic/notas-clinicas/profesional/:professionalId`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/profesional/3?page=1&limit=10"
```

**Respuesta**: Similar al anterior, con todas las notas del profesional especificado.

---

### 7️⃣ Buscar Notas por Rango de Fechas

**GET** `/api/clinic/notas-clinicas/rango-fechas`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/rango-fechas?fechaDesde=2024-11-01&fechaHasta=2024-11-30&page=1&limit=20"
```

**Parámetros requeridos**:
- `fechaDesde`: Fecha inicio (formato: YYYY-MM-DD o ISO 8601)
- `fechaHasta`: Fecha fin (formato: YYYY-MM-DD o ISO 8601)

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Notas clínicas por rango de fechas obtenidas exitosamente",
  "data": [ ... ],
  "pagination": { ... }
}
```

---

## Gestión de Versiones

### 8️⃣ Ver Historial Completo de Versiones

**GET** `/api/clinic/notas-clinicas/:id/versiones`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/1/versiones"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Historial de versiones obtenido exitosamente",
  "data": {
    "nota": {
      "id": 1,
      "episodio": { ... },
      "profesional": { ... },
      "fechaNota": "2024-11-01T10:30:00.000Z"
    },
    "versiones": [
      {
        "id": 3,
        "fechaVersion": "2024-11-08T10:30:00.000Z",
        "subjetivo": "Paciente asintomático. Niega dolor...",
        "objetivo": "Excelente estado general...",
        "analisis": "Resolución completa de colecistitis aguda...",
        "plan": "1. ALTA MÉDICA 2. Dieta normal...",
        "adjuntos": null,
        "createdAt": "2024-11-08T10:30:00.000Z",
        "updatedAt": "2024-11-08T10:30:00.000Z"
      },
      {
        "id": 2,
        "fechaVersion": "2024-11-04T10:30:00.000Z",
        "subjetivo": "Mejoría significativa del dolor...",
        "objetivo": "PA: 120/75 mmHg...",
        "analisis": "Evolución favorable...",
        "plan": "1. Continuar dieta blanda...",
        "adjuntos": null,
        "createdAt": "2024-11-04T10:30:00.000Z",
        "updatedAt": "2024-11-04T10:30:00.000Z"
      },
      {
        "id": 1,
        "fechaVersion": "2024-11-01T10:30:00.000Z",
        "subjetivo": "Dolor abdominal tipo cólico...",
        "objetivo": "PA: 125/80, Murphy positivo...",
        "analisis": "Colecistitis aguda...",
        "plan": "1. NPO 2. Hidratación IV...",
        "adjuntos": null,
        "createdAt": "2024-11-01T10:30:00.000Z",
        "updatedAt": "2024-11-01T10:30:00.000Z"
      }
    ],
    "totalVersiones": 3
  }
}
```

---

### 9️⃣ Obtener Última Versión

**GET** `/api/clinic/notas-clinicas/:id/version-actual`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/1/version-actual"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Última versión obtenida exitosamente",
  "data": {
    "nota": {
      "id": 1,
      "episodio": { ... },
      "profesional": { ... }
    },
    "version": {
      "id": 3,
      "fechaVersion": "2024-11-08T10:30:00.000Z",
      "subjetivo": "Paciente asintomático...",
      "objetivo": "Excelente estado general...",
      "analisis": "Resolución completa...",
      "plan": "1. ALTA MÉDICA..."
    }
  }
}
```

---

### 🔟 Comparar Dos Versiones

**GET** `/api/clinic/notas-clinicas/:id/comparar?version1=X&version2=Y`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/1/comparar?version1=1&version2=3"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Comparación de versiones realizada exitosamente",
  "data": {
    "nota": {
      "id": 1,
      "episodio": { ... },
      "profesional": { ... }
    },
    "version1": {
      "id": 1,
      "fechaVersion": "2024-11-01T10:30:00.000Z",
      "subjetivo": "Dolor abdominal tipo cólico de 48h...",
      "objetivo": "PA: 125/80, Murphy positivo...",
      "analisis": "Colecistitis aguda...",
      "plan": "1. NPO 2. Hidratación IV..."
    },
    "version2": {
      "id": 3,
      "fechaVersion": "2024-11-08T10:30:00.000Z",
      "subjetivo": "Paciente asintomático...",
      "objetivo": "Excelente estado general...",
      "analisis": "Resolución completa...",
      "plan": "1. ALTA MÉDICA..."
    },
    "cambios": {
      "subjetivo": true,
      "objetivo": true,
      "analisis": true,
      "plan": true,
      "attachments": false
    }
  }
}
```

---

### 1️⃣1️⃣ Obtener Versión Específica por ID

**GET** `/api/clinic/notas-clinicas/version/:versionId`

```bash
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas/version/5"
```

**Respuesta**:
```json
{
  "codigo": 200,
  "mensaje": "Versión encontrada",
  "data": {
    "version": {
      "id": 5,
      "fechaVersion": "2024-11-04T10:30:00.000Z",
      "subjetivo": "Mejoría significativa del dolor...",
      "objetivo": "PA: 120/75 mmHg...",
      "analisis": "Evolución favorable...",
      "plan": "1. Continuar dieta blanda..."
    },
    "nota": {
      "id": 2,
      "episodio": { ... },
      "profesional": { ... }
    }
  }
}
```

---

## Filtros y Paginación

### Filtros Disponibles en Listado

**GET** `/api/clinic/notas-clinicas`

**Parámetros Query**:

| Parámetro | Tipo | Descripción | Ejemplo |
|-----------|------|-------------|---------|
| `page` | Integer | Número de página | `page=1` |
| `limit` | Integer | Elementos por página (1-100) | `limit=20` |
| `sortBy` | String | Campo de ordenamiento | `sortBy=fecha` |
| `sortOrder` | String | Orden (asc/desc) | `sortOrder=desc` |
| `episodio` | Integer | Filtrar por ID de episodio | `episodio=5` |
| `profesional` | Integer | Filtrar por ID de profesional | `profesional=3` |
| `fechaDesde` | Date | Filtrar desde fecha | `fechaDesde=2024-11-01` |
| `fechaHasta` | Date | Filtrar hasta fecha | `fechaHasta=2024-11-30` |

**Campos de Ordenamiento (`sortBy`)**:
- `fecha` - Por fecha de la nota (default)
- `episodio` - Por ID de episodio
- `profesional` - Por ID de profesional
- `createdAt` - Por fecha de creación

**Ejemplos**:

```bash
# Notas del episodio 5, ordenadas por fecha descendente
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas?episodio=5&sortBy=fecha&sortOrder=desc"

# Notas del profesional 3 en noviembre de 2024
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas?profesional=3&fechaDesde=2024-11-01&fechaHasta=2024-11-30"

# Página 2, mostrando 5 notas por página
curl -X GET "http://localhost:3000/api/clinic/notas-clinicas?page=2&limit=5"
```

---

## 🚨 Manejo de Errores

### Error 400 - Validación

```json
{
  "codigo": 400,
  "mensaje": "Errores de validación",
  "tipo": "ValidationError",
  "errores": [
    {
      "campo": "subjetivo",
      "mensaje": "El campo subjetivo es requerido",
      "valor": ""
    }
  ]
}
```

### Error 404 - No Encontrado

```json
{
  "codigo": 404,
  "mensaje": "Nota clínica no encontrada",
  "tipo": "NotFoundError"
}
```

### Error 422 - Lógica de Negocio

```json
{
  "codigo": 422,
  "mensaje": "No se pueden crear notas clínicas en un episodio cerrado",
  "tipo": "BusinessLogicError"
}
```

---

## 📦 Colección Postman

Puedes importar estos endpoints en Postman creando una colección con las siguientes variables:

```json
{
  "baseUrl": "http://localhost:3000",
  "episodeId": 5,
  "professionalId": 3,
  "noteId": 1,
  "versionId": 1
}
```

---

## 🧪 Testing Rápido

Script bash para testing rápido:

```bash
#!/bin/bash
BASE_URL="http://localhost:3000/api/clinic/notas-clinicas"

echo "1. Listar notas"
curl -X GET "$BASE_URL?page=1&limit=5"

echo "\n\n2. Obtener nota 1"
curl -X GET "$BASE_URL/1"

echo "\n\n3. Historial de versiones"
curl -X GET "$BASE_URL/1/versiones"

echo "\n\n4. Última versión"
curl -X GET "$BASE_URL/1/version-actual"

echo "\n\n5. Comparar versiones"
curl -X GET "$BASE_URL/1/comparar?version1=1&version2=2"
```

---

**Fecha**: 2024-11-22  
**Versión**: 1.0.0


