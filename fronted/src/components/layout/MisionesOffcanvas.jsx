import React from 'react';

function MisionesOffcanvas({ show, onHide }) {
  // Ejemplo de misiones diarias (después vendrán del backend)
  const misiones = [
    { id: 1, nombre: 'Juega 5 manos', progreso: 3, total: 5, recompensa: 100 },
    { id: 2, nombre: 'Gana 2 partidas', progreso: 1, total: 2, recompensa: 200 },
    { id: 3, nombre: 'Haz fold 3 veces', progreso: 0, total: 3, recompensa: 50 },
  ];

  return (
    <div 
      className={`offcanvas offcanvas-start offcanvas-casino ${show ? 'show' : ''}`} 
      tabIndex="-1"
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">✅ Misiones Diarias</h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onHide}
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="list-group">
          {misiones.map(mision => (
            <div key={mision.id} className="list-group-item">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">{mision.nombre}</h6>
                <span className="badge bg-warning text-dark">
                  💰 {mision.recompensa} fichas
                </span>
              </div>
              <div className="progress">
                <div 
                  className="progress-bar" 
                  style={{ width: `${(mision.progreso / mision.total) * 100}%` }}
                >
                  {mision.progreso}/{mision.total}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MisionesOffcanvas;
