import { useState } from 'react';
import { Store, ArrowLeft, Lock, Key, AlertCircle } from 'lucide-react';
import { User } from '../App';

type LoginProps = {
  onLogin: (username: string, password: string) => boolean;
  users: User[];
  setUsers: (users: User[]) => void;
};

export function Login({ onLogin, users, setUsers }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPasswordRecovery, setShowPasswordRecovery] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState<'username' | 'questions' | 'newPassword'>('username');
  const [recoveryUsername, setRecoveryUsername] = useState('');
  const [answers, setAnswers] = useState({ answer1: '', answer2: '', answer3: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryError, setRecoveryError] = useState('');
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Por favor ingresa usuario y contraseña');
      return;
    }
    
    const success = onLogin(username, password);
    
    if (!success) {
      setError('Usuario o contraseña incorrectos');
    }
  };

  const handleOpenRecovery = () => {
    setShowPasswordRecovery(true);
    setRecoveryStep('username');
    setRecoveryUsername('');
    setAnswers({ answer1: '', answer2: '', answer3: '' });
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryError('');
    setCurrentAdmin(null);
  };

  const handleCloseRecovery = () => {
    setShowPasswordRecovery(false);
    setRecoveryStep('username');
    setRecoveryUsername('');
    setAnswers({ answer1: '', answer2: '', answer3: '' });
    setNewPassword('');
    setConfirmPassword('');
    setRecoveryError('');
    setCurrentAdmin(null);
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError('');
    
    if (recoveryStep === 'username') {
      const user = users.find(u => u.username === recoveryUsername);
      
      if (!user) {
        setRecoveryError('Usuario no encontrado');
        return;
      }
      
      if (user.role !== 'admin') {
        setRecoveryError('Solo el administrador puede recuperar su contraseña aquí. Los empleados deben contactar al administrador.');
        return;
      }
      
      if (!user.securityQuestions) {
        setRecoveryError('Este usuario no tiene preguntas de seguridad configuradas');
        return;
      }
      
      setCurrentAdmin(user);
      setRecoveryStep('questions');
    } else if (recoveryStep === 'questions') {
      if (!currentAdmin || !currentAdmin.securityQuestions) {
        setRecoveryError('Error interno');
        return;
      }
      
      // Validar las 3 respuestas (deben ser en minúsculas)
      const correctAnswer1 = currentAdmin.securityQuestions.answer1.toLowerCase();
      const correctAnswer2 = currentAdmin.securityQuestions.answer2.toLowerCase();
      const correctAnswer3 = currentAdmin.securityQuestions.answer3.toLowerCase();
      
      const userAnswer1 = answers.answer1.toLowerCase().trim();
      const userAnswer2 = answers.answer2.toLowerCase().trim();
      const userAnswer3 = answers.answer3.toLowerCase().trim();
      
      if (userAnswer1 !== correctAnswer1 || userAnswer2 !== correctAnswer2 || userAnswer3 !== correctAnswer3) {
        setRecoveryError('Una o más respuestas son incorrectas. Intenta nuevamente.');
        setAnswers({ answer1: '', answer2: '', answer3: '' });
        return;
      }
      
      setRecoveryStep('newPassword');
    } else if (recoveryStep === 'newPassword') {
      if (!currentAdmin) {
        setRecoveryError('Error interno');
        return;
      }
      
      if (!newPassword || newPassword.length < 6) {
        setRecoveryError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setRecoveryError('Las contraseñas no coinciden');
        return;
      }
      
      // Actualizar la contraseña del administrador
      const updatedUsers = users.map(u => 
        u.username === currentAdmin.username ? { ...u, password: newPassword } : u
      );
      setUsers(updatedUsers);
      
      // Cerrar modal y auto-llenar el login
      setShowPasswordRecovery(false);
      setUsername(currentAdmin.username);
      setPassword(newPassword);
      setError('');
      
      // Mostrar mensaje de éxito
      alert('Contraseña actualizada correctamente. Ahora puedes iniciar sesión.');
    }
  };

  if (showPasswordRecovery) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 mb-6 shadow-lg">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl mb-3 tracking-tight">Recuperar Contraseña</h1>
            <p className="text-gray-500">
              {recoveryStep === 'username' && 'Ingresa tu nombre de usuario'}
              {recoveryStep === 'questions' && 'Responde las preguntas de seguridad'}
              {recoveryStep === 'newPassword' && 'Crea tu nueva contraseña'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <button
              onClick={handleCloseRecovery}
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio de sesión
            </button>

            <form onSubmit={handleRecoverySubmit} className="space-y-5">
              {/* Paso 1: Username */}
              {recoveryStep === 'username' && (
                <div>
                  <label htmlFor="recoveryUsername" className="block text-sm mb-2 text-gray-700">
                    Nombre de Usuario
                  </label>
                  <input
                    id="recoveryUsername"
                    type="text"
                    value={recoveryUsername}
                    onChange={(e) => setRecoveryUsername(e.target.value)}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                    placeholder="Ingresa tu usuario"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Solo el administrador puede recuperar su contraseña aquí
                  </p>
                </div>
              )}

              {/* Paso 2: Security Questions */}
              {recoveryStep === 'questions' && currentAdmin?.securityQuestions && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex gap-2">
                      <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-800">
                        Responde las 3 preguntas de seguridad. Las respuestas deben estar en <strong>minúsculas</strong>.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      1. {currentAdmin.securityQuestions.question1}
                    </label>
                    <input
                      type="text"
                      value={answers.answer1}
                      onChange={(e) => setAnswers({ ...answers, answer1: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                      placeholder="Respuesta en minúsculas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      2. {currentAdmin.securityQuestions.question2}
                    </label>
                    <input
                      type="text"
                      value={answers.answer2}
                      onChange={(e) => setAnswers({ ...answers, answer2: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                      placeholder="Respuesta en minúsculas"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2 text-gray-700">
                      3. {currentAdmin.securityQuestions.question3}
                    </label>
                    <input
                      type="text"
                      value={answers.answer3}
                      onChange={(e) => setAnswers({ ...answers, answer3: e.target.value })}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                      placeholder="Respuesta en minúsculas"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Paso 3: New Password */}
              {recoveryStep === 'newPassword' && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-green-800">
                      ✓ Respuestas correctas. Ahora puedes crear tu nueva contraseña.
                    </p>
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm mb-2 text-gray-700">
                      Nueva Contraseña
                    </label>
                    <input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm mb-2 text-gray-700">
                      Confirmar Contraseña
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                      placeholder="Repite la contraseña"
                      required
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 mt-6"
              >
                {recoveryStep === 'username' && 'Continuar'}
                {recoveryStep === 'questions' && 'Verificar Respuestas'}
                {recoveryStep === 'newPassword' && 'Cambiar Contraseña'}
              </button>

              {recoveryError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{recoveryError}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          <p className="text-center text-gray-400 text-sm mt-8">
            Sistema de Punto de Venta • Versión 1.0.0
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 mb-6 shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl mb-3 tracking-tight">La Favorita</h1>
          <p className="text-gray-500">Inicia sesión en tu cuenta</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm mb-2 text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm text-gray-700">
                  Contraseña
                </label>
                <button
                  type="button"
                  onClick={handleOpenRecovery}
                  className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
                >
                  ¿Olvidó su contraseña?
                </button>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-gray-900 focus:bg-white transition-all"
                placeholder="Ingresa tu contraseña"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white py-3.5 rounded-xl hover:shadow-lg transition-all duration-200 mt-6"
            >
              Iniciar Sesión
            </button>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center text-sm">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-3 text-center">Credenciales de prueba:</p>
            <div className="space-y-2 text-xs text-gray-600 bg-gray-50 p-4 rounded-xl">
              <div><strong>Admin:</strong> admin / admin123</div>
              <div><strong>Empleado:</strong> empleado1 / emp123</div>
              <div className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-200">
                <strong>Preguntas de seguridad (admin):</strong>
                <div className="mt-1">1. mango</div>
                <div>2. guadalajara</div>
                <div>3. firulais</div>
              </div>
              <div className="text-xs text-orange-600 mt-3 pt-3 border-t border-orange-200 bg-orange-50 p-2 rounded">
                <strong>⚠️ Si el módulo de recuperación no funciona:</strong><br/>
                Abre la consola del navegador (F12) y ejecuta:<br/>
                <code className="bg-white px-2 py-1 rounded mt-1 block">localStorage.clear(); location.reload();</code>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm mt-8">
          Sistema de Punto de Venta • Versión 1.0.0
        </p>
      </div>
    </div>
  );
}