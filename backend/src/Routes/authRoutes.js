const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController');
const { verificarToken } = require('../Middleware/auth');

router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/verify', authController.verify);


router.put('/change-password', verificarToken, authController.changePassword);

module.exports = router;