import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs';
import StripeCheckout from '../components/StripeCheckout';
import { rooms } from '../data/rooms';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    checkIn: '',
    checkOut: '',
    huespedes: 1
  });
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    // Cargar usuario logueado para pre-llenar email
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      setFormData(prev => ({
        ...prev,
        nombre: user.nombre || '',
        email: user.email || ''
      }));
    }
    
    const foundRoom = rooms.find(r => r.id === parseInt(id));
    setRoom(foundRoom);
  }, [id]);

  const validarFechasReserva = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaInicio = new Date(formData.checkIn);
    const fechaFin = new Date(formData.checkOut);
    
    const fechaLimite = new Date();
    fechaLimite.setMonth(fechaLimite.getMonth() + 6);
    
    if (!formData.checkIn || !formData.checkOut) {
      alert('Por favor selecciona las fechas de check-in y check-out');
      return false;
    }
    
    if (fechaInicio < hoy) {
      alert('No se puede reservar en fechas pasadas');
      return false;
    }
    
    if (fechaInicio > fechaLimite) {
      alert(`Solo se pueden reservar fechas con hasta 6 meses de anticipación. Máximo: ${fechaLimite.toLocaleDateString()}`);
      return false;
    }
    
    if (fechaFin <= fechaInicio) {
      alert('La fecha de salida debe ser posterior a la fecha de entrada');
      return false;
    }
    
    return true;
  };

  const calcularNoches = () => {
    if (formData.checkIn && formData.checkOut) {
      const inicio = new Date(formData.checkIn);
      const fin = new Date(formData.checkOut);
      const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const noches = calcularNoches();
  const subtotal = room ? room.precio * noches : 0;
  const iva = subtotal * 0.16;
  const total = subtotal + iva;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!validarFechasReserva()) {
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.nombre || !formData.email || !formData.telefono) {
        alert('Completa todos los datos personales');
        return;
      }
      setStep(3);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // Obtener usuario logueado para asegurar el email correcto
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    
    const reserva = {
      id: Date.now(),
      codigo: `PRESTIGE-${Date.now()}`,
      roomId: room.id,
      habitacion: room.nombre,
      huesped: formData.nombre,
      email: currentUser?.email || formData.email, // Prioriza email del usuario logueado
      telefono: formData.telefono,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      noches: noches,
      subtotal: subtotal,
      iva: iva,
      total: total,
      estado: 'confirmada',
      paymentIntentId: paymentIntent.id,
      fechaReserva: new Date().toISOString()
    };
    
    const existing = JSON.parse(localStorage.getItem('reservations') || '[]');
    existing.push(reserva);
    localStorage.setItem('reservations', JSON.stringify(existing));
    sessionStorage.setItem('lastReservation', JSON.stringify(reserva));
    navigate('/confirmation');
  };

  const handlePaymentError = (error) => {
    setPaymentError(error);
    setTimeout(() => setPaymentError(''), 5000);
  };

  if (!room) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        <p className="text-center py-20">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs />
      <h1 className="text-3xl font-bold text-cafe-900 mb-6">Finalizar Reserva</h1>
      
      <div className="flex mb-8">
        <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 1 ? 'border-cafe-200' : 'border-beige-200'}`}>
          <span className={`font-semibold ${step >= 1 ? 'text-cafe-900' : 'text-cafe-100'}`}>1. Fechas</span>
        </div>
        <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 2 ? 'border-cafe-200' : 'border-beige-200'}`}>
          <span className={`font-semibold ${step >= 2 ? 'text-cafe-900' : 'text-cafe-100'}`}>2. Datos</span>
        </div>
        <div className={`flex-1 text-center pb-2 border-b-2 ${step >= 3 ? 'border-cafe-200' : 'border-beige-200'}`}>
          <span className={`font-semibold ${step >= 3 ? 'text-cafe-900' : 'text-cafe-100'}`}>3. Pago</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-4">Selecciona tus fechas</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-cafe-900 text-sm font-medium mb-1">Check-in *</label>
                  <input type="date" name="checkIn" value={formData.checkIn} onChange={handleChange} required className="input" />
                </div>
                <div>
                  <label className="block text-cafe-900 text-sm font-medium mb-1">Check-out *</label>
                  <input type="date" name="checkOut" value={formData.checkOut} onChange={handleChange} required className="input" />
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Huéspedes</label>
                <select name="huespedes" value={formData.huespedes} onChange={handleChange} className="input">
                  {[1,2,3,4,5,6].map(num => <option key={num} value={num}>{num} {num === 1 ? 'Huésped' : 'Huéspedes'}</option>)}
                </select>
              </div>
            </div>
          )}
          
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-cafe-900 mb-4">Datos del Huésped</h2>
              <div className="mb-4">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Nombre Completo *</label>
                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="input" placeholder="Juan Pérez" />
              </div>
              <div className="mb-4">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Correo Electrónico *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required className="input" placeholder="juan@ejemplo.com" />
              </div>
              <div className="mb-6">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Teléfono *</label>
                <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} required className="input" placeholder="+52 653 000 0000" />
              </div>
            </div>
          )}
          
          {step === 3 && (
            <StripeCheckout 
              total={total} 
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
            />
          )}
          
          {paymentError && (
            <div className="mt-4 bg-red-100 border border-error text-error p-3 rounded-lg text-sm">
              {paymentError}
            </div>
          )}
          
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="btn-secondary">
                ← Regresar
              </button>
            )}
            {step < 3 && (
              <button onClick={handleNextStep} className="btn-primary ml-auto">
                Continuar →
              </button>
            )}
          </div>
        </div>
        
        <div className="bg-beige-100 rounded-xl shadow-md p-6 h-fit sticky top-4">
          <h2 className="text-xl font-bold text-cafe-900 mb-4">Resumen de Estancia</h2>
          <div className="rounded-lg overflow-hidden mb-4">
            <img src={room.imagen} alt={room.nombre} className="w-full h-40 object-cover rounded-lg" />
          </div>
          <div className="border-b border-cafe-50 pb-4 mb-4">
            <p className="font-semibold text-cafe-900 text-lg">{room.nombre}</p>
            <p className="text-cafe-100 text-sm">Capacidad: {room.capacidad} personas</p>
          </div>
          <div className="space-y-2 mb-4">
            <div className="flex justify-between"><span className="text-cafe-100">Precio por noche</span><span className="text-cafe-900 font-medium">${room.precio}</span></div>
            <div className="flex justify-between"><span className="text-cafe-100">Noches</span><span className="text-cafe-900 font-medium">{noches}</span></div>
            <div className="flex justify-between"><span className="text-cafe-100">Subtotal</span><span className="text-cafe-900">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-cafe-100">IVA (16%)</span><span className="text-cafe-900">${iva.toFixed(2)}</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span className="text-cafe-900">TOTAL</span><span className="text-cafe-900 text-xl">${total.toFixed(2)}</span></div>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg">
            <p className="text-xs text-cafe-100">⚠️ Los cargos de operación (10%) no son reembolsables en caso de cancelación.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;