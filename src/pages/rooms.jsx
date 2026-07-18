// frontend/src/pages/rooms.jsx
import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Users, Search, Wifi, Tv, Wind, Bath, ArrowRight } from 'lucide-react';
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
const getImageSrc = (imagen) => {
  if (!imagen) {
    return sencillaImg;
  }
  
  // Si es una ruta de uploads (imagen subida del backend)
  if (typeof imagen === 'string' && imagen.startsWith('/uploads/')) {
    return `http://localhost:5000${imagen}`;
  }
  
  // Si es una URL completa
  if (typeof imagen === 'string' && (imagen.startsWith('http://') || imagen.startsWith('https://'))) {
    return imagen;
  }
  
  // Si es una ruta de assets
  if (typeof imagen === 'string' && imagen.includes('/assets/')) {
    const fileName = imagen.split('/').pop();
    return imageMap[fileName] || sencillaImg;
  }
  
  // Si es un nombre de archivo directo (ej: "sencilla.jpg")
  if (typeof imagen === 'string' && !imagen.includes('/')) {
    return imageMap[imagen] || sencillaImg;
  }
  
  // Si es base64
  if (typeof imagen === 'string' && imagen.startsWith('data:image')) {
    return imagen;
  }

  return sencillaImg;
};

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const filteredRoomsToRender = habitaciones
    .filter(room => room.estado !== 'mantenimiento')
    .filter(room => room.capacidad >= guests);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        console.log('Cargando habitaciones...');
        const response = await api.get('/rooms');
        console.log('Respuesta:', response.data);
        
        let habitacionesData = [];
        if (Array.isArray(response.data)) {
          habitacionesData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          habitacionesData = response.data.data;
        } else {
          habitacionesData = [];
        }
        
        setHabitaciones(habitacionesData);
      } catch (error) {
        console.error('Error al cargar habitaciones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const validarFechasFiltro = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = new Date(checkIn);
    const fechaFin = new Date(checkOut);
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 6);
    
    if (checkIn && checkOut) {
      if (fechaInicio < hoy) {
        alert('No se puede buscar en fechas pasadas');
        return false;
      }
      if (fechaInicio > fechaLimite) {
        alert('Solo se pueden buscar fechas con hasta 6 meses de anticipación');
        return false;
      }
      if (fechaFin <= fechaInicio) {
        alert('La fecha de salida debe ser posterior a la fecha de entrada');
        return false;
      }
    }
    return true;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (validarFechasFiltro()) {
      setSearchParams({ checkIn, checkOut, guests });
    }
  };

  const getAmenities = (roomId, roomAmenities) => {
    if (roomAmenities && roomAmenities.length > 0) {
      const amenityMap = {
        'WiFi': 'Wifi',
        'A/C': 'AC',
        'TV': 'TV',
        'Agua caliente': 'Baño',
        'Refrigerador': 'Refrigerador',
        'Cocineta': 'Cocineta',
        'Litera': 'Litera'
      };
      return roomAmenities.map(a => amenityMap[a] || a);
    }
    return ['Wifi', 'TV', 'AC', 'Baño'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
            <p className="text-cafe-100 mt-4">Cargando habitaciones...</p>
          </div>
        </div>
      </div>
    );
  }

  if (habitaciones.length === 0) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <p className="text-cafe-100">No hay habitaciones disponibles</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-cafe-900 mb-3">Habitaciones</h1>
          <p className="text-cafe-100 max-w-2xl mx-auto">
            Diseñadas para el descanso absoluto, pagos anticipados.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input
                    type="date"
                    value={checkIn}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toISOString().split('T')[0]; })()}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100" />
                </div>
              </div>
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input
                    type="date"
                    value={checkOut}
                    min={new Date().toISOString().split('T')[0]}
                    max={(() => { const d = new Date(); d.setMonth(d.getMonth() + 6); return d.toISOString().split('T')[0]; })()}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100" />
                </div>
              </div>
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Huéspedes</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 appearance-none bg-white">
                    {[1,2,3,4,5,6,7].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-cafe-200 hover:bg-cafe-100 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300">
                  <Search size={18} /> Buscar disponibilidad
                </button>
              </div>
            </div>
          </form>
        </div>
        
        <div className="grid grid-cols-1 gap-10">
          {filteredRoomsToRender.map((room) => {
            const amenities = getAmenities(room.id, room.amenities);
            return (
              <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-64 md:h-72 lg:h-80 overflow-hidden">
                    <img 
                      src={getImageSrc(room.imagen)} 
                      alt={room.nombre} 
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      onError={(e) => {
                        e.target.src = sencillaImg;
                      }}
                    />
                    <div className="absolute top-4 left-4 bg-cafe-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      Desde ${room.precio} MXN
                    </div>
                  </div>
                  
                  <div className="p-6 lg:p-8 flex flex-col h-64 md:h-72 lg:h-80">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h2 className="text-2xl lg:text-3xl font-bold text-cafe-900">{room.nombre}</h2>
                        <span className="text-cafe-100 text-sm bg-beige-50 px-3 py-1 rounded-full whitespace-nowrap ml-2">
                          {room.capacidad} {room.capacidad === 1 ? 'persona' : 'personas'}
                        </span>
                      </div>
                      <p className="text-cafe-100 mb-3 text-base line-clamp-2">{room.descripcion}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {amenities.includes('Wifi') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Wifi size={16} /> WiFi</div>}
                        {amenities.includes('TV') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Tv size={16} /> TV</div>}
                        {amenities.includes('AC') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Wind size={16} /> AC</div>}
                        {amenities.includes('Baño') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Bath size={16} /> Baño</div>}
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-beige-100 pt-3 mt-auto">
                      <div>
                        <span className="text-3xl font-bold text-cafe-900">${room.precio}</span>
                        <span className="text-cafe-50 text-sm"> / noche</span>
                      </div>
                      <Link 
                        to={`/booking/${room.id}${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : ''}`}
                        className="bg-cafe-200 hover:bg-cafe-100 text-white px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 group text-sm"
                      >
                        Reservar <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-12 bg-beige-100 rounded-xl p-6 text-center">
          <p className="text-cafe-100 text-sm">
            Todos nuestros huéspedes disfrutan de: barra libre de café, wifi de alta velocidad y estacionamiento gratuito.
            <br />
            Aceptamos mascotas; cobro por mascota chica 15 dlls por día, mascota grande 30 dlls por día, pago en recepción.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rooms;