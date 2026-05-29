import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, LogOut, LayoutDashboard, CalendarCheck, Settings, 
  BookOpen, Users, Home, Hotel, BedDouble, DollarSign
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Función para cargar usuario desde sessionStorage
  const cargarUsuario = () => {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    } else {
      setCurrentUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarUsuario();
    
    // Escuchar cambios en la URL (cuando el usuario usa "atrás" o "adelante")
    const handlePopState = () => {
      cargarUsuario();
    };
    
    window.addEventListener('popstate', handlePopState);
    
    // Escuchar cambios en sessionStorage
    const handleStorageChange = () => {
      cargarUsuario();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Escuchar cambios en la ubicación
  useEffect(() => {
    cargarUsuario();
  }, [location.pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setCurrentUser(null);
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <nav className="bg-cafe-900 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">Prestige Inn</Link>
            <div className="flex gap-4">
              <div className="w-20 h-6 bg-beige-50/20 rounded animate-pulse"></div>
              <div className="w-16 h-6 bg-beige-50/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-cafe-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Link to="/" className="text-2xl font-bold">
            Prestige Inn
          </Link>
          
          <div className="flex gap-4 flex-wrap items-center">
            
            {/* USUARIO NO LOGUEADO */}
            {!currentUser && (
              <>
                <Link to="/" className="hover:text-beige-100">Inicio</Link>
                <Link to="/rooms" className="hover:text-beige-100">Habitaciones</Link>
                <Link to="/login" className="hover:text-beige-100">Login</Link>
              </>
            )}
            
            {/* CLIENTE NORMAL */}
            {currentUser?.role === 'cliente' && (
              <>
                <Link to="/" className="hover:text-beige-100">Inicio</Link>
                <Link to="/rooms" className="hover:text-beige-100">Habitaciones</Link>
                <Link to="/my-reservations" className="hover:text-beige-100">Mis Reservas</Link>
                <Link to="/profile" className="hover:text-beige-100">Mi Perfil</Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-error/20 hover:bg-error/30 text-white px-4 py-2 rounded-lg"
                >
                  Salir
                </button>
              </>
            )}
            
            {/* ADMIN */}
            {currentUser?.role === 'admin' && (
              <>
                <Link to="/admin" className="hover:text-beige-100">Dashboard</Link>
                <Link to="/admin/rooms" className="hover:text-beige-100">Habitaciones</Link>
                <Link to="/admin/reservations" className="hover:text-beige-100">Reservas</Link>
                <Link to="/admin/finance" className="hover:text-beige-100">Finanzas</Link>
                <Link to="/admin/users" className="hover:text-beige-100">Usuarios</Link>
                <Link to="/admin/settings" className="hover:text-beige-100">Configuración</Link>
                <Link to="/profile" className="hover:text-beige-100">Mi Perfil</Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-error/20 hover:bg-error/30 text-white px-4 py-2 rounded-lg"
                >
                  Salir
                </button>
              </>
            )}
            
            {/* RECEPCIONISTA */}
            {currentUser?.role === 'recepcion' && (
              <>
                <Link to="/reception" className="hover:text-beige-100">Recepción</Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-error/20 hover:bg-error/30 text-white px-4 py-2 rounded-lg"
                >
                  Salir
                </button>
              </>
            )}
          </div>
        </div>
        
        {currentUser && (
          <div className="mt-2 text-sm opacity-75 flex items-center gap-2 border-t border-beige-50/20 pt-2">
            <User size={14} />
            <span>{currentUser.nombre}</span>
            <span className="text-xs px-2 py-0.5 bg-beige-50/20 rounded-full">
              {currentUser.role === 'admin' ? 'Administrador' : 
               currentUser.role === 'recepcion' ? 'Recepcionista' : 'Cliente'}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;