import React from 'react';
import './PokerTable.css';

function PokerTable({ maxPlayers = 6, players = [], tableColor = '#1a4d2e' }) {
  // Posiciones de los asientos alrededor de la mesa según el número máximo
  const seatPositions = {
    4: [
      { top: '10%', left: '50%', transform: 'translateX(-50%)' }, // Arriba
      { top: '50%', right: '5%', transform: 'translateY(-50%)' }, // Derecha
      { bottom: '10%', left: '50%', transform: 'translateX(-50%)' }, // Abajo
      { top: '50%', left: '5%', transform: 'translateY(-50%)' }  // Izquierda
    ],
    6: [
      { top: '8%', left: '50%', transform: 'translateX(-50%)' },     // Arriba centro
      { top: '25%', right: '8%', transform: 'translateY(-50%)' },    // Arriba derecha
      { bottom: '25%', right: '8%', transform: 'translateY(50%)' },  // Abajo derecha
      { bottom: '8%', left: '50%', transform: 'translateX(-50%)' },  // Abajo centro
      { bottom: '25%', left: '8%', transform: 'translateY(50%)' },   // Abajo izquierda
      { top: '25%', left: '8%', transform: 'translateY(-50%)' }      // Arriba izquierda
    ],
    8: [
      { top: '5%', left: '50%', transform: 'translateX(-50%)' },     // Arriba centro
      { top: '15%', right: '12%' },                                   // Arriba derecha
      { top: '45%', right: '5%', transform: 'translateY(-50%)' },    // Centro derecha
      { bottom: '15%', right: '12%' },                                // Abajo derecha
      { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },  // Abajo centro
      { bottom: '15%', left: '12%' },                                 // Abajo izquierda
      { top: '45%', left: '5%', transform: 'translateY(-50%)' },     // Centro izquierda
      { top: '15%', left: '12%' }                                     // Arriba izquierda
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
        
        {/* Área central para cartas comunitarias */}
        <div className="community-cards">
          {/* Aquí irán las cartas comunitarias */}
        </div>

        {/* Pot (bote central) */}
        <div className="pot-container">
          <div className="pot-amount">💰 0</div>
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
                <div className="player-avatar">{player.avatar || '👤'}</div>
                <div className="player-name">{player.username}</div>
                <div className="player-chips">💰 {player.chips?.toLocaleString()}</div>
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
