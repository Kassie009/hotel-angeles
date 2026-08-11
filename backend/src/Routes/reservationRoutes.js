const express = require('express');
const reservationController = require('../Controllers/reservationController');
const { verificarToken, verificarRol } = require('../Middleware/auth');

const router = express.Router();


router.post('/', reservationController.create);
router.get('/', verificarToken, verificarRol(['admin', 'recepcion']), reservationController.getAll);
router.get('/email', reservationController.getByEmail);
router.get('/search', reservationController.getByGuestName);
router.get('/today', verificarToken, verificarRol(['admin', 'recepcion']), reservationController.getToday);
router.put('/:codigo/status', verificarToken, verificarRol(['admin', 'recepcion']), reservationController.updateStatus);
router.get('/:codigo', reservationController.getByCode);


module.exports = router;