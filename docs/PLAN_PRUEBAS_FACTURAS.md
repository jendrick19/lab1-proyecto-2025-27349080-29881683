# Plan de Pruebas - Facturas, Items y Pagos

## Base URL
```
/api/bussines
```

## Orden de Pruebas (Importante: seguir este orden)

---

## 📋 PASO 1: Preparar Datos Necesarios

### 1.1 Obtener una Persona (PeopleAttended)
```http
GET /api/operative/personas?limit=1
```
**Guardar:** `personaId` de la respuesta

### 1.2 Obtener una Aseguradora (Insurer)
```http
GET /api/bussines/aseguradoras?limit=1
```
**Guardar:** `insurerId` de la respuesta

### 1.3 Obtener Prestaciones (Services) disponibles
```http
GET /api/bussines/prestaciones?limit=5
```
**Guardar:** Al menos 2-3 códigos de prestaciones (ej: `CONS001`, `LAB001`, `IMG001`)

---

## 🧾 PASO 2: Probar FACTURAS

### 2.1 Crear una Factura (con items)
```http
POST /api/bussines/facturas
Content-Type: application/json

{
  "numero": "FAC-TEST-001",
  "personaId": 1,
  "aseguradoraId": 1,
  "moneda": "VES",
  "items": [
    {
      "prestacionCodigo": "CONS001",
      "descripcion": "Consulta médica general",
      "cantidad": 1,
      "valorUnitario": 50000,
      "impuestos": 9500
    },
    {
      "prestacionCodigo": "LAB001",
      "descripcion": "Hemograma completo",
      "cantidad": 2,
      "valorUnitario": 15000,
      "impuestos": 5700
    }
  ]
}
```
**Guardar:** `id` de la factura creada (ej: `facturaId = 1`)

**Validaciones esperadas:**
- ✅ Status code: 201
- ✅ Estado de factura: "emitida"
- ✅ Total calculado correctamente: (50000 + 9500) + (30000 + 5700) = 95200
- ✅ SubTotal: 80000, Impuestos: 15200

### 2.2 Listar Facturas
```http
GET /api/bussines/facturas?page=1&limit=10
```

### 2.3 Obtener Factura por ID
```http
GET /api/bussines/facturas/1
```
**Reemplazar `1` con el `facturaId` guardado**

### 2.4 Buscar Factura por número
```http
GET /api/bussines/facturas?numero=FAC-TEST-001
```

### 2.5 Filtrar Facturas por estado
```http
GET /api/bussines/facturas?estado=emitida
```

---

## 📦 PASO 3: Probar ITEMS de Factura

### 3.1 Listar Items de una Factura
```http
GET /api/bussines/factura-items/factura/1
```
**Reemplazar `1` con el `facturaId` guardado**

### 3.2 Crear un nuevo Item
```http
POST /api/bussines/factura-items/factura/1
Content-Type: application/json

{
  "prestacionCodigo": "PROC001",
  "descripcion": "Electrocardiograma",
  "cantidad": 1,
  "valorUnitario": 30000,
  "impuestos": 5700
}
```
**Guardar:** `id` del item creado (ej: `itemId = 1`)

**Validaciones esperadas:**
- ✅ Status code: 201
- ✅ Total de factura se recalcula automáticamente
- ✅ Verificar que la factura ahora tiene el nuevo total

### 3.3 Obtener Item por ID
```http
GET /api/bussines/factura-items/1
```
**Reemplazar `1` con el `itemId` guardado**

### 3.4 Actualizar un Item
```http
PATCH /api/bussines/factura-items/1
Content-Type: application/json

{
  "cantidad": 2,
  "valorUnitario": 35000
}
```
**Validaciones esperadas:**
- ✅ Status code: 200
- ✅ Total del item se recalcula: (2 × 35000) + impuestos
- ✅ Total de factura se actualiza automáticamente

### 3.5 Eliminar un Item
```http
DELETE /api/bussines/factura-items/1
```
**Validaciones esperadas:**
- ✅ Status code: 200
- ✅ Total de factura se recalcula (se resta el item eliminado)

### 3.6 Recalcular Total de Factura
```http
POST /api/bussines/facturas/1/recalcular
```
**Validaciones esperadas:**
- ✅ Status code: 200
- ✅ Totales recalculados desde los items actuales

---

## 💰 PASO 4: Probar PAGOS

### 4.1 Obtener Saldo Pendiente de Factura
```http
GET /api/bussines/pagos/factura/1/saldo
```
**Reemplazar `1` con el `facturaId` guardado**

**Validaciones esperadas:**
- ✅ Status code: 200
- ✅ `saldoPendiente` = total de la factura (sin pagos aún)

### 4.2 Crear un Pago Parcial
```http
POST /api/bussines/pagos
Content-Type: application/json

{
  "facturaId": 1,
  "monto": 50000,
  "medio": "efectivo",
  "referencia": "REF-001",
  "estado": "completado"
}
```
**Guardar:** `id` del pago creado (ej: `pagoId = 1`)

**Validaciones esperadas:**
- ✅ Status code: 201
- ✅ Estado de factura cambia de "emitida" a "pendiente" (si no está pagada completamente)

### 4.3 Listar Pagos de una Factura
```http
GET /api/bussines/pagos/factura/1
```
**Validaciones esperadas:**
- ✅ Status code: 200
- ✅ Muestra el pago creado
- ✅ Incluye `saldoPendiente` actualizado

### 4.4 Crear otro Pago (completar factura)
```http
POST /api/bussines/pagos
Content-Type: application/json

{
  "facturaId": 1,
  "monto": 45200,
  "medio": "tarjeta",
  "referencia": "REF-002",
  "estado": "completado"
}
```
**Validaciones esperadas:**
- ✅ Status code: 201
- ✅ Estado de factura cambia a "pagada" (saldo = 0)
- ✅ No se puede crear otro pago (error esperado)

### 4.5 Intentar Crear Pago que Excede Saldo (Debe fallar)
```http
POST /api/bussines/pagos
Content-Type: application/json

{
  "facturaId": 1,
  "monto": 100000,
  "medio": "transferencia",
  "referencia": "REF-ERROR",
  "estado": "completado"
}
```
**Validaciones esperadas:**
- ❌ Status code: 400
- ❌ Error: "El monto del pago excede el saldo pendiente"

### 4.6 Listar Todos los Pagos
```http
GET /api/bussines/pagos?page=1&limit=10
```

### 4.7 Obtener Pago por ID
```http
GET /api/bussines/pagos/1
```

### 4.8 Actualizar Estado de Pago (pendiente → completado)
```http
PATCH /api/bussines/pagos/1
Content-Type: application/json

{
  "estado": "completado"
}
```

### 4.9 Filtrar Pagos por Estado
```http
GET /api/bussines/pagos?estado=completado
```

### 4.10 Filtrar Pagos por Medio
```http
GET /api/bussines/pagos?medio=efectivo
```

---

## 🚫 PASO 5: Probar Validaciones y Errores

### 5.1 Intentar Crear Factura Sin Items (Debe fallar)
```http
POST /api/bussines/facturas
Content-Type: application/json

{
  "numero": "FAC-ERROR-001",
  "personaId": 1,
  "aseguradoraId": 1,
  "moneda": "VES"
}
```
**Validaciones esperadas:**
- ❌ Status code: 400
- ❌ Error: "No se puede crear una factura sin items"

### 5.2 Intentar Crear Factura con Número Duplicado (Debe fallar)
```http
POST /api/bussines/facturas
Content-Type: application/json

{
  "numero": "FAC-TEST-001",
  "personaId": 1,
  "aseguradoraId": 1,
  "moneda": "VES",
  "items": [
    {
      "prestacionCodigo": "CONS001",
      "cantidad": 1,
      "valorUnitario": 50000,
      "impuestos": 9500
    }
  ]
}
```
**Validaciones esperadas:**
- ❌ Status code: 409
- ❌ Error: "Ya existe una factura con este número"

### 5.3 Intentar Anular Factura Pagada (Debe fallar según transiciones)
```http
PATCH /api/bussines/facturas/1
Content-Type: application/json

{
  "estado": "anulada"
}
```
**Nota:** Si la factura está "pagada", debería fallar la transición según las reglas de negocio.

### 5.4 Intentar Agregar Item a Factura Anulada
Primero crear y anular una factura nueva:
```http
POST /api/bussines/facturas
Content-Type: application/json

{
  "numero": "FAC-ANULADA-001",
  "personaId": 1,
  "aseguradoraId": 1,
  "moneda": "VES",
  "estado": "anulada",
  "items": [
    {
      "prestacionCodigo": "CONS001",
      "cantidad": 1,
      "valorUnitario": 50000,
      "impuestos": 9500
    }
  ]
}
```

Luego intentar agregar item:
```http
POST /api/bussines/factura-items/factura/[ID_ANULADA]
Content-Type: application/json

{
  "prestacionCodigo": "LAB001",
  "cantidad": 1,
  "valorUnitario": 15000,
  "impuestos": 2850
}
```
**Validaciones esperadas:**
- ❌ Status code: 400
- ❌ Error: "No se pueden agregar items a una factura en estado 'anulada'"

### 5.5 Intentar Crear Pago para Factura Anulada
```http
POST /api/bussines/pagos
Content-Type: application/json

{
  "facturaId": [ID_ANULADA],
  "monto": 10000,
  "medio": "efectivo"
}
```
**Validaciones esperadas:**
- ❌ Status code: 400
- ❌ Error: "No se pueden crear pagos para facturas anuladas"

---

## 📊 PASO 6: Probar Cálculos y Consistencia

### 6.1 Verificar Cálculo de Totales
Crear una factura con items conocidos y verificar:
- `subTotal` = Σ(cantidad × valorUnitario)
- `impuestos` = Σ(impuestos de cada item)
- `total` = subTotal + impuestos

### 6.2 Verificar Actualización de Estado por Pagos
1. Crear factura (estado: "emitida")
2. Crear pago parcial (estado cambia a: "pendiente")
3. Completar pago (estado cambia a: "pagada")

### 6.3 Verificar Saldo Pendiente
```
Saldo Pendiente = Total Factura - Suma de Pagos Completados
```

---

## 🔄 PASO 7: Probar Transiciones de Estado

### 7.1 Factura: emitida → pendiente
```http
PATCH /api/bussines/facturas/1
Content-Type: application/json

{
  "estado": "pendiente"
}
```

### 7.2 Factura: pendiente → pagada
```http
PATCH /api/bussines/facturas/1
Content-Type: application/json

{
  "estado": "pagada"
}
```

### 7.3 Pago: pendiente → completado
```http
PATCH /api/bussines/pagos/1
Content-Type: application/json

{
  "estado": "completado"
}
```

---

## 📝 Resumen de Endpoints a Probar

### Facturas
- ✅ `POST /api/bussines/facturas` - Crear factura
- ✅ `GET /api/bussines/facturas` - Listar facturas
- ✅ `GET /api/bussines/facturas/:id` - Obtener factura
- ✅ `PATCH /api/bussines/facturas/:id` - Actualizar factura
- ✅ `POST /api/bussines/facturas/:id/recalcular` - Recalcular totales

### Items de Factura
- ✅ `GET /api/bussines/factura-items/factura/:invoiceId` - Listar items
- ✅ `POST /api/bussines/factura-items/factura/:invoiceId` - Crear item
- ✅ `GET /api/bussines/factura-items/:id` - Obtener item
- ✅ `PATCH /api/bussines/factura-items/:id` - Actualizar item
- ✅ `DELETE /api/bussines/factura-items/:id` - Eliminar item

### Pagos
- ✅ `GET /api/bussines/pagos` - Listar pagos
- ✅ `POST /api/bussines/pagos` - Crear pago
- ✅ `GET /api/bussines/pagos/:id` - Obtener pago
- ✅ `PATCH /api/bussines/pagos/:id` - Actualizar pago
- ✅ `GET /api/bussines/pagos/factura/:invoiceId` - Listar pagos de factura
- ✅ `GET /api/bussines/pagos/factura/:invoiceId/saldo` - Obtener saldo pendiente

---

## 🎯 Checklist de Validaciones

### Facturas
- [ ] Se crea correctamente con items
- [ ] Total se calcula correctamente (subTotal + impuestos)
- [ ] Número de factura es único
- [ ] Estado por defecto es "emitida"
- [ ] No se puede crear sin items
- [ ] Se puede actualizar estado según transiciones permitidas

### Items
- [ ] Se agregan correctamente a factura
- [ ] Total de factura se recalcula automáticamente
- [ ] Se pueden actualizar y eliminar
- [ ] No se pueden modificar en facturas anuladas/pagadas

### Pagos
- [ ] Se crean correctamente
- [ ] No exceden saldo pendiente
- [ ] Estado de factura se actualiza automáticamente
- [ ] Saldo pendiente se calcula correctamente
- [ ] No se pueden crear para facturas anuladas/pagadas

---

## 💡 Tips para Pruebas

1. **Usar Postman/Insomnia/Thunder Client** para facilitar las pruebas
2. **Guardar IDs** en variables para usar en siguientes requests
3. **Verificar respuestas** no solo status code, sino también el contenido
4. **Probar casos límite** (valores máximos, negativos, null, etc.)
5. **Verificar relaciones** entre entidades (items → factura, pagos → factura)

