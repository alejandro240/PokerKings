import React, { useState } from 'react';
import { authService } from '../../services/auth';

function Register({ onRegisterSuccess, onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Llamar al servicio de registro
      const result = await authService.register(
        formData.username,
        formData.email,
        formData.password
      );

      if (result.success) {
        console.log('✅ Registro exitoso:', result.user);
        // Notificar al componente padre
        if (onRegisterSuccess) {
          onRegisterSuccess(result.user);
        }
      } else {
        setError(result.error || 'Error al crear la cuenta');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-body p-5">
              <h2 className="text-center mb-4">
                🎰 Crear Cuenta
              </h2>

              {/* Mostrar error si existe */}
              {error && (
                <div className="alert alert-danger" role="alert">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Nombre de usuario */}
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    👤 Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="Ej: PokerKing123"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="3"
                  />
                  <small className="text-muted">
                    Mínimo 3 caracteres
                  </small>
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    📧 Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                  <small className="text-muted">
                    Mínimo 6 caracteres
                  </small>
                </div>

                {/* Confirmar contraseña */}
                <div className="mb-3">
                  <label htmlFor="confirmPassword" className="form-label">
                    🔒 Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    minLength="6"
                  />
                </div>

                {/* Botón de registro */}
                <button
                  type="submit"
                  className="btn btn-success w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    '✨ Crear Cuenta'
                  )}
                </button>
              </form>

              {/* Botón para ir a login */}
              <div className="text-center">
                <p className="mb-2">¿Ya tienes cuenta?</p>
                <button
                  className="btn btn-outline-secondary"
                  onClick={onSwitchToLogin}
                  disabled={loading}
                >
                  Iniciar Sesión
                </button>
              </div>

              {/* Info de chips gratis */}
              <div className="alert alert-info mt-4 mb-0" role="alert">
                🎁 <strong>¡Bienvenida!</strong>
                <br />
                Comenzarás con <strong>1000 chips gratis</strong> para jugar
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
