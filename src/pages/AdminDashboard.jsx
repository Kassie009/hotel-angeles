import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, TrendingUp, Activity, Bed, ClipboardList } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminDashboard = () => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [notas, setNotas] = useState([]);
  const [stats, setStats] = useState({
    totalReservas: 0,
    ingresosTotales: 0,
    ocupacion: 0,
    checkinsHoy: 0,
    checkoutsHoy: 0,
    reservasPendientes: 0
  });

  // Función para actualizar estados según fechas
  const actualizarEstadosPorFecha = (reservasActuales) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let modificadas = false;
    const reservasActualizadas = reservasActuales.map(res => {
      const checkOut = new Date(res.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      
      if (res.estado === 'checkin_realizado' && checkOut < hoy) {
        modificadas = true;
        return { ...res, estado: 'finalizada' };
      }
      return res;
    });
    
    if (modificadas) {
      localStorage.setItem('reservations', JSON.stringify(reservasActualizadas));
    }
    
    return reservasActualizadas;
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = () => {
    let storedReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
    const storedHabitaciones = JSON.parse(localStorage.getItem('rooms') || '[]');
    const storedNotas = JSON.parse(localStorage.getItem('receptionNotes') || '[]');
    
    storedReservas = actualizarEstadosPorFecha(storedReservas);
    
    setReservas(storedReservas);
    setHabitaciones(storedHabitaciones);
    setNotas(storedNotas);
    calcularEstadisticas(storedReservas, storedHabitaciones);
  };

  const calcularEstadisticas = (reservas, habitaciones) => {
    const hoy = new Date().toISOString().split('T')[0];
    
    // Total de reservas
    const totalReservas = reservas.length;
    
    // ✅ CORRECCIÓN: Ingresos incluyen 100% de confirmadas + 10% de canceladas
    const ingresosPorConfirmadas = reservas
      .filter(r => r.estado === 'confirmada' || r.estado === 'checkin_realizado')
      .reduce((sum, r) => sum + (r.total || 0), 0);
    
    const ingresosPorCanceladas = reservas
      .filter(r => r.estado === 'cancelada')
      .reduce((sum, r) => sum + ((r.total || 0) * 0.10), 0);
    
    const ingresosTotales = ingresosPorConfirmadas + ingresosPorCanceladas;
    
    // Ocupación: habitaciones con estado "ocupada"
    const ocupacion = habitaciones.length > 0 
      ? Math.round((habitaciones.filter(h => h.estado === 'ocupada').length / habitaciones.length) * 100) 
      : 0;
    
    // Check-ins Hoy: reservas confirmadas que llegan hoy
    const checkinsHoy = reservas.filter(r => 
      r.estado === 'confirmada' && r.checkIn === hoy
    ).length;
    
    // Check-outs Hoy: reservas EN CURSO que se van hoy
    const checkoutsHoy = reservas.filter(r => 
      r.estado === 'checkin_realizado' && r.checkOut === hoy
    ).length;
    
    // Reservas pendientes
    const reservasPendientes = reservas.filter(r => r.estado === 'pendiente').length;
    
    setStats({
      totalReservas,
      ingresosTotales,
      ocupacion,
      checkinsHoy,
      checkoutsHoy,
      reservasPendientes
    });
  };

  // Últimas 5 reservas
  const ultimasReservas = [...reservas]
    .sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva))
    .slice(0, 5);

  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  const ingresosMensuales = [45000, 52000, 48000, 60000, 55000, stats.ingresosTotales / 6 || 52000];

  const habitacionesListas = habitaciones.filter(h => h.estado === 'disponible').length;
  const enLimpieza = habitaciones.filter(h => h.estado === 'limpieza').length;
  const enMantenimiento = habitaciones.filter(h => h.estado === 'mantenimiento').length;
  const totalHabitaciones = habitaciones.length || 24;

  const getEstadoTexto = (estado) => {
    const estados = {
      confirmada: 'Confirmada',
      checkin_realizado: 'En curso',
      checkout_realizado: 'Finalizada',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada',
      pendiente: 'Pendiente'
    };
    return estados[estado] || estado;
  };

  const getEstadoColor = (estado) => {
    const colores = {
      confirmada: 'bg-exito/20 text-exito',
      checkin_realizado: 'bg-blue-100 text-blue-700',
      checkout_realizado: 'bg-gray-200 text-gray-600',
      finalizada: 'bg-gray-200 text-gray-600',
      cancelada: 'bg-error/20 text-error',
      pendiente: 'bg-yellow-100 text-yellow-700'
    };
    return colores[estado] || 'bg-gray-200 text-gray-600';
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Panel de Administración</h1>
          <p className="text-cafe-100">Bienvenido al centro de control de Prestige Inn</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm mb-1">Total Reservas</p>
                <p className="text-3xl font-bold text-cafe-900">{stats.totalReservas}</p>
                <p className="text-xs text-exito mt-2 flex items-center gap-1"><TrendingUp size={12} /> +12% vs mes ant.</p>
              </div>
              <div className="w-12 h-12 bg-cafe-200/20 rounded-xl flex items-center justify-center"><Calendar size={24} className="text-cafe-200" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm mb-1">Ingresos Totales</p>
                <p className="text-3xl font-bold text-cafe-900">${stats.ingresosTotales.toLocaleString()}</p>
                <p className="text-xs text-cafe-100 mt-2">Incluye 10% de cancelaciones</p>
              </div>
              <div className="w-12 h-12 bg-cafe-200/20 rounded-xl flex items-center justify-center"><DollarSign size={24} className="text-cafe-200" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm mb-1">Ocupación</p>
                <p className="text-3xl font-bold text-cafe-900">{stats.ocupacion}%</p>
                <div className="w-full bg-beige-100 rounded-full h-2 mt-2">
                  <div className="bg-exito rounded-full h-2" style={{ width: `${stats.ocupacion}%` }}></div>
                </div>
              </div>
              <div className="w-12 h-12 bg-cafe-200/20 rounded-xl flex items-center justify-center"><Activity size={24} className="text-cafe-200" /></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Calendar size={20} className="text-blue-600" /></div>
            <div><p className="text-xs text-cafe-100">Check-ins Hoy</p><p className="text-xl font-bold text-cafe-900">{stats.checkinsHoy}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center"><Activity size={20} className="text-orange-600" /></div>
            <div><p className="text-xs text-cafe-100">Check-outs Hoy</p><p className="text-xl font-bold text-cafe-900">{stats.checkoutsHoy}</p></div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center"><Activity size={20} className="text-yellow-600" /></div>
            <div><p className="text-xs text-cafe-100">Pendientes</p><p className="text-xl font-bold text-cafe-900">{stats.reservasPendientes}</p></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4">Ingresos Mensuales</h2>
            <div className="flex items-end gap-4 h-48">
              {meses.map((mes, idx) => (
                <div key={mes} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-cafe-200/30 rounded-t-lg" style={{ height: `${(ingresosMensuales[idx] / 70000) * 140}px` }}>
                    <div className="w-full bg-cafe-200 rounded-t-lg" style={{ height: `${(ingresosMensuales[idx] / 70000) * 140}px` }}></div>
                  </div>
                  <p className="text-xs text-cafe-100 mt-2">{mes}</p>
                  <p className="text-xs font-semibold text-cafe-900">${(ingresosMensuales[idx] / 1000).toFixed(0)}k</p>
                </div>
              ))}
            </div>
          </div>
        
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-cafe-900">Últimas Reservas</h2>
              <Link to="/admin/reservations" className="text-xs text-cafe-100 hover:text-cafe-200">Ver todas</Link>
            </div>
            <div className="space-y-3">
              {ultimasReservas.length === 0 ? (
                <p className="text-cafe-100 text-center py-4">No hay reservas aún</p>
              ) : (
                ultimasReservas.map((res, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 hover:bg-beige-50 rounded-lg">
                    <div>
                      <p className="font-medium text-cafe-900 text-sm">{res.huesped}</p>
                      <p className="text-xs text-cafe-100">{res.habitacion}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-cafe-900">${(res.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-cafe-100">{res.checkIn}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getEstadoColor(res.estado)}`}>
                      {getEstadoTexto(res.estado)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><ClipboardList size={20} /> Notas de Recepción</h2>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notas.length === 0 ? (
                <p className="text-cafe-100 text-center py-4">No hay notas registradas</p>
              ) : (
                notas.slice(0, 5).map(nota => (
                  <div key={nota.id} className="bg-beige-50 p-3 rounded-lg">
                    <p className="text-sm text-cafe-900">{nota.texto}</p>
                    <p className="text-xs text-cafe-100 mt-1">📅 {nota.fecha} - 👤 {nota.autor}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;