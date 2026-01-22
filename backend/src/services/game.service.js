import { Game, Table, User, Hand } from '../models/index.js';
import {
  advancePhase,
  checkAllPlayersActed,
  getFirstToActInPhase
} from './game.phases.js';
import { compareHands, getBestHand } from './hand.ranking.js';

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

  // En heads-up: dealer = SB, otro = BB
  // En 6-max+: dealer (BTN), siguiente (SB), siguiente (BB)
  let smallBlindIndex, bigBlindIndex;
  
  if (count === 2) {
    // Heads-up: dealer es SB, otro es BB
    smallBlindIndex = dealerIndex;
    bigBlindIndex = (dealerIndex + 1) % count;
  } else {
    // 6-max+: estándar
    smallBlindIndex = (dealerIndex + 1) % count;
    bigBlindIndex = (dealerIndex + 2) % count;
  }

  return {
    dealerIndex,
    smallBlindIndex,
    bigBlindIndex,
    positions: playersArray.map((player, idx) => {
      if (idx === dealerIndex && count > 2) return 'BTN';
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

    // Registrar los blinds como apuestas y restarlos de chips
    players[positions.smallBlindIndex].chips -= smallBlindAmount;
    players[positions.smallBlindIndex].committed = smallBlindAmount;
    players[positions.bigBlindIndex].chips -= bigBlindAmount;
    players[positions.bigBlindIndex].committed = bigBlindAmount;

    await game.update({ players });

    return game;
  } catch (error) {
    throw new Error(`Error inicializando juego: ${error.message}`);
  }
};

/**
 * Repartir cartas comunitarias según la fase siguiente
 */
const dealCommunityForNextPhase = (game, nextPhase) => {
  // Normalizar deck y community a arrays reales (pueden venir como string JSON desde DB)
  let deck = Array.isArray(game.deck)
    ? [...game.deck]
    : (typeof game.deck === 'string'
        ? JSON.parse(game.deck || '[]')
        : (game.deck ? JSON.parse(JSON.stringify(game.deck)) : []));

  let community = Array.isArray(game.communityCards)
    ? [...game.communityCards]
    : (typeof game.communityCards === 'string'
        ? JSON.parse(game.communityCards || '[]')
        : (game.communityCards ? JSON.parse(JSON.stringify(game.communityCards)) : []));

  const burn = () => {
    if (deck.length === 0) return;
    deck.pop();
  };

  const deal = (count) => {
    for (let i = 0; i < count; i++) {
      if (deck.length === 0) break;
      community.push(deck.pop());
    }
  };

  switch (nextPhase) {
    case 'flop':
      burn();
      deal(3);
      break;
    case 'turn':
      burn();
      deal(1);
      break;
    case 'river':
      burn();
      deal(1);
      break;
    default:
      break;
  }

  game.deck = deck;
  game.communityCards = community;
};

/**
 * Determinar si sólo queda un jugador activo
 */
const getActivePlayers = (players) => players.filter(p => !p.folded);

/**
 * Resolver ganador por fold (solo queda uno activo)
 */
const finishByFold = async (game) => {
  const active = getActivePlayers(game.players);
  if (active.length !== 1) return null;

  const winner = active[0];
  winner.chips += game.pot;

  game.status = 'finished';
  game.winnerId = winner.userId;
  game.pot = 0;
  game.endTime = new Date();
  game.players = JSON.parse(JSON.stringify(game.players));
  game.changed('players', true);

  await game.save();

  return winner;
};

/**
 * Resolver showdown calculando la mejor mano
 */
const finishShowdown = async (game) => {
  const community = game.communityCards || [];
  const contenders = getActivePlayers(game.players);

  if (community.length < 5 || contenders.length === 0) {
    return null;
  }

  let winners = [];
  let bestEval = null;

  contenders.forEach((player) => {
    const bestHand = getBestHand(player.hand, community);
    if (!bestEval) {
      bestEval = bestHand;
      winners = [player];
      return;
    }

    const cmp = compareHands(bestHand, bestEval);
    if (cmp === 1) {
      bestEval = bestHand;
      winners = [player];
    } else if (cmp === 0) {
      winners.push(player);
    }
  });

  if (winners.length === 0) return null;

  const share = Math.floor(game.pot / winners.length);
  winners.forEach((p) => {
    p.chips += share;
  });

  const potRemainder = game.pot - share * winners.length;
  if (potRemainder > 0) {
    winners[0].chips += potRemainder;
  }

  game.status = 'finished';
  game.winnerId = winners[0].userId;
  game.pot = 0;
  game.endTime = new Date();
  game.players = JSON.parse(JSON.stringify(game.players));
  game.changed('players', true);

  await game.save();

  return winners[0];
};

/**
 * Avanzar a la siguiente fase si corresponde
 */
const advanceGamePhase = async (game) => {
  const nextPhase = advancePhase(game.phase);

  if (!nextPhase) {
    return await finishShowdown(game);
  }

  dealCommunityForNextPhase(game, nextPhase);

  // Reset de apuestas para la nueva ronda (deep copy de players)
  game.currentBet = 0;
  const players = JSON.parse(JSON.stringify(game.players));
  players.forEach((p) => {
    p.committed = 0;
    p.lastAction = null;
    p.betInPhase = 0;
  });
  game.players = players;

  const dealerIndex = game.players.findIndex(p => p.userId === game.dealerId);
  const firstToAct = getFirstToActInPhase(game.players, dealerIndex, nextPhase);

  game.phase = nextPhase;
  game.currentPlayerIndex = firstToAct;

  await game.update({
    phase: game.phase,
    communityCards: JSON.stringify(game.communityCards),
    deck: JSON.stringify(game.deck),
    players: game.players,
    currentBet: 0,
    currentPlayerIndex: game.currentPlayerIndex
  });

  return null;
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

  // Convertir a números para evitar comparaciones de strings
  const currentBet = parseInt(game.currentBet) || 0;
  const playerChips = currentPlayer.chips;
  const playerCommitted = parseInt(currentPlayer.committed) || 0;

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
  // Asegurar que pot y currentBet son números ANTES de validar
  game.pot = parseInt(game.pot) || 0;
  game.currentBet = parseInt(game.currentBet) || 0;

  // También convertir committed de todos los jugadores
  game.players.forEach(p => {
    p.committed = parseInt(p.committed) || 0;
  });

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
      const playerCommittedNum = parseInt(currentPlayer.committed) || 0;
      const callAmount = game.currentBet - playerCommittedNum;
      currentPlayer.chips -= callAmount;
      currentPlayer.committed = playerCommittedNum + callAmount;
      game.pot += callAmount;
      totalBet = callAmount;
      break;

    case 'raise':
      currentPlayer.chips -= amount;
      currentPlayer.committed = (parseInt(currentPlayer.committed) || 0) + amount;
      game.pot += amount;
      game.currentBet = currentPlayer.committed;
      totalBet = amount;
      break;

    case 'all-in':
      totalBet = currentPlayer.chips;
      game.pot += currentPlayer.chips;
      currentPlayer.committed = (parseInt(currentPlayer.committed) || 0) + currentPlayer.chips;
      currentPlayer.chips = 0;
      if (currentPlayer.committed > game.currentBet) {
        game.currentBet = currentPlayer.committed;
      }
      break;
  }

  currentPlayer.lastAction = action;
  currentPlayer.betInPhase = (currentPlayer.betInPhase || 0) + totalBet;

  // Normalizar referencia explícitamente (algunas implementaciones de JSON pueden entregar copias)
  players[currentPlayerIndex] = { ...currentPlayer };

  // Mover al siguiente jugador que no está folded
  let nextIndex = (currentPlayerIndex + 1) % players.length;
  const startIndex = nextIndex;

  while (players[nextIndex].folded) {
    nextIndex = (nextIndex + 1) % players.length;
    if (nextIndex === startIndex) {
      // Todos excepto uno han hecho fold
      const winner = await finishByFold(game);
      return { gameOver: true, winner };
    }
  }

  // Verificar si la ronda de apuestas terminó
  const dealerIndex = players.findIndex(p => p.userId === game.dealerId);
  const firstToAct = getFirstToActInPhase(players, dealerIndex, game.phase);
  const activePlayers = getActivePlayers(players);

  let roundComplete = checkAllPlayersActed(players, dealerIndex);

  // Debug: estado antes de decidir avanzar de fase
  console.log('[DEBUG][ROUND_CHECK]', {
    phase: game.phase,
    currentBet: game.currentBet,
    dealerIndex,
    firstToAct,
    currentPlayerIndex,
    nextIndex,
    roundComplete,
    activePlayers: activePlayers.map(p => ({
      userId: p.userId,
      committed: parseInt(p.committed) || 0,
      chips: p.chips,
      lastAction: p.lastAction,
      betInPhase: p.betInPhase || 0,
      folded: p.folded
    }))
  });

  // Fallback: si todos actuaron, las apuestas están igualadas
  // y volvimos al primer jugador de la fase, cerramos la ronda.
  if (!roundComplete) {
    const currentBetNum = parseInt(game.currentBet) || 0;
    const allMatched = activePlayers.every(p => {
      const committed = parseInt(p.committed) || 0;
      return committed >= currentBetNum || p.chips === 0;
    });
    const everyoneActed = activePlayers.every(p => p.lastAction);

    if (everyoneActed && allMatched && nextIndex === firstToAct) {
      roundComplete = true;
    }
  }

  if (activePlayers.length === 1) {
    const winner = await finishByFold(game);
    return { gameOver: true, winner };
  }

  if (roundComplete) {
    // Deep copy limpio para guardar
    game.players = JSON.parse(JSON.stringify(players));
    game.changed('players', true);
    
    // Guardar el estado actualizado antes de avanzar fase
    await game.save();

    if (game.phase === 'river') {
      const winner = await finishShowdown(game);
      return { gameOver: true, winner };
    }

    await advanceGamePhase(game);
    return {
      phaseAdvanced: true,
      gameState: await getGameState(game.id)
    };
  }

  game.currentPlayerIndex = nextIndex;
  game.players = JSON.parse(JSON.stringify(players));  // Deep copy limpio
  game.changed('players', true);
  
  await game.save();

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

  // Parse JSON fields si son strings
  const communityCards = typeof game.communityCards === 'string' 
    ? JSON.parse(game.communityCards || '[]')
    : (game.communityCards || []);

  return {
    id: game.id,
    tableId: game.tableId,
    table: game.Table,
    phase: game.phase,
    status: game.status,
    pot: parseInt(game.pot) || 0,
    communityCards: communityCards,
    currentBet: parseInt(game.currentBet) || 0,
    currentPlayerIndex: game.currentPlayerIndex,
    players: game.players.map((p, idx) => ({
      userId: p.userId,
      chips: p.chips,
      committed: parseInt(p.committed) || 0,
      folded: p.folded,
      lastAction: p.lastAction || null,
      betInPhase: p.betInPhase || 0,
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
