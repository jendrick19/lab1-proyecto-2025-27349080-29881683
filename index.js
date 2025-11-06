const express = require('express');

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal
app.get('/', (req, res) => {
  res.send('¡Servidor con Express funcionando! 🚀');
});

// Ruta de prueba
app.get('/api', (req, res) => {
  res.json({ 
    mensaje: 'API funcionando correctamente',
    version: '1.0.0'
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor Express corriendo en http://localhost:${PORT}`);
});
