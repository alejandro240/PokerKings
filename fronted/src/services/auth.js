// Auth Service - Manejo de autenticación y sesión
import { authAPI } from './api';
import { socketService } from './socket';

export const authService = {
  // Registrarse (Frontend-only con mock)
  register: async (username, email, password) => {
    try {
      // Intentar registro real con backend
      const response = await authAPI.register(username, email, password);
      const { token, user } = response.data;

      // Guardar en sessionStorage (por pestaña)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));

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
        avatar: '🎮',
        level: 1
      };
      const mockToken = 'mock-token-' + Date.now();

      // Guardar en sessionStorage (por pestaña)
      sessionStorage.setItem('token', mockToken);
      sessionStorage.setItem('user', JSON.stringify(mockUser));

      return { success: true, user: mockUser, token: mockToken };
    }
  },

  // Iniciar sesión (con fallback a mock)
  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      // Guardar en sessionStorage (por pestaña)
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(user));

      // Conectar Socket.IO con el token (solo si backend está disponible)
      try {
        socketService.connect(token);
      } catch (err) {
        console.warn('Socket.IO no disponible');
      }

      return { success: true, user, token };
    } catch (error) {
      // Log detallado del error
      console.error('❌ Error de login en backend:');
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      console.error('   Message:', error.message);
      
      // Si el backend falla, buscar usuario mock en localStorage
      console.warn('Intentando con usuario mock local...');
      
      const storedUser = sessionStorage.getItem('user');
      const storedToken = sessionStorage.getItem('token');
      
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
        error: error.response?.data?.message || 'Usuario o contraseña incorrectos',
      };
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const user = sessionStorage.getItem('user');
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
  getToken: () => sessionStorage.getItem('token'),

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  // Cerrar sesión
  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    socketService.disconnect();
  },

  // Obtener perfil actual del servidor
  getProfile: async () => {
    try {
      const response = await authAPI.getProfile();
      const user = response.data;
      
      // Actualizar en sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
      
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
        sessionStorage.setItem('token', token);
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
