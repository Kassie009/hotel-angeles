import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Edit, Trash2, Power, Shield, UserCog, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    role: 'cliente',
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = () => {
    const stored = JSON.parse(localStorage.getItem('users') || '[]');
    setUsers(stored);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingUser) {
      // Editar usuario existente
      const updatedUsers = users.map(u => 
        u.id === editingUser.id 
          ? { ...u, ...formData, password: formData.password || u.password }
          : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert('Usuario actualizado correctamente');
    } else {
      // Crear nuevo usuario
      const userExists = users.find(u => u.email === formData.email);
      if (userExists) {
        alert('Ya existe un usuario con este correo');
        return;
      }
      
      const newUser = {
        id: Date.now(),
        ...formData,
        password: formData.password || '123456',
        fechaRegistro: new Date().toISOString()
      };
      
      const updatedUsers = [...users, newUser];
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert('Usuario creado correctamente');
    }
    
    cargarUsuarios();
    setShowModal(false);
    setEditingUser(null);
    setFormData({ nombre: '', email: '', password: '', role: 'cliente', activo: true });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      role: user.role,
      activo: user.activo !== false
    });
    setShowModal(true);
  };

  const handleDelete = (user) => {
    if (window.confirm(`¿Eliminar al usuario ${user.nombre}? Esta acción no se puede deshacer.`)) {
      const updatedUsers = users.filter(u => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      cargarUsuarios();
      alert('Usuario eliminado');
    }
  };

  const toggleUserStatus = (user) => {
    const updatedUsers = users.map(u =>
      u.id === user.id ? { ...u, activo: u.activo === false } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    cargarUsuarios();
    alert(`Usuario ${user.activo === false ? 'activado' : 'desactivado'}`);
  };

  const resetPassword = (user) => {
    if (window.confirm(`¿Restablecer contraseña de ${user.nombre} a "123456"?`)) {
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, password: '123456' } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      alert('Contraseña restablecida a: 123456');
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-700' },
      recepcion: { label: 'Recepcionista', color: 'bg-blue-100 text-blue-700' },
      cliente: { label: 'Cliente', color: 'bg-green-100 text-green-700' }
    };
    const r = roles[role] || roles.cliente;
    return <span className={`text-xs px-2 py-1 rounded-full ${r.color}`}>{r.label}</span>;
  };

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-cafe-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-cafe-100">Administra las cuentas de empleados y clientes del sistema</p>
          </div>
          <button
            onClick={() => { setEditingUser(null); setFormData({ nombre: '', email: '', password: '', role: 'cliente', activo: true }); setShowModal(true); }}
            className="bg-cafe-200 hover:bg-cafe-100 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all"
          >
            <UserPlus size={18} /> Nuevo Usuario
          </button>
        </div>
        
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cafe-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-left">Estado</th>
                  <th className="px-4 py-3 text-left">Fecha Registro</th>
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center py-8 text-cafe-100">No hay usuarios registrados</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-beige-100 hover:bg-beige-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-cafe-900">{user.nombre}</td>
                      <td className="px-4 py-3 text-cafe-100">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${user.activo !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.activo !== false ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-cafe-100">{new Date(user.fechaRegistro).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(user)} className="text-cafe-100 hover:text-cafe-200 transition-colors" title="Editar"><Edit size={18} /></button>
                          <button onClick={() => resetPassword(user)} className="text-cafe-100 hover:text-cafe-200 transition-colors" title="Restablecer contraseña"><RefreshCw size={18} /></button>
                          <button onClick={() => toggleUserStatus(user)} className={`transition-colors ${user.activo !== false ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`} title={user.activo !== false ? 'Desactivar' : 'Activar'}>{user.activo !== false ? <XCircle size={18} /> : <CheckCircle size={18} />}</button>
                          <button onClick={() => handleDelete(user)} className="text-error hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                        </div>
                       </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Modal de Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-cafe-900 mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-cafe-900 text-sm font-medium mb-1">Nombre Completo</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="input" /></div>
              <div className="mb-3"><label className="block text-cafe-900 text-sm font-medium mb-1">Correo Electrónico</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="input" /></div>
              <div className="mb-3"><label className="block text-cafe-900 text-sm font-medium mb-1">{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="input" placeholder={editingUser ? 'Dejar vacío para mantener' : '123456'} /></div>
              <div className="mb-3"><label className="block text-cafe-900 text-sm font-medium mb-1">Rol</label><select name="role" value={formData.role} onChange={handleChange} className="input"><option value="cliente">Cliente</option><option value="recepcion">Recepcionista</option><option value="admin">Administrador</option></select></div>
              <div className="mb-4 flex items-center gap-2"><input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} className="w-4 h-4" /><label className="text-cafe-900 text-sm">Usuario activo</label></div>
              <div className="flex gap-3"><button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-cafe-900 py-2 rounded-lg">Cancelar</button><button type="submit" className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg">{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;