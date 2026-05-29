import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Search, ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const Home = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [habitaciones, setHabitaciones] = useState([]);
  const [destacadas, setDestacadas] = useState([]);

  // Cargar habitaciones desde localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('rooms') || '[]');
    if (stored.length > 0) {
      setHabitaciones(stored);
      setDestacadas(stored.slice(0, 3));
    } else {
      // Si no hay habitaciones, mostrar mensaje o cargar datos por defecto
      setDestacadas([]);
    }
  }, []);

  const heroImages = [
    {
      url: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Bienvenidos a Prestige Inn',
      subtitle: 'Lujo y confort en San Luis Río Colorado'
    },
    {
      url: 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Habitaciones de Ensueño',
      subtitle: 'Diseñadas para tu descanso absoluto'
    },
    {
      url: 'https://images.pexels.com/photos/261169/pexels-photo-261169.jpeg?auto=compress&cs=tinysrgb&w=1600',
      title: 'Experiencia Única',
      subtitle: 'Donde cada estancia se vuelve experiencia'
    }
  ];

  const servicios = [
    {
      nombre: 'Alberca Oasis',
      descripcion: 'Disfruta de nuestra alberca climatizada',
      imagen: 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/16/fa/44/2f/piscina-lidotel-hotel.jpg?w=900&h=500&s=1'
    },
    {
      nombre: 'Gimnasio',
      descripcion: 'Equipo de última generación disponible 24/7',
      imagen: 'https://cache.marriott.com/content/dam/marriott-renditions/dm-static-renditions/ts/us-canada/hws/n/nycts/en_us/photo/unlimited/assets/nycts-fitness-2441-wide-hor.jpg?output-quality=70&interpolation=progressive-bilinear&downsize=1318px:*'
    },
    {
      nombre: 'Estacionamiento',
      descripcion: 'Estacionamiento gratuito y vigilado las 24 horas',
      imagen: 'https://img.freepik.com/premium-photo/luxury-hotel-parking-lot-with-valet-service-area-guest-cars-during-evening-twilight_416256-78169.jpg'
    },
    {
      nombre: 'Restaurante',
      descripcion: 'Gastronomía local e internacional',
      imagen: 'https://media.gq.com.mx/photos/62ec2d9cf84edeef239b608c/master/w_1600%2Cc_limit/040-MLC-Mezcal-INT-2.jpg'
    },
    {
      nombre: 'Bar',
      descripcion: 'Coctelería de autor con los mejores ingredientes',
      imagen: 'https://media.timeout.com/images/105296312/1372/772/image.jpg'
    },
    {
      nombre: 'WiFi Alta Velocidad',
      descripcion: 'Conexión de fibra óptica en todo el hotel',
      imagen: 'https://img.freepik.com/premium-photo/person-using-laptop-coffee-shop-connected-internet-via-public-wifi-illustrating-flexibility-wireless-communication_1229213-46202.jpg'
    }
  ];

  // Validación de fechas
  const validarFechas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaInicio = new Date(checkIn);
    const fechaFin = new Date(checkOut);
    
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 6);
    
    if (!checkIn || !checkOut) {
      alert('Por favor selecciona ambas fechas');
      return false;
    }
    
    if (fechaInicio < hoy) {
      alert('No se puede reservar en fechas pasadas');
      return false;
    }
    
    if (fechaInicio > fechaLimite) {
      alert(`Solo se pueden reservar fechas con hasta 6 meses de anticipación. Máximo: ${fechaLimite.toLocaleDateString()}`);
      return false;
    }
    
    if (fechaFin <= fechaInicio) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return false;
    }
    
    return true;
  };

  const handleBuscar = () => {
    if (validarFechas()) {
      navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <div className="min-h-screen bg-beige-50">
      
      {/* Carrusel Principal */}
      <div className="relative h-[500px] md:h-[600px] w-full overflow-hidden">
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img src={img.url} alt={img.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">{img.title}</h1>
              <p className="text-xl md:text-2xl italic">{img.subtitle}</p>
            </div>
          </div>
        ))}
        
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all z-10"
        >
          <ChevronLeft size={32} className="text-white" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all z-10"
        >
          <ChevronRight size={32} className="text-white" />
        </button>
        
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Buscador Flotante */}
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-cafe-900 text-sm font-medium mb-1">Huéspedes</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 appearance-none bg-white"
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-end">
              <button
                onClick={handleBuscar}
                className="w-full bg-cafe-200 hover:bg-cafe-100 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                <Search size={18} />
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 pt-8">
        <Breadcrumbs />
      </div>

      {/* Habitaciones Destacadas */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-cafe-900">Habitaciones Destacadas</h2>
            <p className="text-cafe-100 mt-2">Confort y diseño inspirado en el paisaje sonorense.</p>
          </div>
          <Link to="/rooms" className="text-cafe-100 hover:text-cafe-200 font-medium flex items-center gap-1 group">
            Ver todas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {destacadas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-cafe-100">No hay habitaciones disponibles</p>
            <Link to="/admin/rooms" className="btn-primary inline-block mt-4">Agregar Habitaciones</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destacadas.map((room) => (
              <div key={room.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative overflow-hidden h-64">
                  <img src={room.imagen} alt={room.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-cafe-900">{room.nombre}</h3>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-sm text-cafe-100">4.8</span>
                    </div>
                  </div>
                  <p className="text-cafe-100 text-sm mb-4">{room.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-cafe-900">${room.precio}</span>
                      <span className="text-cafe-50"> / noche</span>
                    </div>
                    <Link to={`/booking/${room.id}`} className="bg-cafe-200 hover:bg-cafe-100 text-white px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2">
                      Reservar <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Servicios y Amenidades */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-cafe-900 mb-4">Servicios y Amedidades</h2>
          <p className="text-cafe-100 text-center max-w-2xl mx-auto mb-12">
            Diseñados para transformar su estancia en una experiencia memorable y sin preocupaciones.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio, idx) => (
              <div key={idx} className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
                <img src={servicio.imagen} alt={servicio.nombre} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-bold text-cafe-900">{servicio.nombre}</h3>
                  <p className="text-cafe-100 text-sm mt-1">{servicio.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ubicación Privilegiada */}
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-beige-100 to-beige-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-4">Ubicación Privilegiada</h2>
              <p className="text-cafe-100 leading-relaxed mb-4">
                Estratégicamente situados en el corazón de San Luis Río Colorado, ofrecemos el equilibrio perfecto entre la conveniencia urbana y la aventura natural.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-cafe-100">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  A 5 minutos del cruce fronterizo
                </li>
                <li className="flex items-center gap-2 text-cafe-100">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  Cerca de los principales centros comerciales
                </li>
                <li className="flex items-center gap-2 text-cafe-100">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  A corta distancia de las famosas dunas del Altar
                </li>
              </ul>
            </div>
            
            <div className="overflow-hidden rounded-xl h-64 md:h-80">
              <img
                src="https://hamiltons.in/wp-content/uploads/2024/01/panthera_projects.jpg"
                alt="Vista del desierto y dunas cerca de San Luis Río Colorado"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Home;