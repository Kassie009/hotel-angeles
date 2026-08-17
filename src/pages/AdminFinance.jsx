import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, RefreshCw, Settings, Star, Users } from 'lucide-react';
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

  const formatMoney = (amount) => {
    return Number(amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cargarDatos = async () => {
    try {
      const response = await api.get('/reservations');

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
      
      const estadosConIngreso = ['confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada'];

      const reembolsos = reservasConNumeros
        .filter(r => r.estado === 'cancelada')
        .reduce((sum, r) => sum + (parseFloat(r.reembolso) || 0), 0);

      const ingresos = reservasConNumeros
        .filter(r => estadosConIngreso.includes(r.estado))
        .reduce((sum, r) => sum + (r.total || 0), 0) - reembolsos;

      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const añoActual = hoy.getFullYear();

      const reembolsosMes = reservasConNumeros
        .filter(r => {
          const fecha = new Date(r.fecha_reserva);
          return r.estado === 'cancelada' &&
                 fecha.getMonth() === mesActual &&
                 fecha.getFullYear() === añoActual;
        })
        .reduce((sum, r) => sum + (parseFloat(r.reembolso) || 0), 0);

      const ingresosMes = reservasConNumeros
        .filter(r => {
          const fecha = new Date(r.fecha_reserva);
          return estadosConIngreso.includes(r.estado) &&
                 fecha.getMonth() === mesActual &&
                 fecha.getFullYear() === añoActual;
        })
        .reduce((sum, r) => sum + (r.total || 0), 0) - reembolsosMes;

      const pagosPendientes = reservasConNumeros
        .filter(r => r.estado === 'pendiente')
        .reduce((sum, r) => sum + (r.total || 0), 0);

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
    } catch {
      setError('Error al cargar los datos financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
    const interval = setInterval(cargarDatos, 15000);
    return () => clearInterval(interval);
  }, []);

  const ocupacion = reservas.filter(r => r.estado === 'checkin_realizado' || r.estado === 'confirmada').length;
  const totalHabitaciones = 27; 
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
          <p className="text-gray-700 mt-4">Cargando datos financieros...</p>
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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gestión Financiera</h1>
          <p className="text-gray-700">Control de ingresos, pagos y estadísticas del hotel</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-gray-900">${formatMoney(stats.ingresosTotales)}</p>
                <p className="text-xs text-gray-700 mt-1">Ingresos netos (después de reembolsos)</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign size={24} className="text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-sm">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-gray-900">${formatMoney(stats.ingresosMes)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-xl flex items-center justify-center">
                <Calendar size={24} className="text-blue-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-sm">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-gray-900">${formatMoney(stats.pagosPendientes)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <TrendingDown size={24} className="text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-700 text-sm">Total Reembolsos</p>
                <p className="text-3xl font-bold text-red-600">${formatMoney(stats.reembolsos)}</p>
                <p className="text-xs text-gray-700 mt-1">Reembolsos de reservas canceladas</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <RefreshCw size={24} className="text-red-600" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
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
                <p className="text-sm text-gray-700">Total reservas: {stats.totalReservas}</p>
                <p className="text-sm text-gray-700">Cancelaciones: {stats.canceladas}</p>
                <p className="text-sm text-gray-700">Habitaciones ocupadas: {ocupacion}/{totalHabitaciones}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star size={20} /> Habitaciones Más Reservadas
            </h2>
            <div className="space-y-3">
              {habitacionesMasReservadas().length === 0 ? (
                <p className="text-gray-700 text-center">No hay datos aún</p>
              ) : (
                habitacionesMasReservadas().map(([nombre, count], idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-gray-700">{nombre}</span>
                    <span className="font-semibold text-gray-900">{count} reservas</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users size={20} /> Clientes Frecuentes
            </h2>
            <div className="space-y-3">
              {clientesFrecuentes().length === 0 ? (
                <p className="text-gray-700 text-center">No hay datos aún</p>
              ) : (
                clientesFrecuentes().map((cliente, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                      <p className="text-xs text-gray-700">{cliente.email}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{cliente.reservas} reservas</span>
                  </div>
                ))
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Settings size={20} /> Resumen Financiero
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-gray-700">Total Reservas</span>
                <span className="font-semibold text-gray-900">{stats.totalReservas}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-gray-700">Confirmadas</span>
                <span className="font-semibold text-green-600">{stats.confirmadas}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-gray-700">Pendientes</span>
                <span className="font-semibold text-yellow-600">{stats.pendientes}</span>
              </div>
              <div className="flex justify-between border-b border-beige-100 pb-2">
                <span className="text-gray-700">Checkouts</span>
                <span className="font-semibold text-blue-700">{stats.checkout}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Canceladas</span>
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