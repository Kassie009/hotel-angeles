import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, Upload, X } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { rooms } from '../data/rooms';

const AdminRooms = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [formData, setFormData] = useState({
    numero: '',
    nombre: '',
    tipo: 'simple',
    precio: '',
    capacidad: '',
    estado: 'disponible',
    descripcion: '',
    amenities: [],
    imagen: ''
  });

  useEffect(() => {
    cargarHabitaciones();
  }, []);

  const cargarHabitaciones = () => {
    const stored = JSON.parse(localStorage.getItem('rooms') || '[]');
    if (stored.length === 0 && rooms.length > 0) {
      const habitacionesIniciales = rooms.map((room, index) => ({
        id: room.id,
        numero: `10${index + 1}`,
        nombre: room.nombre,
        tipo: room.id === 1 ? 'simple' : room.id === 2 ? 'doble' : 'suite',
        precio: room.precio,
        capacidad: room.capacidad,
        estado: 'disponible',
        descripcion: room.descripcion,
        imagen: room.imagen,
        amenities: room.amenities || ['Wifi', 'TV']
      }));
      setHabitaciones(habitacionesIniciales);
      localStorage.setItem('rooms', JSON.stringify(habitacionesIniciales));
    } else {
      setHabitaciones(stored);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      if (name === 'amenities') {
        if (checked) {
          setFormData({ ...formData, amenities: [...formData.amenities, value] });
        } else {
          setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== value) });
        }
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Manejar subida de imagen
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      
      // Validar tamaño (máximo 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('La imagen no debe superar los 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagenPreview(base64String);
        setFormData({ ...formData, imagen: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagenPreview(null);
    setFormData({ ...formData, imagen: '' });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que se haya subido una imagen (solo para nuevas habitaciones)
    if (!editingRoom && !formData.imagen) {
      alert('Por favor sube una imagen para la habitación');
      return;
    }
    
    if (editingRoom) {
      const updatedRooms = habitaciones.map(r =>
        r.id === editingRoom.id ? { ...r, ...formData, id: r.id } : r
      );
      localStorage.setItem('rooms', JSON.stringify(updatedRooms));
      setHabitaciones(updatedRooms);
      alert('Habitación actualizada correctamente');
    } else {
      const newRoom = {
        id: Date.now(),
        ...formData
      };
      const updatedRooms = [...habitaciones, newRoom];
      localStorage.setItem('rooms', JSON.stringify(updatedRooms));
      setHabitaciones(updatedRooms);
      alert('Habitación creada correctamente');
    }
    
    setShowModal(false);
    setEditingRoom(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      numero: '',
      nombre: '',
      tipo: 'simple',
      precio: '',
      capacidad: '',
      estado: 'disponible',
      descripcion: '',
      amenities: [],
      imagen: ''
    });
    setImagenPreview(null);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      numero: room.numero,
      nombre: room.nombre,
      tipo: room.tipo,
      precio: room.precio,
      capacidad: room.capacidad,
      estado: room.estado,
      descripcion: room.descripcion,
      amenities: room.amenities || [],
      imagen: room.imagen
    });
    setImagenPreview(room.imagen);
    setShowModal(true);
  };

  const handleDelete = (room) => {
    if (window.confirm(`¿Eliminar la habitación ${room.nombre}?`)) {
      const updatedRooms = habitaciones.filter(r => r.id !== room.id);
      localStorage.setItem('rooms', JSON.stringify(updatedRooms));
      setHabitaciones(updatedRooms);
      alert('Habitación eliminada');
    }
  };

  const toggleMaintenance = (room) => {
    const nuevoEstado = room.estado === 'mantenimiento' ? 'disponible' : 'mantenimiento';
    const updatedRooms = habitaciones.map(r =>
      r.id === room.id ? { ...r, estado: nuevoEstado } : r
    );
    localStorage.setItem('rooms', JSON.stringify(updatedRooms));
    setHabitaciones(updatedRooms);
    alert(`Habitación ${nuevoEstado === 'mantenimiento' ? 'bloqueada por mantenimiento' : 'disponible nuevamente'}`);
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      disponible: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
      ocupada: { label: 'Ocupada', color: 'bg-blue-100 text-blue-700' },
      mantenimiento: { label: 'Mantenimiento', color: 'bg-red-100 text-red-700' },
      limpieza: { label: 'Limpieza', color: 'bg-yellow-100 text-yellow-700' }
    };
    const e = estados[estado] || estados.disponible;
    return <span className={`text-xs px-2 py-1 rounded-full ${e.color}`}>{e.label}</span>;
  };

  const getTipoBadge = (tipo) => {
    const tipos = {
      simple: 'bg-gray-100 text-gray-700',
      doble: 'bg-blue-100 text-blue-700',
      suite: 'bg-purple-100 text-purple-700'
    };
    return <span className={`text-xs px-2 py-1 rounded-full ${tipos[tipo] || tipos.simple}`}>{tipo.toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Gestión de Habitaciones</h1>
            <p className="text-cafe-100">Administra las habitaciones del hotel (crear, editar, eliminar, mantenimiento)</p>
          </div>
          <button
            onClick={() => { setEditingRoom(null); resetForm(); setShowModal(true); }}
            className="bg-cafe-200 hover:bg-cafe-100 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Nueva Habitación
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {habitaciones.map(room => (
            <div key={room.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden">
              <img src={room.imagen} alt={room.nombre} className="w-full h-48 object-cover" />
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-cafe-900">{room.nombre}</h3>
                    <p className="text-sm text-cafe-100">N° {room.numero}</p>
                  </div>
                  {getTipoBadge(room.tipo)}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-2xl font-bold text-cafe-900">${room.precio}</span>
                  <span className="text-sm text-cafe-50">/ noche</span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-cafe-100">Capacidad: {room.capacidad} personas</span>
                  {getEstadoBadge(room.estado)}
                </div>
                <p className="text-cafe-100 text-sm mb-3 line-clamp-2">{room.descripcion}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {room.amenities?.map((am, idx) => (
                    <span key={idx} className="text-xs bg-beige-100 text-cafe-100 px-2 py-1 rounded-full">{am}</span>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-beige-100">
                  <button onClick={() => handleEdit(room)} className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Edit size={16} /> Editar</button>
                  <button onClick={() => toggleMaintenance(room)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Wrench size={16} /> {room.estado === 'mantenimiento' ? 'Activar' : 'Mantener'}</button>
                  <button onClick={() => handleDelete(room)} className="flex-1 bg-error hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Trash2 size={16} /> Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal de Habitación con subida de imágenes */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-cafe-900 mb-4">{editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Número</label><input type="text" name="numero" value={formData.numero} onChange={handleChange} required className="input" /></div>
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Nombre</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="input" /></div>
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Tipo</label><select name="tipo" value={formData.tipo} onChange={handleChange} className="input"><option value="simple">Simple</option><option value="doble">Doble</option><option value="suite">Suite</option></select></div>
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Precio por noche</label><input type="number" name="precio" value={formData.precio} onChange={handleChange} required className="input" /></div>
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Capacidad (personas)</label><input type="number" name="capacidad" value={formData.capacidad} onChange={handleChange} required className="input" /></div>
                <div><label className="block text-cafe-900 text-sm font-medium mb-1">Estado</label><select name="estado" value={formData.estado} onChange={handleChange} className="input"><option value="disponible">Disponible</option><option value="ocupada">Ocupada</option><option value="mantenimiento">Mantenimiento</option><option value="limpieza">Limpieza</option></select></div>
              </div>
              
              {/* Subida de imágenes */}
              <div className="mt-3">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Imagen de la habitación</label>
                <div className="border-2 border-dashed border-beige-200 rounded-lg p-4 text-center">
                  {imagenPreview ? (
                    <div className="relative">
                      <img src={imagenPreview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                      <button type="button" onClick={removeImage} className="absolute top-0 right-0 bg-error text-white rounded-full p-1 hover:bg-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={32} className="text-cafe-200" />
                      <span className="text-sm text-cafe-100">Haz clic para subir una imagen</span>
                      <span className="text-xs text-cafe-50">JPG, PNG (max 2MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="mt-3"><label className="block text-cafe-900 text-sm font-medium mb-1">Descripción</label><textarea name="descripcion" value={formData.descripcion} onChange={handleChange} rows="3" className="input" /></div>
              
              <div className="mt-3"><label className="block text-cafe-900 text-sm font-medium mb-1">Amenities</label><div className="flex flex-wrap gap-3"><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="Wifi" checked={formData.amenities.includes('Wifi')} onChange={handleChange} /> WiFi</label><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="TV" checked={formData.amenities.includes('TV')} onChange={handleChange} /> TV</label><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="AC" checked={formData.amenities.includes('AC')} onChange={handleChange} /> AC</label><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="Minibar" checked={formData.amenities.includes('Minibar')} onChange={handleChange} /> Minibar</label><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="Balcón" checked={formData.amenities.includes('Balcón')} onChange={handleChange} /> Balcón</label><label className="flex items-center gap-1"><input type="checkbox" name="amenities" value="Jacuzzi" checked={formData.amenities.includes('Jacuzzi')} onChange={handleChange} /> Jacuzzi</label></div></div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowModal(false); setEditingRoom(null); resetForm(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-cafe-900 py-2 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg">{editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;