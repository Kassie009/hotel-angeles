const db = require('../Config/db');

const Room = {
    findAll: async () => {
        try {
            const [rows] = await db.query('SELECT * FROM rooms ORDER BY id');
            return rows;
        } catch (error) {
            console.error('Room.findAll Error:', error);
            throw error;
        }
    },

    findById: async (id) => {
        try {
            const [rows] = await db.query('SELECT * FROM rooms WHERE id = ?', [id]);
            return rows[0] || null;
        } catch (error) {
            console.error('Room.findById Error:', error);
            throw error;
        }
    },

    findAvailable: async () => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM rooms WHERE estado = "disponible"'
            );
            return rows;
        } catch (error) {
            console.error('Room.findAvailable Error:', error);
            throw error;
        }
    },

    create: async (data) => {
        try {
            const { nombre, precio, capacidad, descripcion, imagen, amenities } = data;
            const [result] = await db.query(
                `INSERT INTO rooms (nombre, precio, capacidad, descripcion, imagen, amenities) 
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [nombre, precio, capacidad, descripcion, imagen, JSON.stringify(amenities || [])]
            );
            return result.insertId;
        } catch (error) {
            console.error('Room.create Error:', error);
            throw error;
        }
    },

    update: async (id, data) => {
        try {
            const { nombre, precio, capacidad, descripcion, imagen, amenities, estado } = data;
            const [result] = await db.query(
                `UPDATE rooms 
                 SET nombre = ?, precio = ?, capacidad = ?, descripcion = ?, 
                     imagen = ?, amenities = ?, estado = ?
                 WHERE id = ?`,
                [nombre, precio, capacidad, descripcion, imagen, JSON.stringify(amenities || []), estado, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Room.update Error:', error);
            throw error;
        }
    },

    updateStatus: async (id, estado) => {
        try {
            const [result] = await db.query(
                'UPDATE rooms SET estado = ? WHERE id = ?',
                [estado, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Room.updateStatus Error:', error);
            throw error;
        }
    },

    delete: async (id) => {
        try {
            const [result] = await db.query('DELETE FROM rooms WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Room.delete Error:', error);
            throw error;
        }
    }
};

module.exports = Room;