import React from 'react';
import './PokerTable.css';

function PokerTable({ 
  maxPlayers = 6, 
  players = [], 
  tableColor = '#1a4d2e',
  dealerPosition = null,
  smallBlindPosition = null,
  bigBlindPosition = null,
  communityCards = [],
  gamePhase = 'waiting',
  pot = 0,
  sidePots = []
}) {
  // Formatear carta para mostrar (e.g., "AS" → "A♠", "KH" → "K♥")
  const formatCard = (card) => {
    if (!card || card.length < 2) return '';
    
    const rank = card.charAt(0);
    const suitChar = card.charAt(1).toUpperCase();
    
    const suits = {
      'S': '♠',
      'H': '♥',
      'D': '♦',
      'C': '♣'
    };
    
    const colors = {
      'S': 'black',
      'H': 'red',
      'D': 'red',
      'C': 'black'
    };
    
    return {
      display: `${rank}${suits[suitChar] || suitChar}`,
      color: colors[suitChar] || 'black'
    };
  };

  // Determinar qué cartas mostrar según fase del juego
  const getVisibleCards = () => {
    switch (gamePhase) {
      case 'pre-flop':
        return [];
      case 'flop':
        return communityCards.slice(0, 3);
      case 'turn':
        return communityCards.slice(0, 4);
      case 'river':
      case 'showdown':
        return communityCards.slice(0, 5);
      default:
        return [];
    }
  };

  const visibleCards = getVisibleCards();
  const emptySlots = 5 - visibleCards.length;
  // Posiciones de los asientos alrededor de la mesa según el número máximo
  const seatPositions = {
    4: [
      { top: '2%', left: '50%', transform: 'translateX(-50%)' }, // Arriba
      { top: '50%', right: '1%', transform: 'translateY(-50%)' }, // Derecha
      { bottom: '2%', left: '50%', transform: 'translateX(-50%)' }, // Abajo
      { top: '50%', left: '1%', transform: 'translateY(-50%)' }  // Izquierda
    ],
    6: [
      { top: '1%', left: '50%', transform: 'translateX(-50%)' },     // Arriba centro
      { top: '20%', right: '1%', transform: 'translateY(-50%)' },    // Arriba derecha
      { bottom: '20%', right: '1%', transform: 'translateY(50%)' },  // Abajo derecha
      { bottom: '1%', left: '50%', transform: 'translateX(-50%)' },  // Abajo centro
      { bottom: '20%', left: '1%', transform: 'translateY(50%)' },   // Abajo izquierda
      { top: '20%', left: '1%', transform: 'translateY(-50%)' }      // Arriba izquierda
    ],
    8: [
      { top: '0%', left: '50%', transform: 'translateX(-50%)' },     // Arriba centro
      { top: '12%', right: '3%' },                                   // Arriba derecha
      { top: '45%', right: '0%', transform: 'translateY(-50%)' },    // Centro derecha
      { bottom: '12%', right: '3%' },                                // Abajo derecha
      { bottom: '0%', left: '50%', transform: 'translateX(-50%)' },  // Abajo centro
      { bottom: '12%', left: '3%' },                                 // Abajo izquierda
      { top: '45%', left: '0%', transform: 'translateY(-50%)' },     // Centro izquierda
      { top: '12%', left: '3%' }                                     // Arriba izquierda
    ]
  };

  const positions = seatPositions[maxPlayers] || seatPositions[6];

  return (
    <div className="poker-table-container">
      {/* Mesa de poker */}
      <div className="poker-table">
        <img 
          src="/assets/images/mesa-poker.png" 
          alt="Mesa de Poker" 
          className="table-image"
        />
        
        {/* Cartas comunitarias encima de la mesa */}
        <div className="community-cards-on-table">
          <div className="cards-row-table">
            {/* Cartas visibles */}
            {visibleCards.map((card, index) => {
              const formattedCard = formatCard(card);
              return (
                <div 
                  key={index} 
                  className={`community-card-table revealed card-${index}`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="card-content-table" style={{ color: formattedCard.color }}>
                    <div className="card-rank-top-table">{formattedCard.display}</div>
                    <div className="card-suit-table">{formattedCard.display.slice(-1)}</div>
                    <div className="card-rank-bottom-table">{formattedCard.display}</div>
                  </div>
                </div>
              );
            })}

            {/* Slots vacíos */}
            {gamePhase !== 'waiting' && Array.from({ length: emptySlots }).map((_, index) => (
              <div key={`empty-${index}`} className="community-card-table empty">
                <div className="card-back-table">🂠</div>
              </div>
            ))}

            {/* Estado de espera */}
            {gamePhase === 'waiting' && Array.from({ length: 5 }).map((_, index) => (
              <div key={`waiting-${index}`} className="community-card-table waiting">
                <div className="card-placeholder-table">?</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pot (bote central) debajo de las cartas */}
        <div className="pot-container">
          <div className="pot-amount">💰 {pot.toLocaleString()} PK</div>
          {sidePots && sidePots.length > 0 && (
            <div className="side-pots-mini">
              {sidePots.map((sidePot, index) => (
                <div key={index} className="side-pot-mini">
                  +{sidePot.amount.toLocaleString()} PK
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Asientos de jugadores */}
      {Array.from({ length: maxPlayers }).map((_, index) => {
        const player = players[index];
        const position = positions[index];

        return (
          <div 
            key={index}
            className={`player-seat ${player ? 'occupied' : 'empty'}`}
            style={position}
          >
            {player ? (
              <div className="player-info">
                {/* Position Indicators */}
                {dealerPosition === index && (
                  <div className="position-badge dealer-badge">D</div>
                )}
                {smallBlindPosition === index && (
                  <div className="position-badge sb-badge">SB</div>
                )}
                {bigBlindPosition === index && (
                  <div className="position-badge bb-badge">BB</div>
                )}
                
                <div className="player-header">
                  <div className="player-avatar">{player.avatar || '👤'}</div>
                  <div className="player-level">🎖️ Nv {player.level || 1}</div>
                </div>
                <div className="player-name">{player.username}</div>
                <div className="player-balance">
                  <span className="pk-coin">🪙</span>
                  <span className="balance-amount">{(player.chips || 0).toLocaleString()} PK</span>
                </div>
                <div className="player-cards">
                  {/* Cartas del jugador */}
                  <div className="card">🂠</div>
                  <div className="card">🂠</div>
                </div>
              </div>
            ) : (
              <div className="empty-seat">
                <div className="empty-seat-icon">+</div>
                <div className="empty-seat-text">Asiento {index + 1}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PokerTable;
