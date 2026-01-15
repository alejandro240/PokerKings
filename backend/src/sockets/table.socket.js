import Game from '../models/Game.js';
import Table from '../models/Table.js';
import pokerEngine from '../services/pokerEngine.js';

export const setupTableSocket = (io, socket) => {
  socket.on('table:join', async (tableId) => {
    socket.join(`table_${tableId}`);
    const table = await Table.findById(tableId).populate('players.user', 'username avatar');
    socket.emit('table:state', table);
  });

  socket.on('table:leave', (tableId) => {
    socket.leave(`table_${tableId}`);
  });

  socket.on('game:action', async (data) => {
    const { tableId, action, amount } = data;
    // Process player action (fold, call, raise, etc.)
    
    const game = await Game.findOne({ table: tableId, status: 'active' });
    if (!game) return;

    // Update game state based on action
    // Emit updated state to all players at the table
    io.to(`table_${tableId}`).emit('game:update', game);
  });

  socket.on('game:start', async (tableId) => {
    const table = await Table.findById(tableId);
    
    if (table.players.length < 2) {
      socket.emit('error', { message: 'Not enough players' });
      return;
    }

    const hands = pokerEngine.dealCards(table.players.length);
    
    const game = await Game.create({
      table: tableId,
      players: table.players.map((p, i) => ({
        user: p.user,
        cards: hands[i],
        bet: 0,
        folded: false,
        position: i
      })),
      pot: table.smallBlind + table.bigBlind,
      currentBet: table.bigBlind
    });

    table.currentGame = game._id;
    table.status = 'playing';
    await table.save();

    io.to(`table_${tableId}`).emit('game:started', game);
  });
};
