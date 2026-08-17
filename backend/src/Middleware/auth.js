const jwt = require('jsonwebtoken');
const pool = require('../Config/db');

const verificarToken = (req, res, next) => {
    const tokenFromCookie = req.cookies?.token;
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    const token = tokenFromCookie || tokenFromHeader;
    
    if (!token) {
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado.' });
        }

        if (!req.user.rol && req.user.id) {
            try {
                const [rows] = await pool.query('SELECT rol FROM users WHERE id = ?', [req.user.id]);
                if (rows.length > 0) {
                    req.user.rol = rows[0].rol;
                }
            } catch {
            }
        }
        
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }
        
        next();
    };
};

module.exports = { verificarToken, verificarRol };