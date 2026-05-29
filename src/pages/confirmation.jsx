import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import { CheckCircle } from 'lucide-react';

const Confirmation = () => {
  const [reserva, setReserva] = useState(null);

  useEffect(() => {
    // Recuperar la reserva guardada
    const lastReservation = sessionStorage.getItem('lastReservation');
    if (lastReservation) {
      setReserva(JSON.parse(lastReservation));
      // Limpiar para que no se muestre al recargar
      sessionStorage.removeItem('lastReservation');
    }
  }, []);

  if (!reserva) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <div className="text-center py-20">
          <p className="text-cafe-100">No hay reserva para mostrar</p>
          <Link to="/rooms" className="btn-primary mt-4 inline-block">
            Ver Habitaciones
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      
      <div className="max-w-2xl mx-auto">
        {/* Mensaje de éxito */}
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto text-exito mb-4" size={64} />
          <h1 className="text-3xl font-bold text-cafe-900">¡Reserva Confirmada!</h1>
          <p className="text-cafe-100 mt-2">
            Su estancia ha sido programada con éxito. Un correo de confirmación ha sido enviado.
          </p>
        </div>
        
        {/* Código de reserva */}
        <div className="bg-cafe-900 text-white rounded-xl p-6 text-center mb-8">
          <p className="text-sm opacity-75">CÓDIGO DE RESERVA</p>
          <p className="text-3xl font-bold tracking-wider">{reserva.codigo}</p>
        </div>
        
        {/* Resumen */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-cafe-900 mb-4">Detalles de la Reserva</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Habitación</span>
              <span className="font-semibold text-cafe-900">{reserva.habitacion}</span>
            </div>
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Huésped</span>
              <span className="font-semibold text-cafe-900">{reserva.huesped}</span>
            </div>
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Correo electrónico</span>
              <span className="font-semibold text-cafe-900">{reserva.email}</span>
            </div>
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Teléfono</span>
              <span className="font-semibold text-cafe-900">{reserva.telefono}</span>
            </div>
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Fechas</span>
              <span className="font-semibold text-cafe-900">
                {reserva.checkIn} → {reserva.checkOut}
              </span>
            </div>
            <div className="flex justify-between border-b border-beige-100 pb-2">
              <span className="text-cafe-100">Noches</span>
              <span className="font-semibold text-cafe-900">{reserva.noches}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-cafe-900 font-bold">Total pagado</span>
              <span className="text-xl font-bold text-cafe-900">${reserva.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Información importante */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-8">
          <p className="text-sm text-cafe-100">
            <strong>⚠️ Información importante:</strong><br />
            • Check-in: 15:00 hrs | Check-out: 12:00 hrs<br />
            • Los cargos de operación (10%) no son reembolsables en caso de cancelación<br />
            • Alberca y gimnasio incluidos sin costo
          </p>
        </div>
        
        {/* Botones */}
        <div className="flex gap-4">
          <Link to="/my-reservations" className="btn-primary flex-1 text-center">
            Ver Mis Reservas
          </Link>
          <Link to="/" className="btn-secondary flex-1 text-center">
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;