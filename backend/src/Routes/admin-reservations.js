const express = require('express');

const router = express.Router();

router.use((req, res) => {
  res.status(410).json({
    error: 'Ruta deshabilitada. Usa /api/reservations en lugar de /admin-reservations.'
  });
});

module.exports = router;


