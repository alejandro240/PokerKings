import React, { useState, useEffect } from 'react'
import Navbar from './components/layout/Navbar'
import './App.css'
import { authService } from './services/auth'
import { tableAPI } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="App">
      <Navbar onUserChange={setUser} />
      
      <div className="container mt-4">
        <div className="jumbotron">
          <h1 className="display-4">🎰 Bienvenido a Poker Kings</h1>
          <p className="lead">La mejor plataforma de poker online</p>
          <hr className="my-4" />
          
          {user ? (
            <div>
              <p>👤 Usuario: <strong>{user.username}</strong></p>
              <p>💰 Chips: <strong>{user.chips.toLocaleString()}</strong></p>
              <p>⭐ Nivel: <strong>{user.level}</strong></p>
            </div>
          ) : (
            <p>Por favor inicia sesión para ver tu perfil</p>
          )}
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="alert alert-danger" role="alert">
            Error: {error}
          </div>
        )}

        {/* Mostrar mesas disponibles */}
        {user && (
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
        )}
      </div>
    </div>
  )
}

export default App
