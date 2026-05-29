import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, Bed, Plus, Edit, CheckCircle, XCircle, Users, DollarSign, MessageSquare} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { rooms } from '../data/rooms';

const Reception = () => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [lateCheckout, setLateCheckout] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [pagoMonto, setPagoMonto] = useState('');
  const [pagoMetodo, setPagoMetodo] = useState('efectivo');
  const [notas, setNotas] = useState([]);
  const [nuevaNota, setNuevaNota] = useState('');
  
  // Estado para el modal de reserva en sitio
  const [showNuevaReservaForm, setShowNuevaReservaForm] = useState(false);
  const [nuevaReserva, setNuevaReserva] = useState({
    habitacionId: '',
    huesped: '',
    email: '',
    telefono: '',
    checkIn: '',
    checkOut: '',
    huespedes: 1,
    metodoPago: 'efectivo',
    pagoCompletado: true
  });

  // actualizar estados según fechas
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

  // Función para obtener el texto del estado según la fecha
  const getEstadoTexto = (reserva) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCheckIn = new Date(reserva.checkIn);
    fechaCheckIn.setHours(0, 0, 0, 0);
    
    if (reserva.estado === 'confirmada') {
      if (fechaCheckIn < hoy) return 'No se presentó';
      if (fechaCheckIn.getTime() === hoy.getTime()) return 'Llega hoy';
      return 'Por llegar';
    }
    
    if (reserva.estado === 'checkin_realizado') return 'En curso';
    if (reserva.estado === 'checkout_realizado') return 'Finalizada';
    if (reserva.estado === 'finalizada') return 'Finalizada';
    if (reserva.estado === 'cancelada') return 'Cancelada';
    
    return reserva.estado;
  };

  // Función para obtener el color del estado según la fecha
  const getEstadoColor = (reserva) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaCheckIn = new Date(reserva.checkIn);
    fechaCheckIn.setHours(0, 0, 0, 0);
    
    if (reserva.estado === 'confirmada') {
      if (fechaCheckIn < hoy) return 'bg-red-100 text-red-700';
      if (fechaCheckIn.getTime() === hoy.getTime()) return 'bg-blue-100 text-blue-700';
      return 'bg-yellow-100 text-yellow-700';
    }
    
    if (reserva.estado === 'checkin_realizado') return 'bg-green-100 text-green-700';
    if (reserva.estado === 'checkout_realizado') return 'bg-gray-100 text-gray-700';
    if (reserva.estado === 'finalizada') return 'bg-gray-100 text-gray-700';
    if (reserva.estado === 'cancelada') return 'bg-red-100 text-red-700';
    
    return 'bg-blue-100 text-blue-700';
  };

  useEffect(() => {
    cargarDatos();
    cargarNotas();
  }, []);

  const cargarDatos = () => {
    let storedReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
    const storedRooms = JSON.parse(localStorage.getItem('rooms') || '[]');
    
    storedReservas = actualizarEstadosPorFecha(storedReservas);
    setReservas(storedReservas);
    
    if (storedRooms.length === 0 && rooms.length > 0) {
      const habitacionesIniciales = rooms.map((room, index) => ({
        id: room.id,
        numero: `10${index + 1}`,
        nombre: room.nombre,
        tipo: room.id === 1 ? 'simple' : room.id === 2 ? 'doble' : 'suite',
        precio: room.precio,
        capacidad: room.capacidad,
        estado: 'disponible',
        imagen: room.imagen
      }));
      setHabitaciones(habitacionesIniciales);
      localStorage.setItem('rooms', JSON.stringify(habitacionesIniciales));
    } else {
      setHabitaciones(storedRooms);
    }
  };

  const cargarNotas = () => {
    const storedNotas = JSON.parse(localStorage.getItem('receptionNotes') || '[]');
    setNotas(storedNotas);
  };

  const agregarNota = () => {
    if (!nuevaNota.trim()) return;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    const nueva = {
      id: Date.now(),
      texto: nuevaNota,
      fecha: new Date().toLocaleString(),
      autor: currentUser?.nombre || 'Recepcionista'
    };
    const nuevasNotas = [nueva, ...notas];
    setNotas(nuevasNotas);
    localStorage.setItem('receptionNotes', JSON.stringify(nuevasNotas));
    setNuevaNota('');
  };

  const handleNuevaReservaChange = (e) => {
    setNuevaReserva({ ...nuevaReserva, [e.target.name]: e.target.value });
  };

  const calcularNochesNueva = () => {
    if (nuevaReserva.checkIn && nuevaReserva.checkOut) {
      const inicio = new Date(nuevaReserva.checkIn);
      const fin = new Date(nuevaReserva.checkOut);
      const diff = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
    }
    return 0;
  };

  const crearReservaEnSitio = () => {
    const habitacionSeleccionada = habitaciones.find(h => h.id === parseInt(nuevaReserva.habitacionId));
    const noches = calcularNochesNueva();
    const subtotal = habitacionSeleccionada ? habitacionSeleccionada.precio * noches : 0;
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    const reserva = {
      id: Date.now(),
      codigo: `PRESTIGE-${Date.now()}`,
      roomId: parseInt(nuevaReserva.habitacionId),
      habitacion: habitacionSeleccionada?.nombre,
      huesped: nuevaReserva.huesped,
      email: nuevaReserva.email,
      telefono: nuevaReserva.telefono,
      checkIn: nuevaReserva.checkIn,
      checkOut: nuevaReserva.checkOut,
      noches: noches,
      subtotal: subtotal,
      iva: iva,
      total: total,
      estado: nuevaReserva.pagoCompletado ? 'confirmada' : 'pendiente',
      metodoPago: nuevaReserva.metodoPago,
      fechaReserva: new Date().toISOString(),
      reservaEnSitio: true
    };
    
    const existing = JSON.parse(localStorage.getItem('reservations') || '[]');
    existing.push(reserva);
    localStorage.setItem('reservations', JSON.stringify(existing));
    
    if (nuevaReserva.pagoCompletado) {
      const nuevasHabitaciones = habitaciones.map(h =>
        h.id === parseInt(nuevaReserva.habitacionId) ? { ...h, estado: 'ocupada' } : h
      );
      setHabitaciones(nuevasHabitaciones);
      localStorage.setItem('rooms', JSON.stringify(nuevasHabitaciones));
    }
    
    setShowNuevaReservaForm(false);
    cargarDatos();
    alert(`✅ Reserva creada: ${reserva.codigo}`);
    
    // Resetear formulario
    setNuevaReserva({
      habitacionId: '',
      huesped: '',
      email: '',
      telefono: '',
      checkIn: '',
      checkOut: '',
      huespedes: 1,
      metodoPago: 'efectivo',
      pagoCompletado: true
    });
  };

  const hoy = new Date().toISOString().split('T')[0];
  const checkinsHoy = reservas.filter(r => r.estado === 'confirmada' && r.checkIn === hoy);
  const checkoutsHoy = reservas.filter(r => r.estado === 'checkin_realizado' && r.checkOut === hoy);
  const disponibilidad = habitaciones.filter(h => h.estado === 'disponible').length;
  const ocupadas = habitaciones.filter(h => h.estado === 'ocupada').length;

  const buscarReserva = () => {
    if (!busqueda) return null;
    return reservas.find(r => 
      r.codigo.toLowerCase().includes(busqueda.toLowerCase()) || 
      r.huesped.toLowerCase().includes(busqueda.toLowerCase())
    );
  };

  const realizarCheckIn = (reserva) => {
    const nuevasReservas = reservas.map(r =>
      r.codigo === reserva.codigo 
        ? { ...r, estado: 'checkin_realizado', lateCheckout: lateCheckout, total: lateCheckout ? r.total + 350 : r.total }
        : r
    );
    localStorage.setItem('reservations', JSON.stringify(nuevasReservas));
    
    const roomToUpdate = habitaciones.find(h => h.nombre === reserva.habitacion);
    if (roomToUpdate) {
      const nuevasHabitaciones = habitaciones.map(h =>
        h.id === roomToUpdate.id ? { ...h, estado: 'ocupada' } : h
      );
      setHabitaciones(nuevasHabitaciones);
      localStorage.setItem('rooms', JSON.stringify(nuevasHabitaciones));
    }
    
    setReservas(nuevasReservas);
    setLateCheckout(false);
    alert(`✅ Check-in realizado para ${reserva.huesped}${lateCheckout ? ' + Late check-out ($350)' : ''}`);
  };

  const realizarCheckOut = (reserva) => {
    const nuevasReservas = reservas.map(r =>
      r.codigo === reserva.codigo ? { ...r, estado: 'checkout_realizado' } : r
    );
    localStorage.setItem('reservations', JSON.stringify(nuevasReservas));
    
    const roomToUpdate = habitaciones.find(h => h.nombre === reserva.habitacion);
    if (roomToUpdate) {
      const nuevasHabitaciones = habitaciones.map(h =>
        h.id === roomToUpdate.id ? { ...h, estado: 'limpieza' } : h
      );
      setHabitaciones(nuevasHabitaciones);
      localStorage.setItem('rooms', JSON.stringify(nuevasHabitaciones));
    }
    
    setReservas(nuevasReservas);
    alert(`✅ Check-out realizado para ${reserva.huesped}`);
  };

  const registrarPago = () => {
    if (!selectedReserva) return;
    if (!pagoMonto || Number(pagoMonto) <= 0) {
      alert('Ingrese un monto válido');
      return;
    }
    
    const pagos = JSON.parse(localStorage.getItem('payments') || '[]');
    const nuevoPago = {
      id: Date.now(),
      reservaId: selectedReserva.codigo,
      monto: Number(pagoMonto),
      metodo: pagoMetodo,
      fecha: new Date().toISOString(),
      huesped: selectedReserva.huesped
    };
    pagos.push(nuevoPago);
    localStorage.setItem('payments', JSON.stringify(pagos));
    
    alert(`💰 Pago de $${pagoMonto} registrado (${pagoMetodo})`);
    setShowPaymentModal(false);
    setPagoMonto('');
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      disponible: 'bg-green-100 text-green-700',
      ocupada: 'bg-blue-100 text-blue-700',
      mantenimiento: 'bg-red-100 text-red-700',
      limpieza: 'bg-yellow-100 text-yellow-700'
    };
    return <span className={`text-xs px-2 py-1 rounded-full ${estados[estado] || 'bg-gray-100 text-gray-700'}`}>{estado.toUpperCase()}</span>;
  };

  const reservaEncontrada = buscarReserva();

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Recepción</h1>
            <p className="text-cafe-100">Gestión de check-ins, check-outs, huéspedes y pagos</p>
          </div>
          <button
            onClick={() => setShowNuevaReservaForm(true)}
            className="bg-exito hover:bg-opacity-80 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Reserva en Sitio
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 flex justify-between"><div><p className="text-xs text-cafe-100">DISPONIBILIDAD</p><p className="text-2xl font-bold text-cafe-900">{disponibilidad} Hab.</p></div><Bed size={32} className="text-cafe-200" /></div>
          <div className="bg-white rounded-xl p-4 flex justify-between"><div><p className="text-xs text-cafe-100">PENDIENTES</p><p className="text-2xl font-bold text-cafe-900">{checkinsHoy.length} Check-ins</p></div><Clock size={32} className="text-cafe-200" /></div>
          <div className="bg-white rounded-xl p-4 flex justify-between"><div><p className="text-xs text-cafe-100">SALIDAS</p><p className="text-2xl font-bold text-cafe-900">{checkoutsHoy.length} Check-outs</p></div><Calendar size={32} className="text-cafe-200" /></div>
          <div className="bg-white rounded-xl p-4 flex justify-between"><div><p className="text-xs text-cafe-100">OCUPACIÓN</p><p className="text-2xl font-bold text-cafe-900">{ocupadas}/24</p></div><Users size={32} className="text-cafe-200" /></div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-cafe-900 mb-4">Buscar Reserva</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
            <input type="text" placeholder="Buscar por código o nombre del huésped..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-beige-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cafe-100" />
          </div>
          
          {reservaEncontrada && (
            <div className="mt-6 p-4 bg-beige-50 rounded-xl">
              <div className="flex justify-between items-start flex-wrap gap-3">
                <div><p className="text-xs text-cafe-100">{reservaEncontrada.codigo}</p><h3 className="text-xl font-bold text-cafe-900">{reservaEncontrada.huesped}</h3><p className="text-cafe-100">{reservaEncontrada.habitacion}</p></div>
                <span className={`px-3 py-1 rounded-full text-sm ${getEstadoColor(reservaEncontrada)}`}>
                  {getEstadoTexto(reservaEncontrada)}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                <div><span className="text-cafe-100">Check-in:</span> {reservaEncontrada.checkIn}</div>
                <div><span className="text-cafe-100">Check-out:</span> {reservaEncontrada.checkOut}</div>
                <div><span className="text-cafe-100">Noches:</span> {reservaEncontrada.noches}</div>
                <div><span className="text-cafe-100">Total:</span> ${reservaEncontrada.total?.toFixed(2)}</div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Botón CHECK-IN - solo si la fecha es hoy o futura */}
                {reservaEncontrada.estado === 'confirmada' && (() => {
                  const hoyFecha = new Date();
                  hoyFecha.setHours(0, 0, 0, 0);
                  const fechaCheckIn = new Date(reservaEncontrada.checkIn);
                  fechaCheckIn.setHours(0, 0, 0, 0);
                  const checkInValido = fechaCheckIn >= hoyFecha;
                  
                  return checkInValido ? (
                    <>
                      <label className="flex items-center gap-2 mr-3">
                        <input type="checkbox" checked={lateCheckout} onChange={(e) => setLateCheckout(e.target.checked)} />
                        <span className="text-sm">Late check-out (+$350)</span>
                      </label>
                      <button onClick={() => realizarCheckIn(reservaEncontrada)} className="bg-exito hover:bg-opacity-80 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <CheckCircle size={16} /> Check-in
                      </button>
                    </>
                  ) : (
                    <span className="text-error text-sm flex items-center gap-1">
                      ⚠️ El check-in ya no está disponible (fecha pasada)
                    </span>
                  );
                })()}
                
                {/* Botón CHECK-OUT - solo si está en curso */}
                {reservaEncontrada.estado === 'checkin_realizado' && (
                  <button onClick={() => realizarCheckOut(reservaEncontrada)} className="bg-cafe-200 hover:bg-cafe-100 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                    <XCircle size={16} /> Check-out
                  </button>
                )}
                
                <button onClick={() => { setSelectedReserva(reservaEncontrada); setShowPaymentModal(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                  <DollarSign size={16} /> Registrar Pago
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><MessageSquare size={20} /> Notas de Recepción</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={nuevaNota} onChange={(e) => setNuevaNota(e.target.value)} placeholder="Escribe una nota..." className="input flex-1" />
            <button onClick={agregarNota} className="bg-cafe-200 text-white px-4 py-2 rounded-lg">Agregar</button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notas.length === 0 ? <p className="text-cafe-100 text-sm text-center py-4">No hay notas registradas</p> : notas.map(nota => (<div key={nota.id} className="bg-beige-50 p-3 rounded-lg"><p className="text-sm text-cafe-900">{nota.texto}</p><p className="text-xs text-cafe-100 mt-1">{nota.fecha} - {nota.autor}</p></div>))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-cafe-900 text-white px-4 py-3"><h2 className="font-bold flex items-center gap-2"><Calendar size={16} /> Check-ins del día ({hoy})</h2></div>
            <div className="overflow-x-auto"><table className="w-full"><tbody>{checkinsHoy.length === 0 ? <tr><td className="p-4 text-center text-cafe-100">No hay check-ins programados</td></tr> : checkinsHoy.map((res, idx) => (<tr key={idx} className="border-b"><td className="p-3">{res.huesped}</td><td className="p-3">{res.habitacion}</td><td className="p-3"><button onClick={() => realizarCheckIn(res)} className="bg-exito text-white px-3 py-1 rounded text-sm">Check-in</button></td></tr>))}</tbody></table>
</div>
          </div>
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-cafe-900 text-white px-4 py-3"><h2 className="font-bold flex items-center gap-2"><Clock size={16} /> Check-outs del día ({hoy})</h2></div>
            <div className="overflow-x-auto"><table className="w-full"><tbody>{checkoutsHoy.length === 0 ? <tr><td className="p-4 text-center text-cafe-100">No hay check-outs programados</td></tr> : checkoutsHoy.map((res, idx) => (<tr key={idx} className="border-b"><td className="p-3">{res.huesped}</td><td className="p-3">{res.habitacion}</td><td className="p-3"><button onClick={() => realizarCheckOut(res)} className="bg-cafe-200 text-white px-3 py-1 rounded text-sm">Check-out</button></td></tr>))}</tbody></table>
</div>
          </div>
        </div>
          
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="bg-cafe-900 text-white px-4 py-3"><h2 className="font-bold flex items-center gap-2"><Bed size={16} /> Detalle de Habitaciones</h2></div>
          <div className="p-4"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">{habitaciones.map(room => (<div key={room.id} className="border rounded-lg p-3 text-center"><p className="font-bold text-cafe-900">#{room.numero}</p><p className="text-xs text-cafe-100">{room.nombre}</p>{getEstadoBadge(room.estado)}</div>))}</div></div>
        </div>
      </div>
      
      {/* Modal Registrar Pago */}
      {showPaymentModal && selectedReserva && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-md w-full p-6"><h2 className="text-xl font-bold mb-4">Registrar Pago</h2><p className="mb-3">Huésped: <strong>{selectedReserva.huesped}</strong></p><div className="mb-3"><label className="block text-sm mb-1">Monto</label><input type="number" value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)} placeholder="0.00" className="input" /></div><div className="mb-4"><label className="block text-sm mb-1">Método de Pago</label><select value={pagoMetodo} onChange={(e) => setPagoMetodo(e.target.value)} className="input"><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="transferencia">Transferencia</option></select></div><div className="flex gap-3"><button onClick={() => setShowPaymentModal(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancelar</button><button onClick={registrarPago} className="flex-1 bg-cafe-200 text-white py-2 rounded-lg">Registrar</button></div></div></div>)}

      {/* Modal Nueva Reserva en Sitio */}
      {showNuevaReservaForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cafe-900">Nueva Reserva en Sitio</h2>
              <button onClick={() => setShowNuevaReservaForm(false)} className="text-cafe-100 hover:text-cafe-900 text-2xl">✕</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Habitación</label>
                <select name="habitacionId" value={nuevaReserva.habitacionId} onChange={handleNuevaReservaChange} className="input" required>
                  <option value="">Selecciona una habitación</option>
                  {habitaciones.map(room => {
                    const disponible = room.estado === 'disponible';
                    const estadoTexto = {
                      disponible: '',
                      ocupada: '🔴 Ocupada',
                      mantenimiento: '🛠️ Mantenimiento',
                      limpieza: '🧹 En limpieza'
                    }[room.estado] || '';
                    
                    return (
                      <option 
                        key={room.id} 
                        value={room.id} 
                        disabled={!disponible}
                        className={!disponible ? 'text-gray-400' : ''}
                      >
                        {room.nombre} - ${room.precio}/noche {estadoTexto && `(${estadoTexto})`}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="block text-cafe-900 text-sm font-medium mb-1">Huéspedes</label>
                <select name="huespedes" value={nuevaReserva.huespedes} onChange={handleNuevaReservaChange} className="input">
                  {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Check-in</label><input type="date" name="checkIn" value={nuevaReserva.checkIn} onChange={handleNuevaReservaChange} className="input" required /></div>
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Check-out</label><input type="date" name="checkOut" value={nuevaReserva.checkOut} onChange={handleNuevaReservaChange} className="input" required /></div>
            </div>
            
            <div className="mb-4"><label className="block text-cafe-900 text-sm font-medium mb-1">Huésped</label><input type="text" name="huesped" value={nuevaReserva.huesped} onChange={handleNuevaReservaChange} className="input" placeholder="Nombre completo" required /></div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Email</label><input type="email" name="email" value={nuevaReserva.email} onChange={handleNuevaReservaChange} className="input" placeholder="correo@ejemplo.com" required /></div>
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Teléfono</label><input type="tel" name="telefono" value={nuevaReserva.telefono} onChange={handleNuevaReservaChange} className="input" placeholder="+52 653 000 0000" required /></div>
            </div>
            
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Método de Pago</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="radio" name="metodoPago" value="efectivo" checked={nuevaReserva.metodoPago === 'efectivo'} onChange={handleNuevaReservaChange} /> Efectivo</label>
                <label className="flex items-center gap-2"><input type="radio" name="metodoPago" value="transferencia" checked={nuevaReserva.metodoPago === 'transferencia'} onChange={handleNuevaReservaChange} /> Transferencia</label>
                <label className="flex items-center gap-2"><input type="radio" name="metodoPago" value="tarjeta" checked={nuevaReserva.metodoPago === 'tarjeta'} onChange={handleNuevaReservaChange} /> Tarjeta</label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Estado del Pago</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2"><input type="radio" name="pagoCompletado" value="true" checked={nuevaReserva.pagoCompletado === true} onChange={() => setNuevaReserva({...nuevaReserva, pagoCompletado: true})} /> Pagado (Confirmar)</label>
                <label className="flex items-center gap-2"><input type="radio" name="pagoCompletado" value="false" checked={nuevaReserva.pagoCompletado === false} onChange={() => setNuevaReserva({...nuevaReserva, pagoCompletado: false})} /> Pendiente</label>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowNuevaReservaForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg">Cancelar</button>
              <button onClick={crearReservaEnSitio} className="flex-1 bg-cafe-200 text-white py-2 rounded-lg" disabled={!nuevaReserva.habitacionId || !nuevaReserva.checkIn || !nuevaReserva.checkOut || !nuevaReserva.huesped}>Crear Reserva</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reception;