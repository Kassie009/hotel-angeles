const pool = require('../Config/db');

const dashboardController = {
    getStats: async (req, res) => {
        try {
            console.log('Obteniendo estadísticas del dashboard...');

            const [totalReservas] = await pool.query(
                'SELECT COUNT(*) as total FROM reservations'
            );
            console.log('Total reservas:', totalReservas[0]?.total || 0);

            const [reservasPorEstado] = await pool.query(
                `SELECT estado, COUNT(*) as count 
                 FROM reservations 
                 GROUP BY estado`
            );
            console.log('Reservas por estado:', reservasPorEstado);
            const [ingresosTotales] = await pool.query(
                `SELECT 
                    SUM(total) as bruto,
                    COALESCE((SELECT SUM(reembolso) FROM reservations WHERE estado = 'cancelada'), 0) as reembolsos
                 FROM reservations 
                 WHERE estado IN ('confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada')`
            );
            const ingresosTotalesNum = (parseFloat(ingresosTotales[0]?.bruto) || 0) - (parseFloat(ingresosTotales[0]?.reembolsos) || 0);
            console.log('Ingresos totales:', ingresosTotalesNum);
            const [ocupacion] = await pool.query(
                `SELECT 
                    SUM(CASE WHEN estado = 'ocupada' THEN 1 ELSE 0 END) as ocupadas,
                    COUNT(*) as total_habitaciones
                 FROM rooms`
            );
            console.log('Ocupación:', ocupacion[0]);

            const [habitacionesPopulares] = await pool.query(
                `SELECT 
                    rm.nombre,
                    COUNT(r.id) as reservas
                 FROM reservations r
                 JOIN rooms rm ON r.room_id = rm.id
                 GROUP BY r.room_id
                 ORDER BY reservas DESC
                 LIMIT 5`
            );
            console.log('Habitaciones populares:', habitacionesPopulares.length);

            const [ultimasReservas] = await pool.query(
                `SELECT 
                    id,
                    codigo,
                    nombre,
                    email,
                    habitacion,
                    check_in,
                    check_out,
                    total,
                    estado,
                    fecha_reserva
                 FROM reservations 
                 ORDER BY fecha_reserva DESC 
                 LIMIT 5`
            );
            console.log('Últimas reservas encontradas:', ultimasReservas.length);

            const data = {
                totalReservas: parseInt(totalReservas[0]?.total) || 0,
                reservasPorEstado: reservasPorEstado || [],
                ingresosTotales: ingresosTotalesNum,  
                ingresosPorMes: [],
                ocupacion: {
                    ocupadas: parseInt(ocupacion[0]?.ocupadas) || 0,
                    disponibles: parseInt(ocupacion[0]?.total_habitaciones || 0) - (parseInt(ocupacion[0]?.ocupadas) || 0),
                    total: parseInt(ocupacion[0]?.total_habitaciones) || 0,
                    porcentaje: parseFloat(ocupacion[0]?.total_habitaciones || 0) > 0 
                        ? ((parseInt(ocupacion[0]?.ocupadas) || 0) / parseInt(ocupacion[0]?.total_habitaciones || 1)) * 100 
                        : 0
                },
                habitacionesPopulares: habitacionesPopulares || [],
                ultimasReservas: ultimasReservas.map(r => ({
                    id: r.id,
                    codigo: r.codigo,
                    nombre: r.nombre,
                    email: r.email,
                    habitacion_nombre: r.habitacion || 'N/A',
                    check_in: r.check_in,
                    check_out: r.check_out,
                    total: parseFloat(r.total) || 0,
                    estado: r.estado || 'pendiente',
                    fecha_reserva: r.fecha_reserva
                }))
            };

            console.log('Enviando ultimasReservas:', data.ultimasReservas.length);
            console.log('Enviando ingresosTotales (número):', data.ingresosTotales);

            res.json({
                success: true,
                data: data
            });

        } catch (error) {
            console.error('ERROR EN getStats:', error);
            console.error('Mensaje:', error.message);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener estadísticas',
                error: error.message
            });
        }
    },

    getIngresos: async (req, res) => {
        try {
            const { fecha_inicio, fecha_fin } = req.query;
            
            let query = `
                SELECT 
                    DATE(fecha_reserva) as fecha,
                    COUNT(*) as reservas,
                    SUM(total) - COALESCE(
                        (SELECT SUM(r2.reembolso) FROM reservations r2 
                         WHERE r2.estado = 'cancelada' AND DATE(r2.fecha_reserva) = DATE(reservations.fecha_reserva)), 0
                    ) as total
                FROM reservations 
                WHERE estado IN ('confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada')
            `;
            const params = [];

            if (fecha_inicio && fecha_fin) {
                query += ' AND DATE(fecha_reserva) BETWEEN ? AND ?';
                params.push(fecha_inicio, fecha_fin);
            }

            query += ' GROUP BY DATE(fecha_reserva) ORDER BY fecha DESC';

            const [resultados] = await pool.query(query, params);
            res.json({
                success: true,
                data: resultados
            });

        } catch (error) {
            console.error('Error en getIngresos:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Error al obtener ingresos' 
            });
        }
    }
};

module.exports = dashboardController;