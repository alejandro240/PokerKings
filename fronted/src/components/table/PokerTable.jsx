import React, { useState, useEffect } from 'react';
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
  sidePots = [],
  currentPlayerId = null // ID del jugador que está viendo la mesa
}) {
  // Estado para rastrear qué cartas ya fueron reveladas
  const [revealedCards, setRevealedCards] = useState([]);
  // Obtener ruta de imagen de carta (e.g., "AS" → "/assets/images/AS.png")
  const getCardImage = (card) => {
    if (!card || card.length < 2) return null;
    
    // Normalizar formato: "10H" debe quedar como "10H", "Ah" como "AH"
    let rank = card.slice(0, -1).toUpperCase();
    let suit = card.slice(-1).toUpperCase();
    
    // Asegurar que rank esté en el formato correcto
    const validRanks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const validSuits = ['C', 'D', 'H', 'S'];
    
    if (!validRanks.includes(rank) || !validSuits.includes(suit)) {
      console.warn(`Carta inválida: ${card}`);
      return null;
    }
    
    return `/assets/images/${rank}${suit}.png`;
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

  // Efecto para revelar cartas nuevas con delay
  useEffect(() => {
    // Resetear cuando cambia la fase a waiting (nueva mano)
    if (gamePhase === 'waiting') {
      setRevealedCards([]);
      return;
    }

    // Agregar nuevas cartas con un pequeño delay para activar la transición
    visibleCards.forEach((card, index) => {
      if (!revealedCards.includes(card)) {
        setTimeout(() => {
          setRevealedCards(prev => {
            if (!prev.includes(card)) {
              return [...prev, card];
            }
            return prev;
          });
        }, 100); // Pequeño delay para que el navegador detecte el cambio
      }
    });
  }, [visibleCards, gamePhase]);
  // Posiciones de los asientos alrededor de la mesa según el número máximo
  const seatPositions = {
    4: [
      { top: '1%', left: '50%', transform: 'translateX(-50%)' },       // Arriba
      { top: '50%', right: '2%', transform: 'translateY(-50%)' },      // Derecha
      { bottom: '1%', left: '50%', transform: 'translateX(-50%)' },    // Abajo
      { top: '50%', left: '2%', transform: 'translateY(-50%)' }        // Izquierda
    ],
    6: [
      { top: '1%', left: '50%', transform: 'translateX(-50%)' },       // Arriba centro
      { top: '4%', right: '12%' },                                     // Arriba derecha
      { bottom: '4%', right: '12%' },                                  // Abajo derecha
      { bottom: '1%', left: '50%', transform: 'translateX(-50%)' },    // Abajo centro
      { bottom: '4%', left: '12%' },                                   // Abajo izquierda
      { top: '4%', left: '12%' }                                       // Arriba izquierda
    ],
    8: [
      { top: '1%', left: '50%', transform: 'translateX(-50%)' },       // Arriba centro
      { top: '4%', right: '12%' },                                     // Arriba derecha
      { bottom: '4%', right: '12%' },                                  // Abajo derecha
      { bottom: '1%', left: '50%', transform: 'translateX(-50%)' },    // Abajo centro
      { bottom: '4%', left: '12%' },                                   // Abajo izquierda
      { top: '4%', left: '12%' },                                      // Arriba izquierda
      { top: '50%', left: '0.5%', transform: 'translateY(-50%)' },     // Centro izquierda
      { top: '50%', right: '0.5%', transform: 'translateY(-50%)' }     // Centro derecha
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
              const cardImage = getCardImage(card);
              const isRevealed = revealedCards.includes(card);
              return (
                <div 
                  key={card} 
                  className={`community-card-table ${isRevealed ? 'revealed' : ''} card-${index}`}
                  style={{ transitionDelay: `${index * 0.4}s` }}
                >
                  <div className="card-inner-table">
                    <div className="card-back-table">🂠</div>
                    <div className="card-front-table">
                      {cardImage ? (
                        <img 
                          src={cardImage} 
                          alt={card} 
                          className="card-image"
                        />
                      ) : (
                        <div className="card-placeholder-table">?</div>
                      )}
                    </div>
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
        const isCurrentPlayer = currentPlayerId && player && player.id === currentPlayerId;

        return (
          <div 
            key={index}
            className={`player-seat ${player ? 'occupied' : 'empty'}`}
            style={position}
          >
            {player ? (
              <>
                {/* Cartas del jugador - ARRIBA del player-info */}
                <div className="player-cards">
                  {isCurrentPlayer && player.cards && player.cards.length > 0 ? (
                    // Mostrar cartas reveladas para el jugador actual
                    player.cards.map((card, cardIndex) => {
                      const cardImage = getCardImage(card);
                      return (
                        <div key={cardIndex} className="player-card-revealed">
                          {cardImage ? (
                            <img src={cardImage} alt={card} />
                          ) : (
                            <div className="card-placeholder">?</div>
                          )}
                        </div>
                      );
                    })
                  ) : isCurrentPlayer ? (
                    // Jugador actual sin cartas asignadas (esperando)
                    <>
                      <div className="player-card">🂠</div>
                      <div className="player-card">🂠</div>
                    </>
                  ) : (
                    // Mostrar cartas ocultas para otros jugadores
                    <>
                      <div className="player-card">🂠</div>
                      <div className="player-card">🂠</div>
                    </>
                  )}
                </div>

                {/* Info del jugador - DEBAJO de las cartas */}
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
                </div>
              </>
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
