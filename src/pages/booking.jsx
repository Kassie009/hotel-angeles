import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';  
import sencillaImg from '../assets/sencilla.jpg';
import sencilla2Img from '../assets/sencilla2.jpg';
import dobleImg from '../assets/doble.jpg';
import doble2Img from '../assets/doble2.jpg';
import familiarImg from '../assets/familiar.jpg';
import familiar3Img from '../assets/familiar3.jpg';
import doble3Img from '../assets/doble3.jpg';

const imageMap = {
  'sencilla.jpg': sencillaImg,
  'sencilla2.jpg': sencilla2Img,
  'doble.jpg': dobleImg,
  'doble2.jpg': doble2Img,
  'familiar.jpg': familiarImg,
  'familiar3.jpg': familiar3Img,
  'doble3.jpg': doble3Img,
};

const getImage = (path) => {
  if (!path) return sencillaImg;
  const fileName = path.split('/').pop();
  return imageMap[fileName] || sencillaImg;
};

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    huespedes: Number(searchParams.get('guests')) || 1
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        
        const response = await api.get(`/rooms/${id}`);
        
        
 
        let roomData;
        if (response.data?.data) {
          roomData = response.data.data;
        } else if (response.data?.id) {
          roomData = response.data;
        } else {
          
          throw new Error('Formato de respuesta no reconocido');
        }
        
        
        setRoom(roomData);
      } catch {
        
        setError('Error al cargar la habitación');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const validarFechas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = parseLocalDate(formData.checkIn);
    const fechaFin = parseLocalDate(formData.checkOut);
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 6);

    if (!formData.checkIn || !formData.checkOut) {
      alert('Por favor selecciona las fechas');
      return false;
    }
    if (fechaInicio < hoy) {
      alert('No se puede reservar en fechas pasadas');
      return false;
    }
    if (fechaInicio > fechaLimite) {
      alert(`Solo se puede reservar hasta ${fechaLimite.toLocaleDateString()}`);
      return false;
    }
    if (fechaFin <= fechaInicio) {
      alert('La fecha de salida debe ser posterior a la de entrada');
      return false;
    }
    return true;
  };

  const calcularNoches = () => {
    if (formData.checkIn && formData.checkOut) {
      const inicio = parseLocalDate(formData.checkIn);
      const fin = parseLocalDate(formData.checkOut);
      const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const calcularDescuento = (noches, precioNoche) => {
    const subtotalBase = precioNoche * noches;
    if (noches >= 30) {
      return Math.round(subtotalBase * 0.20 * 100) / 100;
    } else if (noches >= 14) {
      return Math.round((subtotalBase * 0.15 + 200) * 100) / 100;
    } else if (noches >= 7) {
      return Math.round((subtotalBase * 0.10 + 100) * 100) / 100;
    }
    return 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFechas()) return;

    const noches = calcularNoches();
    const subtotal = room.precio * noches;
    const descuento = calcularDescuento(noches, room.precio);
    const total = subtotal - descuento;

    if (Number(formData.huespedes) > Number(room.capacidad)) {
      alert(`El máximo de huéspedes para esta habitación es ${room.capacidad}`);
      return;
    }

    const reserva = {
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      habitacion: room.nombre,
      room_id: room.id,  
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      noches: noches,
      subtotal: subtotal,   
      iva: 0,            
      descuento: descuento,
      total: total,
      huesped: formData.nombre,
      huespedes: formData.huespedes
    };

    try {
      setLoading(true);
      
      
      const response = await api.post('/reservations', reserva);
      

      sessionStorage.setItem('lastReservation', JSON.stringify(response.data));
      navigate(`/confirmation/${response.data.codigo}`);
      
    } catch (error) {
      
      
      let errorMessage = 'Error al crear la reserva';
      if (error.response) {
        
        errorMessage = error.response.data?.error || error.response.data?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
          <p className="text-gray-700 mt-4">Cargando habitación...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <div className="text-center py-20">
          <p className="text-red-600 text-lg">{error || 'Habitación no encontrada'}</p>
<button 
            onClick={() => navigate('/rooms')}
            className="btn-primary mt-4 px-6 py-2"
          >
            Volver a habitaciones
          </button>
        </div>
      </div>
    );
  }

  const noches = calcularNoches();
  const subtotal = room.precio * noches;
  const descuento = calcularDescuento(noches, room.precio);
  const total = subtotal - descuento;

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Finalizar Reserva</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-900 text-sm font-medium mb-1">Nombre Completo *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                placeholder="Juan Pérez"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-900 text-sm font-medium mb-1">Correo Electrónico *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                placeholder="juan@email.com"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-900 text-sm font-medium mb-1">Teléfono *</label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                placeholder="653 123 4567"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-1">Check-in *</label>
                <input
                  type="date"
                  name="checkIn"
                  value={formData.checkIn}
                  onChange={handleChange}
                  required
                  min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                  max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                  className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
              <div>
                <label className="block text-gray-900 text-sm font-medium mb-1">Check-out *</label>
                <input
                  type="date"
                  name="checkOut"
                  value={formData.checkOut}
                  onChange={handleChange}
                  required
                  min={(() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                  max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })()}
                  className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-900 text-sm font-medium mb-1">Huéspedes</label>
              <select
                name="huespedes"
                value={formData.huespedes}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 appearance-none bg-white"
              >
                {[1, 2, 3, 4, 5, 6,7].map(num => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>
                ))}
              </select>
            </div>

<button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Procesando...' : 'Confirmar Reserva'}
            </button>
          </form>
        </div>

        <div className="bg-beige-100 rounded-xl shadow-md p-6 h-fit sticky top-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Resumen de Estancia</h2>
          
          <div className="rounded-lg overflow-hidden mb-4">
            <img 
              src={getImage(room.imagen)} 
              alt={room.nombre} 
              className="w-full h-40 object-cover rounded-lg" 
            />
          </div>
          
          <div className="border-b border-cafe-50 pb-4 mb-4">
            <p className="font-semibold text-gray-900 text-lg">{room.nombre}</p>
            <p className="text-gray-700 text-sm">Capacidad: {room.capacidad} personas</p>
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span className="text-gray-700">Precio por noche</span>
              <span className="text-gray-900 font-medium">${room.precio}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Noches</span>
              <span className="text-gray-900 font-medium">{noches}</span>
            </div>
            {descuento > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span className="font-medium">Descuento estancia larga</span>
                  <span className="font-bold">-{noches >= 30 ? '20%' : noches >= 14 ? '15%' : '10%'}</span>
                </div>
              </>
            )}
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span className="text-gray-900">TOTAL A PAGAR</span>
              <span className="text-gray-900 text-xl">${total.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 text-right">*Precio ya incluye IVA</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Booking;