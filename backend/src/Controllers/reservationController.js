const Reservation = require('../Models/Reservation');
const { generarCodigo } = require('../Utils/codigoGenerador');
const pool = require('../Config/db');
const { sendConfirmationEmail } = require('../Utils/emailService');

const reservationController = {
  create: async (req, res) => {
    try {
      console.log('Creando nueva reserva...');
      console.log('Datos recibidos:', req.body);
      
      const data = req.body;
    
      if (!data.nombre || !data.email || !data.telefono || !data.check_in || !data.check_out) {
        console.log('Faltan datos requeridos');
        return res.status(400).json({ 
          error: 'Faltan datos requeridos: nombre, email, telefono, check_in, check_out' 
        });
      }
      
      const codigo = await generarCodigo();
      console.log(' Código generado:', codigo);
     
      const reservaData = {
        ...data,
        codigo
      };
      
      const id = await Reservation.create(reservaData);
      console.log('Reserva creada con ID:', id);
      
      const nuevaReserva = await Reservation.findByCode(codigo);
      console.log('Reserva encontrada:', nuevaReserva);
      
      res.status(201).json(nuevaReserva);
    } catch (error) {
      console.error('Error al crear reserva:', error);
      res.status(500).json({ 
        error: 'Error al crear la reserva',
        details: error.message 
      });
    }
  },

  getByCode: async (req, res) => {
    try {
      const { codigo } = req.params;
      console.log('Buscando reserva por código:', codigo);
      
      const reserva = await Reservation.findByCode(codigo);
      
      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }
      
      res.json(reserva);
    } catch (error) {
      console.error('Error al obtener reserva:', error);
      res.status(500).json({ error: 'Error al obtener la reserva' });
    }
  },

  getByEmail: async (req, res) => {
    try {
      const { email } = req.query;
      if (!email) {
        return res.status(400).json({ error: 'Email es requerido' });
      }
      
      const reservas = await Reservation.findByEmail(email);
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({ error: 'Error al obtener reservas' });
    }
  },

  getAll: async (req, res) => {
    try {
      const reservas = await Reservation.findAll();
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener reservas:', error);
      res.status(500).json({ error: 'Error al obtener reservas' });
    }
  },

  updateStatus: async (req, res) => {
    try {
      const { codigo } = req.params;
      const { estado } = req.body;

      const reserva = await Reservation.findByCode(codigo);
      if (!reserva) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      if (estado === 'cancelada') {
        const now = new Date();
        const checkIn = new Date(reserva.check_in);
        const horasAntes = (checkIn - now) / (1000 * 60 * 60);
        let reembolso = 0;

        if (horasAntes >= 48) {
          reembolso = Number(reserva.total);
        } else if (horasAntes > 24) {
          reembolso = Number(reserva.total) * 0.5;
        }

        await pool.query(
          'UPDATE reservations SET reembolso = ? WHERE codigo = ?',
          [reembolso, codigo]
        );
      }

      const updated = await Reservation.updateStatus(codigo, estado);
      if (!updated) {
        return res.status(400).json({ error: 'No se pudo actualizar el estado' });
      }

      if (estado === 'checkin_realizado') {
        await pool.query(
          'UPDATE rooms SET estado = "ocupada" WHERE id = (SELECT room_id FROM reservations WHERE codigo = ?)',
          [codigo]
        );
      }

      if (estado === 'checkout_realizado') {
        await pool.query(
          'UPDATE rooms SET estado = "disponible" WHERE id = (SELECT room_id FROM reservations WHERE codigo = ?)',
          [codigo]
        );
      }

      if (estado === 'confirmada') {
        try {
          await sendConfirmationEmail({
            email: reserva.email,
            nombre: reserva.nombre,
            codigo: reserva.codigo,
            checkIn: reserva.check_in,
            checkOut: reserva.check_out,
            habitacion: reserva.habitacion,
            total: Number(reserva.total) || 0
          });
        } catch (emailError) {
          console.error('Error al enviar correo de confirmación:', emailError);
        }
      }


      const nuevaReserva = await Reservation.findByCode(codigo);
      res.json(nuevaReserva);
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado' });
    }
  },

  getToday: async (req, res) => {
    try {
      const reservas = await Reservation.getTodayReservations();
      res.json(reservas);
    } catch (error) {
      console.error('Error al obtener reservas del día:', error);
      res.status(500).json({ error: 'Error al obtener reservas del día' });
    }
  },

  getReservasAdmin: async (req, res) => {
    try {
        const { estado, fecha_inicio, fecha_fin, busqueda } = req.query;
        
        let query = `
            SELECT 
                r.*,
                rm.nombre as habitacion_nombre,
                rm.estado as habitacion_estado
            FROM reservations r
            JOIN rooms rm ON r.room_id = rm.id
            WHERE 1=1
        `;
        const params = [];

        if (estado) {
            query += ' AND r.estado = ?';
            params.push(estado);
        }

        if (fecha_inicio) {
            query += ' AND DATE(r.check_in) >= ?';
            params.push(fecha_inicio);
        }

        if (fecha_fin) {
            query += ' AND DATE(r.check_out) <= ?';
            params.push(fecha_fin);
        }

        if (busqueda) {
            query += ' AND (r.codigo LIKE ? OR r.nombre LIKE ? OR r.email LIKE ? OR r.telefono LIKE ?)';
            const search = `%${busqueda}%`;
            params.push(search, search, search, search);
        }

        query += ' ORDER BY r.fecha_reserva DESC';

        const [reservas] = await pool.query(query, params);
        res.json({
            success: true,
            data: reservas
        });

    } catch (error) {
        console.error('Error en getReservasAdmin:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener reservas'
        });
    }
  },

  cambiarEstadoReserva: async (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        const estadosValidos = ['confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada'];
        if (!estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        const [reservas] = await pool.query(
            'SELECT * FROM reservations WHERE id = ?',
            [id]
        );

        if (reservas.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Reserva no encontrada'
            });
        }

        const reserva = reservas[0];

        if (estado === 'cancelada') {
            const now = new Date();
            const checkIn = new Date(reserva.check_in);
            const horasAntes = (checkIn - now) / (1000 * 60 * 60);
            let reembolso = 0;

            if (horasAntes >= 48) {
                reembolso = Number(reserva.total);
            } else if (horasAntes > 24) {
                reembolso = Number(reserva.total) * 0.5;
            }

            await pool.query(
                'UPDATE reservations SET reembolso = ? WHERE id = ?',
                [reembolso, id]
            );
        }

        await pool.query(
            'UPDATE reservations SET estado = ? WHERE id = ?',
            [estado, id]
        );

        if (estado === 'checkin_realizado') {
            await pool.query(
                'UPDATE rooms SET estado = "ocupada" WHERE id = ?',
                [reserva.room_id]
            );
        }

        if (estado === 'checkout_realizado') {
            await pool.query(
                'UPDATE rooms SET estado = "disponible" WHERE id = ?',
                [reserva.room_id]
            );
        }

        res.json({
            success: true,
            message: `Estado actualizado a ${estado}`
        });

    } catch (error) {
        console.error('Error en cambiarEstadoReserva:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado'
        });
    }
  },

  buscarReservaPorCodigo: (codigo) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!codigo) {
                reject({ success: false, message: 'Código requerido' });
                return;
            }

            const [reservas] = await pool.query(
                `SELECT r.*, rm.nombre as habitacion_nombre 
                 FROM reservations r
                 JOIN rooms rm ON r.room_id = rm.id
                 WHERE r.codigo = ?`,
                [codigo]
            );

            if (reservas.length === 0) {
                reject({ success: false, message: 'Reserva no encontrada' });
                return;
            }

            resolve({
                success: true,
                data: reservas[0]
            });
        } catch (error) {
            reject({ success: false, message: error.message });
        }
    });
  },

  
  getByGuestName: async (req, res) => {
    try {
      const { nombre } = req.query;
      const query = (nombre || '').trim();

      if (!query) {
        return res.status(400).json({ error: 'Nombre del huésped requerido' });
      }

      
      const [rows] = await pool.query(
        `SELECT r.*, rm.nombre as habitacion_nombre
         FROM reservations r
         JOIN rooms rm ON r.room_id = rm.id
         WHERE r.nombre LIKE ?
            OR r.habitacion LIKE ?
            OR r.codigo LIKE ?
            OR r.telefono LIKE ?
         ORDER BY r.fecha_reserva DESC
         LIMIT 5`,
        [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]
      );

      if (!rows || rows.length === 0) {
        return res.status(404).json({ error: 'Reserva no encontrada' });
      }

      return res.json(rows[0]);
    } catch (error) {
      console.error('Error en getByGuestName:', error);
      return res.status(500).json({ error: 'Error al buscar la reserva' });
    }
  }
};

module.exports = reservationController;

