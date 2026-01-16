import React, { useState } from 'react';

function AmigosOffcanvas({ show, onHide }) {
  const [buscarAmigo, setBuscarAmigo] = useState('');

  // Ejemplo de lista de amigos (después vendrán del backend)
  const amigos = [
    { id: 1, nombre: 'Carlos23', avatar: '👤', online: true },
    { id: 2, nombre: 'Maria_Poker', avatar: '👤', online: false },
    { id: 3, nombre: 'JuanKing', avatar: '👤', online: true },
  ];

  const handleAgregarAmigo = () => {
    // Aquí después pondrás la lógica para enviar solicitud de amistad
    console.log('Enviando solicitud a:', buscarAmigo);
    setBuscarAmigo('');
  };

  return (
    <div 
      className={`offcanvas offcanvas-start offcanvas-casino ${show ? 'show' : ''}`} 
      tabIndex="-1"
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">👥 Amigos</h5>
        <button 
          type="button" 
          className="btn-close" 
          onClick={onHide}
        ></button>
      </div>
      <div className="offcanvas-body">
        {/* Buscador de amigos */}
        <div className="mb-3">
          <label className="form-label">Agregar nuevo amigo</label>
          <div className="input-group">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Nombre de usuario"
              value={buscarAmigo}
              onChange={(e) => setBuscarAmigo(e.target.value)}
            />
            <button 
              className="btn btn-primary" 
              onClick={handleAgregarAmigo}
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        <hr />

        {/* Lista de amigos */}
        <h6>Mis amigos ({amigos.length})</h6>
        <div className="list-group">
          {amigos.map(amigo => (
            <div 
              key={amigo.id} 
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <span className="me-2">{amigo.avatar}</span>
                <strong>{amigo.nombre}</strong>
                {amigo.online && <span className="badge bg-success ms-2">Online</span>}
              </div>
              <button className="btn btn-sm btn-outline-primary">
                Ver perfil
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AmigosOffcanvas;
