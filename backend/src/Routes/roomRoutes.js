const express = require('express');
const router = express.Router();
const roomController = require('../Controllers/roomController');
const { verificarToken, verificarRol } = require('../middleware/auth');
const upload = require('../Config/multer');


router.get('/', roomController.getAll);
router.get('/available', roomController.getAvailable);
router.get('/:id', roomController.getById);

router.post('/', verificarToken, verificarRol(['admin']), upload.single('imagen'), roomController.create);
router.put('/:id', verificarToken, verificarRol(['admin']), upload.single('imagen'), roomController.update);
router.put('/:id/status', verificarToken, verificarRol(['admin', 'recepcion']), roomController.updateStatus);
router.delete('/:id', verificarToken, verificarRol(['admin']), roomController.delete);

module.exports = router;