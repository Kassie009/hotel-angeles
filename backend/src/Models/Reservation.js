const db = require('../Config/db');

const Reservation = {
    create: async (data) => {
        const { 
            codigo, room_id, nombre, email, telefono, habitacion,
            check_in, check_out, noches, subtotal, iva, descuento, total
        } = data;
        
        const [result] = await db.query(
            `INSERT INTO reservations 
             (codigo, room_id, nombre, email, telefono, habitacion, 
              check_in, check_out, noches, subtotal, iva, descuento, total) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, room_id, nombre, email, telefono, habitacion,
             check_in, check_out, noches, subtotal || 0, iva || 0, descuento || 0, total || 0]
        );
        return result.insertId;
    },

    findByCode: async (codigo) => {
        const [rows] = await db.query(
            'SELECT * FROM reservations WHERE codigo = ?',
            [codigo]
        );
        return rows[0] || null;
    },

    findByEmail: async (email) => {
        const [rows] = await db.query(
            'SELECT * FROM reservations WHERE email = ? ORDER BY fecha_reserva DESC',
            [email]
        );
        return rows;
    },

    findAll: async () => {
        const [rows] = await db.query(
            'SELECT * FROM reservations ORDER BY fecha_reserva DESC'
        );
        return rows;
    },

    updateStatus: async (codigo, estado) => {
        const [result] = await db.query(
            'UPDATE reservations SET estado = ? WHERE codigo = ?',
            [estado, codigo]
        );
        return result.affectedRows > 0;
    },

    getTodayReservations: async () => {
        const [rows] = await db.query(
            `SELECT * FROM reservations 
             WHERE DATE(check_in) = CURDATE() OR DATE(check_out) = CURDATE()
             ORDER BY fecha_reserva DESC`
        );
        return rows;
    }
};

module.exports = Reservation;