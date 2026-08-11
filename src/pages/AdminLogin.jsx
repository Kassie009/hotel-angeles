import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const { login, user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated() && user) {
            if (user.rol === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.rol === 'recepcion') {
                navigate('/recepcion/dashboard', { replace: true });
            }
        }
    }, [user, isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (attempts >= 5) {
            setError('Demasiados intentos. Espera 15 minutos.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(email, password);
            
            if (result.success) {
                setAttempts(0);
                if (result.user?.rol === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                } else if (result.user?.rol === 'recepcion') {
                    navigate('/recepcion/dashboard', { replace: true });
                }
            } else {
                setAttempts(prev => prev + 1);
                setError(result.message || 'Error al iniciar sesión');
            }
        } catch {
            setAttempts(prev => prev + 1);
            setError('Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600">
            {/* Efectos difuminados de fondo */}
            <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-40"></div>
            <div className="absolute top-1/3 -right-24 w-[28rem] h-[28rem] bg-sky-400 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-300 rounded-full blur-3xl opacity-20"></div>

            <div className="relative bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Hotel Angeles</h1>
                    <p className="text-gray-700 mt-2">Panel Administrativo</p>
                    <p className="text-xs text-gray-500 mt-1">Acceso restringido al personal autorizado</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-200"
                            placeholder="admin@prestige.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-200"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || attempts >= 5}
className="w-full bg-cafe-200 hover:bg-cafe-100 text-white py-2 px-4 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </button>
                </form>

                <p className="text-center text-xs text-gray-400 mt-6">
                    Este acceso es exclusivo para el personal autorizado
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;