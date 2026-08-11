require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { sanitizeInput } = require('./Middleware/Security');
const db = require('./Config/db');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones, intenta más tarde.' }
});
app.use('/api', limiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos de login. Espera 15 minutos.' }
});

const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000'
];

app.use((req, res, next) => {
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
            if (origin === `http://${req.headers.host}` || origin === `https://${req.headers.host}`) {
                return callback(null, true);
            }
            callback(new Error('Origen no permitido'));
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    })(req, res, next);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL || 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor funcionando correctamente' });
});

const authRoutes = require('./Routes/authRoutes');
app.use('/api/auth', loginLimiter, authRoutes);

const roomRoutes = require('./Routes/roomRoutes');
app.use('/api/rooms', roomRoutes);

const reservationRoutes = require('./Routes/reservationRoutes');
app.use('/api/reservations', reservationRoutes);

const userRoutes = require('./Routes/userRoutes');
app.use('/api/users', userRoutes);

const dashboardRoutes = require('./Routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

const DIST_DIR = path.join(__dirname, '../../dist');
app.use(express.static(DIST_DIR));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PORT, async () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
    try {
        const connection = await db.getConnection();
        console.log('Conectado a MySQL');
        connection.release();
    } catch (error) {
        console.error('Error al conectar a MySQL:', error.message);
    }
});