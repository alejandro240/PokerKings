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
      this.socket = io(SOCKET_URL, {
        auth: {
          token: sessionStorage.getItem('token'),
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
    return new Promise((resolve, reject) => {
      // Asegurar que está conectado
      if (!this.isConnected()) {
        console.warn('⚠️ Socket no conectado, conectando...');
        this.connect();
      }
      
      // Esperar a que esté conectado
      const checkConnection = setInterval(() => {
        if (this.isConnected()) {
          clearInterval(checkConnection);
          
          console.log(`📤 Emitiendo table:join para ${tableId}`);
          this.socket.emit('table:join', tableId, (response) => {
            if (response?.success) {
              console.log(`✅ Confirmado: unido a sala table_${tableId}`);
              resolve(response);
            } else {
              console.error('❌ Error al unirse a la sala:', response);
              reject(new Error('No se pudo unir a la sala'));
            }
          });
        }
      }, 100);

      // Timeout de 5 segundos
      setTimeout(() => {
        clearInterval(checkConnection);
        if (!this.isConnected()) {
          reject(new Error('Socket no se pudo conectar en 5 segundos'));
        }
      }, 5000);
    });
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
