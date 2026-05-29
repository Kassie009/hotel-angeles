import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Users, Clock, DollarSign, XCircle, AlertCircle, Star } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { rooms } from '../data/rooms';

const MyReservations = () => {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const [currentUser, setCurrentUser] = useState(null);
  const [rating, setRating] = useState(0);
  const [ratingHover, setRatingHover] = useState(0);
  const [comentario, setComentario] = useState('');

  // Función para actualizar estados según fechas
  const actualizarEstadosPorFecha = (reservasActuales) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    let modificadas = false;
    const reservasActualizadas = reservasActuales.map(res => {
      const checkOut = new Date(res.checkOut);
      checkOut.setHours(0, 0, 0, 0);
      
      // Si la fecha de check-out ya pasó y está en curso, cambiar a "finalizada"
      if (res.estado === 'checkin_realizado' && checkOut < hoy) {
        modificadas = true;
        return { ...res, estado: 'finalizada' };
      }
      return res;
    });
    
    if (modificadas) {
      // Guardar cambios en localStorage
      const todasReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
      const nuevasTodas = todasReservas.map(res => {
        const actualizada = reservasActualizadas.find(r => r.codigo === res.codigo);
        return actualizada || res;
      });
      localStorage.setItem('reservations', JSON.stringify(nuevasTodas));
    }
    
    return reservasActualizadas;
  };

  useEffect(() => {
    const user = sessionStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    const stored = JSON.parse(localStorage.getItem('reservations') || '[]');
    
    // Filtrar reservas del usuario actual por email
    let userReservations = stored.filter(res => res.email === userData.email);
    
    // Actualizar estados según fechas
    userReservations = actualizarEstadosPorFecha(userReservations);
    
    const reservasConImagen = userReservations.map(res => {
      const habitacion = rooms.find(r => r.nombre === res.habitacion);
      return {
        ...res,
        imagen: habitacion ? habitacion.imagen : 'https://picsum.photos/400/300'
      };
    });
    setReservas(reservasConImagen);
  }, [navigate]);

  const filtrarReservas = () => {
    if (filtro === 'todas') return reservas;
    if (filtro === 'activas') return reservas.filter(res => res.estado === 'confirmada' || res.estado === 'checkin_realizado');
    if (filtro === 'finalizadas') return reservas.filter(res => res.estado === 'checkout_realizado' || res.estado === 'finalizada');
    if (filtro === 'canceladas') return reservas.filter(res => res.estado === 'cancelada');
    return reservas.filter(res => res.estado === filtro);
  };

  // ✅ Función cancelar reserva con registro de reembolso en Finanzas
  const cancelarReserva = (reserva) => {
    const todasReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
    const cargos10 = reserva.total * 0.10;
    const reembolso = reserva.total - cargos10;
    
    // 1. Actualizar estado de la reserva a cancelada
    const nuevasTodas = todasReservas.map(r => 
      r.codigo === reserva.codigo ? { ...r, estado: 'cancelada', fechaCancelacion: new Date().toISOString() } : r
    );
    localStorage.setItem('reservations', JSON.stringify(nuevasTodas));
    
    // 2. Registrar reembolso en localStorage (para Finanzas)
    const reembolsos = JSON.parse(localStorage.getItem('refunds') || '[]');
    const nuevoReembolso = {
      id: Date.now(),
      reservaId: reserva.codigo,
      huesped: reserva.huesped,
      habitacion: reserva.habitacion,
      montoOriginal: reserva.total,
      cargos10: cargos10,
      montoReembolsado: reembolso,
      fecha: new Date().toISOString(),
      motivo: 'Cancelación por cliente'
    };
    reembolsos.push(nuevoReembolso);
    localStorage.setItem('refunds', JSON.stringify(reembolsos));
    
    // 3. Actualizar estado local
    const nuevas = reservas.map(r => 
      r.codigo === reserva.codigo ? { ...r, estado: 'cancelada' } : r
    );
    setReservas(nuevas);
    setShowCancelModal(null);
    alert(`✅ Reserva cancelada. Reembolso de $${reembolso.toFixed(2)} registrado.`);
  };

  const calcularReembolso = (reserva) => {
    const total = reserva.total;
    const cargos10 = total * 0.10;
    const reembolso = total - cargos10;
    return { total, cargos10, reembolso };
  };

  const getEstadoTexto = (estado, checkOut) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSalida = new Date(checkOut);
    fechaSalida.setHours(0, 0, 0, 0);
    
    if (estado === 'checkin_realizado' && fechaSalida < hoy) {
      return 'Finalizada';
    }
    
    const estados = {
      confirmada: 'Confirmada',
      checkin_realizado: 'En curso',
      checkout_realizado: 'Finalizada',
      finalizada: 'Finalizada',
      cancelada: 'Cancelada'
    };
    return estados[estado] || estado;
  };

  const getEstadoBadge = (estado, checkOut) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaSalida = new Date(checkOut);
    fechaSalida.setHours(0, 0, 0, 0);
    
    if (estado === 'checkin_realizado' && fechaSalida < hoy) {
      return 'bg-gray-500 text-white';
    }
    
    const clases = {
      confirmada: 'bg-exito text-white',
      checkin_realizado: 'bg-blue-500 text-white',
      checkout_realizado: 'bg-gray-500 text-white',
      finalizada: 'bg-cafe-200 text-white',
      cancelada: 'bg-error text-white'
    };
    return clases[estado] || 'bg-gray-500 text-white';
  };

  const reservasFiltradas = filtrarReservas();

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Mis Reservas</h1>
          <p className="text-cafe-100">Gestione sus estancias actuales y próximas en el corazón del desierto sonorense.</p>
        </div>
        
        <div className="flex flex-wrap gap-3 mb-8 border-b border-beige-200 pb-3">
          <button onClick={() => setFiltro('todas')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'todas' ? 'bg-cafe-200 text-white' : 'text-cafe-100 hover:bg-beige-100'}`}>Todas</button>
          <button onClick={() => setFiltro('activas')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'activas' ? 'bg-exito text-white' : 'text-cafe-100 hover:bg-beige-100'}`}>Activas</button>
          <button onClick={() => setFiltro('finalizadas')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'finalizadas' ? 'bg-cafe-200 text-white' : 'text-cafe-100 hover:bg-beige-100'}`}>Finalizadas</button>
          <button onClick={() => setFiltro('canceladas')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'canceladas' ? 'bg-error text-white' : 'text-cafe-100 hover:bg-beige-100'}`}>Canceladas</button>
        </div>
        
        {reservasFiltradas.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <AlertCircle className="mx-auto text-cafe-100 mb-4" size={48} />
            <p className="text-cafe-100">No tienes reservas {filtro !== 'todas' ? `con este filtro` : 'aún'}.</p>
            <Link to="/rooms" className="btn-primary inline-block mt-4">Ver Habitaciones</Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {reservasFiltradas.map(res => {
              const reembolso = res.estado === 'cancelada' ? calcularReembolso(res) : null;
              const esCancelable = res.estado === 'confirmada';
              const hoy = new Date();
              const checkIn = new Date(res.checkIn);
              const esProxima = esCancelable && checkIn > hoy;
              const estadoTexto = getEstadoTexto(res.estado, res.checkOut);
              const estadoBadge = getEstadoBadge(res.estado, res.checkOut);
              
              return (
                <div key={res.id} className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-4">
                    <div className="md:col-span-1 h-48 md:h-full">
                      <img src={res.imagen} alt={res.habitacion} className="w-full h-full object-cover" />
                    </div>
                    <div className="md:col-span-3">
                      <div className={`p-4 ${res.estado !== 'cancelada' ? 'bg-cafe-900/5 border-b border-beige-100' : 'bg-gray-50 border-b border-gray-200'}`}>
                        <div className="flex flex-wrap justify-between items-center gap-3">
                          <div>
                            <p className="text-xs text-cafe-50 font-mono">{res.codigo}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <h2 className="text-xl font-bold text-cafe-900">{res.habitacion}</h2>
                              {res.estado === 'confirmada' && esProxima && (
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700">PRÓXIMA</span>
                              )}
                            </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${estadoBadge}`}>
                            {estadoTexto}
                          </span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-cafe-50" /><span className="text-cafe-100">LLEGADA:</span><span className="font-medium text-cafe-900">{res.checkIn}</span></div>
                            <div className="flex items-center gap-2 text-sm"><Calendar size={16} className="text-cafe-50" /><span className="text-cafe-100">SALIDA:</span><span className="font-medium text-cafe-900">{res.checkOut}</span></div>
                            <div className="flex items-center gap-2 text-sm"><Clock size={16} className="text-cafe-50" /><span className="text-cafe-100">Noches:</span><span className="font-medium text-cafe-900">{res.noches}</span></div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm"><Users size={16} className="text-cafe-50" /><span className="text-cafe-100">Huésped:</span><span className="font-medium text-cafe-900">{res.huesped}</span></div>
                            <div className="flex items-center gap-2 text-sm"><DollarSign size={16} className="text-cafe-50" /><span className="text-cafe-100">Total pagado:</span><span className="font-bold text-cafe-900">${res.total?.toFixed(2)}</span></div>
                            {reembolso && (
                              <div className="flex items-center gap-2 text-sm"><DollarSign size={16} className="text-error" /><span className="text-cafe-100">Reembolsado:</span><span className="font-medium text-exito">${reembolso.reembolso.toFixed(2)}</span></div>
                            )}
                          </div>
                        </div>
                        
                        {res.calificacion && (
                          <div className="mt-3 pt-3 border-t border-beige-100">
                            <p className="text-sm text-cafe-100">Tu calificación:</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} size={16} className={star <= res.calificacion ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                              ))}
                              {res.comentario && <p className="text-xs text-cafe-100 ml-3">"{res.comentario}"</p>}
                            </div>
                          </div>
                        )}
                        
                        {esCancelable && (
                          <div className="flex flex-wrap gap-3 pt-3 border-t border-beige-100">
                            <button onClick={() => setShowCancelModal(res)} className="bg-error hover:bg-red-700 text-white px-5 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium shadow-sm hover:shadow-md">
                              <XCircle size={18} /> Cancelar reserva
                            </button>
                          </div>
                        )}
                        
                        {(res.estado === 'checkout_realizado' && !res.calificacion) && (
                          <div className="mt-3 pt-3 border-t border-beige-100">
                            <button onClick={() => setShowRatingModal(res)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2 font-medium">
                              <Star size={18} /> Calificar mi estancia
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Modal de Cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-cafe-900 mb-4">Confirmar cancelación</h3>
            <p className="text-cafe-100 mb-4">¿Estás seguro de que deseas cancelar la reserva de <strong>{showCancelModal.habitacion}</strong>?</p>
            {(() => {
              const { total, cargos10, reembolso } = calcularReembolso(showCancelModal);
              return (
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <div className="flex justify-between text-sm mb-2"><span>Total pagado:</span><span>${total.toFixed(2)}</span></div>
                  <div className="flex justify-between text-sm mb-2"><span>Cargo 10% (no reembolsable):</span><span className="text-error">-${cargos10.toFixed(2)}</span></div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Reembolso final:</span><span className="text-exito">${reembolso.toFixed(2)}</span></div>
                  <p className="text-xs text-cafe-100 mt-3">* Los cargos administrativos del 10% no son recuperables.</p>
                </div>
              );
            })()}
            <div className="flex gap-3">
              <button onClick={() => setShowCancelModal(null)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">Mantener reserva</button>
              <button onClick={() => cancelarReserva(showCancelModal)} className="flex-1 bg-error hover:bg-red-700 text-white py-2 rounded-lg">Sí, cancelar</button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Calificación */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-cafe-900 mb-4">Calificar mi estancia</h2>
            <p className="text-cafe-100 mb-3">¿Cómo fue tu experiencia en <strong>{showRatingModal.habitacion}</strong>?</p>
            
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  className="focus:outline-none transform transition-transform hover:scale-110"
                >
                  <Star size={32} className={(ratingHover || rating) >= star ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'} />
                </button>
              ))}
            </div>
            
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Comentario (opcional)</label>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows="3" className="input" placeholder="Cuéntanos cómo fue tu estancia..." />
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => { setShowRatingModal(null); setRating(0); setComentario(''); }} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-lg">Ahora no</button>
              <button onClick={() => {
                if (rating === 0) {
                  alert('Por favor selecciona una calificación');
                  return;
                }
                const todasReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
                const nuevasTodas = todasReservas.map(r =>
                  r.codigo === showRatingModal.codigo ? { ...r, calificacion: rating, comentario: comentario, estado: 'finalizada' } : r
                );
                localStorage.setItem('reservations', JSON.stringify(nuevasTodas));
                
                const nuevas = reservas.map(r =>
                  r.codigo === showRatingModal.codigo ? { ...r, calificacion: rating, comentario: comentario, estado: 'finalizada' } : r
                );
                setReservas(nuevas);
                setShowRatingModal(null);
                setRating(0);
                setComentario('');
                alert('¡Gracias por calificar tu estancia!');
              }} className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg">Enviar calificación</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyReservations;