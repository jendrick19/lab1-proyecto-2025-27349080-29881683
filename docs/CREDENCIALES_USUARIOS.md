# 🔐 Credenciales de Usuarios del Seeder

## 📋 Patrón de Contraseñas

Todas las contraseñas siguen el patrón: **`Password1`**, **`Password2`**, **`Password3`**, etc.

Donde el número corresponde al orden del usuario (1-20).

---

## 👥 Lista Completa de Usuarios

| # | Nombre | Username | Email | Password |
|---|--------|----------|-------|----------|
| 01 | Juan García Pérez | `juangarcia1` | `juan.garcia1@hospital.com` | `Password1` |
| 02 | María Rodríguez López | `mariarodriguez2` | `maria.rodriguez2@hospital.com` | `Password2` |
| 03 | Carlos Martínez González | `carlosmartinez3` | `carlos.martinez3@hospital.com` | `Password3` |
| 04 | Ana Fernández Sánchez | `anafernandez4` | `ana.fernandez4@hospital.com` | `Password4` |
| 05 | Luis López Díaz | `luislopez5` | `luis.lopez5@hospital.com` | `Password5` |
| 06 | Carmen González Martín | `carmengonzalez6` | `carmen.gonzalez6@hospital.com` | `Password6` |
| 07 | Pedro Sánchez Ruiz | `pedrosanchez7` | `pedro.sanchez7@hospital.com` | `Password7` |
| 08 | Laura Pérez Jiménez | `lauraperez8` | `laura.perez8@hospital.com` | `Password8` |
| 09 | Miguel Martín Hernández | `miguelmartin9` | `miguel.martin9@hospital.com` | `Password9` |
| 10 | Isabel Gómez Moreno | `isabelgomez10` | `isabel.gomez10@hospital.com` | `Password10` |
| 11 | José Jiménez Álvarez | `josejimenez11` | `jose.jimenez11@hospital.com` | `Password11` |
| 12 | Elena Ruiz Romero | `elenaruiz12` | `elena.ruiz12@hospital.com` | `Password12` |
| 13 | Antonio Hernández Torres | `antoniohernandez13` | `antonio.hernandez13@hospital.com` | `Password13` |
| 14 | Rosa Díaz Navarro | `rosadiaz14` | `rosa.diaz14@hospital.com` | `Password14` |
| 15 | Francisco Moreno Domínguez | `franciscomoreno15` | `francisco.moreno15@hospital.com` | `Password15` |
| 16 | Marta Álvarez Gil | `martaalvarez16` | `marta.alvarez16@hospital.com` | `Password16` |
| 17 | David Romero Vázquez | `davidromero17` | `david.romero17@hospital.com` | `Password17` |
| 18 | Patricia Torres Serrano | `patriciatorres18` | `patricia.torres18@hospital.com` | `Password18` |
| 19 | Rafael Navarro Ramos | `rafaelnavarro19` | `rafael.navarro19@hospital.com` | `Password19` |
| 20 | Lucía Domínguez Castro | `luciadominguez20` | `lucia.dominguez20@hospital.com` | `Password20` |

---

## 🔑 Usuario Admin

| Username | Email | Password | Rol |
|----------|-------|----------|-----|
| `admin` | `admin@clinica.com` | `admin123` | ADMIN |

---

## 📝 Ejemplo de Uso

### Login con usuario profesional:
```json
{
  "username": "juangarcia1",
  "password": "Password1"
}
```

### Login con admin:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

---

## ⚠️ Notas Importantes

1. **Todas las contraseñas están hasheadas correctamente** con bcrypt
2. **Los hashes se generan automáticamente** al ejecutar el seeder
3. **Las contraseñas son case-sensitive** (mayúsculas y minúsculas importan)
4. **Todos los usuarios tienen rol PROFESSIONAL** (excepto admin que tiene ADMIN)

---

## 🚀 Ejecutar el Seeder

```bash
npm run seed:cli
```

O específicamente:
```bash
npx sequelize-cli db:seed --seed 20241116000000-demo-professionals.js
```

Al ejecutar el seeder, verás todas las credenciales impresas en la consola.

