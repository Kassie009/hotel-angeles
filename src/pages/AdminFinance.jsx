import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Download, RefreshCw, Settings, Percent, Receipt, Star, Users } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminFinance = () => {
  const [reservas, setReservas] = useState([]);
  const [reembolsos, setReembolsos] = useState([]);
  const [impuestos, setImpuestos] = useState(16);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);

  useEffect(() => {
    cargarDatos();
    cargarConfiguracion();
  }, []);

  const cargarDatos = () => {
    const storedReservas = JSON.parse(localStorage.getItem('reservations') || '[]');
    const storedReembolsos = JSON.parse(localStorage.getItem('refunds') || '[]');
    setReservas(storedReservas);
    setReembolsos(storedReembolsos);
  };

  const cargarConfiguracion = () => {
    const config = JSON.parse(localStorage.getItem('hotelConfig') || '{}');
    setImpuestos(config.impuestos || 16);
    setDescuentoGlobal(config.descuentoGlobal || 0);
  };

  const guardarConfiguracion = () => {
    const config = { impuestos, descuentoGlobal };
    localStorage.setItem('hotelConfig', JSON.stringify(config));
    alert('Configuración guardada');
  };

  // Ingresos: reservas confirmadas (100%) + 10% de reservas canceladas
  const ingresosPorConfirmadas = reservas
    .filter(r => r.estado === 'confirmada' || r.estado === 'checkin_realizado')
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const ingresosPorCanceladas = reservas
    .filter(r => r.estado === 'cancelada')
    .reduce((sum, r) => sum + ((r.total || 0) * 0.10), 0);

  const ingresosTotales = ingresosPorConfirmadas + ingresosPorCanceladas;

  const ingresosMesConfirmadas = reservas
    .filter(r => {
      const fechaReserva = new Date(r.fechaReserva);
      const hoy = new Date();
      return (r.estado === 'confirmada' || r.estado === 'checkin_realizado') &&
             fechaReserva.getMonth() === hoy.getMonth() &&
             fechaReserva.getFullYear() === hoy.getFullYear();
    })
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const ingresosMesCanceladas = reservas
    .filter(r => {
      const fechaReserva = new Date(r.fechaReserva);
      const hoy = new Date();
      return r.estado === 'cancelada' &&
             fechaReserva.getMonth() === hoy.getMonth() &&
             fechaReserva.getFullYear() === hoy.getFullYear();
    })
    .reduce((sum, r) => sum + ((r.total || 0) * 0.10), 0);

  const ingresosMes = ingresosMesConfirmadas + ingresosMesCanceladas;

  const pagosPendientes = reservas
    .filter(r => r.estado === 'pendiente')
    .reduce((sum, r) => sum + (r.total || 0), 0);

  const totalReembolsos = reembolsos.reduce((sum, r) => sum + (r.montoReembolsado || 0), 0);

  const habitacionesTotales = 24;
  const ocupacion = reservas.filter(r => r.estado === 'confirmada' || r.estado === 'checkin_realizado').length;
  const porcentajeOcupacion = ((ocupacion / habitacionesTotales) * 100).toFixed(1);

  const totalReservas = reservas.length;
  const cancelaciones = reservas.filter(r => r.estado === 'cancelada').length;
  const porcentajeCancelaciones = totalReservas > 0 
    ? ((cancelaciones / totalReservas) * 100).toFixed(1) 
    : 0;

  const habitacionesMasReservadas = () => {
    const conteo = {};
    reservas.forEach(r => {
      if (r.estado !== 'cancelada') {
        conteo[r.habitacion] = (conteo[r.habitacion] || 0) + 1;
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
        conteo[r.email] = (conteo[r.email] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([email, count]) => {
        const reserva = reservas.find(r => r.email === email);
        return { nombre: reserva?.huesped || email, email, reservas: count };
      });
  };

  const handleRefund = () => {
    const codigo = prompt('Ingrese el código de reserva para reembolsar:');
    if (codigo) {
      const reserva = reservas.find(r => r.codigo === codigo);
      if (reserva && reserva.estado === 'confirmada') {
        const cargos10 = reserva.total * 0.10;
        const montoReembolso = reserva.total - cargos10;
        if (confirm(`¿Reembolsar $${montoReembolso.toFixed(2)} a ${reserva.huesped}?`)) {
          const nuevasReservas = reservas.map(r =>
            r.codigo === codigo ? { ...r, estado: 'cancelada', reembolsado: montoReembolso, fechaCancelacion: new Date().toISOString() } : r
          );
          localStorage.setItem('reservations', JSON.stringify(nuevasReservas));
          
          const nuevosReembolsos = [...reembolsos, {
            id: Date.now(),
            reservaId: reserva.codigo,
            huesped: reserva.huesped,
            habitacion: reserva.habitacion,
            montoOriginal: reserva.total,
            cargos10: cargos10,
            montoReembolsado: montoReembolso,
            fecha: new Date().toISOString(),
            motivo: 'Reembolso manual por administrador'
          }];
          localStorage.setItem('refunds', JSON.stringify(nuevosReembolsos));
          
          cargarDatos();
          alert(`Reembolso de $${montoReembolso.toFixed(2)} procesado`);
        }
      } else {
        alert('Reserva no encontrada o ya cancelada');
      }
    }
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Gestión Financiera</h1>
          <p className="text-cafe-100">Control de ingresos, pagos, reembolsos y configuración financiera</p>
        </div>
        
        {/* Tarjetas de resumen - 4 tarjetas (sin Ingreso Neto) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Ingresos Totales</p>
                <p className="text-3xl font-bold text-cafe-900">${ingresosTotales.toLocaleString()}</p>
                <p className="text-xs text-cafe-100 mt-1">Incluye 10% de cancelaciones</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><DollarSign size={24} className="text-green-600" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Ingresos del Mes</p>
                <p className="text-3xl font-bold text-cafe-900">${ingresosMes.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><Calendar size={24} className="text-blue-600" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Pagos Pendientes</p>
                <p className="text-3xl font-bold text-cafe-900">${pagosPendientes.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center"><TrendingDown size={24} className="text-yellow-600" /></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-cafe-100 text-sm">Total Reembolsos</p>
                <p className="text-3xl font-bold text-error">${totalReembolsos.toLocaleString()}</p>
                <p className="text-xs text-cafe-100 mt-1">Monto devuelto a clientes</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center"><RefreshCw size={24} className="text-red-600" /></div>
            </div>
          </div>
        </div>
        
        {/* Reporte de Ocupación y Habitaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><TrendingUp size={20} /> Reporte de Ocupación</h2>
            <div className="space-y-3">
              <div><div className="flex justify-between text-sm mb-1"><span>Ocupación General</span><span>{porcentajeOcupacion}%</span></div><div className="w-full bg-beige-100 rounded-full h-2"><div className="bg-exito rounded-full h-2" style={{ width: `${porcentajeOcupacion}%` }}></div></div></div>
              <div><div className="flex justify-between text-sm mb-1"><span>Tasa de Cancelación</span><span>{porcentajeCancelaciones}%</span></div><div className="w-full bg-beige-100 rounded-full h-2"><div className="bg-error rounded-full h-2" style={{ width: `${porcentajeCancelaciones}%` }}></div></div></div>
              <div><p className="text-sm text-cafe-100 mt-3">Total reservas: {totalReservas}</p><p className="text-sm text-cafe-100">Cancelaciones: {cancelaciones}</p><p className="text-sm text-cafe-100">Habitaciones ocupadas: {ocupacion}/24</p></div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><Star size={20} /> Habitaciones Más Reservadas</h2>
            <div className="space-y-3">
              {habitacionesMasReservadas().length === 0 ? <p className="text-cafe-100 text-center">No hay datos aún</p> : habitacionesMasReservadas().map(([nombre, count], idx) => (
                <div key={idx} className="flex justify-between items-center"><span className="text-cafe-100">{nombre}</span><span className="font-semibold text-cafe-900">{count} reservas</span></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Clientes Frecuentes y Configuración */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><Users size={20} /> Clientes Frecuentes</h2>
            <div className="space-y-3">
              {clientesFrecuentes().length === 0 ? <p className="text-cafe-100 text-center">No hay datos aún</p> : clientesFrecuentes().map((cliente, idx) => (
                <div key={idx} className="flex justify-between items-center"><div><p className="font-medium text-cafe-900">{cliente.nombre}</p><p className="text-xs text-cafe-100">{cliente.email}</p></div><span className="text-sm font-semibold text-cafe-900">{cliente.reservas} reservas</span></div>
              ))}
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><Settings size={20} /> Configuración Financiera</h2>
            <div className="space-y-4">
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Impuesto (IVA %)</label><div className="flex gap-2"><input type="number" value={impuestos} onChange={(e) => setImpuestos(Number(e.target.value))} className="input flex-1" /><button onClick={guardarConfiguracion} className="bg-cafe-200 text-white px-4 py-2 rounded-lg">Guardar</button></div></div>
              <div><label className="block text-cafe-900 text-sm font-medium mb-1">Descuento Global (%)</label><div className="flex gap-2"><input type="number" value={descuentoGlobal} onChange={(e) => setDescuentoGlobal(Number(e.target.value))} className="input flex-1" /><button onClick={guardarConfiguracion} className="bg-cafe-200 text-white px-4 py-2 rounded-lg">Aplicar</button></div></div>
              <button onClick={handleRefund} className="w-full bg-error/20 hover:bg-error/30 text-error py-2 rounded-lg flex items-center justify-center gap-2 transition-all"><RefreshCw size={16} /> Registrar Reembolso Manual</button>
            </div>
          </div>
        </div>
        
        {/* Historial de Reembolsos */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-bold text-cafe-900 mb-4 flex items-center gap-2"><Receipt size={20} /> Historial de Reembolsos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cafe-900 text-white">
                <tr>
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Huésped</th>
                  <th className="px-4 py-2 text-left">Habitación</th>
                  <th className="px-4 py-2 text-left">Monto Original</th>
                  <th className="px-4 py-2 text-left">Cargo 10%</th>
                  <th className="px-4 py-2 text-left">Reembolsado</th>
                </tr>
              </thead>
              <tbody>
                {reembolsos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-cafe-100">No hay reembolsos registrados</td>
                  </tr>
                ) : (
                  reembolsos.map(ref => (
                    <tr key={ref.id} className="border-b">
                      <td className="px-4 py-2">{new Date(ref.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{ref.huesped}</td>
                      <td className="px-4 py-2">{ref.habitacion}</td>
                      <td className="px-4 py-2">${ref.montoOriginal.toFixed(2)}</td>
                      <td className="px-4 py-2 text-error">-${ref.cargos10.toFixed(2)}</td>
                      <td className="px-4 py-2 text-exito">${ref.montoReembolsado.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;