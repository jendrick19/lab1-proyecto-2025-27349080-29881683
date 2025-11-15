# Validators

Esta carpeta contiene los **validadores** de datos de entrada para el módulo de agenda.

## Propósito

Los validators se encargan de:

- ✅ Validar datos del **request** (body, params, query)
- ✅ Sanitizar inputs (limpiar, normalizar datos)
- ✅ Verificar tipos de datos, formatos, rangos
- ✅ Proporcionar mensajes de error claros y específicos
- ✅ Proteger contra datos maliciosos o incorrectos

## Tecnología

Utilizamos **express-validator** que es la librería estándar para validación en Express:

```javascript
const { body, param, query, validationResult } = require('express-validator');
```

## Uso en Rutas

Los validators se aplican como **middleware** antes del controller:

```javascript
router.post('/', validateCreate, createHandler);
//             ↑ validator     ↑ controller
```

### Flujo de Validación:

```
Request → Validator → Controller → Service → Repository → DB
          ↓
    Si es inválido → 400 Bad Request
    Si es válido   → Continúa
```

## Ejemplo Práctico

### 1. Definir validación (`people.validator.js`)

```javascript
const validateCreate = [
  body('nombres')
    .notEmpty().withMessage('Los nombres son requeridos')
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/),
  
  body('correo')
    .notEmpty()
    .isEmail().withMessage('Correo inválido')
    .normalizeEmail(),
  
  handleValidationErrors,
];
```

### 2. Aplicar en ruta (`people.routes.js`)

```javascript
router.post('/', validateCreate, createHandler);
```

### 3. Respuesta de error (si falla validación)

```json
{
  "mensaje": "Errores de validación",
  "errores": [
    {
      "campo": "nombres",
      "mensaje": "Los nombres son requeridos",
      "valor": ""
    },
    {
      "campo": "correo",
      "mensaje": "Correo inválido",
      "valor": "correo-mal-escrito"
    }
  ]
}
```

## Tipos de Validaciones Comunes

### Validaciones de Campo

```javascript
body('campo')
  .notEmpty()                    // No vacío
  .isString()                    // Es string
  .isInt()                       // Es entero
  .isFloat()                     // Es decimal
  .isBoolean()                   // Es booleano
  .isEmail()                     // Es email válido
  .isURL()                       // Es URL válida
  .isISO8601()                   // Es fecha válida
  .isIn(['valor1', 'valor2'])    // Está en lista
```

### Validaciones de Longitud

```javascript
body('campo')
  .isLength({ min: 5, max: 100 })   // Longitud entre 5 y 100
  .isLength({ min: 1 })              // Longitud mínima 1
```

### Validaciones con Regex

```javascript
body('telefono')
  .matches(/^[0-9]{7,15}$/)          // Solo números, 7-15 dígitos
```

### Validaciones Personalizadas

```javascript
body('edad')
  .custom((value) => {
    if (value < 18) {
      throw new Error('Debe ser mayor de 18 años');
    }
    return true;
  })
```

### Sanitización

```javascript
body('correo')
  .normalizeEmail()                   // Normaliza email
  .trim()                             // Elimina espacios
  .toLowerCase()                      // Convierte a minúsculas
```

## Validaciones por Tipo de Request

### Body (POST/PATCH)
```javascript
body('campo').notEmpty()
```

### Params (/:id)
```javascript
param('id').isInt()
```

### Query (?page=1&limit=20)
```javascript
query('page').optional().isInt()
```

## Mejores Prácticas

1. **Separar validaciones por operación**:
   - `validateCreate` - Para crear (campos requeridos)
   - `validateUpdate` - Para actualizar (campos opcionales)
   - `validateId` - Para operaciones por ID
   - `validateList` - Para listar (query params)

2. **Mensajes claros en español**:
   ```javascript
   .withMessage('El nombre debe tener entre 2 y 100 caracteres')
   ```

3. **Validar todos los campos**:
   - Tipo de dato
   - Formato
   - Rango/longitud
   - Valores permitidos

4. **Sanitizar siempre**:
   ```javascript
   .trim()           // Elimina espacios
   .normalizeEmail() // Normaliza emails
   .escape()         // Escapa caracteres especiales (XSS)
   ```

5. **Usar `optional()` para campos no requeridos**:
   ```javascript
   body('telefono').optional().isLength({ min: 7 })
   ```

## Beneficios

- 🛡️ **Seguridad**: Previene inyecciones y datos maliciosos
- ✅ **Calidad**: Garantiza datos consistentes en la BD
- 📝 **Claridad**: Mensajes de error específicos para el usuario
- 🧪 **Testeable**: Fácil de probar validaciones aisladamente
- 🔧 **Mantenible**: Validaciones centralizadas y reutilizables
- 🚀 **Performance**: Detecta errores antes de llegar a la BD

## Referencias

- [Express Validator Docs](https://express-validator.github.io/docs/)
- [Validation Best Practices](https://express-validator.github.io/docs/guides/getting-started)

