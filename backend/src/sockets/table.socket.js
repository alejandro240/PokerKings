import { Game, Table, Hand, HandAction } from '../models/index.js';
import pokerEngine from '../services/pokerEngine.js';

export const setupTableSocket = (io, socket) => {
  const syncLeaveTable = async (tableId) => {
    if (!tableId) return;
    try {
      const table = await Table.findByPk(tableId);
      if (!table) return;

      table.currentPlayers = Math.max(0, (table.currentPlayers || 0) - 1);
      if (table.currentPlayers === 0 && table.status === 'playing') {
        table.status = 'waiting';
      }
      await table.save();
      console.log(`👋 Socket ${socket.id} salió de mesa ${tableId}. currentPlayers=${table.currentPlayers}`);
    } catch (error) {
      console.error(`❌ Error actualizando mesa al salir socket ${socket.id}:`, error.message);
    }
  };

  socket.on('table:join', async (tableId) => {
    console.log(`🔌 Socket ${socket.id} uniéndose a sala table_${tableId}`);
    socket.data.tableId = tableId;
    socket.join(`table_${tableId}`);
    const table = await Table.findByPk(tableId);
    socket.emit('table:state', table);
    console.log(`✅ Socket ${socket.id} unido a sala table_${tableId}`);
  });

  socket.on('table:leave', async (tableId) => {
    socket.leave(`table_${tableId}`);
    if (socket.data.tableId === tableId) {
      socket.data.tableId = null;
    }
    await syncLeaveTable(tableId);
  });

  socket.on('disconnecting', async () => {
    const tableId = socket.data.tableId;
    if (!tableId) return;
    await syncLeaveTable(tableId);
    socket.data.tableId = null;
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
