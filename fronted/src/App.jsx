import React from 'react'
import Navbar from './components/layout/Navbar'
import './App.css'

function App() {
  return (
    <div className="App">
      <Navbar />
      
      <div className="container mt-4">
        <div className="jumbotron">
          <h1 className="display-4">🎰 Bienvenido a Poker Kings</h1>
          <p className="lead">La mejor plataforma de poker online</p>
          <hr className="my-4" />
          <p>Prueba los botones del navbar para ver los offcanvas funcionando</p>
        </div>
      </div>
    </div>
  )
}

export default App
