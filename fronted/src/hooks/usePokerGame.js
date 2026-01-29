import { useState, useCallback } from 'react';

/**
 * Custom hook for managing poker game state
 * This will integrate with backend game logic once implemented
 */
const usePokerGame = () => {
  // Game state
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

  // All players state (for display)
  const [players, setPlayers] = useState([]);

  // Actions that will connect to backend
  const handleFold = useCallback(() => {
    setPlayerHasFolded(true);
    setPlayerHasActed(true);
    
    // TODO: Send to backend
    console.log('Player folded');
  }, []);

  const handleCheck = useCallback(() => {
    setPlayerHasActed(true);
    
    // TODO: Send to backend
    console.log('Player checked');
  }, []);

  const handleCall = useCallback(() => {
    const callAmount = currentBet - playerBet;
    setPlayerBet(currentBet);
    setPlayerChips(prev => prev - callAmount);
    setPot(prev => prev + callAmount);
    setPlayerHasActed(true);
    
    // TODO: Send to backend
    console.log('Player called', callAmount);
  }, [currentBet, playerBet]);

  const handleRaise = useCallback((raiseAmount) => {
    const totalBet = currentBet + raiseAmount;
    const additionalChips = totalBet - playerBet;
    
    setPlayerBet(totalBet);
    setPlayerChips(prev => prev - additionalChips);
    setPot(prev => prev + additionalChips);
    setCurrentBet(totalBet);
    setMinRaise(raiseAmount);
    setPlayerHasActed(true);
    
    // TODO: Send to backend
    console.log('Player raised to', totalBet);
  }, [currentBet, playerBet]);

  const handleAllIn = useCallback(() => {
    const allInAmount = playerChips;
    const totalBet = playerBet + allInAmount;
    
    setPlayerBet(totalBet);
    setPlayerChips(0);
    setPot(prev => prev + allInAmount);
    
    if (totalBet > currentBet) {
      setCurrentBet(totalBet);
      setMinRaise(totalBet - currentBet);
    }
    
    setPlayerHasActed(true);
    
    // TODO: Send to backend
    console.log('Player went all-in with', allInAmount);
  }, [playerChips, playerBet, currentBet]);

  // Game phase progression (backend will control this)
  const advanceGamePhase = useCallback(() => {
    const phaseOrder = ['waiting', 'pre-flop', 'flop', 'turn', 'river', 'showdown'];
    const currentIndex = phaseOrder.indexOf(gamePhase);
    
    if (currentIndex < phaseOrder.length - 1) {
      const nextPhase = phaseOrder[currentIndex + 1];
      setGamePhase(nextPhase);
      
      // Reset betting for new round
      setCurrentBet(0);
      setPlayerBet(0);
      setPlayerHasActed(false);
      
      console.log('Advanced to phase:', nextPhase);
    }
  }, [gamePhase]);

  // Initialize new game (mock - backend will handle)
  const startNewGame = useCallback((initialPlayers, playerIndex, smallBlind, bigBlind) => {
    // Reset game state
    setGamePhase('pre-flop');
    setPot(smallBlind + bigBlind);
    setSidePots([]);
    setCommunityCards([]);
    setCurrentBet(bigBlind);
    setMinRaise(bigBlind);
    setTurnTimeRemaining(30);
    
    // Set positions
    setDealerPosition(0);
    setSmallBlindPosition(1);
    setBigBlindPosition(2);
    setCurrentPlayerTurn((2 + 1) % initialPlayers.length); // First to act after big blind
    
    // Set player state
    setPlayerHoleCards([]);
    setPlayerBet(playerIndex === 1 ? smallBlind : playerIndex === 2 ? bigBlind : 0);
    setPlayerHasFolded(false);
    setPlayerHasActed(false);
    
    // Set all players
    setPlayers(initialPlayers);
    
    console.log('New game started');
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
    // State
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
  };
};

export default usePokerGame;
