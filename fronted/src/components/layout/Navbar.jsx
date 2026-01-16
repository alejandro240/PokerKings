import React, { useState } from 'react';
import TrofeosOffcanvas from './TrofeosOffcanvas';
import MisionesOffcanvas from './MisionesOffcanvas';
import AmigosOffcanvas from './AmigosOffcanvas';
import InvitacionesOffcanvas from './InvitacionesOffcanvas';
import './Navbar.css';

function Navbar({ user, onLogout }) {
  // Estado para controlar qué offcanvas está abierto (solo uno a la vez)
  const [activeOffcanvas, setActiveOffcanvas] = useState(null);

  // Funciones para abrir offcanvas (cierra cualquier otro abierto)
  const openTrofeos = () => setActiveOffcanvas('trofeos');
  const openMisiones = () => setActiveOffcanvas('misiones');
  const openAmigos = () => setActiveOffcanvas('amigos');
  const openInvitaciones = () => setActiveOffcanvas('invitaciones');
  const closeOffcanvas = () => setActiveOffcanvas(null);

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
      <nav className="navbar navbar-expand-lg navbar-dark navbar-casino">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/assets/images/logo.png" alt="Poker Kings" height="100" />
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
                  onClick={openTrofeos}
                >
                  🏆 Trofeos
                </button>
              </li>

              {/* 3. Misiones Diarias */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={openMisiones}
                >
                  ✅ Misiones Diarias
                </button>
              </li>

              {/* 4. Amigos */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={openAmigos}
                >
                  👥 Amigos
                </button>
              </li>

              {/* 5. Invitaciones */}
              <li className="nav-item">
                <button 
                  className="nav-link btn btn-link" 
                  onClick={openInvitaciones}
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
        show={activeOffcanvas === 'trofeos'} 
        onHide={closeOffcanvas} 
      />

      {/* Offcanvas para Misiones */}
      <MisionesOffcanvas 
        show={activeOffcanvas === 'misiones'} 
        onHide={closeOffcanvas} 
      />

      {/* Offcanvas para Amigos */}
      <AmigosOffcanvas 
        show={activeOffcanvas === 'amigos'} 
        onHide={closeOffcanvas} 
      />

      {/* Offcanvas para Invitaciones */}
      <InvitacionesOffcanvas 
        show={activeOffcanvas === 'invitaciones'} 
        onHide={closeOffcanvas} 
      />
    </>
  );
}

export default Navbar;
