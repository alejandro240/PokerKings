import React, { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import './App.css'
import { authService } from './services/auth'
import { tableAPI } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRegister, setShowRegister] = useState(false)

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Verificar si hay usuario autenticado
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          
          // Cargar mesas disponibles
          const tablesResponse = await tableAPI.getAllTables()
          setTables(tablesResponse.data || [])
        } else {
          setTables([])
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Función cuando el login es exitoso
  const handleLoginSuccess = async (loggedUser) => {
    setUser(loggedUser)
    
    // Cargar mesas después del login
    try {
      const tablesResponse = await tableAPI.getAllTables()
      setTables(tablesResponse.data || [])
    } catch (err) {
      console.error('Error cargando mesas:', err)
    }
  }

  // Función cuando el registro es exitoso
  const handleRegisterSuccess = (registeredUser) => {
    setUser(registeredUser)
    setShowRegister(false)
  }

  // Función para cerrar sesión
  const handleLogout = () => {
    authService.logout()
    setUser(null)
    setTables([])
  }

  // Si no hay usuario, mostrar Login o Register
  if (!user) {
    return (
      <div className="App">
        {showRegister ? (
          <Register
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setShowRegister(true)}
          />
        )}
      </div>
    )
  }

  // Si hay usuario, mostrar la aplicación principal
  return (
    <div className="App">
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="container mt-4">
        <div className="jumbotron">
          <h1 className="display-4">🎰 Bienvenido a Poker Kings</h1>
          <p className="lead">La mejor plataforma de poker online</p>
          <hr className="my-4" />
          
          <div>
            <p>👤 Usuario: <strong>{user.username}</strong></p>
            <p>💰 Chips: <strong>{user.chips.toLocaleString()}</strong></p>
            <p>⭐ Nivel: <strong>{user.level}</strong></p>
            <button className="btn btn-danger" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        )}

        {/* Mostrar mesas disponibles */}
        <div className="mt-5">
          <h2>📊 Mesas Disponibles</h2>
          {loading ? (
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          ) : tables.length > 0 ? (
            <div className="row">
              {tables.map((table) => (
                <div key={table.id} className="col-md-4 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h5 className="card-title">{table.name}</h5>
                      <p className="card-text">
                        <strong>Límites:</strong> {table.smallBlind}/{table.bigBlind}<br/>
                        <strong>Jugadores:</strong> {table.currentPlayers}/{table.maxPlayers}<br/>
                        <strong>Estado:</strong> <span className="badge bg-info">{table.status}</span>
                      </p>
                      <button className="btn btn-primary btn-sm">
                        Unirse
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay mesas disponibles en este momento</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
