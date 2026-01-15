import { Server } from 'socket.io';
import { setupLobbySocket } from '../sockets/lobby.socket.js';
import { setupTableSocket } from '../sockets/table.socket.js';

export const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

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
