import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, RefreshCw, XCircle, CheckCircle } from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs';
import api from '../Config/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'recepcion',
    activo: true
  });

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/users');
      
      
      let usuariosData = [];
      if (Array.isArray(response.data)) {
        usuariosData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        usuariosData = response.data.data;
      } else {
        usuariosData = [];
      }
      
      setUsers(usuariosData);
      setError(null);
    } catch {
      
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarUsuarios();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData);
        alert('Usuario actualizado correctamente');
      } else {
        await api.post('/users', formData);
        alert('Usuario creado correctamente');
      }
      
      cargarUsuarios();
      setShowModal(false);
      setEditingUser(null);
      setFormData({ nombre: '', email: '', password: '', rol: 'recepcion', activo: true });
    } catch (error) {
      
      alert(error.response?.data?.error || 'Error al guardar el usuario');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      nombre: user.nombre,
      email: user.email,
      password: '',
      rol: user.rol,
      activo: user.activo !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Eliminar al usuario ${user.nombre}?`)) {
      try {
        await api.delete(`/users/${user.id}`);
        alert('Usuario eliminado');
        cargarUsuarios();
      } catch {
        
        alert('Error al eliminar el usuario');
      }
    }
  };

  const toggleUserStatus = async (user) => {
    try {
      await api.put(`/users/${user.id}`, { ...user, activo: !user.activo });
      alert(`Usuario ${user.activo ? 'desactivado' : 'activado'}`);
      cargarUsuarios();
    } catch {
      
      alert('Error al cambiar estado');
    }
  };

  const resetPassword = async (user) => {
    if (window.confirm(`¿Restablecer contraseña de ${user.nombre} a "123456"?`)) {
      try {
        await api.put(`/users/${user.id}`, { ...user, password: '123456' });
        alert('Contraseña restablecida a: 123456');
        cargarUsuarios();
      } catch {
        
        alert('Error al restablecer contraseña');
      }
    }
  };

  const getRoleBadge = (rol) => {
    const roles = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-700' },
      recepcion: { label: 'Recepcionista', color: 'bg-blue-200 text-blue-800' }
    };
    const r = roles[rol] || roles.recepcion;
    return <span className={`text-xs px-2 py-1 rounded-full ${r.color}`}>{r.label}</span>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-200 mx-auto"></div>
            <p className="text-gray-700 mt-4">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige-50">
        <div className="container mx-auto px-4 py-8">
          <Breadcrumbs />
          <div className="bg-red-50 text-red-600 p-6 rounded-xl text-center">
            <p className="font-bold">{error}</p>
            <button 
              onClick={cargarUsuarios}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-beige-50">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs />
        
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gestión de Usuarios</h1>
            <p className="text-gray-700">Administra las cuentas del sistema</p>
          </div>
          <button
            onClick={() => { setEditingUser(null); setFormData({ nombre: '', email: '', password: '', rol: 'recepcion', activo: true }); setShowModal(true); }}
className="bg-cafe-200 hover:bg-cafe-100 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition"
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
                  <th className="px-4 py-3 text-left">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-8 text-gray-700">No hay usuarios registrados</td></tr>
                ) : (
                  users.map(user => (
                    <tr key={user.id} className="border-b border-beige-100 hover:bg-beige-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{user.nombre}</td>
                      <td className="px-4 py-3 text-gray-700">{user.email}</td>
                      <td className="px-4 py-3">{getRoleBadge(user.rol)}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const isActive = Number(user.activo) === 1;
                          return (
                            <span className={`text-xs px-2 py-1 rounded-full ${isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                              {isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(user)} className="text-gray-700 hover:text-blue-800 transition-colors" title="Editar"><Edit size={18} /></button>
                          <button onClick={() => resetPassword(user)} className="text-gray-700 hover:text-blue-800 transition-colors" title="Restablecer contraseña"><RefreshCw size={18} /></button>
                          <button onClick={() => toggleUserStatus(user)} className={`transition-colors ${user.activo !== false ? 'text-yellow-500 hover:text-yellow-600' : 'text-green-500 hover:text-green-600'}`} title={user.activo !== false ? 'Desactivar' : 'Activar'}>{user.activo !== false ? <XCircle size={18} /> : <CheckCircle size={18} />}</button>
                          <button onClick={() => handleDelete(user)} className="text-red-500 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
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
      
     
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3"><label className="block text-gray-900 text-sm font-medium mb-1">Nombre Completo</label><input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required className="w-full px-4 py-2 border border-beige-200 rounded-xl" /></div>
              <div className="mb-3"><label className="block text-gray-900 text-sm font-medium mb-1">Correo Electrónico</label><input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2 border border-beige-200 rounded-xl" /></div>
              <div className="mb-3"><label className="block text-gray-900 text-sm font-medium mb-1">{editingUser ? 'Nueva Contraseña (dejar vacío para mantener)' : 'Contraseña'}</label><input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-4 py-2 border border-beige-200 rounded-xl" placeholder={editingUser ? 'Dejar vacío para mantener' : '123456'} /></div>
              <div className="mb-3"><label className="block text-gray-900 text-sm font-medium mb-1">Rol</label><select name="rol" value={formData.rol} onChange={handleChange} className="w-full px-4 py-2 border border-beige-200 rounded-xl"><option value="recepcion">Recepcionista</option><option value="admin">Administrador</option></select></div>
              <div className="mb-4 flex items-center gap-2"><input type="checkbox" checked={formData.activo} onChange={(e) => setFormData({ ...formData, activo: e.target.checked })} className="w-4 h-4" /><label className="text-gray-900 text-sm">Usuario activo</label></div>
              <div className="flex gap-3"><button type="button" onClick={() => { setShowModal(false); setEditingUser(null); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 py-2 rounded-lg">Cancelar</button><button type="submit" className="flex-1 bg-cafe-200 hover:bg-cafe-100 text-white py-2 rounded-lg">{editingUser ? 'Guardar Cambios' : 'Crear Usuario'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;