// Servicio WebSocket para conectar con el backend en tiempo real
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

class GameSocketService {
  constructor() {
    this.socket = null;
    this.gameId = null;
    this.listeners = {};
  }

  connect() {
    if (!this.socket) {
      // FIX: Verificar que el token existe antes de conectar
      const token = sessionStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No hay token de autenticación, no se puede conectar al WebSocket');
        return;
      }
      
      this.socket = io(SOCKET_URL, {
        auth: {
          token: token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('🔌 Conectado al servidor WebSocket');
        this.emit('socketConnected');
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 Desconectado del servidor');
        this.emit('socketDisconnected');
      });

      this.socket.on('error', (error) => {
        console.error('❌ Error WebSocket:', error);
        this.emit('socketError', error);
      });

      // Eventos del juego
      this.socket.on('gameStarted', (gameData) => {
        console.log('🎮 gameStarted recibido:', gameData);
        this.emit('gameStarted', gameData);
      });

      this.socket.on('gameState', (gameState) => {
        console.log('🎮 gameState recibido:', gameState);
        this.emit('gameStateUpdated', gameState);
      });

      this.socket.on('gameStateUpdated', (gameState) => {
        console.log('🎮 gameStateUpdated recibido directo:', gameState);
        this.emit('gameStateUpdated', gameState);
      });

      this.socket.on('playerAction', (actionData) => {
        this.emit('playerActionReceived', actionData);
      });

      this.socket.on('phaseChanged', (phaseData) => {
        this.emit('phaseChanged', phaseData);
      });

      this.socket.on('showdown', (showdownData) => {
        this.emit('showdown', showdownData);
      });

      this.socket.on('gameEnded', (gameData) => {
        this.emit('gameEnded', gameData);
      });

      this.socket.on('playerJoined', (playerData) => {
        this.emit('playerJoined', playerData);
      });

      this.socket.on('playerLeft', (playerData) => {
        this.emit('playerLeft', playerData);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Unirse a una partida
  joinGame(gameId, userId) {
    this.gameId = gameId;
    if (this.socket) {
      this.socket.emit('joinGame', { gameId, userId });
    }
  }

  // Unirse a la sala de una mesa
  joinTable(tableId) {
    if (this.socket) {
      console.log(`📤 Emitiendo table:join para ${tableId}`);
      this.socket.emit('table:join', tableId);
    } else {
      console.error('❌ Socket no conectado, no se puede unir a la mesa');
    }
  }

  // Salir de una partida
  leaveGame(gameId, userId) {
    if (this.socket) {
      this.socket.emit('leaveGame', { gameId, userId });
    }
  }

  // Enviar acción del jugador
  playerAction(gameId, userId, action, amount = 0) {
    if (this.socket) {
      this.socket.emit('playerAction', {
        gameId,
        userId,
        action, // fold, check, call, raise, allIn
        amount,
      });
    }
  }

  // Obtener estado del juego
  getGameState(gameId) {
    if (this.socket) {
      this.socket.emit('getGameState', { gameId });
    }
  }

  // Suscribirse a eventos
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Desuscribirse de eventos
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  // Emitir eventos internos
  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(data));
    }
  }

  // Verificar si está conectado
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export const gameSocket = new GameSocketService();
