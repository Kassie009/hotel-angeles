import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import Confirmation from './pages/Confirmation';
import MyReservations from './pages/MyReservations';
import LoginRegister from './pages/LoginRegister';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import AdminRooms from './pages/AdminRooms';
import AdminReservations from './pages/AdminReservations';
import AdminFinance from './pages/AdminFinance';
import AdminUsers from './pages/AdminUsers';
import AdminSettings from './pages/AdminSettings';
import Reception from './pages/Reception';
import Terms from './pages/Terminos';
import Privacy from './pages/Privacidad';
function App() {
  return (
    <div className="min-h-screen flex flex-col bg-beige-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/login" element={<LoginRegister />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          
          {/* Rutas protegidas - cualquier usuario logueado */}
          <Route path="/booking/:id" element={
            <ProtectedRoute allowedRoles={['cliente', 'admin', 'recepcion']}>
              <Booking />
            </ProtectedRoute>
          } />
          <Route path="/confirmation" element={
            <ProtectedRoute allowedRoles={['cliente', 'admin', 'recepcion']}>
              <Confirmation />
            </ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute allowedRoles={['cliente', 'admin']}>
              <MyReservations />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute allowedRoles={['cliente', 'admin', 'recepcion']}>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Rutas solo para ADMIN */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/rooms" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminRooms />
            </ProtectedRoute>
          } />
          <Route path="/admin/reservations" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReservations />
            </ProtectedRoute>
          } />
          <Route path="/admin/finance" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminFinance />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/settings" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSettings />
            </ProtectedRoute>
          } />
          
          {/* Rutas para ADMIN y RECEPCIONISTA */}
          <Route path="/reception" element={
            <ProtectedRoute allowedRoles={['admin', 'recepcion']}>
              <Reception />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;