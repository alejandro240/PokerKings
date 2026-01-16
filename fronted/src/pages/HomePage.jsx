import React from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      <div className="home-content">
        <h1 className="home-title">🎰 Poker Kings</h1>
        <p className="home-subtitle">La mejor experiencia de poker online</p>

        {/* Mesa de poker central */}
        <div className="home-table-container">
          <img 
            src="/assets/images/mesa-poker.png" 
            alt="Mesa de Poker" 
            className="home-table-image"
          />
          
          {/* Botones sobre la mesa */}
          <div className="home-buttons">
            <button 
              className="btn btn-home btn-play"
              onClick={() => onNavigate('lobby')}
            >
              <span className="btn-icon">🎮</span>
              <span className="btn-text">Jugar</span>
            </button>
            
            <button 
              className="btn btn-home btn-create"
              onClick={() => onNavigate('create')}
            >
              <span className="btn-icon">🔒</span>
              <span className="btn-text">Crear Mesa Privada</span>
            </button>
          </div>
        </div>

        {/* Información adicional */}
        <div className="home-info">
          <div className="info-card">
            <div className="info-icon">👥</div>
            <div className="info-text">Multijugador</div>
          </div>
          <div className="info-card">
            <div className="info-icon"></div>
            <div className="info-text">Recompensas</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
