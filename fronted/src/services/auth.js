// Auth Service - Manejo de autenticación y sesión
import { authAPI } from './api';
import { socketService } from './socket';

export const authService = {
  // Registrarse
  register: async (username, email, password) => {
    try {
      const response = await authAPI.register(username, email, password);
      const { token, user } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Conectar Socket.IO con el token
      socketService.connect(token);

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error en el registro',
      };
    }
  },

  // Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Conectar Socket.IO con el token
      socketService.connect(token);

      return { success: true, user, token };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error en el inicio de sesión',
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obtener token
  getToken: () => localStorage.getItem('token'),

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    socketService.disconnect();
  },

  // Obtener perfil actual del servidor
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data;
      
      // Actualizar en localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Error al obtener perfil',
      };
    }
  },

  // Renovar token (si el servidor lo requiere)
  refreshToken: async () => {
    try {
      const response = await authAPI.getProfile();
      const { token } = response.data;
      
      if (token) {
        localStorage.setItem('token', token);
      }
      
      return { success: true };
    } catch (error) {
      // Si falla, el usuario debe loguearse de nuevo
      authService.logout();
      return { success: false };
    }
  },
};

// Inicializar Socket.IO si hay sesión activa al cargar
if (authService.isAuthenticated()) {
  socketService.connect(authService.getToken());
}

export default authService;
