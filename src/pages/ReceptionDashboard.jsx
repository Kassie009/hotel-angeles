import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../Config/api';

const ReceptionDashboard = () => {
    const { user } = useAuth();
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState({ estado: '', busqueda: '' });

    const cargarReservas = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtro.estado) params.append('estado', filtro.estado);
            if (filtro.busqueda) params.append('busqueda', filtro.busqueda.trim());
            
            const response = await api.get(`/reservations?${params}`);
            const payload = response.data?.data || response.data;
            setReservas(Array.isArray(payload) ? payload : []);
        } catch {
            
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        (async () => {
            await cargarReservas();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filtro.estado]);

    const cambiarEstado = async (codigoReserva, nuevoEstado) => {
        const confirmMsg =
            nuevoEstado === 'confirmada'
                ? '¿Confirmar la reserva?'
                : nuevoEstado === 'checkin_realizado'
                  ? '¿Registrar check-in?'
                  : nuevoEstado === 'checkout_realizado'
                    ? '¿Registrar check-out?'
                    : `¿Confirmar ${nuevoEstado} para esta reserva?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            let endpoint = '';

            switch (nuevoEstado) {
                case 'confirmada':
                    endpoint = `/reservations/${codigoReserva}/confirm`;
                    break;
                case 'checkin_realizado':
                    endpoint = `/reservations/${codigoReserva}/checkin`;
                    break;
                case 'checkout_realizado':
                    endpoint = `/reservations/${codigoReserva}/checkout`;
                    break;
                case 'cancelada':
                    endpoint = `/reservations/${codigoReserva}/cancel`;
                    break;
                default:
                    throw new Error(`Estado no soportado: ${nuevoEstado}`);
            }

            if (nuevoEstado === 'confirmada') endpoint = `/reservations/${codigoReserva}/status`;
            if (nuevoEstado === 'checkin_realizado') endpoint = `/reservations/${codigoReserva}/status`;
            if (nuevoEstado === 'checkout_realizado') endpoint = `/reservations/${codigoReserva}/status`;
            if (nuevoEstado === 'cancelada') endpoint = `/reservations/${codigoReserva}/status`;

            const payload = { estado: nuevoEstado };
            await api.put(endpoint, payload);


            alert('Estado actualizado exitosamente');
            await cargarReservas();
        } catch {
            
            alert('Error al actualizar estado');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Panel de Recepción</h1>
                <p className="text-gray-600">Bienvenido, {user?.nombre}</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex flex-wrap gap-4">
                    <select
                        className="border rounded-lg px-4 py-2"
                        value={filtro.estado}
                        onChange={(e) => setFiltro((prev) => ({ ...prev, estado: e.target.value }))}
                    >
                        <option value="">Todos los estados</option>
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="checkin_realizado">Check-in</option>
                        <option value="checkout_realizado">Check-out</option>
                        <option value="cancelada">Cancelada</option>
                    </select>

                    <input
                        type="text"
                        placeholder="Buscar por código, nombre, email..."
                        className="border rounded-lg px-4 py-2 flex-1 min-w-[200px]"
                        value={filtro.busqueda}
                        onChange={(e) => setFiltro((prev) => ({ ...prev, busqueda: e.target.value }))}
                        autoComplete="off"
                        spellCheck={false}
                        autoCorrect="off"
                    />

                    <button
                        onClick={() => setFiltro({ estado: '', busqueda: '' })}
                        className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                        Limpiar
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                {(() => {
                    const q = filtro.busqueda.trim().toLowerCase();
                    const estadoFiltro = filtro.estado;

                    const base = estadoFiltro
                        ? reservas.filter((r) => r.estado === estadoFiltro)
                        : reservas;

                    const filas = q
                        ? base.filter((r) => {
                            const codigo = (r.codigo || '').toString().toLowerCase();
                            const nombre = (r.nombre || '').toString().toLowerCase();
                            const email = (r.email || '').toString().toLowerCase();
                            return codigo.includes(q) || nombre.includes(q) || email.includes(q);
                        })
                        : base;

                    return (
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habitación</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filas.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-gray-500">No hay reservas que coincidan con los filtros</td>
                                    </tr>
                                ) : (
                                    filas.map((reserva) => (
                                        <tr key={reserva.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium">{reserva.codigo}</td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium">{reserva.nombre}</div>
                                                <div className="text-sm text-gray-500">{reserva.email}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{reserva.habitacion_nombre}</td>
                                            <td className="px-6 py-4 text-sm">{new Date(reserva.check_in).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm">{new Date(reserva.check_out).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm font-bold">${(Number(reserva.total) || 0).toFixed(2)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    reserva.estado === 'confirmada'
                                                        ? 'bg-green-100 text-green-800'
                                                        : reserva.estado === 'pendiente'
                                                          ? 'bg-yellow-100 text-yellow-800'
                                                          : reserva.estado === 'checkin_realizado'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : reserva.estado === 'checkout_realizado'
                                                              ? 'bg-gray-100 text-gray-800'
                                                              : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {reserva.estado.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {reserva.estado === 'pendiente' && (
                                                        <button
                                                            onClick={() => cambiarEstado(reserva.codigo, 'confirmada')}
                                                            className="bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                                                        >
                                                            Confirmar
                                                        </button>
                                                    )}
                                                    {reserva.estado === 'confirmada' && (
                                                        <button
                                                            onClick={() => cambiarEstado(reserva.codigo, 'checkin_realizado')}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
                                                        >
                                                            Check-in
                                                        </button>
                                                    )}
                                                    {reserva.estado === 'checkin_realizado' && (
                                                        <button
                                                            onClick={() => cambiarEstado(reserva.codigo, 'checkout_realizado')}
                                                            className="bg-purple-500 text-white px-3 py-1 rounded text-xs hover:bg-purple-600"
                                                        >
                                                            Check-out
                                                        </button>
                                                    )}
                                                    {reserva.estado !== 'cancelada' && reserva.estado !== 'checkout_realizado' && (
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm('¿Cancelar esta reserva?')) {
                                                                    cambiarEstado(reserva.codigo, 'cancelada');
                                                                }
                                                            }}
                                                            className="bg-red-500 text-white px-3 py-1 rounded text-xs hover:bg-red-600"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    );
                })()}
            </div>
        </div>
    );
};

export default ReceptionDashboard;
