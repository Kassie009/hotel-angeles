import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Search, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';  
import hotelImg from '../assets/hotel.jpg';
import sencillaImg from '../assets/sencilla.jpg';
import sencilla2Img from '../assets/sencilla2.jpg';
import dobleImg from '../assets/doble.jpg';
import doble2Img from '../assets/doble2.jpg';
import familiarImg from '../assets/familiar.jpg';
import familiar3Img from '../assets/familiar3.jpg';
import doble3Img from '../assets/doble3.jpg';
import estacionamientoImg from '../assets/estacionamiento.jpg';
import barraImg from '../assets/barra1.png';
import camaraImg from '../assets/camara.jpg';
import tvImg from '../assets/tv.jpg';
import wifiImg from '../assets/wifi.jpg';
import recepcionImg from '../assets/recepcion.png';

const imageMap = {
  'sencilla.jpg': sencillaImg,
  'sencilla2.jpg': sencilla2Img,
  'doble.jpg': dobleImg,
  'doble2.jpg': doble2Img,
  'familiar.jpg': familiarImg,
  'familiar3.jpg': familiar3Img,
  'doble3.jpg': doble3Img,
  'estacionamiento.jpg': estacionamientoImg,
  'barra.png': barraImg
};

const getImage = (path) => {
  if (!path) return sencillaImg;
  const fileName = path.split('/').pop();
  return imageMap[fileName] || sencillaImg;
};

const Home = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [destacadas, setDestacadas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        
        const response = await api.get('/rooms');  
        
        
        let habitacionesData = [];
        if (Array.isArray(response.data)) {
          habitacionesData = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          habitacionesData = response.data.data;
        } else {
          habitacionesData = [];
        }
        
        const filtradas = habitacionesData.filter(r => r.estado !== 'mantenimiento');
        setDestacadas(filtradas.slice(0, 3));
      } catch {
        
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const heroImages = [
    {
      url: hotelImg,
      title: 'Bienvenidos a Hotel Angeles',
      subtitle: 'Su confortabilidad es nuestra prioridad'
    },
    {
      url: doble2Img,
      title: 'Habitaciones diseñadas para tu descanso absoluto',
      subtitle: 'Comodidad y calidez en San Luis Río Colorado'
    }
  ];

  const servicios = [
    {
      nombre: 'Barra de café',
      descripcion: 'Barra libre de café, té y chocolate disponible 24/7',
      imagen: barraImg
    },
    {
      nombre: 'Estacionamiento',
      descripcion: 'Estacionamiento gratuito y vigilado las 24 horas',
      imagen: estacionamientoImg
    },
    {
      nombre: 'WiFi Alta Velocidad',
      descripcion: 'Conexión de fibra óptica en todo el hotel',
      imagen: wifiImg
    },
    {
      nombre: 'Cámaras de vigilancia',
      descripcion: 'Cámaras de seguridad en funcionamiento las 24 hrs',
      imagen: camaraImg
    },
    {
      nombre: 'TV por cable',
      descripcion: 'Televisión por cable con una amplia variedad de canales de entretenimiento.',
      imagen: tvImg
    },
    {
      nombre: 'Habitaciones sanitizadas',
      descripcion: 'Habitaciones limpias y sanitizadas para una estancia cómoda y segura.',
      imagen: sencilla2Img
    },

  ];

  const parseLocalDate = (str) => {
    const [y, m, d] = str.split('-').map(Number);
    return new Date(y, m - 1, d);
  };

  const validarFechas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaInicio = parseLocalDate(checkIn);
    const fechaFin = parseLocalDate(checkOut);
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

  const hoyISO = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const fechaLimiteISO = (() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

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
        <button onClick={prevSlide} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all z-10">
          <ChevronLeft size={32} className="text-white" />
        </button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-2 transition-all z-10">
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

     
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-900 text-sm font-medium mb-1">Check-in</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="date"
                  value={checkIn}
                  min={hoyISO}
                  max={fechaLimiteISO}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-900 text-sm font-medium mb-1">Check-out</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="date"
                  value={checkOut}
                  min={hoyISO}
                  max={fechaLimiteISO}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-900 text-sm font-medium mb-1">Huéspedes</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 appearance-none bg-white">
                  {[1,2,3,4,5,6,7].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>)}
                </select>
              </div>
            </div>
<div className="flex items-end">
              <button onClick={handleBuscar} className="btn-primary w-full py-3">
                <Search size={18} /> Buscar
              </button>
            </div>
          </div>
        </div>
      </div>

     
      <div className="container mx-auto px-4 pt-8">
        <Breadcrumbs />
      </div>

    
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Habitaciones Destacadas</h2>
          </div>
          <Link to="/rooms" className="text-gray-700 hover:text-blue-800 font-medium flex items-center gap-1 group">
            Ver todas <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
            <p className="text-gray-700 mt-4">Cargando habitaciones...</p>
          </div>
        ) : destacadas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-700">No hay habitaciones disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destacadas.map((room) => (
              <div key={room.id} className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                <div className="relative overflow-hidden h-64">
                  <img src={getImage(room.imagen)} alt={room.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{room.nombre}</h3>
                  </div>
                  <p className="text-gray-700 text-sm mb-4">{room.descripcion}</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">${room.precio}</span>
                      <span className="text-gray-500"> / noche</span>
                    </div>
<Link to={`/booking/${room.id}`} className="btn-primary px-5 py-2">
                      Reservar <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-cafe-900 via-blue-900 to-cafe-900 rounded-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-2">Descuentos por Estancia Larga</h2>
          <p className="text-blue-200 text-center mb-8">Ahorra más cuanto más te quedas</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <p className="text-4xl font-bold mb-2">10%</p>
              <p className="font-semibold text-lg">Semana</p>
              <p className="text-sm text-blue-200 mt-1">7 noches o más</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <p className="text-4xl font-bold mb-2">15%</p>
              <p className="font-semibold text-lg">Quincena</p>
              <p className="text-sm text-blue-200 mt-1">14 noches o más</p>
            </div>
            <div className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300">
              <p className="text-4xl font-bold mb-2">20%</p>
              <p className="font-semibold text-lg">Mes</p>
              <p className="text-sm text-blue-200 mt-1">30 noches o más</p>
            </div>
          </div>
        </div>
      </div>

      
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">Servicios y Amenidades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {servicios.map((servicio, idx) => (
              <div key={idx} className="group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-500">
                <img src={servicio.imagen} alt={servicio.nombre} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="p-4 bg-white">
                  <h3 className="text-xl font-bold text-gray-900">{servicio.nombre}</h3>
                  <p className="text-gray-700 text-sm mt-1">{servicio.descripcion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    
      <div className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-r from-beige-100 to-beige-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ubicación Privilegiada</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Estratégicamente situados en el corazón de San Luis Río Colorado.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  A 5 minutos del cruce fronterizo
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  Cerca de los principales centros comerciales
                </li>
                <li className="flex items-center gap-2 text-gray-700">
                  <span className="w-2 h-2 bg-cafe-200 rounded-full"></span>
                  Cerca de áreas bares y restaurantes
                </li>
              </ul>
            </div>
            <div className="overflow-hidden rounded-xl h-64 md:h-80">
              <img src={recepcionImg} alt="Hotel Ángeles" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default Home;