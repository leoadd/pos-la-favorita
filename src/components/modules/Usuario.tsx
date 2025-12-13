import { useState } from 'react';
import { AppContextType } from '../../App';
import { User, Mail, Shield, Calendar, Edit3, Check } from 'lucide-react';

export function Usuario({ appContext }: { appContext: AppContextType }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(appContext.currentUser?.name || '');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Usuario</h2>
          <p className="text-gray-500">Información de la cuenta</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-gray-900 to-gray-700"></div>
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-12 mb-6">
              <div className="w-24 h-24 bg-black rounded-full border-4 border-white flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
              <div className="flex-1 pt-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-2xl px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black mb-1"
                  />
                ) : (
                  <h3 className="text-2xl mb-1">{appContext.currentUser?.name}</h3>
                )}
                <p className="text-gray-500">@{appContext.currentUser?.username}</p>
              </div>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Check className="w-5 h-5" />
                  Guardar
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:border-black transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                  Editar
                </button>
              )}
            </div>

            {showSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg text-center">
                Información actualizada exitosamente
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Correo electrónico</div>
                  <div>{appContext.currentUser?.username}@lafavorita.com</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Rol</div>
                  <div>{appContext.currentUser?.role}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Fecha de registro</div>
                  <div>01 de Enero, 2025</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Activo
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Stats */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-xl mb-6">Estadísticas de Actividad</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{appContext.sales.length}</div>
              <div className="text-gray-500">Ventas Realizadas</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">{appContext.products.length}</div>
              <div className="text-gray-500">Productos Gestionados</div>
            </div>
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div className="text-3xl mb-2">
                ${appContext.sales.reduce((sum, s) => sum + s.total, 0).toFixed(0)}
              </div>
              <div className="text-gray-500">Total Vendido</div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xl mb-6">Seguridad</h3>
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
              <div className="text-left">
                <div className="mb-1">Cambiar contraseña</div>
                <div className="text-sm text-gray-500">Última actualización: Hace 30 días</div>
              </div>
              <Edit3 className="w-5 h-5 text-gray-400" />
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
              <div className="text-left">
                <div className="mb-1">Autenticación de dos factores</div>
                <div className="text-sm text-gray-500">No configurado</div>
              </div>
              <div className="text-sm text-gray-400">Configurar →</div>
            </button>

            <button className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-black transition-colors">
              <div className="text-left">
                <div className="mb-1">Sesiones activas</div>
                <div className="text-sm text-gray-500">1 sesión activa</div>
              </div>
              <div className="text-sm text-gray-400">Ver todas →</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
