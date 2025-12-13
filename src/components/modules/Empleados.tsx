import { useState } from 'react';
import { AppContextType, User } from '../../App';
import { Users, Plus, Edit3, Trash2, Shield, User as UserIcon, Key, Save, X } from 'lucide-react';

export function Empleados({ appContext }: { appContext: AppContextType }) {
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'employee' as 'admin' | 'employee',
  });
  const [editFormData, setEditFormData] = useState<User | null>(null);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verificar si el username ya existe
    if (appContext.users.find(u => u.username === formData.username)) {
      alert('Este nombre de usuario ya existe');
      return;
    }

    const newUser: User = {
      username: formData.username,
      password: formData.password,
      name: formData.name,
      role: formData.role,
    };

    appContext.setUsers([...appContext.users, newUser]);
    setFormData({
      username: '',
      password: '',
      name: '',
      role: 'employee',
    });
    setShowForm(false);
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setEditFormData({ ...user });
    setShowPasswordFields(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editFormData) return;

    // Verificar si el username ya existe (excepto el usuario actual)
    if (editFormData.username !== editingUser?.username) {
      if (appContext.users.find(u => u.username === editFormData.username)) {
        alert('Este nombre de usuario ya existe');
        return;
      }
    }

    // Si está cambiando la contraseña, validar
    if (showPasswordFields) {
      if (!newPassword || newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      if (newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }
      editFormData.password = newPassword;
    }

    // Actualizar el usuario
    const updatedUsers = appContext.users.map(u => 
      u.username === editingUser?.username ? editFormData : u
    );
    appContext.setUsers(updatedUsers);
    
    // Cerrar modal
    setEditingUser(null);
    setEditFormData(null);
    setShowPasswordFields(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const deleteUser = (username: string) => {
    if (username === appContext.currentUser?.username) {
      alert('No puedes eliminar tu propia cuenta');
      return;
    }
    if (confirm('¿Estás seguro de eliminar este empleado?')) {
      appContext.setUsers(appContext.users.filter(u => u.username !== username));
    }
  };

  // Solo el admin puede ver este módulo
  if (appContext.currentUser?.role !== 'admin') {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-xl">No tienes permisos para acceder a este módulo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gray-900 p-4 overflow-hidden">
      <div className="h-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl mb-1 tracking-tight">Gestión de Empleados</h2>
              <p className="text-gray-500 text-base">Administra usuarios del sistema</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-5 py-2.5 text-base bg-gradient-to-r from-gray-900 to-gray-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Nuevo
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {showForm && (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
              <h3 className="text-xl mb-4 font-medium">Agregar Empleado</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700 text-base">Nombre Completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-base">Usuario</label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-base">Contraseña</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-base">Rol</label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'employee' })}
                      className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                    >
                      <option value="employee">Empleado</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-2.5 text-base rounded-xl hover:shadow-lg transition-all"
                  >
                    Guardar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2.5 text-base border border-gray-300 rounded-xl hover:border-gray-900 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {appContext.users.map((user) => (
              <div key={user.username} className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-5 hover:border-gray-900 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${user.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' : 'bg-gradient-to-br from-blue-500 to-blue-700'} rounded-xl flex items-center justify-center shadow-lg`}>
                      {user.role === 'admin' ? (
                        <Shield className="w-6 h-6 text-white" />
                      ) : (
                        <UserIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{user.name}</h3>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEditUser(user)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar usuario"
                    >
                      <Edit3 className="w-4 h-4 text-blue-500" />
                    </button>
                    {user.username !== appContext.currentUser?.username && (
                      <button
                        onClick={() => deleteUser(user.username)}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                  </span>
                  {user.role === 'admin' && user.securityQuestions && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <Key className="w-3 h-3" />
                      <span>Preguntas configuradas</span>
                    </div>
                  )}
                  {user.role === 'admin' && !user.securityQuestions && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <Key className="w-3 h-3" />
                      <span>Sin preguntas de seguridad</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Edición */}
      {editingUser && editFormData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-3xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-medium">Editar Usuario</h2>
                  <p className="text-gray-500 text-sm mt-1">@{editingUser.username}</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setEditFormData(null);
                    setShowPasswordFields(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              {/* Información Básica */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Información Básica
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">Nombre Completo</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">Nombre de Usuario</label>
                    <input
                      type="text"
                      value={editFormData.username}
                      onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-2 text-gray-700 text-sm">Rol</label>
                    <select
                      value={editFormData.role}
                      onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as 'admin' | 'employee' })}
                      className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                    >
                      <option value="employee">Empleado</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <div>
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Contraseña
                </h3>
                {!showPasswordFields ? (
                  <button
                    type="button"
                    onClick={() => setShowPasswordFields(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    Cambiar contraseña
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-2 text-gray-700 text-sm">Nueva Contraseña</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>
                      <div>
                        <label className="block mb-2 text-gray-700 text-sm">Confirmar Contraseña</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                          placeholder="Repite la contraseña"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordFields(false);
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Cancelar cambio de contraseña
                    </button>
                  </div>
                )}
              </div>

              {/* Preguntas de Seguridad - Solo para Admin */}
              {editFormData.role === 'admin' && (
                <div>
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Preguntas de Seguridad
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      Las respuestas deben estar en <strong>minúsculas</strong> para mayor seguridad.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-gray-700 text-sm">Pregunta 1</label>
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.question1 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            question1: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 mb-2"
                        placeholder="Ej: ¿Cuál es tu fruta favorita?"
                      />
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.answer1 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            answer1: e.target.value.toLowerCase()
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                        placeholder="Respuesta en minúsculas"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700 text-sm">Pregunta 2</label>
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.question2 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            question2: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 mb-2"
                        placeholder="Ej: ¿En qué ciudad naciste?"
                      />
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.answer2 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            answer2: e.target.value.toLowerCase()
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                        placeholder="Respuesta en minúsculas"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-gray-700 text-sm">Pregunta 3</label>
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.question3 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            question3: e.target.value
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900 mb-2"
                        placeholder="Ej: ¿Cuál es el nombre de tu mascota?"
                      />
                      <input
                        type="text"
                        value={editFormData.securityQuestions?.answer3 || ''}
                        onChange={(e) => setEditFormData({
                          ...editFormData,
                          securityQuestions: {
                            ...(editFormData.securityQuestions || { question1: '', answer1: '', question2: '', answer2: '', question3: '', answer3: '' }),
                            answer3: e.target.value.toLowerCase()
                          }
                        })}
                        className="w-full px-4 py-2.5 text-base bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:border-gray-900"
                        placeholder="Respuesta en minúsculas"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3 text-base rounded-xl hover:shadow-lg transition-all"
                >
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setEditFormData(null);
                    setShowPasswordFields(false);
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="px-6 py-3 text-base border border-gray-300 rounded-xl hover:border-gray-900 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
