import React, { useState, useEffect } from 'react';
import './LobbyPage.css';

function LobbyPage({ onNavigate, onJoinTable }) {
  const [tables, setTables] = useState([
    { id: 1, name: 'Mesa VIP', players: 4, maxPlayers: 6, blinds: '10/20', smallBlind: 10, bigBlind: 20, status: 'playing', botsCount: 0 },
    { id: 2, name: 'Principiantes', players: 2, maxPlayers: 4, blinds: '5/10', smallBlind: 5, bigBlind: 10, status: 'waiting', botsCount: 1 },
    { id: 3, name: 'High Stakes', players: 6, maxPlayers: 8, blinds: '50/100', smallBlind: 50, bigBlind: 100, status: 'playing', botsCount: 2 },
    { id: 4, name: 'Casual', players: 3, maxPlayers: 6, blinds: '10/20', smallBlind: 10, bigBlind: 20, status: 'waiting', botsCount: 0 },
  ]);

  return (
    <div className="lobby-page">
      <div className="lobby-header">
        <button className="btn-back" onClick={() => onNavigate('home')}>
          ← Volver
        </button>
        <h1 className="lobby-title">🎮 Mesas Públicas</h1>
        <div className="lobby-stats">
          <span className="stat-badge">🟢 {tables.length} mesas activas</span>
        </div>
      </div>

      {/* Scroll horizontal de mesas */}
      <div className="tables-scroll-container">
        <div className="tables-scroll">
          {tables.map(table => (
            <div key={table.id} className="table-card">
              <div className="table-card-header">
                <h3 className="table-name">{table.name}</h3>
                <span className={`table-status ${table.status}`}>
                  {table.status === 'playing' ? '🎲 Jugando' : '⏳ Esperando'}
                </span>
              </div>

              <div className="table-card-body">
                {/* Mini mesa visual */}
                <div className="mini-table">
                  <img src="/assets/images/mesa-poker.png" alt="Mesa" />
                  <div className="player-count">
                    {table.players}/{table.maxPlayers}
                  </div>
                </div>

                {/* Información */}
                <div className="table-info">
                  <div className="info-row">
                    <span className="info-label">👥 Jugadores:</span>
                    <span className="info-value">{table.players}/{table.maxPlayers}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">💰 Ciegas:</span>
                    <span className="info-value">{table.blinds}</span>
                  </div>
                </div>

                {/* Botón unirse */}
                <button 
                  className={`btn-join ${table.players >= table.maxPlayers ? 'disabled' : ''}`}
                  onClick={() => table.players < table.maxPlayers && onJoinTable(table)}
                  disabled={table.players >= table.maxPlayers}
                >
                  {table.players >= table.maxPlayers ? '🔒 Mesa Llena' : '▶ Unirse'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicador de scroll */}
      <div className="scroll-hint">
        ← Desliza para ver más mesas →
      </div>
    </div>
  );
}

export default LobbyPage;
