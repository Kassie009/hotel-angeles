const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    message: 'Demasiadas peticiones desde esta IP, intenta de nuevo en 15 minutos'
});

const SKIP_FIELDS = new Set([
    'password',
    'password2',
    'confirmPassword',
    'email',
    'token',
    'codigo'
]);

const sanitizeInput = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (SKIP_FIELDS.has(key)) continue;
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#x27;');
            }
        }
    }
    next();
};

module.exports = { limiter, sanitizeInput };