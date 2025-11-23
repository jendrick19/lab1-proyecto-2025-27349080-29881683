# 🚀 Guía Rápida - Seeder de 50 Personas

## ⚡ Inicio Rápido

### Opción 1: Con scripts npm (Recomendado)

```bash
# Ejecutar el seeder (crea 50 personas)
npm run seed

# Eliminar las personas creadas
npm run seed:undo
```

### Opción 2: Con Sequelize CLI

```bash
# Ejecutar el seeder
npx sequelize-cli db:seed --seed 20251115000000-demo-people.js

# Eliminar las personas
npx sequelize-cli db:seed:undo --seed 20251115000000-demo-people.js
```

### Opción 3: Con Node.js directamente

```bash
# Ejecutar el seeder
node scripts/run-seeder.js

# Eliminar las personas
node scripts/clear-seeder.js
```

---

## 📋 ¿Qué hace el seeder?

Crea **50 personas** con datos aleatorios pero realistas:

✅ **Nombres en español**: María, José, Carlos, Ana, etc.  
✅ **Apellidos reales**: García, Rodríguez, Martínez, etc.  
✅ **Documentos únicos**: Cedula, RIF, Pasaporte, Otro  
✅ **Emails únicos**: nombre.apellido{N}@dominio.com  
✅ **Teléfonos**: Formato colombiano (300XXXXXXX)  
✅ **Direcciones**: Direcciones realistas con calles y números  
✅ **Edades**: Entre 18 y 80 años  
✅ **Alergias**: 20% tienen alergias  
✅ **Estados**: 90% activos, 10% inactivos  

---

## 🧪 Verificar los Datos

### En la API

```bash
# Listar todas las personas
curl http://localhost:3000/api/operative/agenda/personas

# Obtener una persona específica
curl http://localhost:3000/api/operative/agenda/personas/1

# Filtrar por género
curl "http://localhost:3000/api/operative/agenda/personas?sexo=F"
```

### En la Base de Datos

```sql
-- Contar personas
SELECT COUNT(*) FROM PeopleAttendeds;

-- Ver las últimas 10
SELECT * FROM PeopleAttendeds ORDER BY id DESC LIMIT 10;

-- Contar por tipo de documento
SELECT documentType, COUNT(*) 
FROM PeopleAttendeds 
GROUP BY documentType;
```

---

## 📚 Documentación Completa

- **Seeder**: `database/seeders/20251115000000-demo-people.js`
- **Documentación detallada**: `database/seeders/README_SEEDER.md`
- **Scripts**:
  - `scripts/run-seeder.js` - Ejecuta el seeder con Node
  - `scripts/clear-seeder.js` - Limpia los datos

---

## 🔧 Scripts Disponibles en package.json

```json
{
  "seed": "node scripts/run-seeder.js",         // Ejecutar seeder
  "seed:undo": "node scripts/clear-seeder.js",  // Eliminar datos
  "seed:cli": "npx sequelize-cli db:seed:all",  // Con CLI
  "seed:cli:undo": "npx sequelize-cli db:seed:undo:all"
}
```

---

## 💡 Ejemplo de Datos Generados

```json
{
  "id": 1,
  "tipoDocumento": "Cedula",
  "numeroDocumento": "10245678",
  "nombres": "María",
  "apellidos": "García Rodríguez",
  "fechaNacimiento": "1985-03-15T00:00:00.000Z",
  "sexo": "F",
  "telefono": "3001234567",
  "correo": "maria.garcia1@gmail.com",
  "direccion": "Avenida Principal #45-23, Apto 301",
  "contactoEmergencia": "Pedro García (Hermano) - 3109876543",
  "alergias": "Penicilina, Polen",
  "estado": true
}
```

---

## ⚠️ Antes de Ejecutar

1. **Asegúrate de que la base de datos esté corriendo**
2. **Ejecuta las migraciones primero**:
   ```bash
   npx sequelize-cli db:migrate
   ```
3. **Verifica las credenciales** en `.env` o `database/config/database.js`

---

## 🐛 Solución de Problemas

### Error: "unique constraint"

Ya existen datos. Elimina primero:
```bash
npm run seed:undo
```

### Error: "Table doesn't exist"

Ejecuta las migraciones:
```bash
npx sequelize-cli db:migrate
```

### Error: "Cannot connect to database"

Verifica que la base de datos esté corriendo y las credenciales sean correctas.

---

## ✨ ¡Listo!

Ahora tienes 50 personas en tu base de datos para probar tu API.

**Comandos más usados:**

```bash
# Crear datos
npm run seed

# Probar API
curl http://localhost:3000/api/operative/agenda/personas

# Limpiar datos
npm run seed:undo
```

🎉 **¡Disfruta probando tu API con datos reales!**

