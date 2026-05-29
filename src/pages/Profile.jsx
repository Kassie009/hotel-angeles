import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const Profile = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    passwordActual: '',
    nuevaPassword: '',
    confirmarPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = sessionStorage.getItem('currentUser');
    if (!user) {
      navigate('/login');
      return;
    }
    
    const userData = JSON.parse(user);
    setCurrentUser(userData);
    
    // Cargar datos del usuario desde localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const fullUser = users.find(u => u.email === userData.email);
    
    if (fullUser) {
      setFormData({
        nombre: fullUser.nombre || '',
        email: fullUser.email || '',
        telefono: fullUser.telefono || '',
        passwordActual: '',
        nuevaPassword: '',
        confirmarPassword: ''
      });
    }
    setLoading(false);
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    
    if (formData.nuevaPassword) {
      if (formData.nuevaPassword.length < 6) {
        newErrors.nuevaPassword = 'La contraseña debe tener al menos 6 caracteres';
      }
      if (formData.nuevaPassword !== formData.confirmarPassword) {
        newErrors.confirmarPassword = 'Las contraseñas no coinciden';
      }
      if (!formData.passwordActual) {
        newErrors.passwordActual = 'Ingresa tu contraseña actual para cambiarla';
      }
    }
    
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Verificar contraseña actual si se quiere cambiar
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    
    if (userIndex === -1) {
      setErrors({ general: 'Usuario no encontrado' });
      return;
    }
    
    // Si quiere cambiar contraseña, verificar la actual
    if (formData.nuevaPassword) {
      if (users[userIndex].password !== formData.passwordActual) {
        setErrors({ passwordActual: 'Contraseña actual incorrecta' });
        return;
      }
    }
    
    // Actualizar datos
    const updatedUser = {
      ...users[userIndex],
      nombre: formData.nombre,
      telefono: formData.telefono
    };
    
    if (formData.nuevaPassword) {
      updatedUser.password = formData.nuevaPassword;
    }
    
    users[userIndex] = updatedUser;
    localStorage.setItem('users', JSON.stringify(users));
    
    // Actualizar sessionStorage
    sessionStorage.setItem('currentUser', JSON.stringify({
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      role: updatedUser.role
    }));
    
    setCurrentUser({
      id: updatedUser.id,
      nombre: updatedUser.nombre,
      email: updatedUser.email,
      role: updatedUser.role
    });
    
    setSuccessMessage('✅ Perfil actualizado correctamente');
    
    // Limpiar campos de contraseña
    setFormData({
      ...formData,
      passwordActual: '',
      nuevaPassword: '',
      confirmarPassword: ''
    });
    
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50 flex items-center justify-center">
        <p className="text-cafe-100">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <Breadcrumbs />
        
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-cafe-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <User size={40} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-cafe-900">Mi Perfil</h1>
            <p className="text-cafe-100 mt-2">Gestiona tu información personal</p>
          </div>
          
          {successMessage && (
            <div className="mb-6 bg-exito/20 text-exito p-3 rounded-lg flex items-center gap-2">
              <CheckCircle size={18} />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errors.general && (
            <div className="mb-6 bg-error/20 text-error p-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={`input pl-10 ${errors.nombre ? 'border-error' : ''}`}
                />
              </div>
              {errors.nombre && <p className="text-error text-xs mt-1">{errors.nombre}</p>}
            </div>
            
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="input pl-10 bg-gray-100 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-cafe-100 mt-1">El correo no se puede modificar</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-cafe-900 text-sm font-medium mb-1">Teléfono</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="input pl-10"
                  placeholder="+52 653 000 0000"
                />
              </div>
            </div>
            
            <div className="border-t border-beige-100 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-cafe-900 mb-4 flex items-center gap-2">
                <Lock size={18} /> Cambiar Contraseña
              </h3>
              <p className="text-sm text-cafe-100 mb-4">Deja los campos en blanco si no deseas cambiar tu contraseña</p>
              
              <div className="mb-4">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input
                    type="password"
                    name="passwordActual"
                    value={formData.passwordActual}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.passwordActual ? 'border-error' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.passwordActual && <p className="text-error text-xs mt-1">{errors.passwordActual}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input
                    type="password"
                    name="nuevaPassword"
                    value={formData.nuevaPassword}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.nuevaPassword ? 'border-error' : ''}`}
                    placeholder="•••••••• (mínimo 6 caracteres)"
                  />
                </div>
                {errors.nuevaPassword && <p className="text-error text-xs mt-1">{errors.nuevaPassword}</p>}
              </div>
              
              <div className="mb-4">
                <label className="block text-cafe-900 text-sm font-medium mb-1">Confirmar Nueva Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} />
                  <input
                    type="password"
                    name="confirmarPassword"
                    value={formData.confirmarPassword}
                    onChange={handleChange}
                    className={`input pl-10 ${errors.confirmarPassword ? 'border-error' : ''}`}
                    placeholder="••••••••"
                  />
                </div>
                {errors.confirmarPassword && <p className="text-error text-xs mt-1">{errors.confirmarPassword}</p>}
              </div>
            </div>
            
            <button type="submit" className="btn-primary w-full py-3 mt-6 flex items-center justify-center gap-2">
              <Save size={18} /> Guardar Cambios
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;