import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Importar páginas públicas
import Home from './pages/home';
import Rooms from './pages/rooms';
import Booking from './pages/booking';
import Confirmation from './pages/confirmation';
import SearchReservation from './pages/SearchReservation';
import Terminos from './pages/Terminos';
import Privacidad from './pages/Privacidad';

// Importar páginas privadas
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminRooms from './pages/AdminRooms';
import AdminReservations from './pages/AdminReservations';
import AdminFinance from './pages/AdminFinance';
import AdminUsers from './pages/AdminUsers';
import AdminProfile from './pages/AdminProfile';
import ReceptionDashboard from './pages/ReceptionDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-beige-50">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

            {/* ===== RUTAS PÚBLICAS ===== */}
            <Route path="/" element={<Home />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/booking/:id" element={<Booking />} />
            <Route path="/confirmation/:codigo" element={<Confirmation />} />
            <Route path="/search-reservation" element={<SearchReservation />} />
            <Route path="/terms" element={<Terminos />} />
            <Route path="/privacy" element={<Privacidad />} />
            
            {/* ===== LOGIN ===== */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            {/* ===== SOLO ADMIN ===== */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/rooms" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRooms />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/finance" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminFinance />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminUsers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/profile" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminProfile />
                </ProtectedRoute>
              } 
            />
            
            {/* ===== ADMIN Y RECEPCIÓN ===== */}
            <Route 
              path="/admin/reservations" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'recepcion']}>
                  <AdminReservations />
                </ProtectedRoute>
              } 
            />
            
            {/* ===== SOLO RECEPCIÓN ===== */}
            <Route 
              path="/recepcion/dashboard" 
              element={
                <ProtectedRoute allowedRoles={['recepcion']}>
                  <ReceptionDashboard />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;