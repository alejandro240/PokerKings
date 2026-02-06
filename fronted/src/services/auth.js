// Auth Service - Manejo de autenticación y sesión
import { authAPI } from './api';
import { socketService } from './socket';

export const authService = {
  // Registrarse (Frontend-only con mock)
  register: async (username, email, password, avatar = '🎮') => {
    try {
      // Intentar registro real con backend
      const response = await authAPI.register(username, email, password, avatar);
      const { token, user } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Conectar Socket.IO con el token (solo si backend está disponible)
      try {
        socketService.connect(token);
      } catch (err) {
        console.warn('Socket.IO no disponible');
      }

      return { success: true, user, token };
    } catch (error) {
      // Si falla la conexión, usar registro mock (frontend-only)
      console.warn('Backend no disponible, usando registro mock');
      
      // Crear usuario mock
      const mockUser = {
        id: Date.now(),
        username: username,
        email: email,
        chips: 1000,
        avatar: avatar || '🎮',
        level: 1
      };
      const mockToken = 'mock-token-' + Date.now();

      // Guardar en localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      return { success: true, user: mockUser, token: mockToken };
    }
  },

  // Iniciar sesión (con fallback a mock)
  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Guardar en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Conectar Socket.IO con el token (solo si backend está disponible)
      try {
        socketService.connect(token);
      } catch (err) {
        console.warn('Socket.IO no disponible');
      }

      return { success: true, user, token };
    } catch (error) {
      // Si el backend falla, buscar usuario mock en localStorage
      console.warn('Backend login falló, intentando con usuario mock local');
      
      const storedUser = localStorage.getItem('user');
      const storedToken = localStorage.getItem('token');
      
      // Si hay un usuario guardado localmente con el mismo email, usar ese
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.email === email) {
          console.log('✅ Login exitoso con usuario mock:', user);
          return { success: true, user, token: storedToken };
        }
      }
      
      // Si no hay usuario local, retornar error
      return {
        success: false,
        error: 'Usuario o contraseña incorrectos',
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsedUser = JSON.parse(user);
      // Asegurar que el usuario tenga nivel por defecto si no lo tiene
      if (!parsedUser.level) {
        parsedUser.level = 1;
      }
      return parsedUser;
    }
    return null;
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

// No inicializar Socket.IO automáticamente - solo cuando el usuario haga login
// if (authService.isAuthenticated()) {
//   socketService.connect(authService.getToken());
// }

export default authService;
