import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNames = {
    'rooms': 'Habitaciones',
    'booking': 'Reservar',
    'confirmation': 'Confirmación',
    'my-reservations': 'Mis Reservas',
    'login': 'Acceso',
    'admin': 'Dashboard',
    'reservations': 'Reservas',
    'settings': 'Configuración',
    'reception': 'Recepción',
    'terms': 'Términos y Condiciones',
  'privacy': 'Aviso de Privacidad'
  };

  // No mostrar breadcrumb en la página de inicio
  if (location.pathname === '/') {
    return null;
  }

  // Para rutas de admin, mostrar breadcrumb simplificado (sin Inicio)
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        
        {/* Mostrar "Inicio" solo si NO es ruta de admin */}
        {!isAdminRoute && (
          <li className="inline-flex items-center">
            <Link to="/" className="text-cafe-900 hover:text-cafe-100 flex items-center gap-1">
              <Home size={16} />
              <span>Inicio</span>
            </Link>
          </li>
        )}
        
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const name = routeNames[value] || value;
          
          // Capitalizar primera letra
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          
          return (
            <li key={to} className="inline-flex items-center">
              {/* Mostrar "/" solo si hay un elemento antes (admin) o si no es el primero */}
              {(index > 0 || !isAdminRoute) && (
                <span className="mx-2 text-cafe-50">/</span>
              )}
              {isLast ? (
                <span className="text-cafe-100 font-medium">{displayName}</span>
              ) : (
                <Link to={to} className="text-cafe-900 hover:text-cafe-100">
                  {displayName}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;