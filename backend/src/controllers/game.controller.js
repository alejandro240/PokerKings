import { Game, Table, User, Hand, HandAction } from '../models/index.js';
import {
  initializeGame,
  processPlayerAction,
  getGameState,
  createDeck
} from '../services/game.service.js';

/**
 * Crear y iniciar un nuevo juego en una mesa
 * POST /games/start
 * Body: { tableId, playerIds: [uuid, uuid] }
 */
export const startGame = async (req, res) => {
  try {
    const { tableId, playerIds } = req.body;

    if (!tableId || !playerIds || playerIds.length < 2) {
      return res.status(400).json({ 
        error: 'Se requieren tableId y al menos 2 jugadores' 
      });
    }

    // Verificar que la mesa existe
    const table = await Table.findByPk(tableId);
    if (!table) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Verificar que no hay otro juego activo en la mesa
    const activeGame = await Game.findOne({
      where: { tableId, status: 'active' }
    });

    if (activeGame) {
      return res.status(400).json({ 
        error: 'Ya hay un juego activo en esta mesa' 
      });
    }

    // Obtener datos de los jugadores (chips de su cuenta)
    const players = await User.findAll({
      where: { id: playerIds },
      attributes: ['id', 'chips']
    });

    if (players.length !== playerIds.length) {
      return res.status(404).json({ error: 'Uno o más jugadores no existen' });
    }

    // Inicializar el juego
    const playersData = players.map(p => ({
      userId: p.id,
      chips: Math.min(p.chips, 10000) // Max buy-in de 10,000 fichas
    }));

    const game = await initializeGame(tableId, playersData);

    // Actualizar estado de la mesa
    await table.update({
      status: 'playing',
      currentPlayers: playerIds.length
    });

    res.status(201).json({
      success: true,
      message: 'Juego iniciado',
      game: await getGameState(game.id)
    });

  } catch (error) {
    res.status(500).json({ 
      error: `Error iniciando juego: ${error.message}` 
    });
  }
};

/**
 * Obtener el estado actual del juego
 * GET /games/:gameId
 */
export const getGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const gameState = await getGameState(gameId);
    res.json(gameState);

  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

/**
 * Realizar una acción en el juego
 * POST /games/:gameId/action
 * Body: { userId, action: 'fold'|'check'|'call'|'raise'|'all-in', amount?: number }
 */
export const playerAction = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId, action, amount } = req.body;

    // Validar entrada
    if (!userId || !action) {
      return res.status(400).json({ 
        error: 'userId y action son requeridos' 
      });
    }

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ 
        error: 'Este juego ya ha terminado' 
      });
    }

    // Procesar la acción
    const result = await processPlayerAction(game, userId, action, amount || 0);

    if (result.gameOver) {
      return res.json({
        success: true,
        gameOver: true,
        winner: result.winner || null,
        gameState: await getGameState(gameId, false)
      });
    }

    if (result.phaseAdvanced) {
      return res.json({
        success: true,
        phaseAdvanced: true,
        gameState: result.gameState
      });
    }

    res.json({
      success: true,
      action: result.action,
      amount: result.amount,
      gameState: await getGameState(gameId, false)
    });

  } catch (error) {
    res.status(400).json({ 
      error: error.message 
    });
  }
};

/**
 * Obtener juegos activos de un jugador
 * GET /games/player/:userId
 */
export const getPlayerGames = async (req, res) => {
  try {
    const { userId } = req.params;

    const games = await Game.findAll({
      where: { status: 'active' },
      attributes: ['id', 'tableId', 'phase', 'pot', 'currentPlayerIndex', 'players'],
      include: [
        {
          model: Table,
          attributes: ['name', 'smallBlind', 'bigBlind']
        }
      ]
    });

    // Filtrar juegos donde el usuario es jugador
    const userGames = games.filter(game => {
      return game.players.some(p => p.userId === userId);
    });

    res.json({
      count: userGames.length,
      games: await Promise.all(
        userGames.map(async (game) => {
          const state = await getGameState(game.id);
          return state;
        })
      )
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

/**
 * Obtener juegos terminados de una mesa
 * GET /games/table/:tableId/history
 */
export const getGameHistory = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const games = await Game.findAll({
      where: { tableId, status: 'finished' },
      attributes: [
        'id', 'phase', 'pot', 'winnerId', 'createdAt', 'endTime'
      ],
      include: [
        {
          model: User,
          as: 'winner',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const total = await Game.count({
      where: { tableId, status: 'finished' }
    });

    res.json({
      total,
      count: games.length,
      games
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

/**
 * Obtener detalles de una mano específica
 * GET /games/:gameId/hands/:handId
 */
export const getHandDetails = async (req, res) => {
  try {
    const { gameId, handId } = req.params;

    const hand = await Hand.findByPk(handId, {
      where: { gameId },
      include: [
        {
          model: User,
          as: 'player',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: HandAction,
          attributes: ['action', 'amount', 'phase', 'sequenceNumber'],
          order: [['sequenceNumber', 'ASC']]
        }
      ]
    });

    if (!hand) {
      return res.status(404).json({ error: 'Mano no encontrada' });
    }

    res.json(hand);

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

/**
 * Abandonar un juego
 * POST /games/:gameId/leave
 * Body: { userId }
 */
export const leaveGame = async (req, res) => {
  try {
    const { gameId } = req.params;
    const { userId } = req.body;

    const game = await Game.findByPk(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    if (game.status !== 'active') {
      return res.status(400).json({ 
        error: 'El juego ya ha terminado' 
      });
    }

    // Marcar al jugador como sitting out
    const players = game.players;
    const playerIndex = players.findIndex(p => p.userId === userId);

    if (playerIndex === -1) {
      return res.status(400).json({ 
        error: 'El jugador no está en este juego' 
      });
    }

    players[playerIndex].isSittingOut = true;
    
    // Si es el turno del jugador que se va, mover al siguiente
    if (game.currentPlayerIndex === playerIndex) {
      let nextIndex = (playerIndex + 1) % players.length;
      while (players[nextIndex].isSittingOut && nextIndex !== playerIndex) {
        nextIndex = (nextIndex + 1) % players.length;
      }
      game.currentPlayerIndex = nextIndex;
    }

    await game.update({ players });

    res.json({
      success: true,
      message: 'Has abandonado el juego',
      gameState: await getGameState(gameId)
    });

  } catch (error) {
    res.status(500).json({ 
      error: error.message 
    });
  }
};

export default {
  startGame,
  getGame,
  playerAction,
  getPlayerGames,
  getGameHistory,
  getHandDetails,
  leaveGame
};
