import { useState, useCallback, useEffect } from 'react';
import { gameSocket } from '../../servicios/socketJuego';
import { gameAPI } from '../../servicios/api';

/**
 * Custom hook for managing poker game state
 * Integrado con backend a través de WebSocket
 */
const usePokerGame = (user) => {
  // Game state
  const [gameId, setGameId] = useState(null);
  const [gamePhase, setGamePhase] = useState('waiting'); // pre-flop, flop, turn, river, showdown
  const [gameStatus, setGameStatus] = useState('waiting'); // waiting, active, completed 
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

  // Actualizar avatar del jugador actual inmediatamente cuando cambia en el perfil
  useEffect(() => {
    if (!user?.id || !user?.avatar) return;
    setPlayers(prev => prev.map(p =>
      p.userId === user.id ? { ...p, avatar: user.avatar } : p
    ));
  }, [user?.avatar]);
  
  // Winners from backend
  const [winners, setWinners] = useState([]); // Para múltiples ganadores
  const [winnerIds, setWinnerIds] = useState([]); // IDs de ganadores
  const [lastHandResult, setLastHandResult] = useState(null);

  // Configurar listeners de WebSocket al montar
  useEffect(() => {
    gameSocket.connect();

    // Actualizar estado del juego desde backend
    gameSocket.on('gameStateUpdated', (gameState) => {
      console.log('🎮 gameStateUpdated recibido:', gameState);
      
      if (gameState) {
        setGameId(gameState.id);
        // FIX: Separar phase y status correctamente
        setGamePhase(gameState.phase || 'waiting');
        setGameStatus(gameState.status || 'waiting');
        setPot(gameState.pot || 0);
        setSidePots(gameState.sidePots || []);
        setCommunityCards(gameState.communityCards || []);
        setCurrentBet(gameState.currentBet || 0);
        setMinRaise(gameState.minRaise || 0);
        setDealerPosition(gameState.dealerIndex || 0);
        setSmallBlindPosition(gameState.smallBlindIndex ?? 0);
        setBigBlindPosition(gameState.bigBlindIndex ?? 0);
        
        let currentIdx = -1;
        
        // Actualizar estado del jugador actual
        if (gameState.players && gameState.players.length > 0) {
          console.log('👥 Actualizando jugadores:', gameState.players.length, gameState.players);

          // Usar avatar local (sessionStorage) para el jugador actual ya que el backend puede tener uno desactualizado
          const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
          const playersConAvatar = gameState.players.map(p =>
            p.userId === currentUser.id && currentUser.avatar
              ? { ...p, avatar: currentUser.avatar }
              : p
          );
          setPlayers(playersConAvatar);
          currentIdx = gameState.players.findIndex(p => p.userId === currentUser.id);
          
          // FIX: Manejar caso cuando currentIdx === -1 (espectador)
          if (currentIdx !== -1) {
            setPlayerIndex(currentIdx);
            const currentPlayer = gameState.players[currentIdx];
            setPlayerChips(currentPlayer.chips || 0);
            setPlayerBet(currentPlayer.betInPhase || 0);
            setPlayerHoleCards(currentPlayer.holeCards || []);
            setPlayerHasFolded(currentPlayer.folded || false);
            // Resetear acciones cuando es tu turno o al empezar mano
            if (gameState.currentPlayerIndex === currentIdx || !currentPlayer.lastAction) {
              setPlayerHasActed(false);
            }
          } else {
            // Usuario es espectador, establecer valores por defecto
            setPlayerIndex(-1);
            setPlayerChips(0);
            setPlayerBet(0);
            setPlayerHoleCards([]);
            setPlayerHasFolded(false);
            setPlayerHasActed(false);
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

    gameSocket.on('handOver', (handData) => {
      setLastHandResult(handData);
      setPlayerHasActed(false);
    });

    return () => {
      // FIX: Pasar las mismas referencias de funciones para limpiar correctamente
      // No hay referencias específicas guardadas, así que usamos off sin callback
      // para remover todos los listeners de ese evento
      gameSocket.off('gameStateUpdated');
      gameSocket.off('phaseChanged');
      gameSocket.off('showdown');
      gameSocket.off('handOver');
    };
  }, []);

  // Resetear acciones cuando cambia el turno al jugador actual
  useEffect(() => {
    if (currentPlayerTurn === playerIndex) {
      setPlayerHasActed(false);
    }
  }, [currentPlayerTurn, playerIndex]);

  // Actions que envían al backend vía REST API
  const sendAction = useCallback(async (action, amount = 0) => {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    
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
        if (data.handOver) {
          setLastHandResult({
            winnerId: data.winnerId || data.winner?.userId || data.winner?.id,
            winnerName: data.winnerName || data.winner?.username || 'Desconocido',
            winnerIds: data.winnerIds || [],
            winners: data.winners || [],
            potWon: data.potWon ?? 0
          });
          setPlayerHasActed(false);
        }
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
  const currentPlayerState = players[playerIndex];
  const committed = parseInt(currentPlayerState?.betInPhase ?? playerBet) || 0;
  const currentBetNum = parseInt(currentBet) || 0;
  const isMyTurn = currentPlayerTurn === playerIndex;
  const isPreflop = gamePhase === 'preflop' || gamePhase === 'pre-flop';
  const isBigBlind = playerIndex === bigBlindPosition;
  let canCheck = isMyTurn && committed >= currentBetNum && !playerHasFolded;
  const canCall = isMyTurn && currentBetNum > committed && !playerHasFolded;
  const canRaise = isMyTurn && playerChips > (currentBetNum - committed + minRaise) && !playerHasFolded;
  const canFold = isMyTurn && !playerHasFolded;
  const canAllIn = isMyTurn && playerChips > 0 && !playerHasFolded;

  // Preflop: si eres BB y ya igualaste (SB ha pagado), debes poder hacer check
  if (isMyTurn && isPreflop && isBigBlind && committed >= currentBetNum && !playerHasFolded) {
    canCheck = true;
  }

  // Debug logs para check
  if (isMyTurn) {
    console.log('🔍 [usePokerGame] Action Check Debug:', {
      playerIndex,
      currentPlayerTurn,
      isMyTurn,
      committed,
      currentBetNum,
      playerHasFolded,
      canCheck,
      canCall,
      currentPlayerState
    });
  }

  return {
    // Game state
    gameId,
    gamePhase,
    gameStatus,
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
    
    // Winners
    winners,
    winnerIds,
    lastHandResult,
    
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
