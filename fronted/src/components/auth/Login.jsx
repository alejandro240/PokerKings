import React, { useState } from 'react';
import { authService } from '../../services/auth';

function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Llamar al servicio de autenticación
      const result = await authService.login(email, password);

      if (result.success) {
        console.log('✅ Login exitoso:', result.user);
        // Notificar al componente padre
        if (onLoginSuccess) {
          onLoginSuccess(result.user);
        }
      } else {
        setError(result.error || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('Error en login:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Login rápido para pruebas
  const handleQuickLogin = async (userNumber) => {
    setLoading(true);
    const result = await authService.login(
      `jugador${userNumber}@pokerkings.com`,
      'password123'
    );
    if (result.success) {
      onLoginSuccess(result.user);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">
                🎰 Iniciar Sesión
              </h2>

              {/* Mostrar error si existe */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Contraseña */}
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    🔒 Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                {/* Botón de login */}
                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    '🎮 Iniciar Sesión'
                  )}
                </button>
              </form>

              {/* Botón para ir a registro */}
              <div className="text-center">
                <p className="mb-2">¿No tienes cuenta?</p>
                <button
                  className="btn btn-outline-secondary"
                  onClick={onSwitchToRegister}
                  disabled={loading}
                >
                  Crear Cuenta Nueva
                </button>
              </div>

              {/* Login rápido para pruebas */}
              <hr className="my-4" />
              <div className="text-center">
                <p className="text-muted small mb-2">🧪 Pruebas rápidas:</p>
                <div className="d-flex gap-2 justify-content-center">
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleQuickLogin(1)}
                    disabled={loading}
                  >
                    Jugador 1
                  </button>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleQuickLogin(2)}
                    disabled={loading}
                  >
                    Jugador 2
                  </button>
                  <button
                    className="btn btn-sm btn-outline-info"
                    onClick={() => handleQuickLogin(3)}
                    disabled={loading}
                  >
                    Jugador 3
                  </button>
                </div>
                <p className="text-muted small mt-2">
                  (jugador1@pokerkings.com / password123)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
