import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../Config/api';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    const cargarEstadisticas = async () => {
        try {
            const response = await api.get('/dashboard/stats');
            setStats(response?.data?.data || null);
        } catch {
            
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        cargarEstadisticas();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-gray-600">Bienvenido, {user?.nombre}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Total Reservas</p>
                            <p className="text-3xl font-bold">{stats?.totalReservas || 0}</p>
                        </div>
                        <div className="bg-blue-200 p-3 rounded-full">
                            <svg
                                className="w-6 h-6 text-blue-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Ingresos Totales</p>
                            <p className="text-3xl font-bold text-green-600">
                                ${stats?.ingresosTotales?.toFixed(2) || '0.00'}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <svg
                                className="w-6 h-6 text-green-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-bold mb-4">Últimas Reservas</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left py-2">Código</th>
                                <th className="text-left py-2">Cliente</th>
                                <th className="text-left py-2">Habitación</th>
                                <th className="text-left py-2">Check-in</th>
                                <th className="text-left py-2">Total</th>
                                <th className="text-left py-2">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats?.ultimasReservas?.map((reserva) => (
                                <tr key={reserva.id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 font-medium">{reserva.codigo}</td>
                                    <td className="py-2">{reserva.nombre}</td>
                                    <td className="py-2">{reserva.habitacion_nombre}</td>
                                    <td className="py-2">{new Date(reserva.check_in).toLocaleDateString()}</td>
                                    <td className="py-2 font-bold">${(parseFloat(reserva.total) || 0).toFixed(2)}</td>
                                    <td className="py-2">
                                        <span
                                            className={`px-2 py-1 rounded text-xs ${
                                                reserva.estado === 'confirmada'
                                                    ? 'bg-green-100 text-green-800'
                                                    : reserva.estado === 'pendiente'
                                                      ? 'bg-yellow-100 text-yellow-800'
                                                      : reserva.estado === 'checkin_realizado'
                                                        ? 'bg-blue-200 text-blue-900'
                                                        : reserva.estado === 'checkout_realizado'
                                                          ? 'bg-gray-100 text-gray-800'
                                                          : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {reserva.estado?.replace('_', ' ') || 'N/A'}
                                        </span>
                                    </td>
                                </tr>
                            ))}

                            {(!stats?.ultimasReservas || stats.ultimasReservas.length === 0) && (
                                <tr>
                                    <td colSpan="6" className="text-center py-4 text-gray-500">
                                        No hay reservas recientes
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

