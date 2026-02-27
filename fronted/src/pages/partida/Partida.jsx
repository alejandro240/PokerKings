import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PokerTable from './MesaPoker';
import BettingActions from './AccionesApuesta';
import usePokerGame from './useJuegoPoker';
import { gameAPI } from '../../servicios/api';
import { gameSocket } from '../../servicios/socketJuego';
import './Partida.css';

function TablePage({ table, user, onNavigate }) {
  const [players, setPlayers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastShownHandOver, setLastShownHandOver] = useState(null);
  const [winnerPopupData, setWinnerPopupData] = useState(null);
  const [isCompact, setIsCompact] = useState(window.innerWidth < 900);

  // Detectar tamaño de pantalla para colapsar botones
  useEffect(() => {
    const handleResize = () => setIsCompact(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Usar el hook de juego de póker (conectado con backend)
  const pokerGame = usePokerGame(user);

  // Sincronizar jugadores desde el backend
  useEffect(() => {
    if (pokerGame.players && pokerGame.players.length > 0) {
      setPlayers(pokerGame.players);

      const me = pokerGame.players.find(p => p.userId === user?.id);
      if (me) {
        const shouldSpectate = !!me.isSittingOut;
        setIsSpectator(shouldSpectate);
      }
    }
  }, [pokerGame.players]);

  useEffect(() => {
    if (pokerGame.lastHandResult) {
      const idsKey = (pokerGame.lastHandResult.winnerIds || []).join(',');
      const key = `${idsKey || pokerGame.lastHandResult.winnerId}-${pokerGame.lastHandResult.potWon}`;
      if (key !== lastShownHandOver) {
        const winners = pokerGame.lastHandResult.winners || [];
        const potText = (pokerGame.lastHandResult.potWon ?? 0).toLocaleString();
        if (winners.length > 1) {
          const names = winners.map(w => w.username).filter(Boolean).join(', ');
          toast.success(`🤝 Empate: ${names || pokerGame.lastHandResult.winnerName} (Bote: ${potText} PK)`);
        } else {
          toast.success(`🏆 Ganador: ${pokerGame.lastHandResult.winnerName} (+${potText} PK)`);
        }
        setLastShownHandOver(key);
        return () => clearTimeout(timer);
      }
    }
  }, [pokerGame.lastHandResult, lastShownHandOver, user]);

  // Inicializar el juego desde el backend
  useEffect(() => {
    const initializeGame = async () => {
      if (!table || !user) return;

      try {
        setLoading(true);
        setError(null);

        // ESPERAR a unirse a la sala de WebSocket de la mesa ANTES de hacer startGame
        console.log(`🔌 Uniéndose a sala de WebSocket: table_${table.id}`);
        try {
          await gameSocket.joinTable(table.id);
          console.log(`✅ Socket unido a la sala. Procediendo con startGame...`);
        } catch (socketErr) {
          console.error('⚠️ Error al unirse a WebSocket:', socketErr.message);
          // Continuar de todas formas, pero puede haber problemas de sync
        }

        // Crear lista de jugadores para el backend
        const playerIds = [user.id]; // Comenzar con el usuario actual
        
        // El backend manejará agregar más jugadores si existen en la mesa
        // Por ahora, solo enviar el usuario actual
        
        // Iniciar el juego en el backend
        const response = await gameAPI.startGame(table.id, playerIds);
        
        // El backend devuelve response.data.game con el estado del juego
        const gameData = response.data.game || response.data;
        const gameId = gameData.id;
        
        if (gameId) {
          // Guardar el ID del juego
          pokerGame.setGameId(gameId);

          // Hidratar estado local inmediatamente con jugadores
          if (Array.isArray(gameData.players)) {
            setPlayers(gameData.players);
          }
          
          // El hook usePokerGame recibirá actualizaciones de todo el estado via WebSocket
          console.log('✅ Juego iniciado/unido:', gameId);
        } else {
          console.error('⚠️ No se recibió ID de juego del backend', response.data);
        }
      } catch (err) {
        console.error('❌ Error al iniciar el juego:', err);
        setError('No se pudo iniciar el juego. Intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    // Esperar un poco antes de inicializar (para que el WebSocket esté listo)
    const timer = setTimeout(() => {
      initializeGame();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (table?.id) {
        gameSocket.leaveTable(table.id);
      }
    };
  }, [table, user]);

  // Manejar levantarse (modo espectador)
  const handleStandUp = async () => {
    try {
      if (pokerGame.gameId) {
        await gameAPI.leaveGame(pokerGame.gameId, user?.id);
      }
      if (table?.id) {
        gameSocket.leaveTable(table.id);
      }
      setIsSpectator(true);
      setShowMenu(false);
      console.log('👁️ Usuario cambió a modo espectador');
    } catch (err) {
      console.error('Error al cambiar a modo espectador:', err);
    }
  };

  // Manejar volver a sentarse
  const handleSitDown = async () => {
    try {
      if (table && user) {
        // Re-unirse a la sala de WebSocket (por si se había desconectado)
        try {
          await gameSocket.joinTable(table.id);
          console.log(`✅ Socket re-unido a la sala. Procediendo con startGame...`);
        } catch (socketErr) {
          console.error('⚠️ Error al re-unirse a WebSocket:', socketErr.message);
        }

        const response = await gameAPI.startGame(table.id, [user.id]);
        const gameData = response.data?.game || response.data;
        if (gameData?.id) {
          pokerGame.setGameId(gameData.id);
          if (Array.isArray(gameData.players)) {
            setPlayers(gameData.players);
          }
        }
      }
      setIsSpectator(false);
      console.log('🪡 Usuario volvió a sentarse en la mesa');
    } catch (err) {
      console.error('Error al volver a sentarse:', err);
    }
  };

  // Manejar abandonar partida
  const handleLeaveTable = async () => {
    const performLeave = async () => {
      try {
        if (pokerGame.gameId) {
          await gameAPI.leaveGame(pokerGame.gameId, user?.id);
        }
        if (table?.id) {
          gameSocket.leaveTable(table.id);
        }
      } catch (leaveErr) {
        console.error('Error abandonando el juego:', leaveErr);
      }
      toast.success('Has abandonado la mesa', { id: 'leave-success' });
      onNavigate('lobby');
    };

    toast.dismiss('leave-confirm');
    
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>¿Abandonar la partida?</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              await performLeave();
            }}
            style={{
              background: '#c41e3a',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Sí, salir
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: '#0b6623',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    ), { duration: 5000, id: 'leave-confirm' });
  };

  // Manejar invitar a un amigo
  const handleOpenInvite = () => {
    setShowInviteModal(true);
    setShowMenu(false);
  };

  // Lista de amigos de ejemplo (después vendrá del backend)
  const friends = [
    { id: 1, username: 'Carlos23', avatar: '👤', online: true },
    { id: 2, username: 'Maria_Poker', avatar: '👤', online: false },
    { id: 3, username: 'JuanKing', avatar: '👤', online: true },
    { id: 4, username: 'AnaQueen', avatar: '👤', online: true },
  ];

  // Manejar selección de amigos
  const toggleFriendSelection = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  // Enviar invitaciones
  const handleSendInvites = () => {
    const count = selectedFriends.length;
    toast.success(`📨 ${count} invitación${count > 1 ? 'es' : ''} enviada${count > 1 ? 's' : ''}`, { id: 'send-invites' });
    // Aquí después llamarás al backend
    setShowInviteModal(false);
    setSelectedFriends([]);
  };

  if (!table) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e0e0e0' }}>
        <h2>Mesa no encontrada</h2>
        <button className="btn btn-primary" onClick={() => onNavigate('inicio')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e0e0e0' }}>
        <h2>Cargando usuario...</h2>
        <p>Espera un momento</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#e0e0e0' }}>
        <h2>Iniciando juego...</h2>
        <p>Conectando con el servidor...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: '#ff6b6b' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={() => onNavigate('mesas')}>
          Volver al lobby
        </button>
      </div>
    );
  }

  return (
    <div className="table-page">
      {/* Popup ganador centrado en pantalla */}
      {winnerPopupData && (
        <div className={`winner-popup ${winnerPopupData.esTuVictoria ? 'winner-popup--tuya' : ''}`}>
          <div className="winner-popup__icono">{winnerPopupData.esTuVictoria ? '🥇' : '🏆'}</div>
          <div className="winner-popup__titulo">
            {winnerPopupData.esTuVictoria ? '¡HAS GANADO!' : 'Ganador de la mano'}
          </div>
          <div className="winner-popup__nombre">{winnerPopupData.winnerName}</div>
          <div className="winner-popup__bote">+{(winnerPopupData.potWon || 0).toLocaleString()} PK</div>
        </div>
      )}

      {/* Header con información de la mesa */}
      <div className="table-header">
        <button className="btn-back" onClick={handleLeaveTable}>
          ← Salir de la mesa
        </button>
        
        <div className="table-info-header">
          <h2 className="table-title">{table.name}</h2>
          <div className="table-stats">
            <span className="stat">💰 Ciegas: {table.smallBlind}/{table.bigBlind}</span>
            <span className="stat">👥 Jugadores: {pokerGame.players.filter(p => p && !p.isSittingOut).length}/{table.maxPlayers}</span>
            {table.isPrivate && <span className="stat">🔒 Privada</span>}
            {isSpectator && <span className="stat spectator-badge">👁️ Modo Espectador</span>}
            <span className="stat">🎮 Fase: {pokerGame.gamePhase}</span>
          </div>
        </div>

        {/* Botones de menú y chat */}
        <div className="menu-container">
          {/* Chat: visible solo en pantallas grandes */}
          {!isCompact && (
            <button className="btn-menu btn-chat">
              🗣️ Chat
            </button>
          )}

          <button 
            className={`btn-menu${isCompact ? ' compact' : ''}`}
            onClick={() => setShowMenu(!showMenu)}
          >
            {isCompact ? '☰' : '☰ Menú'}
          </button>
          
          {/* Dropdown del menú */}
          {showMenu && (
            <div className="menu-dropdown">
              {/* En modo compacto: Salir y Chat al principio del dropdown */}
              {isCompact && (
                <>
                  <button
                    className="menu-item"
                    onClick={() => { setShowMenu(false); onNavigate('mesas'); }}
                  >
                    <span className="menu-icon">←</span>
                    Salir de la mesa
                    <span className="menu-desc">Volver al lobby</span>
                  </button>
                  <button className="menu-item">
                    <span className="menu-icon">🗣️</span>
                    Chat
                    <span className="menu-desc">Abrir el chat</span>
                  </button>
                  <div className="menu-divider" />
                </>
              )}

              {!isSpectator ? (
                <button 
                  className="menu-item" 
                  onClick={handleStandUp}
                >
                  <span className="menu-icon">🪡</span>
                  Levantarse
                  <span className="menu-desc">Cambiar a modo espectador</span>
                </button>
              ) : (
                <button 
                  className="menu-item" 
                  onClick={handleSitDown}
                >
                  <span className="menu-icon">🪡</span>
                  Volver a sentarse
                  <span className="menu-desc">Reincorporarse a la mesa</span>
                </button>
              )}
              
              <button 
                className="menu-item" 
                onClick={handleOpenInvite}
              >
                <span className="menu-icon">👥</span>
                Invitar a un amigo
                <span className="menu-desc">Enviar invitaciones</span>
              </button>
              
              <button 
                className="menu-item danger" 
                onClick={handleLeaveTable}
              >
                <span className="menu-icon">🚻</span>
                Abandonar partida
                <span className="menu-desc">Salir definitivamente</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mesa de poker con cartas comunitarias */}
      {(() => {
        const tablePlayers = pokerGame.players.length > 0 ? pokerGame.players : players;
        const currentUserIndex = tablePlayers.findIndex(p => p?.userId === user?.id);
        return (
      <PokerTable 
        maxPlayers={table.maxPlayers}
        players={tablePlayers}
        currentPlayerId={user?.id || user?.username} // ID del usuario actual
        tableColor={table.tableColor}
        dealerPosition={pokerGame.dealerPosition}
        smallBlindPosition={pokerGame.smallBlindPosition}
        bigBlindPosition={pokerGame.bigBlindPosition}
        communityCards={pokerGame.communityCards}
        gamePhase={pokerGame.gamePhase}
        pot={pokerGame.pot}
        sidePots={pokerGame.sidePots}
        currentUserIndex={currentUserIndex}
        currentPlayerIndex={pokerGame.currentPlayerTurn}
      />
        );
      })()}

      {/* Acciones de apuestas */}
      {!isSpectator && pokerGame.gamePhase !== 'waiting' && (() => {
        const isMyTurn = pokerGame.currentPlayerTurn === pokerGame.playerIndex;
        console.log('🎮 BettingActions:', {
          currentPlayerTurn: pokerGame.currentPlayerTurn,
          playerIndex: pokerGame.playerIndex,
          isMyTurn,
          gamePhase: pokerGame.gamePhase
        });
        return (
          <BettingActions 
            playerChips={pokerGame.playerChips}
            currentBet={pokerGame.currentBet}
            minRaise={pokerGame.minRaise}
            pot={pokerGame.pot}
            isPlayerTurn={isMyTurn}
            canCheck={pokerGame.canCheck}
            canCall={pokerGame.canCall}
            canRaise={pokerGame.canRaise}
            canFold={pokerGame.canFold}
            turnTimeRemaining={pokerGame.turnTimeRemaining}
            onFold={pokerGame.handleFold}
            onCheck={pokerGame.handleCheck}
            onCall={pokerGame.handleCall}
            onRaise={pokerGame.handleRaise}
            onAllIn={pokerGame.handleAllIn}
          />
        );
      })()}

      {/* Panel de acciones */}
      {isSpectator && (
        <div className="actions-panel">
          <button className="btn-action btn-rejoin" onClick={handleSitDown}>
            🪡 Volver a la Mesa
          </button>
        </div>
      )}

      {/* Modal de invitación a amigos */}
      {showInviteModal && (
        <>
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}></div>
          <div className="invite-modal">
            <div className="modal-header">
              <h3>👥 Invitar a un amigo</h3>
              <button 
                className="btn-close-modal" 
                onClick={() => setShowInviteModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-subtitle">Selecciona a quién quieres invitar a {table.name}</p>
              
              <div className="friends-list">
                {friends.map(friend => (
                  <div 
                    key={friend.id} 
                    className={`friend-item ${
                      !friend.online ? 'offline' : ''
                    } ${
                      selectedFriends.includes(friend.id) ? 'selected' : ''
                    }`}
                    onClick={() => friend.online && toggleFriendSelection(friend.id)}
                  >
                    <div className="friend-info">
                      <span className="friend-avatar">{friend.avatar}</span>
                      <span className="friend-name">{friend.username}</span>
                      {friend.online ? (
                        <span className="status-badge online">🟢 Online</span>
                      ) : (
                        <span className="status-badge offline">⚪ Offline</span>
                      )}
                    </div>
                    {selectedFriends.includes(friend.id) && (
                      <span className="check-icon">✓</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-cancel" 
                onClick={() => setShowInviteModal(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-send-invites" 
                onClick={handleSendInvites}
                disabled={selectedFriends.length === 0}
              >
                📨 Enviar Invitaciones ({selectedFriends.length})
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TablePage;
