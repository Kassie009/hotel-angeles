import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, Users, Search, Wifi, Coffee, Bath, Tv, Wind, Sparkles, ArrowRight, Star } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const Rooms = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [checkIn, setCheckIn] = useState(searchParams.get('checkIn') || '');
  const [checkOut, setCheckOut] = useState(searchParams.get('checkOut') || '');
  const [guests, setGuests] = useState(Number(searchParams.get('guests')) || 1);
  const [habitaciones, setHabitaciones] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);

  // Cargar habitaciones desde localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('rooms') || '[]');
    if (stored.length === 0) {
      // Si no hay habitaciones en localStorage, cargar las iniciales
      const storedReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
      // Podrías inicializar con datos por defecto aquí
      setHabitaciones([]);
      setFilteredRooms([]);
    } else {
      setHabitaciones(stored);
      setFilteredRooms(stored);
    }
  }, []);

  // Filtrar habitaciones por capacidad
  useEffect(() => {
    const filtered = habitaciones.filter(room => room.capacidad >= guests);
    setFilteredRooms(filtered);
  }, [guests, habitaciones]);

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
      return roomAmenities;
    }
    // Fallback por si no tiene amenities
    return ['Wifi', 'TV', 'AC', 'Baño'];
  };

  if (habitaciones.length === 0) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <p className="text-cafe-100">No hay habitaciones disponibles</p>
            <Link to="/admin/rooms" className="btn-primary inline-block mt-4">Agregar Habitaciones</Link>
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
          <h1 className="text-4xl md:text-5xl font-bold text-cafe-900 mb-3">Habitaciones y Suites</h1>
          <p className="text-cafe-100 max-w-2xl mx-auto">
            Diseñadas para el descanso absoluto, nuestras habitaciones fusionan la calidez del desierto con el lujo contemporáneo.
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Check-in</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100" />
                </div>
              </div>
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Check-out</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100" />
                </div>
              </div>
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Huéspedes</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 appearance-none bg-white">
                    {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>)}
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
          {filteredRooms.map((room) => {
            const amenities = getAmenities(room.id, room.amenities);
            return (
              <div key={room.id} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-2">
                  <div className="relative h-80 lg:h-full overflow-hidden">
                    <img src={room.imagen} alt={room.nombre} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                    <div className="absolute top-4 left-4 bg-cafe-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                      Desde ${room.precio} MXN
                    </div>
                  </div>
                  <div className="p-6 lg:p-8">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl lg:text-3xl font-bold text-cafe-900">{room.nombre}</h2>
                      <span className="text-cafe-100 text-sm bg-beige-50 px-3 py-1 rounded-full">
                        {room.capacidad} {room.capacidad === 1 ? 'persona' : 'personas'}
                      </span>
                    </div>
                    <p className="text-cafe-100 mb-4">{room.descripcion}</p>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      {amenities.includes('Wifi') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Wifi size={16} /> WiFi</div>}
                      {amenities.includes('TV') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Tv size={16} /> TV</div>}
                      {amenities.includes('AC') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Wind size={16} /> AC</div>}
                      {amenities.includes('Baño') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Bath size={16} /> Baño</div>}
                      {amenities.includes('Balcón') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Sparkles size={16} /> Balcón</div>}
                      {amenities.includes('Minibar') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Coffee size={16} /> Minibar</div>}
                      {amenities.includes('Jacuzzi') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Bath size={16} /> Jacuzzi</div>}
                      {amenities.includes('Terraza') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Sparkles size={16} /> Terraza</div>}
                      {amenities.includes('VIP') && <div className="flex items-center gap-1 text-sm text-cafe-100"><Star size={14} /> VIP</div>}
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-beige-100 pt-4">
                      <div>
                        <span className="text-3xl font-bold text-cafe-900">${room.precio}</span>
                        <span className="text-cafe-50"> / noche</span>
                      </div>
                      <Link 
                        to={`/booking/${room.id}${checkIn ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}` : ''}`}
                        className="bg-cafe-200 hover:bg-cafe-100 text-white px-6 py-3 rounded-full transition-all duration-300 flex items-center gap-2 group"
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
            Todos nuestros huéspedes disfrutan de: Alberca, Gimnasio, WiFi de alta velocidad y Estacionamiento gratuito.
            <br />
            Bar y Restaurante con servicio a la habitación (pago directo en el hotel).
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rooms;