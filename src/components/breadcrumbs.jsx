import { Link, useLocation } from 'react-router-dom';

import { Home } from 'lucide-react';


const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const routeNames = {
    'rooms': 'Habitaciones',
    'booking': 'Reservar',
    'confirmation': 'Confirmación',
    'login': 'Acceso',
    'admin': 'Dashboard',
    'reservations': 'Reservas',
    'settings': 'Configuración',
    'reception': 'Recepción',
    'terms': 'Términos y Condiciones',
    'privacy': 'Aviso de Privacidad'
  };

  if (location.pathname === '/') {
    return null;
  }

  const isAdminRoute = location.pathname.startsWith('/admin');
  if (location.pathname === '/admin') {
    return (
      <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-cafe-900 hover:text-cafe-100 flex items-center gap-1">
              <Home size={16} />
              <span>Inicio</span>
            </Link>
          </li>
          <li className="inline-flex items-center">
            <span className="mx-2 text-cafe-50">/</span>
            <span className="text-cafe-100 font-medium">Dashboard</span>
          </li>
        </ol>
      </nav>
    );
  }

  if (location.pathname.startsWith('/confirmation')) {
    return (
      <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-cafe-900 hover:text-cafe-100 flex items-center gap-1">
              <Home size={16} />
              <span>Inicio</span>
            </Link>
          </li>
          <li className="inline-flex items-center">
            <span className="mx-2 text-cafe-50">/</span>
            <span className="text-cafe-100 font-medium">Confirmación</span>
          </li>
        </ol>
      </nav>
    );
  }

  if (location.pathname.startsWith('/booking/')) {
    return (
      <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="text-cafe-900 hover:text-cafe-100 flex items-center gap-1">
              <Home size={16} />
              <span>Inicio</span>
            </Link>
          </li>
          <li className="inline-flex items-center">
            <span className="mx-2 text-cafe-50">/</span>
            <span className="text-cafe-100 font-medium">Reservar</span>
          </li>
        </ol>
      </nav>
    );
  }


  if (isAdminRoute) {
    const adminSection = pathnames[1] || 'dashboard';

    const sectionLabel = {
      dashboard: 'Dashboard',
      rooms: 'Habitaciones',
      reservations: 'Reservas',
      finance: 'Finanzas',
      users: 'Usuarios',
      profile: 'Mi perfil',
    };

    const sectionKey = sectionLabel[adminSection] ? adminSection : 'dashboard';

    const dashboardLink = '/admin/dashboard';

    return (
      <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/"
              className="text-cafe-900 hover:text-cafe-100 flex items-center gap-1"
            >
              <Home size={16} />
              <span>Inicio</span>
            </Link>
          </li>

          <li className="inline-flex items-center">
            <span className="mx-2 text-cafe-50">/</span>
            <Link to={dashboardLink} className="text-cafe-900 hover:text-cafe-100">Dashboard</Link>
          </li>

          <li className="inline-flex items-center">
            <span className="mx-2 text-cafe-50">/</span>
            <span className="text-cafe-100 font-medium">{sectionLabel[sectionKey] || 'Dashboard'}</span>
          </li>
        </ol>
      </nav>
    );
  }

  return (
    <nav className="flex py-3 px-5 bg-beige-100 rounded-lg mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {(!isAdminRoute) && (
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
          
          const displayName = name.charAt(0).toUpperCase() + name.slice(1);
          
          return (
            <li key={to} className="inline-flex items-center">
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