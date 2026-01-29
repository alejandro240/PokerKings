import { Server } from 'socket.io';
import { setupLobbySocket } from '../sockets/lobby.socket.js';
import { setupTableSocket } from '../sockets/table.socket.js';

let ioInstance = null;

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('👤 User connected:', socket.id);

    setupLobbySocket(io, socket);
    setupTableSocket(io, socket);

    socket.on('disconnect', () => {
      console.log('👋 User disconnected:', socket.id);
    });
  });

  return io;
};

// Exportar instancia para usar en controladores
export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO no está inicializado');
  }
  return ioInstance;
};
