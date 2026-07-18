const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult, body } = require('express-validator');
const User = require('../Models/User');
const pool = require('../Config/db');

const loginValidations = [
    body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres')
];

const changePasswordValidations = [
    body('currentPassword').isLength({ min: 6 }),
    body('newPassword').isLength({ min: 6 })
];

const authController = {

    login: [
        loginValidations,
        async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ 
                        error: 'Datos inválidos',
                        details: errors.array().map(e => e.msg)
                    });
                }

                const { email, password } = req.body;

                const user = await User.findByEmail(email);
                if (!user || !user.activo) {
                    console.log('[AUTH][LOGIN] fallo: usuario no existe o inactivo', {
                        email,
                        exists: !!user,
                        activo: user?.activo
                    });
                    return res.status(401).json({ error: 'Credenciales incorrectas' });
                }

                const isValid = await bcrypt.compare(password, user.password_hash);
                if (!isValid) {
                    console.log('[AUTH][LOGIN] fallo: password_hash no coincide', {
                        email,
                        userId: user.id
                    });
                    return res.status(401).json({ error: 'Credenciales incorrectas' });
                }


                const token = jwt.sign(
                    { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol },
                    process.env.JWT_SECRET,
                    { expiresIn: '8h' }
                );

                const isProduction = process.env.NODE_ENV === 'production';
                
                res.cookie('token', token, {
                    httpOnly: true,
                    secure: isProduction,
                    sameSite: 'lax',
                    maxAge: 8 * 60 * 60 * 1000,
                    path: '/'
                });

                res.json({
                    success: true,
                    user: {
                        id: user.id,
                        nombre: user.nombre,
                        email: user.email,
                        rol: user.rol
                    }
                });

            } catch (error) {
                console.error('Error en login:', error);
                res.status(500).json({ error: 'Error al iniciar sesión' });
            }
        }
    ],

 
    verify: async (req, res) => {
        try {
            const token = req.cookies?.token;
            if (!token) {
                return res.status(401).json({ valid: false });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findByEmail(decoded.email);
            
            if (!user || !user.activo) {
                return res.status(401).json({ valid: false });
            }

            res.json({
                valid: true,
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    email: user.email,
                    rol: user.rol
                }
            });

        } catch (error) {
            res.status(401).json({ valid: false });
        }
    },

    logout: async (req, res) => {
        const isProduction = process.env.NODE_ENV === 'production';
        
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: 'lax',
            path: '/'
        });
        
        res.json({ success: true, message: 'Sesión cerrada' });
    },

   
    changePassword: [
        changePasswordValidations,
        async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return res.status(400).json({ 
                        error: 'Datos inválidos',
                        details: errors.array().map(e => e.msg)
                    });
                }

                const userId = req.user.id;
                const { currentPassword, newPassword } = req.body;

                const [users] = await pool.query(
                    'SELECT * FROM users WHERE id = ?',
                    [userId]
                );

                if (users.length === 0) {
                    return res.status(404).json({ error: 'Usuario no encontrado' });
                }

                const user = users[0];
                const isValid = await bcrypt.compare(currentPassword, user.password_hash);
                
                if (!isValid) {
                    return res.status(400).json({ error: 'Contraseña actual incorrecta' });
                }

                const hashedPassword = await bcrypt.hash(newPassword, 10);
                await pool.query(
                    'UPDATE users SET password_hash = ? WHERE id = ?',
                    [hashedPassword, userId]
                );

                res.json({ success: true, message: 'Contraseña actualizada correctamente' });

            } catch (error) {
                console.error('Error:', error);
                res.status(500).json({ error: 'Error al cambiar contraseña' });
            }
        }
    ]
};

module.exports = authController;