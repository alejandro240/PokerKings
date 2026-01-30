import { useState, useCallback, useEffect } from 'react';
import { gameSocket } from '../services/gameSocket';

/**
 * Custom hook for managing poker game state
 * Integrado con backend a través de WebSocket
 */
const usePokerGame = () => {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gamePhase, setGamePhase] = useState('waiting'); // waiting, pre-flop, flop, turn, river, showdown
  const [pot, setPot] = useState(0);
  const [sidePots, setSidePots] = useState([]);
  const [communityCards, setCommunityCards] = useState([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [minRaise, setMinRaise] = useState(0);
  const [dealerPosition, setDealerPosition] = useState(0);
  const [smallBlindPosition, setSmallBlindPosition] = useState(1);
  const [bigBlindPosition, setBigBlindPosition] = useState(2);
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState(null);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(30);
  
  // Player-specific state
  const [playerHoleCards, setPlayerHoleCards] = useState([]);
  const [playerChips, setPlayerChips] = useState(0);
  const [playerBet, setPlayerBet] = useState(0);
  const [playerHasFolded, setPlayerHasFolded] = useState(false);
  const [playerHasActed, setPlayerHasActed] = useState(false);
  const [playerIndex, setPlayerIndex] = useState(0);

  // All players state (for display)
  const [players, setPlayers] = useState([]);
  
  // Winners from backend
  const [winners, setWinners] = useState([]); // Para múltiples ganadores
  const [winnerIds, setWinnerIds] = useState([]); // IDs de ganadores

  // Configurar listeners de WebSocket al montar
  useEffect(() => {
    gameSocket.connect();

    // Actualizar estado del juego desde backend
    gameSocket.on('gameStateUpdated', (gameState) => {
      console.log('🎮 gameStateUpdated recibido:', gameState);
      
      if (gameState) {
        setGameId(gameState.id);
        setGamePhase(gameState.phase || gameState.status || 'waiting');
        setPot(gameState.pot || 0);
        setSidePots(gameState.sidePots || []);
        setCommunityCards(gameState.communityCards || []);
        setCurrentBet(gameState.currentBet || 0);
        setMinRaise(gameState.minRaise || 0);
        setDealerPosition(gameState.dealerIndex || 0);
        
        let currentIdx = -1;
        
        // Actualizar estado del jugador actual
        if (gameState.players && gameState.players.length > 0) {
          console.log('👥 Actualizando jugadores:', gameState.players.length, gameState.players);
          setPlayers(gameState.players);
          
          // Encontrar al jugador actual
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          currentIdx = gameState.players.findIndex(p => p.userId === currentUser.id);
          if (currentIdx !== -1) {
            setPlayerIndex(currentIdx);
            const currentPlayer = gameState.players[currentIdx];
            setPlayerChips(currentPlayer.chips || 0);
            setPlayerBet(currentPlayer.bet || 0);
            setPlayerHoleCards(currentPlayer.holeCards || []);
            setPlayerHasFolded(currentPlayer.folded || false);
          }
        }
        
        // Actualizar turno actual
        if (gameState.currentPlayerIndex !== undefined) {
          console.log('🎯 Turno actual:', gameState.currentPlayerIndex);
          setCurrentPlayerTurn(gameState.currentPlayerIndex);
        }
        
        console.log('🔍 Debug - playerIndex:', currentIdx, 'currentPlayerTurn:', gameState.currentPlayerIndex);
        console.log('🔍 Es mi turno?:', currentIdx === gameState.currentPlayerIndex);
        
        // Guardar múltiples ganadores si están disponibles
        if (gameState.winners) {
          setWinners(gameState.winners);
        }
        if (gameState.winnerIds) {
          setWinnerIds(gameState.winnerIds);
        }
      }
    });

    // Cambio de fase
    gameSocket.on('phaseChanged', (phaseData) => {
      if (phaseData.phase) {
        setGamePhase(phaseData.phase);
        setCommunityCards(phaseData.communityCards || []);
      }
    });

    // Fin del juego / Showdown
    gameSocket.on('showdown', (showdownData) => {
      setGamePhase('showdown');
      if (showdownData.winners) {
        setWinners(showdownData.winners);
      }
      if (showdownData.winnerIds) {
        setWinnerIds(showdownData.winnerIds);
      }
      if (showdownData.pot) {
        setPot(showdownData.pot);
      }
    });

    return () => {
      // Limpiar listeners al desmontar
      gameSocket.off('gameStateUpdated', null);
      gameSocket.off('phaseChanged', null);
      gameSocket.off('showdown', null);
    };
  }, []);

  // Actions que envían al backend vía REST API
  const sendAction = useCallback(async (action, amount = 0) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/games/${gameId}/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          action,
          amount
        })
      });
      
      const data = await response.json();
      if (!response.ok) {
        console.error('❌ Error en acción:', data.error);
      } else {
        console.log('✅ Acción procesada:', action);
      }
      return data;
    } catch (error) {
      console.error('❌ Error enviando acción:', error);
    }
  }, [gameId]);

  const handleFold = useCallback(() => {
    if (gameId) {
      console.log('📤 Enviando acción FOLD');
      sendAction('fold');
      setPlayerHasFolded(true);
      setPlayerHasActed(true);
    }
  }, [gameId, sendAction]);

  const handleCheck = useCallback(() => {
    if (gameId) {
      console.log('📤 Enviando acción CHECK');
      sendAction('check');
      setPlayerHasActed(true);
    }
  }, [gameId, sendAction]);

  const handleCall = useCallback(() => {
    if (gameId) {
      const callAmount = currentBet - playerBet;
      console.log('📤 Enviando acción CALL', callAmount);
      sendAction('call', callAmount);
      setPlayerHasActed(true);
    }
  }, [gameId, sendAction, currentBet, playerBet]);

  const handleRaise = useCallback((raiseAmount) => {
    if (gameId) {
      const totalBet = currentBet + raiseAmount;
      console.log('📤 Enviando acción RAISE', totalBet);
      sendAction('raise', totalBet);
      setPlayerHasActed(true);
    }
  }, [gameId, sendAction, currentBet]);

  const handleAllIn = useCallback(() => {
    if (gameId) {
      const allInAmount = playerChips;
      console.log('📤 Enviando acción ALL-IN', allInAmount);
      sendAction('all-in', allInAmount);
      setPlayerHasActed(true);
    }
  }, [gameId, sendAction, playerChips]);

  // Game phase progression (backend controls)
  const advanceGamePhase = useCallback(() => {
    // Backend maneja el avance de fases
    console.log('Esperando al backend para avanzar fase...');
  }, []);

  // Initialize new game - AHORA CONECTA CON BACKEND
  const startNewGame = useCallback((initialPlayers, playerIdx, smallBlind, bigBlind) => {
    setPlayerIndex(playerIdx);
    // El backend se encargará de iniciar el juego
    console.log('Esperando al backend para iniciar el juego...');
  }, []);

  // Update community cards (backend will send)
  const updateCommunityCards = useCallback((cards) => {
    setCommunityCards(cards);
  }, []);

  // Update player chips (backend will send)
  const updatePlayerChips = useCallback((chips) => {
    setPlayerChips(chips);
  }, []);

  // Update turn (backend will send)
  const updateCurrentTurn = useCallback((playerIndex) => {
    setCurrentPlayerTurn(playerIndex);
    setTurnTimeRemaining(30);
  }, []);

  // Check if player can perform actions
  const canCheck = currentBet === playerBet && !playerHasFolded && !playerHasActed;
  const canCall = currentBet > playerBet && !playerHasFolded && !playerHasActed;
  const canRaise = playerChips > (currentBet - playerBet + minRaise) && !playerHasFolded && !playerHasActed;
  const canFold = !playerHasFolded && !playerHasActed;
  const canAllIn = playerChips > 0 && !playerHasFolded && !playerHasActed;

  return {
    // Game state
    gameId,
    gamePhase,
    pot,
    sidePots,
    communityCards,
    currentBet,
    minRaise,
    dealerPosition,
    smallBlindPosition,
    bigBlindPosition,
    currentPlayerTurn,
    turnTimeRemaining,
    playerHoleCards,
    playerChips,
    playerBet,
    playerHasFolded,
    playerHasActed,
    players,
    playerIndex,
    currentPlayerTurn,
    
    // Winners (múltiples ganadores)
    winners,
    winnerIds,
    
    // Action checks
    canCheck,
    canCall,
    canRaise,
    canFold,
    canAllIn,
    
    // Actions
    handleFold,
    handleCheck,
    handleCall,
    handleRaise,
    handleAllIn,
    
    // Game control (for backend integration)
    advanceGamePhase,
    startNewGame,
    updateCommunityCards,
    updatePlayerChips,
    updateCurrentTurn,
    setGamePhase,
    setPot,
    setSidePots,
    setCurrentBet,
    setMinRaise,
    setDealerPosition,
    setSmallBlindPosition,
    setBigBlindPosition,
    setPlayerHoleCards,
    setPlayers,
    setGameId,
  };
};

export default usePokerGame;
