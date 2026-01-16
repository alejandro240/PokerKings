import React from 'react';

function TrofeosOffcanvas({ show, onHide }) {
  // Ejemplo de trofeos (después vendrán del backend)
  const trofeos = [
    { id: 1, nombre: 'Primera Victoria', descripcion: 'Gana tu primera mano', desbloqueado: true },
    { id: 2, nombre: 'Primera Escalera', descripcion: 'Consigue una escalera', desbloqueado: false },
    { id: 3, nombre: 'Full House', descripcion: 'Consigue un full', desbloqueado: false },
  ];

  return (
    <div 
      className={`offcanvas offcanvas-start offcanvas-casino ${show ? 'show' : ''}`} 
      tabIndex="-1"
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">🏆 Trofeos</h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onHide}
        ></button>
      </div>
      <div className="offcanvas-body">
        <div className="list-group">
          {trofeos.map(trofeo => (
            <div 
              key={trofeo.id} 
              className={`list-group-item ${trofeo.desbloqueado ? 'list-group-item-success' : ''}`}
            >
              <h6>{trofeo.nombre}</h6>
              <p className="mb-0 text-muted">{trofeo.descripcion}</p>
              {trofeo.desbloqueado && <span className="badge bg-success">✓ Desbloqueado</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrofeosOffcanvas;
