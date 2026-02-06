import React, { useState, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import HomePage from './hooks/pages/HomePage'
import LobbyPage from './hooks/pages/LobbyPage'
import CreateTablePage from './hooks/pages/CreateTablePage'
import TablePage from './hooks/pages/TablePage'
import './App.css'
import './styles/animations.css'
import { authService } from './services/auth'
import { tableAPI } from './services/api'

function App() {
  const [user, setUser] = useState(null)
  const [tables, setTables] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showRegister, setShowRegister] = useState(false)
  const [currentView, setCurrentView] = useState('home') // home, lobby, create, table
  const [currentTable, setCurrentTable] = useState(null) // Datos de la mesa actual

  // Cargar datos al iniciar
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Verificar si hay usuario autenticado
        const currentUser = authService.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          // Las mesas se cargarán bajo demanda cuando el usuario vaya al lobby
          setTables([])
        } else {
          setTables([])
        }
      } catch (err) {
        console.error('Error cargando datos:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Función cuando el login es exitoso
  const handleLoginSuccess = async (loggedUser) => {
    setUser(loggedUser)
    // Las mesas se mostrarán desde LobbyPage (datos de ejemplo)
    setTables([])
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
    setCurrentView('home')
  }

  // Función para actualizar usuario
  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Navegación entre vistas
  const handleNavigate = (view) => {
    setCurrentView(view)
  }

  // Unirse a mesa
  const handleJoinTable = async (table) => {
    try {
      console.log('Unirse a mesa:', table)
      // Establecer la mesa actual
      setCurrentTable(table)
      setCurrentView('table')
      // Aquí después harás la llamada al backend para unirse realmente
      // const response = await tableAPI.joinTable(table.id)
    } catch (err) {
      console.error('Error uniéndose a mesa:', err)
      setError('No se pudo unir a la mesa')
    }
  }

  // Crear mesa
  const handleCreateTable = async (formData) => {
    try {
      console.log('Creando mesa:', formData)
      
      // Llamar al backend para crear la mesa
      const tableData = {
        name: formData.tableName,
        smallBlind: formData.smallBlind,
        bigBlind: formData.bigBlind,
        maxPlayers: formData.maxPlayers,
        isPrivate: formData.isPrivate,
        botsCount: formData.bots
      }
      
      try {
        const response = await tableAPI.createTable(tableData)
        
        // Establecer la mesa creada como mesa actual
        setCurrentTable({
          ...response.data,
          players: [user], // El creador es el primer jugador
          botsCount: formData.bots
        })
        
        setCurrentView('table')
        
        // Recargar lista de mesas
        try {
          const tablesResponse = await tableAPI.getAllTables()
          setTables(tablesResponse.data || [])
        } catch (err) {
          console.warn('No se pudo recargar mesas')
        }
      } catch (apiError) {
        // Si backend no está disponible, crear mesa localmente
        console.warn('Backend no disponible, creando mesa localmente')
        const localTable = {
          id: Date.now(),
          ...tableData,
          players: [user],
          status: 'waiting'
        }
        setCurrentTable(localTable)
        setCurrentView('table')
        setTables(prev => [...prev, localTable])
      }
    } catch (err) {
      console.error('Error creando mesa:', err)
      setError('No se pudo crear la mesa')
    }
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
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1a1a2e',
            color: '#daa520',
            border: '2px solid #daa520',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '1rem',
            fontWeight: 'bold',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)'
          },
          success: {
            iconTheme: {
              primary: '#0b6623',
              secondary: '#daa520',
            },
          },
          error: {
            iconTheme: {
              primary: '#c41e3a',
              secondary: '#daa520',
            },
          },
        }}
      />
      
      <Navbar user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />
      
      {/* Renderizar vista actual */}
      {currentView === 'home' && (
        <HomePage onNavigate={handleNavigate} />
      )}

      {currentView === 'lobby' && (
        <LobbyPage 
          onNavigate={handleNavigate}
          onJoinTable={handleJoinTable}
        />
      )}

      {currentView === 'create' && (
        <CreateTablePage 
          onNavigate={handleNavigate}
          onCreate={handleCreateTable}
        />
      )}

      {currentView === 'table' && currentTable && (
        <TablePage 
          table={currentTable}
          user={user}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  )
}

export default App
