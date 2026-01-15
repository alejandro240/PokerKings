import React from 'react';

function InvitacionesOffcanvas({ show, onHide }) {
  // Ejemplo de invitaciones (después vendrán del backend)
  const invitaciones = [
    { id: 1, tipo: 'amistad', de: 'Pedro_Poker', mensaje: 'Te ha enviado una solicitud de amistad' },
    { id: 2, tipo: 'mesa', de: 'Carlos23', mensaje: 'Te invita a su mesa de poker' },
  ];

  const handleAceptar = (id) => {
    // Aquí después pondrás la lógica para aceptar invitación
    console.log('Aceptando invitación:', id);
  };

  const handleRechazar = (id) => {
    // Aquí después pondrás la lógica para rechazar invitación
    console.log('Rechazando invitación:', id);
  };

  return (
    <div 
      className={`offcanvas offcanvas-start ${show ? 'show' : ''}`} 
      tabIndex="-1"
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">📨 Invitaciones</h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onHide}
        ></button>
      </div>
      <div className="offcanvas-body">
        {invitaciones.length === 0 ? (
          <div className="text-center text-muted py-5">
            <p>No tienes invitaciones pendientes</p>
          </div>
        ) : (
          <div className="list-group">
            {invitaciones.map(inv => (
              <div key={inv.id} className="list-group-item">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <strong>{inv.de}</strong>
                    <p className="mb-0 text-muted">{inv.mensaje}</p>
                    <small className="text-muted">
                      {inv.tipo === 'amistad' ? '👥 Solicitud de amistad' : '🎲 Invitación a mesa'}
                    </small>
                  </div>
                </div>
                <div className="btn-group w-100 mt-2">
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={() => handleAceptar(inv.id)}
                  >
                    ✓ Aceptar
                  </button>
                  <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRechazar(inv.id)}
                  >
                    ✗ Rechazar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InvitacionesOffcanvas;
