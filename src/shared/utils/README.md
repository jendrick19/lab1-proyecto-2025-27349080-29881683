# Utilidades compartidas

Guarda aquí helpers genéricos, formateadores, adaptadores y cualquier lógica reutilizable.

## Helpers disponibles

### `pagination.helper.js`
Utilidades para manejo de paginación en endpoints.

- **`buildPaginationParams(page, limit)`**: Valida y normaliza parámetros de paginación
- **`buildPaginationResponse(rows, count, page, limit)`**: Construye respuesta paginada estándar

### `CIE10Helper.js`
Utilidades para validación de códigos CIE-10 (Clasificación Internacional de Enfermedades).

- **`CIE10_REGEX`**: Expresión regular para formato CIE-10
- **`isValidCIE10Code(code)`**: Valida si un código cumple con formato CIE-10
- **`validateAndNormalizeCIE10Code(code)`**: Valida y normaliza código CIE-10 (mayúsculas)
- **`getCIE10Category(code)`**: Extrae categoría principal de un código CIE-10
- **`hasSubcategory(code)`**: Verifica si un código tiene subcategoría

#### Ejemplo de uso:

```javascript
const { validateAndNormalizeCIE10Code } = require('../shared/utils/CIE10Helper');

// Validar y normalizar código
try {
  const code = validateAndNormalizeCIE10Code('j06.9'); // Retorna: 'J06.9'
} catch (error) {
  console.error(error.message); // Código CIE-10 inválido...
}
```

