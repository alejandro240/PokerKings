import React, { useState, useEffect } from 'react';
import { tableAPI } from '../services/api';
import './LobbyPage.css';

function LobbyPage({ onNavigate, onJoinTable }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar mesas desde el backend
  useEffect(() => {
    const loadTables = async () => {
      try {
        const response = await tableAPI.getAllTables();
        setTables(response.data || []);
      } catch (err) {
        console.error('Error cargando mesas:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTables();
    
    // Recargar cada 5 segundos para actualizar estado de mesas
    const interval = setInterval(loadTables, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lobby-page">
      <div className="lobby-header">
        <button className="btn-back" onClick={() => onNavigate('home')}>
          ← Volver
        </button>
        <h1 className="lobby-title">🎮 Mesas Disponibles</h1>
        <div className="lobby-stats">
          <span className="stat-badge">🟢 {tables.length} mesa{tables.length !== 1 ? 's' : ''} disponible{tables.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {loading ? (
        <div className="loading-message">Cargando mesas...</div>
      ) : tables.length === 0 ? (
        <div className="empty-message">
          <p>No hay mesas disponibles</p>
          <button onClick={() => onNavigate('create')} className="btn-create-first">
            + Crear Primera Mesa
          </button>
        </div>
      ) : (
        <>
          {/* Scroll horizontal de mesas */}
          <div className="tables-scroll-container">
            <div className="tables-scroll">
              {tables.map(table => (
                <div key={table.id} className="table-card">
                  <div className="table-card-header">
                    <h3 className="table-name">
                      {table.isPrivate ? '🔒' : '🔓'} {table.name}
                    </h3>
                    <span className={`table-status ${table.status}`}>
                      {table.status === 'playing' ? '🎲 Jugando' : '⏳ Esperando'}
                    </span>
                  </div>

                  <div className="table-card-body">
                    {/* Mini mesa visual */}
                    <div className="mini-table">
                      <img src="/assets/images/mesa-poker.png" alt="Mesa" />
                      <div className="player-count">
                        {table.currentPlayers || 0}/{table.maxPlayers}
                      </div>
                    </div>

                    {/* Información */}
                    <div className="table-info">
                      <div className="info-row">
                        <span className="info-label">👥 Jugadores:</span>
                        <span className="info-value">{table.currentPlayers || 0}/{table.maxPlayers}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">💰 Ciegas:</span>
                        <span className="info-value">{table.smallBlind}/{table.bigBlind}</span>
                      </div>
                      {table.botsCount > 0 && (
                        <div className="info-row">
                          <span className="info-label">🤖 Bots:</span>
                          <span className="info-value">{table.botsCount}</span>
                        </div>
                      )}
                      <div className="info-row">
                        <span className="info-label">🔐 Tipo:</span>
                        <span className="info-value">{table.isPrivate ? 'Privada' : 'Pública'}</span>
                      </div>
                    </div>

                    {/* Botón unirse */}
                    <button 
                      className={`btn-join ${(table.currentPlayers || 0) >= table.maxPlayers ? 'disabled' : ''}`}
                      onClick={() => (table.currentPlayers || 0) < table.maxPlayers && onJoinTable(table)}
                      disabled={(table.currentPlayers || 0) >= table.maxPlayers}
                    >
                      {(table.currentPlayers || 0) >= table.maxPlayers ? '🔒 Mesa Llena' : '▶ Unirse'}
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
        </>
      )}
    </div>
  );
}

export default LobbyPage;
