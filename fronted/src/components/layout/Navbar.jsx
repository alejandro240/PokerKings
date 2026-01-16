import React, { useState } from 'react';
import TrofeosOffcanvas from './TrofeosOffcanvas';
import MisionesOffcanvas from './MisionesOffcanvas';
import AmigosOffcanvas from './AmigosOffcanvas';
import InvitacionesOffcanvas from './InvitacionesOffcanvas';

function Navbar({ user, onLogout }) {
  // Estados para controlar qué offcanvas está abierto
  const [showTrofeos, setShowTrofeos] = useState(false);
  const [showMisiones, setShowMisiones] = useState(false);
  const [showAmigos, setShowAmigos] = useState(false);
  const [showInvitaciones, setShowInvitaciones] = useState(false);

  // Función para ir a inicio
  const handleInicio = () => {
    window.location.href = '/';
  };

  // Función para cerrar sesión
  const handleCerrarSesion = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/logo.png" alt="Poker Kings" height="40" />
            Poker Kings
          </a>

          {/* Botón hamburguesa para móvil */}
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              {/* Mostrar usuario y chips si está autenticado */}
              {user && (
                <li className="nav-item">
                  <span className="nav-link text-warning">
                    👤 {user.username} | 💰 {user.chips?.toLocaleString() || 0} chips
                  </span>
                </li>
              )}

              {/* 1. Inicio */}
              <li className="nav-item">
                <button className="nav-link btn btn-link" onClick={handleInicio}>
                  🏠 Inicio
                </button>
              </li>

              {/* 2. Trofeos */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => setShowTrofeos(true)}
                >
                  🏆 Trofeos
                </button>
              </li>

              {/* 3. Misiones Diarias */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => setShowMisiones(true)}
                >
                  ✅ Misiones Diarias
                </button>
              </li>

              {/* 4. Amigos */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => setShowAmigos(true)}
                >
                  👥 Amigos
                </button>
              </li>

              {/* 5. Invitaciones */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={() => setShowInvitaciones(true)}
                >
                  📨 Invitaciones
                </button>
              </li>

              {/* 6. Cerrar Sesión */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link text-danger" 
                  onClick={handleCerrarSesion}
                >
                  🚪 Cerrar Sesión
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Offcanvas para Trofeos */}
      <TrofeosOffcanvas 
        show={showTrofeos} 
        onHide={() => setShowTrofeos(false)} 
      />

      {/* Offcanvas para Misiones */}
      <MisionesOffcanvas 
        show={showMisiones} 
        onHide={() => setShowMisiones(false)} 
      />

      {/* Offcanvas para Amigos */}
      <AmigosOffcanvas 
        show={showAmigos} 
        onHide={() => setShowAmigos(false)} 
      />

      {/* Offcanvas para Invitaciones */}
      <InvitacionesOffcanvas 
        show={showInvitaciones} 
        onHide={() => setShowInvitaciones(false)} 
      />
    </>
  );
}

export default Navbar;
