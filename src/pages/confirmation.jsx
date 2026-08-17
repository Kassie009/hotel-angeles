import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../Config/api';  
import { hotel } from '../Config/hotel';

const Confirmation = () => {
  const { codigo } = useParams();
  const navigate = useNavigate();
  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchReserva = async () => {
      try {
        
        
        if (!codigo) {
          
          setError(true);
          setLoading(false);
          return;
        }
        const storedReserva = sessionStorage.getItem('lastReservation');
        if (storedReserva) {
          try {
            const parsed = JSON.parse(storedReserva);
            
            setReserva(parsed);
            setLoading(false);
            return;
          } catch {
            
          }
        }

        
        const response = await api.get(`/reservations/${codigo}`);
        
        
        setReserva(response.data);
        setError(false);
      } catch (error) {
        
        
        if (error.response) {
          
          if (error.response.status === 404) {
            setError(true);
          }
        }
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (codigo) {
      fetchReserva();
    } else {
      navigate('/rooms');
    }
  }, [codigo, navigate]);

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
      pendiente: { label: 'Pendiente de pago', color: 'bg-yellow-100 text-yellow-800' },
      confirmada: { label: 'Confirmada', color: 'bg-green-100 text-green-800' },
      cancelada: { label: 'Cancelada', color: 'bg-red-100 text-red-800' },
      checkin_realizado: { label: 'En curso', color: 'bg-blue-200 text-blue-900' },
      checkout_realizado: { label: 'Finalizada', color: 'bg-gray-100 text-gray-800' }
    };
    return estados[estado] || estados.pendiente;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
          <p className="text-gray-700 mt-4">Cargando confirmación...</p>
        </div>
      </div>
    );
  }

  if (error || !reserva) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <div className="text-center py-20 max-w-md mx-auto">
          <p className="text-gray-700 text-lg mb-2">Error al cargar la reserva</p>
          <p className="text-gray-500 text-sm mb-6">
            No pudimos encontrar la reserva con el código proporcionado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              to="/rooms" 
              className="btn-primary px-6 py-2 inline-block"
            >
              Ver Habitaciones
            </Link>
            <Link 
              to="/search-reservation" 
              className="btn-outline px-6 py-2 inline-block"
            >
              Consultar mi reserva
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const total = Number(reserva.total) || 0;
  const estadoInfo = getEstadoInfo(reserva.estado);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Breadcrumbs />
      
      <button 
        onClick={() => navigate('/rooms')}
        className="text-gray-700 hover:text-gray-900 mb-6 flex items-center gap-2 transition"
      >
        <ArrowLeft size={18} /> Volver a habitaciones
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            reserva.estado === 'confirmada' ? 'bg-green-100' :
            reserva.estado === 'cancelada' ? 'bg-red-100' :
            reserva.estado === 'checkin_realizado' ? 'bg-blue-200' :
            reserva.estado === 'checkout_realizado' ? 'bg-gray-100' :
            'bg-yellow-100'
          }`}>
            <CheckCircle className={`${
              reserva.estado === 'confirmada' ? 'text-green-600' :
              reserva.estado === 'cancelada' ? 'text-red-600' :
              reserva.estado === 'checkin_realizado' ? 'text-blue-700' :
              reserva.estado === 'checkout_realizado' ? 'text-gray-600' :
              'text-yellow-600'
            }`} size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {reserva.estado === 'confirmada' && 'Reserva Confirmada'}
            {reserva.estado === 'pendiente' && 'Reserva Pendiente'}
            {reserva.estado === 'cancelada' && 'Reserva Cancelada'}
            {reserva.estado === 'checkin_realizado' && 'Estancia en Curso'}
            {reserva.estado === 'checkout_realizado' && 'Estancia Finalizada'}
          </h1>
          <p className="text-gray-700 mt-2">
            {reserva.estado === 'pendiente' && 'Tu reserva está pendiente de pago. Sigue los pasos para completarla.'}
            {reserva.estado === 'confirmada' && 'Tu pago ha sido verificado. ¡Te esperamos!'}
            {reserva.estado === 'cancelada' && 'Esta reserva ha sido cancelada.'}
            {reserva.estado === 'checkin_realizado' && '¡Ya estás hospedado! Disfruta tu estancia.'}
            {reserva.estado === 'checkout_realizado' && 'Gracias por tu visita. ¡Esperamos verte pronto!'}
          </p>
        </div>

        <div className="bg-cafe-900 text-white rounded-xl p-6 text-center mb-8">
          <p className="text-sm opacity-75">CÓDIGO DE RESERVA</p>
          <p className="text-3xl font-bold tracking-wider">{reserva.codigo}</p>
        </div>

        <div className="bg-cafe-50 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-700">Estado</p>
              <p className="text-xl font-bold">
                <span className={`inline-block px-3 py-1 rounded-full text-sm ${estadoInfo.color}`}>
                  {estadoInfo.label}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">Total a pagar</p>
              <p className="text-xl font-bold text-gray-900">${total.toFixed(2)}</p>
              {Number(reserva.descuento) > 0 && (
                <p className="text-xs text-green-600 mt-1">Incluye descuento de estancia larga: -${Number(reserva.descuento).toFixed(2)}</p>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-700">Check-in</p>
              <p className="font-medium text-gray-900">
                {formatearFecha(reserva.check_in || reserva.checkIn)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-700">Check-out</p>
              <p className="font-medium text-gray-900">
                {formatearFecha(reserva.check_out || reserva.checkOut)}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-700">Habitación</p>
            <p className="font-medium text-gray-900">{reserva.habitacion}</p>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-700">Noches</p>
            <p className="font-medium text-gray-900">{reserva.noches}</p>
          </div>
        </div>

        {reserva.estado === 'pendiente' && (
          <div className="bg-blue-100 border border-blue-300 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Datos para transferencia</h3>
            <p className="text-sm text-gray-900 font-medium mb-3">Titular: {hotel.transferencia?.titular || 'Hotel Angeles'}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-gray-700">Banco:</span>
                <span className="font-semibold text-gray-900">BANCOMER</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-gray-700">Cuenta personal:</span>
                <span className="font-semibold text-gray-900">4152 3137 7796 9580</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="text-gray-700">Cuenta fiscal:</span>
                <span className="font-semibold text-gray-900">00486020682</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Beneficiario:</span>
                <span className="font-semibold text-gray-900">{hotel.transferencia?.titular || 'Hotel Angeles'}</span>
              </div>
            </div>
            
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">Concepto de pago:</span> Usa tu código de reserva:
                <span className="font-bold text-gray-900 block text-center text-lg mt-1">{reserva.codigo}</span>
              </p>
<p className="text-sm text-gray-900 mt-2">
                Envía tu comprobante al correo <strong>{hotel.email || 'hotel@angeles.com'}</strong> para confirmar tu reserva.
              </p>
            </div>

            <div className="mt-4 bg-blue-100 border border-blue-300 rounded-lg p-3">
              <p className="text-sm text-gray-900">
                <span className="font-semibold text-blue-900">¿Requieres factura?</span>
              </p>
              <p className="text-sm text-gray-900 mt-1">
                Si necesitas factura, realiza la transferencia a la <span className="font-semibold">Cuenta fiscal</span> (00486020682) y envía tus datos fiscales al correo <strong>hotelangeles_21@hotmail.com</strong>.
              </p>
            </div>
          </div>
        )}

       
        {reserva.estado === 'confirmada' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-green-800 font-medium">Tu pago ha sido verificado. ¡Te esperamos en Hotel Ángeles!</p>
          </div>
        )}

        
        {reserva.estado === 'cancelada' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
            <p className="text-red-800 font-medium">Esta reserva ha sido cancelada. Si tienes dudas, contacta al hotel.</p>
            {Number(reserva.reembolso) > 0 && (
              <p className="text-red-700 mt-2">
                Reembolso: <span className="font-bold">${Number(reserva.reembolso).toFixed(2)}</span> MXN
              </p>
            )}
          </div>
        )}

        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/" className="btn-outline flex-1 text-center">
            Volver al Inicio
          </Link>
          <Link to="/search-reservation" className="btn-primary flex-1 text-center">
            Consultar mi reserva
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;