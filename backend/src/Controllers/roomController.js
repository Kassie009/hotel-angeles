const Room = require('../Models/Room');

const roomController = {
    getAll: async (req, res) => {
        try {
            const rooms = await Room.findAll();
            res.json(rooms);
        } catch (error) {
            console.error('Error al obtener habitaciones:', error);
            res.status(500).json({ error: 'Error al obtener habitaciones' });
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;
            const room = await Room.findById(id);
            if (!room) {
                return res.status(404).json({ error: 'Habitación no encontrada' });
            }
            res.json(room);
        } catch (error) {
            console.error('Error al obtener habitación:', error);
            res.status(500).json({ error: 'Error al obtener habitación' });
        }
    },

    getAvailable: async (req, res) => {
        try {
            const rooms = await Room.findAvailable();
            res.json(rooms);
        } catch (error) {
            console.error('Error al obtener habitaciones disponibles:', error);
            res.status(500).json({ error: 'Error al obtener habitaciones disponibles' });
        }
    },

    create: async (req, res) => {
        try {
            const { nombre, precio, capacidad, descripcion, amenities } = req.body;
            
            console.log('Creando habitación...');
            console.log('Datos:', { nombre, precio, capacidad });
            console.log('Archivo:', req.file);
            
            if (!nombre || !precio || !capacidad) {
                return res.status(400).json({ error: 'Nombre, precio y capacidad son requeridos' });
            }

            let imagen = null;
            if (req.file) {
                imagen = `/uploads/rooms/${req.file.filename}`;
                console.log('Imagen guardada:', imagen);
            } else {
                imagen = '/assets/sencilla.jpg';
            }

            let amenitiesParsed = [];
            if (amenities) {
                try {
                    amenitiesParsed = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
                } catch (e) {
                    amenitiesParsed = [];
                }
            }

            const id = await Room.create({ 
                nombre, 
                precio, 
                capacidad, 
                descripcion, 
                imagen: imagen, 
                amenities: amenitiesParsed
            });
            
            const newRoom = await Room.findById(id);
            res.status(201).json(newRoom);
        } catch (error) {
            console.error(' Error al crear habitación:', error);
            res.status(500).json({ error: 'Error al crear habitación' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, precio, capacidad, descripcion, imagen, amenities, estado } = req.body;
            
            const exists = await Room.findById(id);
            if (!exists) {
                return res.status(404).json({ error: 'Habitación no encontrada' });
            }

            let imagenData = imagen || exists.imagen;
            if (req.file) {
                imagenData = `/uploads/rooms/${req.file.filename}`;
                console.log('Nueva imagen:', imagenData);
            }

            let amenitiesParsed = [];
            if (amenities) {
                try {
                    amenitiesParsed = typeof amenities === 'string' ? JSON.parse(amenities) : amenities;
                } catch (e) {
                    amenitiesParsed = exists.amenities || [];
                }
            }

            const data = {
                nombre: nombre || exists.nombre,
                precio: precio || exists.precio,
                capacidad: capacidad || exists.capacidad,
                descripcion: descripcion || exists.descripcion,
                imagen: imagenData,
                amenities: amenitiesParsed,
                estado: estado || exists.estado
            };

            const updated = await Room.update(id, data);
            if (updated) {
                const room = await Room.findById(id);
                res.json(room);
            } else {
                res.status(400).json({ error: 'No se pudo actualizar la habitación' });
            }
        } catch (error) {
            console.error('Error al actualizar habitación:', error);
            res.status(500).json({ error: 'Error al actualizar habitación' });
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { estado } = req.body;
            
            const exists = await Room.findById(id);
            if (!exists) {
                return res.status(404).json({ error: 'Habitación no encontrada' });
            }

            const updated = await Room.updateStatus(id, estado);
            if (updated) {
                const room = await Room.findById(id);
                res.json(room);
            } else {
                res.status(400).json({ error: 'No se pudo actualizar el estado' });
            }
        } catch (error) {
            console.error('Error al actualizar estado:', error);
            res.status(500).json({ error: 'Error al actualizar estado' });
        }
    },

    delete: async (req, res) => {
        try {
            const { id } = req.params;
            
            const exists = await Room.findById(id);
            if (!exists) {
                return res.status(404).json({ error: 'Habitación no encontrada' });
            }

            const deleted = await Room.delete(id);
            if (deleted) {
                res.json({ message: 'Habitación eliminada correctamente' });
            } else {
                res.status(400).json({ error: 'No se pudo eliminar la habitación' });
            }
        } catch (error) {
            console.error('Error al eliminar habitación:', error);
            res.status(500).json({ error: 'Error al eliminar habitación' });
        }
    }
};

module.exports = roomController;