const pool = require('../Config/db');
const bcrypt = require('bcryptjs');

const userController = {
    getUsuarios: async (req, res) => {
        try {
            const [usuarios] = await pool.query(
                'SELECT id, nombre, email, rol, activo, telefono, fecha_creacion FROM users'
            );
            res.json({
                success: true,
                data: usuarios
            });
        } catch (error) {
            console.error('Error en getUsuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
    },
    crearUsuario: async (req, res) => {
        try {
            const { nombre, email, password, rol, telefono } = req.body;

            if (!nombre || !email || !password || !rol) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, email, password y rol son requeridos'
                });
            }

            const [existe] = await pool.query(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );

            if (existe.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const [result] = await pool.query(
                `INSERT INTO users (nombre, email, password_hash, rol, telefono) 
                 VALUES (?, ?, ?, ?, ?)`,
                [nombre, email, hashedPassword, rol, telefono || null]
            );

            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: { id: result.insertId, nombre, email, rol }
            });

        } catch (error) {
            console.error('Error en crearUsuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario'
            });
        }
    },
    actualizarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, email, rol, activo, telefono, password } = req.body;

            const [usuario] = await pool.query(
                'SELECT id FROM users WHERE id = ?',
                [id]
            );

            if (usuario.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            let query = `UPDATE users SET nombre = ?, email = ?, rol = ?, activo = ?, telefono = ?`;
            const params = [nombre, email, rol, activo, telefono];

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                query += `, password_hash = ?`;
                params.push(hashedPassword);
            }

            query += ` WHERE id = ?`;
            params.push(id);

            await pool.query(query, params);

            res.json({
                success: true,
                message: 'Usuario actualizado exitosamente'
            });

        } catch (error) {
            console.error('Error en actualizarUsuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
            });
        }
    },

    eliminarUsuario: async (req, res) => {
        try {
            const { id } = req.params;

            if (req.user.id === parseInt(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'No puedes eliminar tu propio usuario'
                });
            }

            const [usuario] = await pool.query(
                'SELECT id FROM users WHERE id = ?',
                [id]
            );

            if (usuario.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await pool.query(
                'UPDATE users SET activo = 0 WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Usuario desactivado exitosamente'
            });

        } catch (error) {
            console.error('Error en eliminarUsuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario'
            });
        }
    }
};

module.exports = userController;