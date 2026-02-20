// Socket.IO Service - Para comunicación en tiempo real
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

let socket = null;

export const socketService = {
  // Conectar al servidor
  connect: (token) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Eventos de conexión
    socket.on('connect', () => {
      console.log('✅ Conectado al servidor via WebSocket');
    });

    socket.on('disconnect', () => {
      console.log('❌ Desconectado del servidor');
    });

    socket.on('error', (error) => {
      console.error('❌ Error de Socket.IO:', error);
    });

    return socket;
  },

  // Desconectar
  disconnect: () => {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  },

  // ============= EVENTOS DE LOBBY =============
  joinLobby: (callback) => {
    socket?.emit('lobby:join', callback);
  },

  leaveLobby: (callback) => {
    socket?.emit('lobby:leave', callback);
  },

  refreshLobby: (callback) => {
    socket?.emit('lobby:refresh', callback);
  },

  onLobbyUpdate: (callback) => {
    socket?.on('lobby:update', callback);
  },

  // ============= EVENTOS DE MESA =============
  joinTable: (tableId, callback) => {
    socket?.emit('table:join', { tableId }, callback);
  },

  leaveTable: (tableId, callback) => {
    socket?.emit('table:leave', { tableId }, callback);
  },

  onTableUpdate: (callback) => {
    socket?.on('table:update', callback);
  },

  // ============= EVENTOS DE JUEGO =============
  startGame: (tableId, callback) => {
    socket?.emit('game:start', { tableId }, callback);
  },

  playAction: (tableId, action, amount, callback) => {
    socket?.emit('game:action', { tableId, action, amount }, callback);
  },

  onGameUpdate: (callback) => {
    socket?.on('game:update', callback);
  },

  onGameEnd: (callback) => {
    socket?.on('game:end', callback);
  },

  // ============= EVENTOS DE CHAT (Opcional) =============
  sendMessage: (tableId, message) => {
    socket?.emit('chat:message', { tableId, message });
  },

  onMessage: (callback) => {
    socket?.on('chat:message', callback);
  },

  // Remover listeners
  offLobbyUpdate: () => {
    socket?.off('lobby:update');
  },

  offTableUpdate: () => {
    socket?.off('table:update');
  },

  offGameUpdate: () => {
    socket?.off('game:update');
  },

  offGameEnd: () => {
    socket?.off('game:end');
  },

  offMessage: () => {
    socket?.off('chat:message');
  },

  // Obtener socket actual
  getSocket: () => socket,
};

export default socketService;
