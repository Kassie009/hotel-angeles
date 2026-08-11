import { Link, useNavigate } from 'react-router-dom';
import { User, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="bg-cafe-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Link 
            to={currentUser ? '/admin/dashboard' : '/'} 
            className="text-2xl font-bold"
          >
            Hotel Angeles
          </Link>
          
          <div className="flex gap-4 flex-wrap items-center">

            {!currentUser && (
              <>
                <Link to="/" className="hover:text-beige-100">Inicio</Link>
                <Link to="/rooms" className="hover:text-beige-100">Habitaciones</Link>
                <Link to="/search-reservation" className="hover:text-beige-100 flex items-center gap-1">
                  <Search size={16} /> Consultar reserva
                </Link>
              </>
            )}
            

            {currentUser?.rol === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="hover:text-beige-100">Dashboard</Link>
                <Link to="/admin/rooms" className="hover:text-beige-100">Habitaciones</Link>
                <Link to="/admin/reservations" className="hover:text-beige-100">Reservas</Link>
                <Link to="/admin/finance" className="hover:text-beige-100">Finanzas</Link>
                <Link to="/admin/users" className="hover:text-beige-100">Usuarios</Link>
                <Link to="/admin/profile" className="hover:text-beige-100">Mi Perfil</Link>
                <button 
                  onClick={handleLogout} 
                  className="bg-red-600/20 hover:bg-red-600/30 text-white px-4 py-2 rounded-lg transition"
                >
                  Salir
                </button>
              </>
            )}
            

            {currentUser?.rol === 'recepcion' && (
              <>

                <Link to="/recepcion/dashboard" className="hover:text-beige-100">Reservas</Link>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600/20 hover:bg-red-600/30 text-white px-4 py-2 rounded-lg transition"
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
              {currentUser.rol === 'admin' ? 'Administrador' : 'Recepcionista'}
            </span>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;