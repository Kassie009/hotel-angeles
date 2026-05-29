import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Users, DollarSign, Plus } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import { rooms } from '../data/rooms';

const AdminReservations = () => {
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [filtro, setFiltro] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  
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

  useEffect(() => {
    cargarReservas();
    cargarHabitaciones();
  }, []);

  const cargarReservas = () => {
    const stored = JSON.parse(localStorage.getItem('reservations') || '[]');
    setReservas(stored);
  };

  const cargarHabitaciones = () => {
    const stored = JSON.parse(localStorage.getItem('rooms') || '[]');
    if (stored.length === 0 && rooms.length > 0) {
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
      setHabitaciones(stored);
    }
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
    cargarReservas();
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

  const filtrarReservas = () => {
    let filtradas = [...reservas];
    
    if (filtro !== 'todas') {
      filtradas = filtradas.filter(r => r.estado === filtro);
    }
    
    if (busqueda) {
      filtradas = filtradas.filter(r => 
        r.huesped?.toLowerCase().includes(busqueda.toLowerCase()) ||
        r.codigo?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }
    
    return filtradas;
  };

  const cambiarEstado = (codigo, nuevoEstado) => {
    const nuevas = reservas.map(r => 
      r.codigo === codigo ? { ...r, estado: nuevoEstado } : r
    );
    setReservas(nuevas);
    localStorage.setItem('reservations', JSON.stringify(nuevas));
    alert(`✅ Reserva ${codigo} actualizada a ${nuevoEstado}`);
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      confirmada: { label: 'Confirmada', color: 'bg-exito/20 text-exito' },
      pendiente: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700' },
      cancelada: { label: 'Cancelada', color: 'bg-error/20 text-error' },
      checkin_realizado: { label: 'En curso', color: 'bg-blue-100 text-blue-700' },
      checkout_realizado: { label: 'Finalizada', color: 'bg-gray-200 text-gray-600' },
      finalizada: { label: 'Finalizada', color: 'bg-gray-200 text-gray-600' }
    };
    const e = estados[estado] || { label: estado, color: 'bg-gray-200 text-gray-600' };
    return <span className={`text-xs px-2 py-1 rounded-full ${e.color}`}>{e.label}</span>;
  };

  const reservasFiltradas = filtrarReservas();
  const totalReservas = reservas.length;
  const checkinsHoy = reservas.filter(r => r.checkIn === new Date().toISOString().split('T')[0]).length;
  const ocupacion = reservas.filter(r => r.estado === 'confirmada' || r.estado === 'checkin_realizado').length;
  const pendientes = reservas.filter(r => r.estado === 'pendiente').length;

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Gestión de Reservas</h1>
            <p className="text-cafe-100">Administra la ocupación y estados del resort en tiempo real.</p>
          </div>
          <button
            onClick={() => setShowNuevaReservaForm(true)}
            className="bg-exito hover:bg-opacity-80 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <Plus size={18} /> Reserva en Sitio
          </button>
        </div>
        
        {/* Tarjetas resumen */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-cafe-100">Total Reservas</p>
            <p className="text-2xl font-bold text-cafe-900">{totalReservas}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-cafe-100">Check-ins Hoy</p>
            <p className="text-2xl font-bold text-cafe-900">{checkinsHoy}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-cafe-100">Ocupación Actual</p>
            <p className="text-2xl font-bold text-cafe-900">{Math.round((ocupacion / 24) * 100)}%</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <p className="text-xs text-cafe-100">Pendientes</p>
            <p className="text-2xl font-bold text-cafe-900">{pendientes}</p>
          </div>
        </div>
        
        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 justify-between items-center">
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFiltro('todas')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'todas' ? 'bg-cafe-200 text-white' : 'bg-beige-50 text-cafe-100 hover:bg-beige-100'}`}>Todas</button>
              <button onClick={() => setFiltro('confirmada')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'confirmada' ? 'bg-exito text-white' : 'bg-beige-50 text-cafe-100 hover:bg-beige-100'}`}>Confirmadas</button>
              <button onClick={() => setFiltro('pendiente')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'pendiente' ? 'bg-yellow-500 text-white' : 'bg-beige-50 text-cafe-100 hover:bg-beige-100'}`}>Pendientes</button>
              <button onClick={() => setFiltro('cancelada')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'cancelada' ? 'bg-error text-white' : 'bg-beige-50 text-cafe-100 hover:bg-beige-100'}`}>Canceladas</button>
              <button onClick={() => setFiltro('finalizada')} className={`px-4 py-2 rounded-lg transition-all ${filtro === 'finalizada' ? 'bg-gray-500 text-white' : 'bg-beige-50 text-cafe-100 hover:bg-beige-100'}`}>Finalizadas</button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
              <input
                type="text"
                placeholder="Buscar huésped o código..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="pl-10 pr-4 py-2 border border-beige-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-cafe-100"
              />
            </div>
          </div>
        </div>
        
        {/* Tabla de reservas */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cafe-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Huésped</th>
                  <th className="px-4 py-3 text-left">Habitación</th>
                  <th className="px-4 py-3 text-left">Estancia</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Total</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-cafe-100">
                      No hay reservas que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  reservasFiltradas.map((res, idx) => (
                    <tr key={idx} className="border-b border-beige-100 hover:bg-beige-50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-cafe-900">{res.huesped || 'N/A'}</p>
                          <p className="text-xs text-cafe-100 font-mono">{res.codigo || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-cafe-900">{res.habitacion || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-cafe-900">{res.checkIn || 'N/A'} → {res.checkOut || 'N/A'}</p>
                        <p className="text-xs text-cafe-100">{res.noches || 0} noches</p>
                      </td>
                      <td className="px-4 py-3">
                        {getEstadoBadge(res.estado)}
                      </td>
                      <td className="px-4 py-3 font-semibold text-cafe-900">${(res.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={res.estado || 'confirmada'}
                          onChange={(e) => cambiarEstado(res.codigo, e.target.value)}
                          className="text-sm border border-beige-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cafe-100"
                        >
                          <option value="confirmada">Confirmada</option>
                          <option value="pendiente">Pendiente</option>
                          <option value="checkin_realizado">En curso</option>
                          <option value="cancelada">Cancelada</option>
                          <option value="finalizada">Finalizada</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
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

export default AdminReservations;