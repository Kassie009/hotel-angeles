import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, RefreshCw, Settings, Percent, Receipt, Star, Users } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';

const AdminFinance = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    ingresosTotales: 0,
    ingresosMes: 0,
    pagosPendientes: 0,
    reembolsos: 0,
    totalReservas: 0,
    confirmadas: 0,
    pendientes: 0,
    checkout: 0,
    canceladas: 0
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      console.log('Cargando datos financieros...');

      const response = await api.get('/reservations');
      console.log('Reservas:', response.data);

      let reservasData = [];
      if (Array.isArray(response.data)) {
        reservasData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        reservasData = response.data.data;
      } else {
        reservasData = [];
      }

      const reservasConNumeros = reservasData.map(r => ({
        ...r,
        total: parseFloat(r.total) || 0
      }));

      setReservas(reservasConNumeros);

      const total = reservasConNumeros.length;
      const pendientes = reservasConNumeros.filter(r => r.estado === 'pendiente').length;
      const confirmadas = reservasConNumeros.filter(r => r.estado === 'confirmada').length;
      const checkout = reservasConNumeros.filter(r => r.estado === 'checkout_realizado').length;
      const canceladas = reservasConNumeros.filter(r => r.estado === 'cancelada').length;
      
      const ingresos = reservasConNumeros
        .filter(r => r.estado === 'confirmada' || r.estado === 'checkin_realizado' || r.estado === 'checkout_realizado')
        .reduce((sum, r) => sum + (r.total || 0), 0);

      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();

      const ingresosMes = reservasConNumeros
        .filter(r => {
          const fecha = new Date(r.fecha_reserva);
          return (r.estado === 'confirmada' || r.estado === 'checkin_realizado' || r.estado === 'checkout_realizado') &&
                 fecha.getMonth() === mesActual &&
                 fecha.getFullYear() === añoActual;
        })
        .reduce((sum, r) => sum + (r.total || 0), 0);

      const pagosPendientes = reservasConNumeros
        .filter(r => r.estado === 'pendiente')
        .reduce((sum, r) => sum + (r.total || 0), 0);

      const reembolsos = reservasConNumeros
        .filter(r => r.estado === 'cancelada')
        .reduce((sum, r) => sum + (r.total || 0), 0) * 0.1;

      setStats({
        ingresosTotales: ingresos,
        ingresosMes: ingresosMes,
        pagosPendientes: pagosPendientes,
        reembolsos: reembolsos,
        totalReservas: total,
        confirmadas: confirmadas,
        pendientes: pendientes,
        checkout: checkout,
        canceladas: canceladas
      });

      setError(null);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const ocupacion = reservas.filter(r => r.estado === 'checkin_realizado' || r.estado === 'confirmada').length;
  const totalHabitaciones = 30; 
  const porcentajeOcupacion = totalHabitaciones > 0 ? ((ocupacion / totalHabitaciones) * 100).toFixed(1) : 0;

  const totalReservas = reservas.length;
  const cancelaciones = reservas.filter(r => r.estado === 'cancelada').length;
  const porcentajeCancelaciones = totalReservas > 0 ? ((cancelaciones / totalReservas) * 100).toFixed(1) : 0;

  const habitacionesMasReservadas = () => {
    const conteo = {};
    reservas.forEach(r => {
      if (r.estado !== 'cancelada') {
        const nombre = r.habitacion || r.habitacion_nombre || 'Sin nombre';
        conteo[nombre] = (conteo[nombre] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
  };

  const clientesFrecuentes = () => {
    const conteo = {};
    reservas.forEach(r => {
      if (r.estado !== 'cancelada') {
        const email = r.email || 'sin-email';
        conteo[email] = (conteo[email] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => {
        const reserva = reservas.find(r => r.email === email);
        return { nombre: reserva?.nombre || email, email, reservas: count };
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
          <p className="text-cafe-100 mt-4">Cargando datos financieros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <p className="font-bold">{error}</p>
            <button 
              onClick={cargarDatos}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Gestión Financiera</h1>
          <p className="text-cafe-100">Control de ingresos, pagos y estadísticas del hotel</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-cafe-900">${stats.ingresosTotales.toFixed(2)}</p>
                <p className="text-xs text-cafe-100 mt-1">Reservas confirmadas y checkouts</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-cafe-900">${stats.ingresosMes.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-cafe-900">${stats.pagosPendientes.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingDown size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Total Reembolsos</p>
                <p className="text-3xl font-bold text-red-600">${stats.reembolsos.toFixed(2)}</p>
                <p className="text-xs text-cafe-100 mt-1">10% de reservas canceladas</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <RefreshCw size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2">
              <TrendingUp size={20} /> Reporte de Ocupación
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Ocupación General</span>
                  <span>{porcentajeOcupacion}%</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2">
                  <div className="bg-green-600 rounded-full h-2" style={{ width: `${porcentajeOcupacion}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Tasa de Cancelación</span>
                  <span>{porcentajeCancelaciones}%</span>
                </div>
                <div className="w-full bg-beige-100 rounded-full h-2">
                  <div className="bg-red-600 rounded-full h-2" style={{ width: `${porcentajeCancelaciones}%` }}></div>
                </div>
              </div>
              <div className="mt-3">
                <p className="text-sm text-cafe-100">Total reservas: {stats.totalReservas}</p>
                <p className="text-sm text-cafe-100">Cancelaciones: {stats.canceladas}</p>
                <p className="text-sm text-cafe-100">Habitaciones ocupadas: {ocupacion}/{totalHabitaciones}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2">
              <Star size={20} /> Habitaciones Más Reservadas
            </h2>
            <div className="space-y-3">
              {habitacionesMasReservadas().length === 0 ? (
                <p className="text-cafe-100 text-center">No hay datos aún</p>
              ) : (
                habitacionesMasReservadas().map(([nombre, count], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-cafe-100">{nombre}</span>
                    <span className="font-semibold text-cafe-900">{count} reservas</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2">
              <Users size={20} /> Clientes Frecuentes
            </h2>
            <div className="space-y-3">
              {clientesFrecuentes().length === 0 ? (
                <p className="text-cafe-100 text-center">No hay datos aún</p>
              ) : (
                clientesFrecuentes().map((cliente, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-cafe-900">{cliente.nombre}</p>
                      <p className="text-xs text-cafe-100">{cliente.email}</p>
                    </div>
                    <span className="text-sm font-semibold text-cafe-900">{cliente.reservas} reservas</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2">
              <Settings size={20} /> Resumen Financiero
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-cafe-100">Total Reservas</span>
                <span className="font-semibold text-cafe-900">{stats.totalReservas}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-cafe-100">Confirmadas</span>
                <span className="font-semibold text-green-600">{stats.confirmadas}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-cafe-100">Pendientes</span>
                <span className="font-semibold text-yellow-600">{stats.pendientes}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-cafe-100">Checkouts</span>
                <span className="font-semibold text-blue-600">{stats.checkout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cafe-100">Canceladas</span>
                <span className="font-semibold text-red-600">{stats.canceladas}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;