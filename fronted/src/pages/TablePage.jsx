import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import PokerTable from '../components/table/PokerTable';
import BettingActions from '../components/table/BettingActions';
import usePokerGame from '../hooks/usePokerGame';
import './TablePage.css';

function TablePage({ table, user, onNavigate }) {
  const [players, setPlayers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  // Usar el hook de juego de póker
  const pokerGame = usePokerGame();

  useEffect(() => {
    if (table) {
      // Inicializar jugadores: el usuario actual + bots si se configuraron
      const initialPlayers = [];
      
      // Agregar el usuario actual como primer jugador
      if (user && !isSpectator) {
        initialPlayers.push({
          username: user.username,
          chips: user.chips || 5000,
          avatar: user.avatar && user.avatar !== 'default-avatar.png' ? user.avatar : '🎮',
          level: user.level || 1
        });
      }
      
      // Agregar bots si se configuraron
      if (table.botsCount) {
        for (let i = 0; i < table.botsCount; i++) {
          initialPlayers.push({
            username: `Bot ${i + 1}`,
            chips: 5000,
            avatar: '🤖',
            level: Math.floor(Math.random() * 20) + 1 // Nivel aleatorio entre 1-20
          });
        }
      }
      
      // Rellenar asientos vacíos hasta maxPlayers
      while (initialPlayers.length < table.maxPlayers) {
        initialPlayers.push(null);
      }
      
      setPlayers(initialPlayers);

      // Inicializar el juego cuando hay suficientes jugadores
      const activePlayers = initialPlayers.filter(p => p !== null);
      if (activePlayers.length >= 2) {
        // Determinar el índice del jugador actual
        const playerIndex = activePlayers.findIndex(p => p.username === user?.username);
        
        // Iniciar juego (después el backend enviará esto)
        setTimeout(() => {
          pokerGame.startNewGame(
            activePlayers, 
            playerIndex >= 0 ? playerIndex : 0,
            table.smallBlind || 50,
            table.bigBlind || 100
          );
          pokerGame.updatePlayerChips(user?.chips || 5000);
        }, 1000);
      }
    }
  }, [table, user, isSpectator]);

  // Manejar levantarse (modo espectador)
  const handleStandUp = () => {
    setIsSpectator(true);
    setShowMenu(false);
    toast.success('👁️ Ahora estás en modo espectador', { id: 'stand-up' });
  };

  // Manejar volver a sentarse
  const handleSitDown = () => {
    setIsSpectator(false);
    toast.success('🪑 Te has vuelto a sentar en la mesa', { id: 'sit-down' });
  };

  // Manejar abandonar partida
  const handleLeaveTable = () => {
    // Cerrar cualquier toast de confirmación previo
    toast.dismiss('leave-confirm');
    
    toast((t) => (
      <div style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '1rem' }}>¿Abandonar la partida?</p>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              toast.success('Has abandonado la mesa', { id: 'leave-success' });
              onNavigate('home');
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
        <button className="btn btn-primary" onClick={() => onNavigate('home')}>
          Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="table-page">
      {/* Header con información de la mesa */}
      <div className="table-header">
        <button className="btn-back" onClick={() => onNavigate('lobby')}>
          ← Salir de la mesa
        </button>
        
        <div className="table-info-header">
          <h2 className="table-title">{table.name}</h2>
          <div className="table-stats">
            <span className="stat">💰 Ciegas: {table.smallBlind}/{table.bigBlind}</span>
            <span className="stat">👥 Jugadores: {players.filter(p => p !== null).length}/{table.maxPlayers}</span>
            {table.isPrivate && <span className="stat">🔒 Privada</span>}
            {isSpectator && <span className="stat spectator-badge">👁️ Modo Espectador</span>}
          </div>
        </div>

        {/* Botones de menú y chat */}
        <div className="menu-container">
          <button className="btn-menu btn-chat">
            🗣️ Chat
          </button>
          
          <button 
            className="btn-menu" 
            onClick={() => setShowMenu(!showMenu)}
          >
            ☰ Menú
          </button>
          
          {/* Dropdown del menú */}
          {showMenu && (
            <div className="menu-dropdown">
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
      <PokerTable 
        maxPlayers={table.maxPlayers}
        players={players}
        tableColor={table.tableColor}
        dealerPosition={pokerGame.dealerPosition}
        smallBlindPosition={pokerGame.smallBlindPosition}
        bigBlindPosition={pokerGame.bigBlindPosition}
        communityCards={pokerGame.communityCards}
        gamePhase={pokerGame.gamePhase}
        pot={pokerGame.pot}
        sidePots={pokerGame.sidePots}
      />

      {/* Acciones de apuestas */}
      {!isSpectator && pokerGame.gamePhase !== 'waiting' && (
        <BettingActions 
          playerChips={pokerGame.playerChips}
          currentBet={pokerGame.currentBet}
          minRaise={pokerGame.minRaise}
          pot={pokerGame.pot}
          isPlayerTurn={pokerGame.currentPlayerTurn === 0} // Asumiendo que el jugador es índice 0
          canCheck={pokerGame.canCheck}
          canCall={pokerGame.canCall}
          canRaise={pokerGame.canRaise}
          canFold={pokerGame.canFold}
          onFold={pokerGame.handleFold}
          onCheck={pokerGame.handleCheck}
          onCall={pokerGame.handleCall}
          onRaise={pokerGame.handleRaise}
          onAllIn={pokerGame.handleAllIn}
        />
      )}

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
