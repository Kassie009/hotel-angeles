import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const LoginRegister = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // ✅ Redirigir automáticamente si ya está logueado
  useEffect(() => {
    const user = sessionStorage.getItem('currentUser');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.role === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userData.role === 'recepcion') {
        navigate('/reception', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El correo es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    return newErrors;
  };

  const validateRegister = () => {
    const newErrors = {};
    if (!formData.nombre) newErrors.nombre = 'El nombre es requerido';
    if (!formData.email) newErrors.email = 'El correo es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Las contraseñas no coinciden';
    return newErrors;
  };

  // ✅ Redirección con replace para no volver atrás
  const redirectByRole = (role) => {
    if (role === 'admin') {
      navigate('/admin', { replace: true });
    } else if (role === 'recepcion') {
      navigate('/reception', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    
    if (isLogin) {
      const errors = validateLogin();
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find(u => u.email === formData.email && u.password === formData.password);
      
      if (user) {
        sessionStorage.setItem('currentUser', JSON.stringify({ 
          id: user.id,
          nombre: user.nombre, 
          email: user.email, 
          role: user.role || 'cliente'
        }));
        setSuccessMessage('¡Bienvenido de vuelta! Redirigiendo...');
        setTimeout(() => redirectByRole(user.role || 'cliente'), 1500);
      } else {
        setErrors({ general: 'Correo o contraseña incorrectos' });
      }
    } else {
      const errors = validateRegister();
      if (Object.keys(errors).length > 0) {
        setErrors(errors);
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userExists = users.find(u => u.email === formData.email);
      
      if (userExists) {
        setErrors({ general: 'Este correo ya está registrado' });
        return;
      }
      
      let role = 'cliente';
      if (formData.email === 'admin@prestige.com') {
        role = 'admin';
      } else if (formData.email === 'recepcion@prestige.com') {
        role = 'recepcion';
      }
      
      const newUser = {
        id: Date.now(),
        nombre: formData.nombre,
        email: formData.email,
        password: formData.password,
        role: role,
        fechaRegistro: new Date().toISOString(),
        activo: true
      };
      
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      sessionStorage.setItem('currentUser', JSON.stringify({ 
        id: newUser.id,
        nombre: newUser.nombre, 
        email: newUser.email, 
        role: newUser.role
      }));
      
      setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo...');
      setTimeout(() => redirectByRole(newUser.role), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <Breadcrumbs />
            
            <div className="flex gap-4 mb-8 border-b border-beige-200">
              <button onClick={() => { setIsLogin(true); setErrors({}); setSuccessMessage(''); }} className={`pb-3 px-4 text-lg font-semibold transition-all ${isLogin ? 'text-cafe-900 border-b-2 border-cafe-200' : 'text-cafe-100 hover:text-cafe-200'}`}>INICIAR SESIÓN</button>
              <button onClick={() => { setIsLogin(false); setErrors({}); setSuccessMessage(''); }} className={`pb-3 px-4 text-lg font-semibold transition-all ${!isLogin ? 'text-cafe-900 border-b-2 border-cafe-200' : 'text-cafe-100 hover:text-cafe-200'}`}>REGISTRARSE</button>
            </div>
            
            {successMessage && (<div className="mb-4 bg-exito/20 text-exito p-3 rounded-lg flex items-center gap-2"><CheckCircle size={18} /><span className="text-sm">{successMessage}</span></div>)}
            {errors.general && (<div className="mb-4 bg-error/20 text-error p-3 rounded-lg text-sm">{errors.general}</div>)}
            
            <form onSubmit={handleSubmit}>
              {!isLogin && (<div className="mb-4"><label className="block text-cafe-900 text-sm font-medium mb-1">Nombre Completo</label><div className="relative"><User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} /><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} className={`input pl-10 ${errors.nombre ? 'border-error' : ''}`} placeholder="Juan Pérez" /></div>{errors.nombre && <p className="text-error text-xs mt-1">{errors.nombre}</p>}</div>)}
              
              <div className="mb-4"><label className="block text-cafe-900 text-sm font-medium mb-1">Correo Electrónico</label><div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} /><input type="email" name="email" value={formData.email} onChange={handleChange} className={`input pl-10 ${errors.email ? 'border-error' : ''}`} placeholder="ejemplo@prestige.com" /></div>{errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}</div>
              
              <div className="mb-4"><label className="block text-cafe-900 text-sm font-medium mb-1">Contraseña</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} /><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className={`input pl-10 pr-10 ${errors.password ? 'border-error' : ''}`} placeholder="••••••••" /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-cafe-50 hover:text-cafe-100">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>{errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}</div>
              
              {!isLogin && (<div className="mb-6"><label className="block text-cafe-900 text-sm font-medium mb-1">Confirmar Contraseña</label><div className="relative"><Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cafe-50" size={18} /><input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`input pl-10 ${errors.confirmPassword ? 'border-error' : ''}`} placeholder="••••••••" /></div>{errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}</div>)}
              
              {isLogin && (<div className="text-right mb-6"><a href="#" className="text-sm text-cafe-100 hover:text-cafe-200">¿Olvidó su contraseña?</a></div>)}
              
              <button type="submit" className="btn-primary w-full py-3 flex items-center justify-center gap-2 group">{isLogin ? 'ACCEDER A MI CUENTA' : 'REGISTRARSE'} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></button>
            </form>
            
            {!isLogin && (<div className="mt-4 p-3 bg-beige-50 rounded-lg text-xs text-cafe-100"><p className="font-semibold mb-1">📋 Cuentas especiales para prueba:</p><p>• <strong>admin@prestige.com</strong> → Administrador</p><p>• <strong>recepcion@prestige.com</strong> → Recepcionista</p><p>• Cualquier otro email → Cliente</p></div>)}
          </div>
          
          <div className="hidden lg:flex relative bg-cafe-900 rounded-2xl overflow-hidden min-h-[550px]">
            <img src="https://images.trvl-media.com/lodging/105000000/104970000/104961800/104961798/a75c795f.jpg?impolicy=resizecrop&rw=598&ra=fit" alt="Prestige Inn" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative z-10 flex flex-col justify-center text-center text-white p-8 w-full">
              <h2 className="text-3xl font-bold mb-4">Bienvenido a su refugio</h2>
              <p className="text-beige-100 leading-relaxed">Experimente la calidez del desierto y el lujo de una hospitalidad meticulosa en San Luis Río Colorado.</p>
              <div className="mt-8 pt-8 border-t border-beige-100/20"><p className="text-sm text-beige-100">¿Primera vez?</p><p className="text-2xl font-bold mt-1">Prestige Inn</p><p className="text-sm text-beige-100 mt-2">Donde cada estancia se vuelve experiencia</p></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;