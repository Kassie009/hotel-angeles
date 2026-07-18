const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    // 1. Buscar token en la cookie
    const tokenFromCookie = req.cookies?.token;
    
    // 2. Buscar token en el header (para compatibilidad)
    const tokenFromHeader = req.headers.authorization?.split(' ')[1];
    
    // Usar el token de la cookie primero, si no del header
    const token = tokenFromCookie || tokenFromHeader;
    
    if (!token) {
        console.log('No hay token en cookie ni en header');
        return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        console.log('Token verificado para:', decoded.email, 'Rol:', decoded.rol);
        next();
    } catch (error) {
        console.log('Token inválido:', error.message);
        return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
};

const verificarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'No autenticado.' });
        }
        
        if (!rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ error: 'No tienes permisos para realizar esta acción.' });
        }
        
        next();
    };
};

module.exports = { verificarToken, verificarRol };