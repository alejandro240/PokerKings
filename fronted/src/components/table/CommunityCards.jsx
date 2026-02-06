import React from 'react';
import './CommunityCards.css';

const CommunityCards = ({ 
  communityCards = [], 
  gamePhase = 'waiting', 
  pot = 0,
  sidePots = [] 
}) => {
  // Determine which cards to show based on game phase
  const getVisibleCards = () => {
    switch (gamePhase) {
      case 'pre-flop':
      case 'preflop':
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

  // Format card for display (e.g., "AS" → "A♠", "KH" → "K♥")
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

  return (
    <div className="community-cards-section">
      {/* Pot Information */}
      <div className="pot-container">
        <div className="main-pot">
          <div className="pot-label">💰 Bote Principal</div>
          <div className="pot-amount">{pot.toLocaleString()} PK</div>
        </div>
        
        {sidePots && sidePots.length > 0 && (
          <div className="side-pots">
            {sidePots.map((sidePot, index) => (
              <div key={index} className="side-pot">
                <div className="pot-label">Bote Lateral #{index + 1}</div>
                <div className="pot-amount">{sidePot.amount.toLocaleString()} PK</div>
                <div className="pot-players">
                  {sidePot.players.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community Cards */}
      <div className="community-cards-container">
        <div className="cards-title">
          {gamePhase === 'waiting' && '🎰 Esperando inicio...'}
          {(gamePhase === 'pre-flop' || gamePhase === 'preflop') && '🎲 Pre-Flop'}
          {gamePhase === 'flop' && '🃏 Flop'}
          {gamePhase === 'turn' && '🎴 Turn'}
          {gamePhase === 'river' && '🎯 River'}
          {gamePhase === 'showdown' && '🏆 Showdown'}
        </div>

        <div className="cards-row">
          {/* Visible cards */}
          {visibleCards.map((card, index) => {
            const formattedCard = formatCard(card);
            return (
              <div 
                key={index} 
                className={`community-card revealed card-${index}`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="card-content" style={{ color: formattedCard.color }}>
                  <div className="card-rank-top">{formattedCard.display}</div>
                  <div className="card-suit">{formattedCard.display.slice(-1)}</div>
                  <div className="card-rank-bottom">{formattedCard.display}</div>
                </div>
              </div>
            );
          })}

          {/* Empty slots */}
          {gamePhase !== 'waiting' && Array.from({ length: emptySlots }).map((_, index) => (
            <div key={`empty-${index}`} className="community-card empty">
              <div className="card-back">🂠</div>
            </div>
          ))}

          {/* Waiting state - show 5 empty slots */}
          {gamePhase === 'waiting' && Array.from({ length: 5 }).map((_, index) => (
            <div key={`waiting-${index}`} className="community-card waiting">
              <div className="card-placeholder">?</div>
            </div>
          ))}
        </div>

        {/* Phase indicator */}
        <div className="phase-indicator">
          <div className={`phase-dot ${(gamePhase === 'pre-flop' || gamePhase === 'preflop') ? 'active' : ''}`}></div>
          <div className={`phase-dot ${gamePhase === 'flop' ? 'active' : ''}`}></div>
          <div className={`phase-dot ${gamePhase === 'turn' ? 'active' : ''}`}></div>
          <div className={`phase-dot ${gamePhase === 'river' ? 'active' : ''}`}></div>
          <div className={`phase-dot ${gamePhase === 'showdown' ? 'active' : ''}`}></div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCards;
