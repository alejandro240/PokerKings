import React, { useState, useEffect } from 'react';
import PokerTable from '../components/table/PokerTable';
import './TablePage.css';

function TablePage({ table, user, onNavigate }) {
  const [players, setPlayers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [isSpectator, setIsSpectator] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (table) {
      // Inicializar jugadores: el usuario actual + bots si se configuraron
      const initialPlayers = [];
      
      // Agregar el usuario actual como primer jugador
      if (user && !isSpectator) {
        initialPlayers.push({
          username: user.username,
          chips: user.chips || 5000,
          avatar: user.avatar || '😎'
        });
      }
      
      // Agregar bots si se configuraron
      if (table.botsCount) {
        for (let i = 0; i < table.botsCount; i++) {
          initialPlayers.push({
            username: `Bot ${i + 1}`,
            chips: 5000,
            avatar: '🤖'
          });
        }
      }
      
      // Rellenar asientos vacíos hasta maxPlayers
      while (initialPlayers.length < table.maxPlayers) {
        initialPlayers.push(null);
      }
      
      setPlayers(initialPlayers);
    }
  }, [table, user, isSpectator]);

  // Manejar levantarse (modo espectador)
  const handleStandUp = () => {
    setIsSpectator(true);
    setShowMenu(false);
    console.log('👁️ Usuario cambió a modo espectador');
  };

  // Manejar volver a sentarse
  const handleSitDown = () => {
    setIsSpectator(false);
    console.log('🪡 Usuario volvió a sentarse en la mesa');
  };

  // Manejar abandonar partida
  const handleLeaveTable = () => {
    const confirm = window.confirm('¿Estás seguro de que quieres abandonar la partida?');
    if (confirm) {
      console.log('🚻 Usuario abandonó la mesa');
      onNavigate('home');
    }
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
    console.log('📨 Enviando invitaciones a:', selectedFriends);
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
        <button className="btn-back" onClick={() => onNavigate('home')}>
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

        {/* Botón de menú */}
        <div className="menu-container">
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

      {/* Mesa de poker */}
      <PokerTable 
        maxPlayers={table.maxPlayers}
        players={players}
        tableColor={table.tableColor}
      />

      {/* Panel de acciones */}
      <div className="actions-panel">
        <button className="btn-action">🗣️ Chat</button>
        {isSpectator && (
          <button className="btn-action btn-rejoin" onClick={handleSitDown}>
            🪡 Volver a la Mesa
          </button>
        )}
        <button className="btn-action">⚙️ Configuración</button>
      </div>

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
