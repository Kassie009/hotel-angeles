const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { verificarToken, verificarRol } = require('../middleware/auth');


router.use(verificarToken);
router.use(verificarRol(['admin']));

router.get('/', userController.getUsuarios);
router.post('/', userController.crearUsuario);
router.put('/:id', userController.actualizarUsuario);
router.delete('/:id', userController.eliminarUsuario);

module.exports = router;