import { Game, Table, User, Hand } from '../models/index.js';

// Palos de cartas
const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

/**
 * Crear un mazo nuevo (52 cartas)
 */
export const createDeck = () => {
  const deck = [];
  for (let suit of SUITS) {
    for (let rank of RANKS) {
      deck.push(`${rank}${suit}`);
    }
  }
  // Shuffle
  return shuffleDeck(deck);
};

/**
 * Mezclar el mazo (Fisher-Yates shuffle)
 */
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Obtener la siguiente posición del dealer (rotación circular)
 */
export const getNextDealerPosition = (currentDealerIndex, playersCount) => {
  return (currentDealerIndex + 1) % playersCount;
};

/**
 * Calcular posiciones de dealer, small blind y big blind
 */
export const calculatePositions = (playersArray, dealerIndex) => {
  const count = playersArray.length;
  
  if (count < 2) {
    throw new Error('Se requieren al menos 2 jugadores');
  }

  const smallBlindIndex = (dealerIndex + 1) % count;
  const bigBlindIndex = (dealerIndex + 2) % count;

  return {
    dealerIndex,
    smallBlindIndex,
    bigBlindIndex,
    positions: playersArray.map((player, idx) => {
      if (idx === dealerIndex) return 'BTN';
      if (idx === smallBlindIndex) return 'SB';
      if (idx === bigBlindIndex) return 'BB';
      if (count === 2) return null;
      
      // Nombres estándar para posiciones (6-max):
      // BTN, SB, BB, UTG, HJ, CO
      const positionNames = ['BTN', 'SB', 'BB', 'UTG', 'HJ', 'CO'];
      return positionNames[idx] || `POS${idx}`;
    })
  };
};

/**
 * Inicializar una nueva partida
 */
export const initializeGame = async (tableId, playersData) => {
  try {
    const table = await Table.findByPk(tableId);
    if (!table) throw new Error('Mesa no encontrada');

    const smallBlindAmount = table.smallBlind;
    const bigBlindAmount = table.bigBlind;

    // Crear array de jugadores con estructura
    const players = playersData.map(playerData => ({
      userId: playerData.userId,
      chips: playerData.chips || 1000,
      committed: 0,
      hand: null,
      folded: false,
      isSittingOut: false
    }));

    // Dealer es el primer jugador (será rotado después de cada mano)
    const dealerIndex = 0;
    const positions = calculatePositions(players, dealerIndex);

    // Crear mazo
    const deck = createDeck();

    // Repartir cartas iniciales (2 por jugador)
    players.forEach(player => {
      player.hand = [deck.pop(), deck.pop()];
    });

    // El siguiente jugador en turno será quien actúa primero (después de BB)
    // En preflop: UTG (after BB)
    // Si es heads-up (2 jugadores): dealer actúa primero
    const currentPlayerIndex = players.length === 2 ? dealerIndex : (positions.bigBlindIndex + 1) % players.length;

    // Crear el juego
    const game = await Game.create({
      tableId,
      phase: 'preflop',
      status: 'active',
      dealerId: players[dealerIndex].userId,
      smallBlindId: players[positions.smallBlindIndex].userId,
      bigBlindId: players[positions.bigBlindIndex].userId,
      players,
      currentPlayerIndex,
      currentBet: bigBlindAmount,
      deck,
      communityCards: [],
      pot: smallBlindAmount + bigBlindAmount
    });

    // Registrar los blinds como apuestas
    players[positions.smallBlindIndex].committed = smallBlindAmount;
    players[positions.bigBlindIndex].committed = bigBlindAmount;

    await game.update({ players });

    return game;
  } catch (error) {
    throw new Error(`Error inicializando juego: ${error.message}`);
  }
};

/**
 * Validar que una acción es legal
 */
export const validateAction = (game, playerId, action, amount = 0) => {
  const players = game.players;
  const currentPlayerIndex = game.currentPlayerIndex;
  const currentPlayer = players[currentPlayerIndex];

  // Verificar que es el turno del jugador
  if (currentPlayer.userId !== playerId) {
    throw new Error('No es tu turno');
  }

  // Verificar que el jugador no está folded
  if (currentPlayer.folded) {
    throw new Error('Ya hiciste fold en esta mano');
  }

  const currentBet = game.currentBet;
  const playerChips = currentPlayer.chips;
  const playerCommitted = currentPlayer.committed;

  switch (action) {
    case 'fold':
      return true;

    case 'check':
      // Solo si la apuesta actual es igual a lo que ya ha puesto
      if (playerCommitted >= currentBet) {
        return true;
      }
      throw new Error('No puedes hacer check, necesitas igualar la apuesta');

    case 'call':
      const callAmount = currentBet - playerCommitted;
      if (callAmount > playerChips) {
        throw new Error('No tienes suficientes fichas para igualar');
      }
      return true;

    case 'raise':
      if (amount <= currentBet - playerCommitted) {
        throw new Error(`La subida mínima es ${currentBet - playerCommitted + currentBet}`);
      }
      const raiseTotal = playerCommitted + amount;
      if (raiseTotal > playerChips + playerCommitted) {
        throw new Error('No tienes suficientes fichas para subir esa cantidad');
      }
      return true;

    case 'all-in':
      if (playerChips <= 0) {
        throw new Error('Ya estás all-in');
      }
      return true;

    default:
      throw new Error('Acción inválida');
  }
};

/**
 * Procesar una acción en el juego
 */
export const processPlayerAction = async (game, playerId, action, amount = 0) => {
  validateAction(game, playerId, action, amount);

  const players = game.players;
  const currentPlayerIndex = game.currentPlayerIndex;
  const currentPlayer = players[currentPlayerIndex];

  let totalBet = 0;

  switch (action) {
    case 'fold':
      currentPlayer.folded = true;
      break;

    case 'check':
      // No hay cambio en fichas
      break;

    case 'call':
      const callAmount = game.currentBet - currentPlayer.committed;
      currentPlayer.chips -= callAmount;
      currentPlayer.committed += callAmount;
      game.pot += callAmount;
      totalBet = callAmount;
      break;

    case 'raise':
      currentPlayer.chips -= amount;
      currentPlayer.committed += amount;
      game.pot += amount;
      game.currentBet = currentPlayer.committed;
      totalBet = amount;
      break;

    case 'all-in':
      totalBet = currentPlayer.chips;
      game.pot += currentPlayer.chips;
      currentPlayer.committed += currentPlayer.chips;
      currentPlayer.chips = 0;
      if (currentPlayer.committed > game.currentBet) {
        game.currentBet = currentPlayer.committed;
      }
      break;
  }

  // Mover al siguiente jugador que no está folded
  let nextIndex = (currentPlayerIndex + 1) % players.length;
  const startIndex = nextIndex;

  while (players[nextIndex].folded) {
    nextIndex = (nextIndex + 1) % players.length;
    if (nextIndex === startIndex) {
      // Todos excepto uno han hecho fold
      return { gameOver: true, message: 'Solo un jugador restante' };
    }
  }

  game.currentPlayerIndex = nextIndex;
  await game.update({ 
    players, 
    pot: game.pot,
    currentBet: game.currentBet,
    currentPlayerIndex: game.currentPlayerIndex
  });

  return { 
    success: true, 
    action, 
    amount: totalBet,
    nextPlayer: players[nextIndex]
  };
};

/**
 * Obtener el estado actual del juego
 */
export const getGameState = async (gameId) => {
  const game = await Game.findByPk(gameId, {
    include: [
      {
        model: Table,
        attributes: ['name', 'smallBlind', 'bigBlind', 'maxPlayers']
      },
      {
        model: User,
        as: 'winner',
        attributes: ['id', 'username', 'avatar']
      }
    ]
  });

  if (!game) throw new Error('Juego no encontrado');

  return {
    id: game.id,
    tableId: game.tableId,
    table: game.Table,
    phase: game.phase,
    status: game.status,
    pot: game.pot,
    communityCards: game.communityCards,
    currentBet: game.currentBet,
    currentPlayerIndex: game.currentPlayerIndex,
    players: game.players.map((p, idx) => ({
      userId: p.userId,
      chips: p.chips,
      committed: p.committed,
      folded: p.folded,
      isCurrentPlayer: idx === game.currentPlayerIndex,
      cardsHidden: true // Las cartas se ven según permisos
    })),
    dealerIndex: game.players.findIndex(p => p.userId === game.dealerId),
    smallBlindIndex: game.players.findIndex(p => p.userId === game.smallBlindId),
    bigBlindIndex: game.players.findIndex(p => p.userId === game.bigBlindId),
    winner: game.winner || null,
    startTime: game.startTime,
    endTime: game.endTime
  };
};

export default {
  createDeck,
  shuffleDeck,
  getNextDealerPosition,
  calculatePositions,
  initializeGame,
  validateAction,
  processPlayerAction,
  getGameState
};
