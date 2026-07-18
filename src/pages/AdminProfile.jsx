import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../Config/api';
import { User, Mail, Shield, Key } from 'lucide-react';

const AdminProfile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            
            setMessage({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.error || 'Error al cambiar la contraseña' 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value
        });
    };

    const getRolLabel = (rol) => {
        const roles = {
            admin: 'Administrador',
            recepcion: 'Recepcionista'
        };
        return roles[rol] || rol;
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-cafe-900">Mi Perfil</h1>
                <p className="text-cafe-100">Gestiona tu información personal</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-lg font-bold text-cafe-900 mb-4">Información Personal</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-beige-50 rounded-lg">
                        <User size={20} className="text-cafe-200" />
                        <div>
                            <p className="text-xs text-cafe-100">Nombre</p>
                            <p className="font-medium text-cafe-900">{user?.nombre || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-beige-50 rounded-lg">
                        <Mail size={20} className="text-cafe-200" />
                        <div>
                            <p className="text-xs text-cafe-100">Email</p>
                            <p className="font-medium text-cafe-900">{user?.email || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-beige-50 rounded-lg">
                        <Shield size={20} className="text-cafe-200" />
                        <div>
                            <p className="text-xs text-cafe-100">Rol</p>
                            <p className="font-medium text-cafe-900">{getRolLabel(user?.rol)}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-lg font-bold text-cafe-900 mb-4 flex items-center gap-2">
                    <Key size={20} /> Cambiar Contraseña
                </h2>
                
                {message && (
                    <div className={`p-3 rounded-lg mb-4 ${
                        message.type === 'success' 
                            ? 'bg-green-50 text-green-600 border border-green-200' 
                            : 'bg-red-50 text-red-600 border border-red-200'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handlePasswordChange}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña actual
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-200 focus:border-transparent"
                            placeholder="Ingresa tu contraseña actual"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nueva contraseña
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-200 focus:border-transparent"
                            placeholder="Nueva contraseña (mínimo 6 caracteres)"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar nueva contraseña
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cafe-200 focus:border-transparent"
                            placeholder="Confirma tu nueva contraseña"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-cafe-200 hover:bg-cafe-100 text-white py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminProfile;