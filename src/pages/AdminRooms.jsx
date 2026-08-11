import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Wrench, Upload, X } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import api, { getMediaUrl } from '../Config/api';

const TIPOS_HABITACION = [
  'Habitación Sencilla',
  'Habitación Sencilla con Cocineta',
  'Habitación Doble',
  'Habitación Doble con Cocineta',
  'Familiar sin Cocineta',
  'Familiar con Cocineta',
  'Familiar Extra Grande',
  'Doble con Litera y Cocineta'
];

const AMENITIES_DISPONIBLES = [
  'WiFi',
  'A/C',
  'TV',
  'Agua caliente',
  'Refrigerador',
  'Cocineta',
  'Litera'
];

const ESTADOS_DISPONIBLES = [
  'disponible',
  'ocupada',
  'mantenimiento',
  'limpieza'
];

const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
const TAMAÑO_MAXIMO = 2 * 1024 * 1024; 

const AdminRooms = () => {
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    tipo: 'Habitación Sencilla',
    precio: '',
    capacidad: 1,
    estado: 'disponible',
    descripcion: '',
    amenities: [],
    imagen: null
  });

  const cargarHabitaciones = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/rooms');
      
      
      let habitacionesData = [];
      if (Array.isArray(response.data)) {
        habitacionesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        habitacionesData = response.data.data;
      } else {
        
        habitacionesData = [];
      }
      
      setHabitaciones(habitacionesData);
      setError(null);
    } catch {
      
      setError('Error al cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarHabitaciones();
  }, []);

  const validarFormulario = () => {
    if (!formData.nombre || formData.nombre.trim() === '') {
      alert('El nombre de la habitación es obligatorio');
      return false;
    }

    const precio = parseFloat(formData.precio);
    if (isNaN(precio) || precio < 500) {
      alert('El precio debe ser mayor a 500');
      return false;
    }
    if (precio > 5000) {
      alert('El precio no puede exceder los $5,000 MXN por noche');
      return false;
    }

    const capacidad = parseInt(formData.capacidad);
    if (isNaN(capacidad) || capacidad < 1 || capacidad > 7) {
      alert('La capacidad debe ser entre 1 y 7 personas');
      return false;
    }

    if (!formData.descripcion || formData.descripcion.length < 10) {
      alert('La descripción debe tener al menos 10 caracteres');
      return false;
    }

    if (!editingRoom && !formData.imagen) {
      alert('Por favor sube una imagen para la habitación');
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' && name === 'amenities') {
      if (checked) {
        setFormData({ ...formData, amenities: [...formData.amenities, value] });
      } else {
        setFormData({ ...formData, amenities: formData.amenities.filter(a => a !== value) });
      }
    } else if (name === 'capacidad') {
      const val = parseInt(value);
      if (val >= 1 && val <= 7) {
        setFormData({ ...formData, [name]: val });
      } else if (value === '') {
        setFormData({ ...formData, [name]: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('El archivo no es una imagen válida');
      e.target.value = '';
      return;
    }

    if (!FORMATOS_PERMITIDOS.includes(file.type)) {
      alert('Formato no permitido. Usa: JPG, PNG, GIF, WEBP o BMP');
      e.target.value = '';
      return;
    }

    if (file.size > TAMAÑO_MAXIMO) {
      alert(`La imagen no debe superar los 2MB`);
      e.target.value = '';
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      if (img.width < 100 || img.height < 100) {
        alert('La imagen debe tener al menos 100x100 píxeles');
        URL.revokeObjectURL(objectUrl);
        e.target.value = '';
        return;
      }
      URL.revokeObjectURL(objectUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagenPreview(base64String);
        setFormData({ ...formData, imagen: file });
      };
      reader.readAsDataURL(file);
    };
    
    img.onerror = () => {
      alert('Error al cargar la imagen');
      URL.revokeObjectURL(objectUrl);
      e.target.value = '';
    };
    
    img.src = objectUrl;
  };

  const removeImage = () => {
    setImagenPreview(null);
    setFormData({ ...formData, imagen: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) return;
    
    try {
      const url = editingRoom 
        ? `/rooms/${editingRoom.id}` 
        : '/rooms';
      const method = editingRoom ? 'put' : 'post';
      
      const formDataToSend = new FormData();
      formDataToSend.append('nombre', formData.nombre.trim());
      formDataToSend.append('tipo', formData.tipo);
      formDataToSend.append('precio', parseFloat(formData.precio));
      formDataToSend.append('capacidad', parseInt(formData.capacidad));
      formDataToSend.append('estado', formData.estado);
      formDataToSend.append('descripcion', formData.descripcion.trim());
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));
      
      if (formData.imagen && typeof formData.imagen === 'object') {
        formDataToSend.append('imagen', formData.imagen);
      }
      
      
      
      const response = await api[method](url, formDataToSend);
      
      if (response.data) {
        alert(editingRoom ? 'Habitación actualizada correctamente' : 'Habitación creada correctamente');
        cargarHabitaciones();
        setShowModal(false);
        setEditingRoom(null);
        resetForm();
      }
    } catch (error) {
      
      alert(error.response?.data?.error || 'Error al guardar la habitación');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      tipo: 'Habitación Sencilla',
      precio: '',
      capacidad: 1,
      estado: 'disponible',
      descripcion: '',
      amenities: [],
      imagen: null
    });
    setImagenPreview(null);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      nombre: room.nombre || '',
      tipo: room.tipo || 'Habitación Sencilla',
      precio: room.precio || '',
      capacidad: room.capacidad || 1,
      estado: room.estado || 'disponible',
      descripcion: room.descripcion || '',
      amenities: room.amenities || [],
      imagen: room.imagen || null
    });
    setImagenPreview(room.imagen || null);
    setShowModal(true);
  };

  const handleDelete = async (room) => {
    if (window.confirm(`¿Eliminar la habitación ${room.nombre}?`)) {
      try {
        await api.delete(`/rooms/${room.id}`);
        alert('Habitación eliminada');
        cargarHabitaciones();
      } catch {
        
        alert('Error al eliminar la habitación');
      }
    }
  };

  const toggleMaintenance = async (room) => {
    const nuevoEstado = room.estado === 'mantenimiento' ? 'disponible' : 'mantenimiento';
    try {
      await api.put(`/rooms/${room.id}/status`, { estado: nuevoEstado });
      alert(`Habitación ${nuevoEstado === 'mantenimiento' ? 'bloqueada por mantenimiento' : 'disponible nuevamente'}`);
      cargarHabitaciones();
    } catch {
      
      alert('Error de conexión');
    }
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
      'Habitación Sencilla': 'bg-gray-100 text-gray-700',
      'Habitación Sencilla con Cocineta': 'bg-gray-200 text-gray-700',
      'Habitación Doble': 'bg-blue-100 text-blue-700',
      'Habitación Doble con Cocineta': 'bg-blue-200 text-blue-700',
      'Familiar sin Cocineta': 'bg-purple-100 text-purple-700',
      'Familiar con Cocineta': 'bg-purple-200 text-purple-700',
      'Familiar Extra Grande': 'bg-purple-300 text-purple-700',
      'Doble con Litera y Cocineta': 'bg-indigo-100 text-indigo-700'
    };
    return <span className={`text-xs px-2 py-1 rounded-full ${tipos[tipo] || tipos['Habitación Sencilla']}`}>{tipo || 'SIMPLE'}</span>;
  };

  const getImageSrc = (imagen) => {
    if (!imagen) {
      return '/assets/sencilla.jpg';
    }
    
    // Si es un objeto (error)
    if (typeof imagen === 'object') {
      return '/assets/sencilla.jpg';
    }
    
    // Si es una ruta de uploads (imagen subida)
    if (imagen.startsWith('/uploads/')) {
      return getMediaUrl(imagen);
    }
    
    // Si es una URL completa
    if (imagen.startsWith('http://') || imagen.startsWith('https://')) {
      return imagen;
    }
    
    // Si es una ruta de assets
    if (imagen.includes('/assets/')) {
      const partes = imagen.split('/assets/');
      if (partes.length > 1) {
        return '/assets/' + partes[partes.length - 1];
      }
      return imagen;
    }
    
    // Si empieza con /assets/
    if (imagen.startsWith('/assets/')) {
      return imagen;
    }
    
    // Si es base64
    if (imagen.startsWith('data:image')) {
      return imagen;
    }
    
    // Fallback
    return '/assets/sencilla.jpg';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
            <p className="text-gray-700 mt-4">Cargando habitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <p className="font-bold">{error}</p>
            <button 
              onClick={cargarHabitaciones}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gestión de Habitaciones</h1>
            <p className="text-gray-700">Administra las habitaciones del hotel</p>
          </div>
          <button
            onClick={() => { setEditingRoom(null); resetForm(); setShowModal(true); }}
className="bg-cafe-200 hover:bg-cafe-100 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
          >
            <Plus size={18} /> Nueva Habitación
          </button>
        </div>
        
        {habitaciones.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <p className="text-gray-700 text-lg">No hay habitaciones registradas</p>
            <p className="text-gray-500 text-sm mt-2">Haz clic en "Nueva Habitación" para agregar una</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {habitaciones.map(room => (
              <div key={room.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all overflow-hidden">
                <img 
                  src={getImageSrc(room.imagen)} 
                  alt={room.nombre} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = '/assets/sencilla.jpg';
                  }}
                />
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{room.nombre}</h3>
                    </div>
                    {getTipoBadge(room.tipo)}
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-gray-900">${room.precio}</span>
                    <span className="text-sm text-gray-500">/ noche</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm text-gray-700">Capacidad: {room.capacidad} personas</span>
                    {getEstadoBadge(room.estado)}
                  </div>
                  <p className="text-gray-700 text-sm mb-3 line-clamp-2">{room.descripcion}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {room.amenities?.map((am, idx) => (
                      <span key={idx} className="text-xs bg-beige-100 text-gray-700 px-2 py-1 rounded-full">{am}</span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2 border-t border-beige-100">
                    <button onClick={() => handleEdit(room)} className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Edit size={16} /> Editar</button>
                    <button onClick={() => toggleMaintenance(room)} className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Wrench size={16} /> {room.estado === 'mantenimiento' ? 'Activar' : 'Mantener'}</button>
                    <button onClick={() => handleDelete(room)} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 transition-all text-sm"><Trash2 size={16} /> Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingRoom ? 'Editar Habitación' : 'Nueva Habitación'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-1">Nombre *</label>
                  <input 
                    type="text" 
                    name="nombre" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                    placeholder="Ej: Habitación Premium"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-1">Tipo de Habitación *</label>
                  <select 
                    name="tipo" 
                    value={formData.tipo} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                  >
                    {TIPOS_HABITACION.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-1">Precio por noche (MXN) *</label>
                  <input 
                    type="number" 
                    name="precio" 
                    value={formData.precio} 
                    onChange={handleChange} 
                    required 
                    min="500" 
                    max="5000"
                    className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                    placeholder="Ej: 850"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo $500 - Máximo $5,000</p>
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-1">Capacidad (personas) *</label>
                  <input 
                    type="number" 
                    name="capacidad" 
                    value={formData.capacidad} 
                    onChange={handleChange} 
                    required 
                    min="1" 
                    max="7"
                    className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                    placeholder="Ej: 2"
                  />
                  <p className="text-xs text-gray-500 mt-1">Mínimo 1 - Máximo 7 personas</p>
                </div>
                
                <div>
                  <label className="block text-gray-900 text-sm font-medium mb-1">Estado</label>
                  <select 
                    name="estado" 
                    value={formData.estado} 
                    onChange={handleChange} 
                    className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                  >
                    {ESTADOS_DISPONIBLES.map(estado => (
                      <option key={estado} value={estado}>
                        {estado.charAt(0).toUpperCase() + estado.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-gray-900 text-sm font-medium mb-1">Imagen de la habitación {!editingRoom && '*'}</label>
                <div className="border-2 border-dashed border-beige-200 rounded-lg p-4 text-center">
                  {imagenPreview ? (
                    <div className="relative">
                      <img 
                        src={imagenPreview} 
                        alt="Preview" 
                        className="max-h-40 mx-auto rounded-lg" 
                      />
                      <button type="button" onClick={removeImage} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center gap-2">
                      <Upload size={32} className="text-blue-700" />
                      <span className="text-sm text-gray-700">Haz clic para subir una imagen</span>
                      <span className="text-xs text-gray-500">JPG, PNG, GIF, WEBP, BMP (max 2MB)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
              
              <div className="mt-3">
                <label className="block text-gray-900 text-sm font-medium mb-1">Descripción *</label>
                <textarea 
                  name="descripcion" 
                  value={formData.descripcion} 
                  onChange={handleChange} 
                  rows="3" 
                  className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                  placeholder="Describe la habitación (mínimo 10 caracteres)"
                  minLength={10}
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 10 caracteres</p>
              </div>
              
              <div className="mt-3">
                <label className="block text-gray-900 text-sm font-medium mb-1">Amenities</label>
                <div className="flex flex-wrap gap-3">
                  {AMENITIES_DISPONIBLES.map(amenity => (
                    <label key={amenity} className="flex items-center gap-1 text-sm cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="amenities" 
                        value={amenity} 
                        checked={formData.amenities.includes(amenity)} 
                        onChange={handleChange} 
                        className="w-4 h-4 accent-cafe-200"
                      /> 
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => { setShowModal(false); setEditingRoom(null); resetForm(); }} 
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg transition"
                >
                  {editingRoom ? 'Guardar Cambios' : 'Crear Habitación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;