import Table from '../models/Table.js';

export const setupLobbySocket = (io, socket) => {
  socket.on('lobby:join', async () => {
    socket.join('lobby');
    const tables = await Table.find().populate('players.user', 'username avatar');
    socket.emit('lobby:tables', tables);
  });

  socket.on('lobby:leave', () => {
    socket.leave('lobby');
  });

  socket.on('lobby:refresh', async () => {
    const tables = await Table.find().populate('players.user', 'username avatar');
    socket.emit('lobby:tables', tables);
  });
};
