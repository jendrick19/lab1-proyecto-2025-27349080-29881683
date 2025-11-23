#!/bin/bash

# Script de testing rápido para API de Notas Clínicas
# Ejecutar: bash QUICK_TEST_CLINICAL_NOTES.sh

BASE_URL="http://localhost:3000/api/clinic/notas-clinicas"

echo "=================================================="
echo "🧪 Testing API - Notas Clínicas"
echo "=================================================="
echo ""

# 1. Listar todas las notas
echo "1️⃣  Listar todas las notas clínicas"
echo "GET $BASE_URL?page=1&limit=5"
echo ""
curl -X GET "$BASE_URL?page=1&limit=5" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 2. Obtener nota por ID
echo "2️⃣  Obtener nota clínica por ID"
echo "GET $BASE_URL/1"
echo ""
curl -X GET "$BASE_URL/1" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 3. Crear nueva nota clínica
echo "3️⃣  Crear nueva nota clínica"
echo "POST $BASE_URL"
echo ""
curl -X POST "$BASE_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "episodioId": 5,
    "profesionalId": 3,
    "fechaNota": "2024-11-22T14:30:00Z",
    "subjetivo": "Paciente refiere dolor abdominal tipo cólico de 48 horas de evolución, localizado en epigastrio. Intensidad 7/10. Asociado a náuseas.",
    "objetivo": "PA: 125/80 mmHg, FC: 78 lpm, FR: 18 rpm, Temp: 36.8°C. Abdomen blando, doloroso a la palpación en epigastrio, Murphy positivo.",
    "analisis": "Cuadro clínico compatible con COLECISTITIS AGUDA. Hallazgos sugestivos de inflamación vesicular.",
    "plan": "1. NPO\n2. Hidratación IV: SSN 0.9% 1000cc c/8h\n3. Analgesia: Metamizol 1g IV c/8h\n4. Ecografía abdominal\n5. Interconsulta Cirugía"
  }' | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 4. Actualizar nota (crear versión)
echo "4️⃣  Actualizar nota clínica (crear nueva versión)"
echo "PATCH $BASE_URL/1"
echo ""
curl -X PATCH "$BASE_URL/1" \
  -H "Content-Type: application/json" \
  -d '{
    "subjetivo": "Paciente refiere mejoría significativa del dolor, ahora 3/10. Tolera vía oral sin náuseas.",
    "objetivo": "PA: 120/75 mmHg, FC: 72 lpm. Abdomen blando, Murphy negativo.",
    "analisis": "Evolución FAVORABLE de colecistitis aguda. Respuesta adecuada al tratamiento.",
    "plan": "1. Dieta blanda\n2. Omeprazol 20mg c/12h\n3. Control en 7 días"
  }' | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 5. Notas por episodio
echo "5️⃣  Listar notas por episodio"
echo "GET $BASE_URL/episodio/5"
echo ""
curl -X GET "$BASE_URL/episodio/5?page=1&limit=10" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 6. Notas por profesional
echo "6️⃣  Listar notas por profesional"
echo "GET $BASE_URL/profesional/3"
echo ""
curl -X GET "$BASE_URL/profesional/3?page=1&limit=10" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 7. Notas por rango de fechas
echo "7️⃣  Buscar notas por rango de fechas"
echo "GET $BASE_URL/rango-fechas"
echo ""
curl -X GET "$BASE_URL/rango-fechas?fechaDesde=2024-11-01&fechaHasta=2024-11-30&page=1&limit=20" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 8. Historial de versiones
echo "8️⃣  Ver historial de versiones"
echo "GET $BASE_URL/1/versiones"
echo ""
curl -X GET "$BASE_URL/1/versiones" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 9. Última versión
echo "9️⃣  Obtener última versión"
echo "GET $BASE_URL/1/version-actual"
echo ""
curl -X GET "$BASE_URL/1/version-actual" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 10. Comparar versiones
echo "🔟 Comparar dos versiones"
echo "GET $BASE_URL/1/comparar?version1=1&version2=2"
echo ""
curl -X GET "$BASE_URL/1/comparar?version1=1&version2=2" | json_pp
echo ""
echo "Presiona Enter para continuar..."
read
echo ""

# 11. Versión específica
echo "1️⃣1️⃣  Obtener versión específica"
echo "GET $BASE_URL/version/1"
echo ""
curl -X GET "$BASE_URL/version/1" | json_pp
echo ""

echo ""
echo "=================================================="
echo "✅ Testing completado!"
echo "=================================================="


