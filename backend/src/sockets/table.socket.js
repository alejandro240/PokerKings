import { Game, Table, Hand, HandAction } from '../models/index.js';
import pokerEngine from '../services/pokerEngine.js';

export const setupTableSocket = (io, socket) => {
  socket.on('table:join', async (tableId) => {
    console.log(`🔌 Socket ${socket.id} uniéndose a sala table_${tableId}`);
    socket.join(`table_${tableId}`);
    const table = await Table.findByPk(tableId);
    socket.emit('table:state', table);
    console.log(`✅ Socket ${socket.id} unido a sala table_${tableId}`);
  });

  socket.on('table:leave', (tableId) => {
    socket.leave(`table_${tableId}`);
  });

  socket.on('game:action', async (data) => {
    const { tableId, action, amount } = data;
    
    const game = await Game.findOne({
      where: { tableId, status: 'active' }
    });
    if (!game) return;

    // Update game state based on action
    io.to(`table_${tableId}`).emit('game:update', game);
  });

  socket.on('game:start', async (tableId) => {
    const table = await Table.findByPk(tableId);
    
    if (table.currentPlayers < 2) {
      socket.emit('error', { message: 'Not enough players' });
      return;
    }

    const hands = pokerEngine.dealCards(table.currentPlayers);
    
    const game = await Game.create({
      tableId,
      pot: table.smallBlind + table.bigBlind,
      status: 'active'
    });

    table.status = 'playing';
    await table.save();

    io.to(`table_${tableId}`).emit('game:started', game);
  });
};
