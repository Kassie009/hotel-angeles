import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, XCircle, Search, Calendar, DollarSign, Users } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';

const AdminReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      
      const response = await api.get('/reservations');
      

      const raw = response?.data;
      const reservasData = Array.isArray(raw)
        ? raw
        : Array.isArray(raw?.data)
          ? raw.data
          : Array.isArray(raw?.data?.data)
            ? raw.data.data
            : [];

      const reservasConNumeros = reservasData.map((r) => ({
        ...r,
        total: parseFloat(r.total) || 0,
        subtotal: parseFloat(r.subtotal) || 0,
        iva: parseFloat(r.iva) || 0,
        noches: parseInt(r.noches) || 0
      }));

      setReservations(reservasConNumeros);

      const total = reservasConNumeros.length;
      const pendientes = reservasConNumeros.filter((r) => r.estado === 'pendiente').length;
      const confirmadas = reservasConNumeros.filter((r) => r.estado === 'confirmada').length;
      const ingresos = reservasConNumeros
        .filter(
          (r) =>
            r.estado === 'confirmada' ||
            r.estado === 'checkin_realizado' ||
            r.estado === 'checkout_realizado'
        )
        .reduce((sum, r) => sum + (r.total || 0), 0);

      setStats({ total, pendientes, confirmadas, ingresos });
    } catch (err) {
      
      const msg = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Error al cargar las reservas';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);


  const q = useMemo(() => (search || '').toLowerCase(), [search]);

  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      const matchesFilter = filter === 'all' || r.estado === filter;
      const matchesSearch =
        (r.codigo || '').toString().toLowerCase().includes(q) ||
        (r.nombre || '').toString().toLowerCase().includes(q) ||
        (r.email || '').toString().toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reservations, filter, q]);

  const handleConfirm = async (codigo) => {
    if (!confirm('¿Confirmar esta reserva?')) return;
    try {
      await api.put(`/reservations/${codigo}/status`, { estado: 'confirmada' });
      alert('Reserva confirmada');
      await fetchData();
    } catch (err) {
      
      alert(err?.response?.data?.error || 'Error al confirmar la reserva');
    }
  };

  const handleCancel = async (codigo) => {
    if (!confirm('¿Cancelar esta reserva?')) return;
    try {
      await api.put(`/reservations/${codigo}/status`, { estado: 'cancelada' });
      alert('Reserva cancelada');
      await fetchData();
    } catch (err) {
      
      alert(err?.response?.data?.error || 'Error al cancelar la reserva');
    }
  };

  const handleCheckIn = async (codigo) => {
    if (!confirm('¿Registrar check-in?')) return;
    try {
      await api.put(`/reservations/${codigo}/status`, { estado: 'checkin_realizado' });
      alert('Check-in registrado');
      await fetchData();
    } catch (err) {
      
      alert(err?.response?.data?.error || 'Error al registrar check-in');
    }
  };

  const handleCheckOut = async (codigo) => {
    if (!confirm('¿Registrar check-out?')) return;
    try {
      await api.put(`/reservations/${codigo}/status`, { estado: 'checkout_realizado' });
      alert('Check-out registrado');
      await fetchData();
    } catch (err) {
      
      alert(err?.response?.data?.error || 'Error al registrar check-out');
    }
  };

  const getStatusBadge = (estado) => {
    const styles = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      confirmada: 'bg-green-100 text-green-800',
      checkin_realizado: 'bg-blue-200 text-blue-900',
      checkout_realizado: 'bg-purple-100 text-purple-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    const labels = {
      pendiente: 'Pendiente',
      confirmada: 'Confirmada',
      checkin_realizado: 'Check-in',
      checkout_realizado: 'Check-out',
      cancelada: 'Cancelada'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[estado] || 'bg-gray-100 text-gray-800'}`}>
        {labels[estado] || estado}
      </span>
    );
  };

  const getStatusActions = (reserva) => {
    switch (reserva.estado) {
      case 'pendiente':
        return (
          <button
            onClick={() => handleConfirm(reserva.codigo)}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
          >
            <CheckCircle size={14} /> Confirmar
          </button>
        );
      case 'confirmada':
        return (
          <button
            onClick={() => handleCheckIn(reserva.codigo)}
            className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
          >
            Check-in
          </button>
        );
      case 'checkin_realizado':
        return (
          <button
            onClick={() => handleCheckOut(reserva.codigo)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
          >
            Check-out
          </button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto" />
            <p className="text-gray-700 mt-4">Cargando reservas...</p>
          </div>
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
              onClick={() => void fetchData()}
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Reservas</h1>
            <p className="text-gray-700">Administra las reservas del hotel</p>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Users className="text-blue-800" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendientes}</p>
                </div>
                <Calendar className="text-yellow-500" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Confirmadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats.confirmadas}</p>
                </div>
                <CheckCircle className="text-green-500" size={28} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-700">Ingresos</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="text-blue-800" size={28} />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Buscar por código, cliente o email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-beige-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cafe-100"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {['all', 'pendiente', 'confirmada', 'checkin_realizado', 'checkout_realizado', 'cancelada'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    filter === status
                      ? 'bg-cafe-200 text-white'
                      : 'bg-beige-50 text-gray-700 hover:bg-beige-100'
                  }`}
                >
                  {status === 'all'
                    ? 'Todos'
                    : status === 'pendiente'
                      ? 'Pendientes'
                      : status === 'confirmada'
                        ? 'Confirmadas'
                        : status === 'checkin_realizado'
                          ? 'Check-in'
                          : status === 'checkout_realizado'
                            ? 'Check-out'
                            : 'Canceladas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-beige-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Código</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Habitación</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Fechas</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Total</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-100">
                {filteredReservations.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-beige-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{reserva.codigo}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{reserva.nombre}</p>
                        <p className="text-sm text-gray-700">{reserva.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{reserva.habitacion || reserva.habitacion_nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      <div>In: {reserva.check_in ? new Date(reserva.check_in).toLocaleDateString('es-MX') : 'N/A'}</div>
                      <div>Out: {reserva.check_out ? new Date(reserva.check_out).toLocaleDateString('es-MX') : 'N/A'}</div>
                      <div className="text-xs text-gray-500">{reserva.noches || 0} noches</div>
                    </td>
                    <td className="px-6 py-4 font-bold">${(reserva.total || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className="px-6 py-4">{getStatusBadge(reserva.estado)}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {getStatusActions(reserva)}
                        {reserva.estado !== 'cancelada' && reserva.estado !== 'checkout_realizado' && (
                          <button
                            onClick={() => handleCancel(reserva.codigo)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1"
                          >
                            <XCircle size={14} /> Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredReservations.length === 0 && (
            <div className="text-center py-12 text-gray-700">
              No hay reservas que coincidan con los filtros
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReservations;

