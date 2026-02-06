import React, { useState } from 'react';
import './BettingActions.css';

function BettingActions({ 
  playerChips = 0, 
  currentBet = 0, 
  minRaise = 0,
  pot = 0,
  isPlayerTurn = false,
  canCheck = false,
  canCall = false,
  canRaise = false,
  canFold = false,
  onFold,
  onCheck,
  onCall,
  onRaise,
  onAllIn
}) {
  const [raiseAmount, setRaiseAmount] = useState(minRaise);
  const [showRaiseSlider, setShowRaiseSlider] = useState(false);

  const handleRaise = () => {
    if (raiseAmount >= minRaise && raiseAmount <= playerChips) {
      onRaise(raiseAmount);
      setShowRaiseSlider(false);
      setRaiseAmount(minRaise);
    }
  };

  const handleAllIn = () => {
    onAllIn(playerChips);
  };

  console.log('🎮 BettingActions Render:', { isPlayerTurn, canCheck, canCall, canRaise, canFold });

  return (
    <div className={`betting-actions-container${!isPlayerTurn ? ' disabled' : ''}`}>
      {!isPlayerTurn && (
        <div className="waiting-turn">
          <span className="waiting-icon">⏳</span>
          <span>Esperando tu turno...</span>
        </div>
      )}
      <div className="betting-info">
        <div className="info-item">
          <span className="info-label">💰 Bote:</span>
          <span className="info-value">{pot.toLocaleString()} PK</span>
        </div>
        <div className="info-item">
          <span className="info-label">💵 Apuesta actual:</span>
          <span className="info-value">{currentBet.toLocaleString()} PK</span>
        </div>
        <div className="info-item">
          <span className="info-label">🪙 Tus fichas:</span>
          <span className="info-value">{playerChips.toLocaleString()} PK</span>
        </div>
      </div>

      {/* Barra de botones SIEMPRE VISIBLE */}
      <div className="action-buttons" style={{ display: 'flex', position: 'relative', zIndex: 50 }}>
          {/* Botón 1: No ir (Fold) */}
          <button
            className="btn-action btn-fold"
            onClick={onFold}
            disabled={!isPlayerTurn || !canFold}
            title={!canFold ? 'No puedes hacer fold ahora' : 'No ir'}
          >
            🚫 No ir
          </button>
          
          {/* Botón 2: Pasar (Check) - SIEMPRE VISIBLE */}
          <button 
            className="btn-action btn-check" 
            onClick={onCheck}
            disabled={!isPlayerTurn || !canCheck}
            title={!canCheck ? "No puedes pasar, debes igualar la apuesta" : "Pasar sin apostar"}
          >
            ✅ Pasar
          </button>
          
          {/* Botón 3: Igualar (Call) */}
          <button
            className="btn-action btn-call"
            onClick={onCall}
            disabled={!isPlayerTurn || !canCall}
            title={!canCall ? 'No puedes igualar ahora' : 'Igualar'}
          >
            💵 Igualar {currentBet.toLocaleString()} PK
          </button>
          
          {/* Botón 4: Subir (Raise) */}
          <button
            className="btn-action btn-raise"
            onClick={() => setShowRaiseSlider(true)}
            disabled={!isPlayerTurn || !canRaise}
            title={!canRaise ? 'No puedes subir ahora' : 'Subir'}
          >
            💸 Subir
          </button>
        </div>

      {/* Slider de subida */}
      {showRaiseSlider && (
        <div className="raise-slider-container">
          <div className="slider-header">
            <span>💸 Cantidad a subir</span>
            <button className="btn-close-slider" onClick={() => setShowRaiseSlider(false)}>✕</button>
          </div>
          <div className="slider-amount">
            <span className="amount-label">Monto:</span>
            <span className="amount-value">{raiseAmount.toLocaleString()} PK</span>
          </div>
          <input
            type="range"
            min={minRaise}
            max={playerChips}
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
            className="raise-slider"
          />
          <div className="slider-limits">
            <span>Min: {minRaise.toLocaleString()}</span>
            <span>Max: {playerChips.toLocaleString()}</span>
          </div>
          <div className="slider-actions">
            <button className="btn-action btn-cancel" onClick={() => setShowRaiseSlider(false)}>
              Cancelar
            </button>
            {playerChips > 0 && (
              <button className="btn-action btn-allin" onClick={handleAllIn}>
                🔥 All-In
              </button>
            )}
            <button className="btn-action btn-confirm" onClick={handleRaise}>
              ✅ Confirmar Subida
            </button>
          </div>
        </div>
      )}

      <div className="turn-timer">
        <div className="timer-label">⏱️ Tiempo restante</div>
        <div className="timer-bar">
          <div className="timer-fill" style={{ width: '75%' }}></div>
        </div>
      </div>
    </div>
  );
}

export default BettingActions;
