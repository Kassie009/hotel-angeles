const express = require('express');
const router = express.Router();
const dashboardController = require('../Controllers/dashboardController');
const { verificarToken, verificarRol } = require('../Middleware/auth');


router.use(verificarToken);

router.get('/stats', verificarRol(['admin', 'recepcion']), dashboardController.getStats);

router.get('/ingresos', verificarRol(['admin']), dashboardController.getIngresos);

module.exports = router;