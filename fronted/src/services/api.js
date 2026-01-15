// API Service - Wrapper para todas las peticiones HTTP
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Crear instancia de axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a cada petición
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= AUTENTICACIÓN =============
export const authAPI = {
  register: (username, email, password) =>
    apiClient.post('/auth/register', { username, email, password }),
  
  login: (email, password) =>
    apiClient.post('/auth/login', { email, password }),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
};

// ============= USUARIOS =============
export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),
  
  getUserById: (userId) =>
    apiClient.get(`/users/${userId}`),
  
  updateProfile: (userData) =>
    apiClient.put('/users/profile', userData),
};

// ============= MESAS =============
export const tableAPI = {
  getAllTables: () =>
    apiClient.get('/tables'),
  
  createTable: (tableData) =>
    apiClient.post('/tables', tableData),
  
  joinTable: (tableId) =>
    apiClient.put(`/tables/${tableId}/join`),
  
  leaveTable: (tableId) =>
    apiClient.put(`/tables/${tableId}/leave`),
  
  getTableById: (tableId) =>
    apiClient.get(`/tables/${tableId}`),
};

// ============= TIENDA =============
export const shopAPI = {
  buyChips: (packageId, amount) =>
    apiClient.post('/shop/buy', { packageId, amount }),
  
  getPackages: () =>
    apiClient.get('/shop/packages'),
};

// ============= AMIGOS =============
export const friendAPI = {
  getFriends: () =>
    apiClient.get('/friends'),
  
  sendFriendRequest: (friendId) =>
    apiClient.post('/friends/request', { friendId }),
  
  acceptFriendRequest: (requestId) =>
    apiClient.put(`/friends/request/${requestId}/accept`),
  
  rejectFriendRequest: (requestId) =>
    apiClient.put(`/friends/request/${requestId}/reject`),
  
  removeFriend: (friendId) =>
    apiClient.delete(`/friends/${friendId}`),
  
  getPendingRequests: () =>
    apiClient.get('/friends/requests/pending'),
};

// ============= HISTORIAL DE MANOS =============
export const handAPI = {
  getHandHistory: (limit = 20, offset = 0) =>
    apiClient.get(`/hands?limit=${limit}&offset=${offset}`),
  
  getHandById: (handId) =>
    apiClient.get(`/hands/${handId}`),
  
  getHandStats: () =>
    apiClient.get('/hands/stats'),
};

// ============= MISIONES =============
export const missionAPI = {
  getAllMissions: () =>
    apiClient.get('/missions'),
  
  claimReward: (missionId) =>
    apiClient.post(`/missions/${missionId}/claim`),
  
  checkProgress: () =>
    apiClient.post('/missions/check-progress'),
};

export default apiClient;
