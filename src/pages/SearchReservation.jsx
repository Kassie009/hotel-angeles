import { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';
import { Search, User, Mail, Phone, CheckCircle, XCircle, Clock } from 'lucide-react';

const SearchReservation = () => {
  const [codigo, setCodigo] = useState('');
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Log útil para depurar errores de búsqueda
  const normalizeQuery = (q) => (q || '').trim().toUpperCase();

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getEstadoInfo = (estado) => {
    const estados = {
      pendiente: { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800', icon: XCircle },
      checkin_realizado: { label: 'En curso', color: 'bg-blue-200 text-blue-900', icon: CheckCircle },
      checkout_realizado: { label: 'Finalizada', color: 'bg-gray-100 text-gray-800', icon: CheckCircle }
    };
    return estados[estado] || estados.pendiente;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const query = codigo.trim();
    if (!query) {
      setError('Por favor ingresa el número/código o el nombre del huésped');
      return;
    }

    setLoading(true);
    setError(null);
    setReserva(null);

    try {
      const normalized = normalizeQuery(query);

    
      try {
        
        const response = await api.get(`/reservations/${encodeURIComponent(normalized)}`);
        setReserva(response.data);
        setError(null);
        return;
      } catch {
     
        
      }

      
      const responseByName = await api.get(`/reservations/search`, { params: { nombre: normalized } });

      const payload = responseByName.data;
      if (payload && typeof payload === 'object' && payload.data) {
        const val = payload.data;
        setReserva(Array.isArray(val) ? val[0] : val);
      } else {
        setReserva(payload);
      }
      setError(null);
    } catch (error) {
      

      let errorMessage = 'Error al buscar la reserva';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'No se encontró ninguna reserva con ese código o nombre';
        } else if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
      setReserva(null);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCodigo(e.target.value);
    if (error) setError(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Breadcrumbs />
      
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Consultar Reserva</h1>
        <p className="text-gray-700 max-w-xl mx-auto">
          Ingresa el código de tu reserva para ver el estado de tu estancia
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={codigo}
                onChange={handleChange}
                placeholder="Ej: RES-ABC123"
                className="w-full px-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100 text-center md:text-left uppercase"
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Ingresa el código que recibiste al hacer tu reserva
              </p>
            </div>
            <button
              type="submit"
disabled={loading}
              className="btn-primary px-8 py-3 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search size={20} />
              {loading ? 'Buscando...' : 'Consultar'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm flex items-start gap-3">
            <XCircle size={20} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {reserva && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle size={24} className="text-green-600" />
            Detalles de tu Reserva
          </h2>
          
          <div className="bg-beige-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              {(() => {
                const estadoInfo = getEstadoInfo(reserva.estado);
                const Icon = estadoInfo.icon;
                return (
                  <>
                    <Icon className={`w-6 h-6 ${
                      reserva.estado === 'confirmada' ? 'text-green-600' :
                      reserva.estado === 'pendiente' ? 'text-yellow-600' :
                      reserva.estado === 'cancelada' ? 'text-red-600' :
                      reserva.estado === 'checkin_realizado' ? 'text-blue-700' :
                      'text-gray-600'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-700">Estado actual</p>
                      <p className={`font-bold ${estadoInfo.color} px-3 py-1 rounded-full inline-block`}>
                        {estadoInfo.label}
                      </p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Código de reserva</p>
              <p className="font-bold text-gray-900 text-lg font-mono">{reserva.codigo}</p>
            </div>
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Total a pagar</p>
              <p className="font-bold text-gray-900 text-lg">${Number(reserva.total).toFixed(2)}</p>
              {Number(reserva.descuento) > 0 && (
                <p className="text-xs text-green-600 mt-1">Incluye descuento: -${Number(reserva.descuento).toFixed(2)}</p>
              )}
            </div>
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Check-in</p>
              <p className="font-medium text-gray-900">{formatearFecha(reserva.check_in || reserva.checkIn)}</p>
            </div>
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Check-out</p>
              <p className="font-medium text-gray-900">{formatearFecha(reserva.check_out || reserva.checkOut)}</p>
            </div>
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Habitación</p>
              <p className="font-medium text-gray-900">{reserva.habitacion}</p>
            </div>
            <div className="bg-beige-50 rounded-xl p-4">
              <p className="text-sm text-gray-700">Noches</p>
              <p className="font-medium text-gray-900">{reserva.noches}</p>
            </div>
          </div>

          
          <div className="mt-6 bg-beige-50 rounded-xl p-4">
            <p className="text-sm text-gray-700 font-medium mb-3">Datos del cliente</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-700" />
                <span className="text-gray-900">{reserva.nombre}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-700" />
                <span className="text-gray-900">{reserva.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-700" />
                <span className="text-gray-900">{reserva.telefono}</span>
              </div>
            </div>
          </div>

          {reserva.estado === 'pendiente' && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <Clock size={18} className="flex-shrink-0 mt-0.5" />
                <span>Tu reserva está <strong>pendiente de pago</strong>. Realiza la transferencia y envía tu comprobante al correo para confirmar.</span>
              </p>
            </div>
          )}

          {reserva.estado === 'confirmada' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-green-800 flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>¡Tu reserva está <strong>confirmada</strong>! Te esperamos en Hotel Angeles.</span>
              </p>
            </div>
          )}

          {reserva.estado === 'cancelada' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm text-red-800 flex items-start gap-2">
                <XCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>Esta reserva ha sido <strong>cancelada</strong>. Si tienes dudas, contacta al hotel.</span>
              </p>
              {Number(reserva.reembolso) > 0 && (
                <p className="text-sm text-red-700 mt-2 ml-7">
                  Reembolso: <span className="font-bold">${Number(reserva.reembolso).toFixed(2)}</span> MXN
                </p>
              )}
            </div>
          )}

          {reserva.estado === 'checkin_realizado' && (
            <div className="mt-6 bg-blue-100 border border-blue-300 rounded-xl p-4">
              <p className="text-sm text-blue-900 flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>¡Ya estás <strong>hospedado</strong>! Disfruta tu estancia en Hotel Ángeles.</span>
              </p>
            </div>
          )}

          {reserva.estado === 'checkout_realizado' && (
            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
              <p className="text-sm text-gray-800 flex items-start gap-2">
                <CheckCircle size={18} className="flex-shrink-0 mt-0.5" />
                <span>Tu estancia ha <strong>finalizado</strong>. Gracias por visitarnos, ¡esperamos verte pronto!</span>
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3">
<Link 
              to="/rooms" 
              className="btn-primary px-6 py-2.5 text-center"
            >
              Ver más habitaciones
            </Link>
            <Link 
              to="/" 
              className="btn-outline px-6 py-2.5 text-center"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchReservation;