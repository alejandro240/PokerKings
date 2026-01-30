/**
 * Servicio de IA para bots
 * Implementa estrategia básica de poker para jugadores bot
 */

import { Game, User } from '../models/index.js';
import { processPlayerAction } from './game.service.js';

/**
 * Evaluar la fuerza de la mano del jugador
 * Retorna: 'weak' | 'medium' | 'strong'
 */
export const evaluateHandStrength = (holeCards) => {
  if (!holeCards || holeCards.length < 2) {
    return 'weak';
  }

  const [card1, card2] = holeCards;
  
  // Extraer rango (2-A) y palo
  const getRank = (card) => {
    const rankMap = { '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14 };
    return rankMap[card.slice(0, -1)] || 0;
  };

  const rank1 = getRank(card1);
  const rank2 = getRank(card2);
  const isSuited = card1[card1.length - 1] === card2[card2.length - 1];
  const isPair = rank1 === rank2;

  // Puntuación básica
  let score = (rank1 + rank2) / 2;

  // Premium hands
  if (isPair && (rank1 >= 10 || rank1 === 14)) {
    return 'strong'; // AA, KK, QQ, JJ, TT
  }

  if ((rank1 === 14 && rank2 >= 12) || (rank2 === 14 && rank1 >= 12)) {
    return 'strong'; // AK, AQ
  }

  // Medium hands
  if (isPair || (score >= 11 && isSuited) || (score >= 12 && !isSuited)) {
    return 'medium';
  }

  // Weak hands
  return 'weak';
};

/**
 * Tomar decisión para el bot
 * Retorna: { action: 'fold' | 'check' | 'call' | 'raise', amount: number }
 */
export const makeBotDecision = (gameState, botPlayerIndex, currentBet) => {
  const botPlayer = gameState.players[botPlayerIndex];
  
  if (!botPlayer) {
    return { action: 'check', amount: 0 };
  }

  // Determinar acciones disponibles
  const canCheck = currentBet === 0 || botPlayer.bet === currentBet;
  const canCall = botPlayer.chips > 0 && currentBet > botPlayer.bet;
  const canRaise = botPlayer.chips > currentBet;

  // Evaluar la mano
  const handStrength = evaluateHandStrength(botPlayer.holeCards);

  // Probabilidad aleatoria para hacer el juego más interesante
  const randomFactor = Math.random();

  // Estrategia según fase del juego
  const phase = gameState.phase;

  // PRE-FLOP: Más cauteloso
  if (phase === 'pre-flop') {
    if (handStrength === 'strong') {
      // Con mano fuerte, raise
      if (canRaise && randomFactor < 0.8) {
        const raiseAmount = Math.min(currentBet * 2, botPlayer.chips);
        return { action: 'raise', amount: raiseAmount };
      }
      if (canCall) {
        return { action: 'call', amount: currentBet };
      }
    } else if (handStrength === 'medium') {
      // Con mano mediocre, call o fold
      if (canCall && randomFactor < 0.6) {
        return { action: 'call', amount: currentBet };
      }
      return { action: 'fold', amount: 0 };
    } else {
      // Mano débil, fold generalmente
      if (randomFactor < 0.9) {
        return { action: 'fold', amount: 0 };
      }
      if (canCall) {
        return { action: 'call', amount: currentBet };
      }
    }
  }

  // FLOP, TURN, RIVER: Más agresivo si está comprometido
  if (handStrength === 'strong') {
    if (canRaise && randomFactor < 0.6) {
      const raiseAmount = Math.min(gameState.pot * 0.25, botPlayer.chips);
      return { action: 'raise', amount: raiseAmount };
    }
    if (canCall) {
      return { action: 'call', amount: currentBet };
    }
    if (canCheck) {
      return { action: 'check', amount: 0 };
    }
  } else if (handStrength === 'medium') {
    if (canCheck) {
      return { action: 'check', amount: 0 };
    }
    if (canCall && randomFactor < 0.5) {
      return { action: 'call', amount: currentBet };
    }
    return { action: 'fold', amount: 0 };
  } else {
    if (canCheck) {
      return { action: 'check', amount: 0 };
    }
    return { action: 'fold', amount: 0 };
  }

  // Default
  if (canCheck) {
    return { action: 'check', amount: 0 };
  }
  if (canCall) {
    return { action: 'call', amount: currentBet };
  }
  return { action: 'fold', amount: 0 };
};

/**
 * Ejecutar turno automático del bot
 */
export const executeBotTurn = async (gameId) => {
  try {
    const game = await Game.findByPk(gameId);
    
    if (!game || game.status !== 'active') {
      console.log('❌ Juego no está activo o no existe');
      return null;
    }

    const currentPlayerIndex = game.currentPlayerIndex;
    const currentPlayer = game.players[currentPlayerIndex];

    if (!currentPlayer) {
      console.log('❌ No hay jugador actual');
      return null;
    }

    // Obtener el usuario para verificar si es bot
    const user = await User.findByPk(currentPlayer.userId);

    if (!user || !user.isBot) {
      console.log('⏸️  El jugador actual no es un bot, esperando entrada del usuario');
      return null;
    }

    // Bot toma decisión
    const gameState = {
      ...game.toJSON(),
      players: game.players
    };

    const decision = makeBotDecision(gameState, currentPlayerIndex, game.currentBet);
    
    console.log(`🤖 Bot ${user.username} tomó decisión:`, decision);

    // Ejecutar la acción en el juego
    const result = await processPlayerAction(
      game,
      currentPlayer.userId,
      decision.action,
      decision.amount
    );

    if (!result || !result.success) {
      console.error('❌ Error al procesar acción del bot:', result);
      return null;
    }

    // Obtener el juego actualizado
    const updatedGame = await Game.findByPk(gameId);

    // Si el siguiente jugador también es bot, ejecutar automáticamente
    const nextPlayer = updatedGame.players[updatedGame.currentPlayerIndex];
    const nextUser = await User.findByPk(nextPlayer?.userId);

    if (nextUser?.isBot && updatedGame.status === 'active') {
      // Esperar un poco antes de ejecutar el siguiente bot
      setTimeout(() => executeBotTurn(gameId), 1000);
    }

    return updatedGame;
  } catch (error) {
    console.error('❌ Error ejecutando turno del bot:', error.message);
    return null;
  }
};
