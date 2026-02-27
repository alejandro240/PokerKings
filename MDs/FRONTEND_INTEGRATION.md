# 🔗 Integración Frontend-Backend

## Estado: EN PROGRESO ✅

Se ha conectado la lógica del frontend con el backend real usando:
- **WebSocket** para eventos en tiempo real
- **API REST** para crear/obtener juegos
- **Hook actualizado** con integración completa

---

## 📁 Archivos Modificados

### 1. `fronted/src/services/gameSocket.js` ✨ NUEVO
**Propósito**: Servicio WebSocket para comunicación en tiempo real con el backend

```javascript
// Uso:
import { gameSocket } from '../services/gameSocket'

gameSocket.connect()
gameSocket.joinGame(gameId, userId)
gameSocket.playerAction(gameId, userId, 'fold')
gameSocket.on('gameStateUpdated', (state) => { ... })
```

**Eventos que escucha:**
- `gameStarted` - Juego iniciado
- `gameStateUpdated` - Estado del juego actualizado
- `playerAction` - Acción de otro jugador
- `phaseChanged` - Cambio de fase (pre-flop → flop → turn → river)
- `showdown` - Fin del juego, mostrar ganadores
- `gameEnded` - Juego terminado

**Eventos que envía:**
- `joinGame` - Unirse a un juego
- `leaveGame` - Salir del juego
- `playerAction` - Realizar una acción (fold, check, call, raise, allIn)
- `getGameState` - Solicitar estado actual

---

### 2. `fronted/src/hooks/usePokerGame.js` ✅ ACTUALIZADO
**Propósito**: Hook que gestiona el estado del juego con integración backend

**Cambios principales:**
- ✅ Conecta automáticamente al WebSocket
- ✅ Escucha eventos del backend
- ✅ Actualiza estado en tiempo real
- ✅ Nuevos campos: `gameId`, `winners`, `winnerIds`
- ✅ Las acciones envían datos al backend

**Nuevos campos retornados:**
```javascript
{
  gameId,           // ID único del juego en backend
  winners,          // Array de múltiples ganadores
  winnerIds,        // Array de IDs de ganadores
  // ... resto igual que antes
}
```

**Cómo usar:**
```javascript
const pokerGame = usePokerGame()

// Enviar acción al backend
pokerGame.handleFold()          // Automáticamente se envía al servidor
pokerGame.handleCall()          // Se sincroniza con otros jugadores
pokerGame.handleRaise(amount)   // Se valida en backend

// Recibir cambios del backend
console.log(pokerGame.gamePhase)      // Se actualiza automáticamente
console.log(pokerGame.communityCards) // Se actualiza cuando dealer reparte
console.log(pokerGame.winners)        // Múltiples ganadores en split pots
```

---

### 3. `fronted/src/services/api.js` ✅ ACTUALIZADO
**Nuevo objeto**: `gameAPI` con endpoints del juego

```javascript
// Importar
import { gameAPI } from '../services/api'

// Usar
gameAPI.startGame(tableId, playerIds)    // Crear/iniciar juego
gameAPI.getGame(gameId)                  // Obtener estado actual
gameAPI.playerAction(gameId, action, amount)  // Enviar acción
gameAPI.leaveGame(gameId)                // Salir del juego
```

---

### 4. `fronted/src/pages/TablePage.jsx` ✅ ACTUALIZADO
**Cambios principales:**
- ✅ Conecta con backend al montar
- ✅ Maneja carga y errores
- ✅ Llama a `gameAPI.startGame()` automáticamente
- ✅ Los menús (Stand Up, Leave) usan endpoints reales
- ✅ Muestra la fase actual del juego

**Estado nuevo:**
```javascript
const [loading, setLoading] = useState(false)     // Mientras carga
const [error, setError] = useState(null)          // Errores del backend
```

---

## 🚀 Próximos Pasos Necesarios

### 1. Instalar socket.io en frontend
```bash
cd fronted
npm install socket.io-client
```

### 2. Actualizar componentes de tabla
Los componentes ya existentes (PokerTable, BettingActions, CommunityCards) necesitan:
- Recibir `winners` prop para mostrar múltiples ganadores
- Mostrar `chip odd` junto al ganador más cercano al dealer
- Actualizar cuando `gamePhase` cambia

**Cambios mínimos sugeridos:**

```jsx
// En PokerTable.jsx - agregar prop
<PokerTable 
  ...props...
  winners={pokerGame.winners}      // ✨ NUEVO
  winnerIds={pokerGame.winnerIds}  // ✨ NUEVO
/>

// En componente de jugadores
{winners && winners.length > 0 && (
  <div className="winner-badge">
    {winners.length === 1 ? '🏆 Ganador' : `🏆 ${winners.length} Ganadores`}
  </div>
)}
```

### 3. Configurar CORS en backend
Asegurar que el backend permite conexiones desde `http://localhost:5173` (Vite)

```javascript
// En backend/src/config/cors.js o app.js
const cors = require('cors');
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
```

### 4. Socket.IO en backend
Asegurar que está configurado:

```javascript
// En backend/src/config/socket.js
import { Server } from 'socket.io';

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173'],
    credentials: true
  }
});
```

---

## 🧪 Testing

### Test Manual:
1. Iniciar backend: `npm run dev`
2. Iniciar frontend: `npm run dev`
3. Login en http://localhost:5173
4. Crear mesa → Esperar a que cargue el juego
5. Abrir DevTools → Network/Console
6. Ver eventos WebSocket en tiempo real

### Pruebas Específicas:

**Test 1: Múltiples Ganadores**
```
1. Crear juego con 3+ jugadores
2. Hacer que 2 terminen con la misma mano
3. Verificar en console: game.winners = [...]
4. Verificar en UI: mostrar múltiples ganadores
```

**Test 2: Chip Odd Distribution**
```
1. Crear juego donde 2 jugadores ganan el mismo bote con chips impar
2. Verificar logs: [DEBUG][CHIP_ODD]
3. Verificar que el chip se da al más cercano al dealer
4. No al dealer mismo (busca distancia > 0)
```

**Test 3: Split Pot**
```
1. Crear juego con all-in lateral
2. Verificar sidePots recibido del backend
3. Verificar que ambos ganadores aparecen en winners[]
```

---

## 📊 Flujo de Datos

### Inicio del Juego
```
Frontend                    Backend
   │                           │
   ├─ gameAPI.startGame()─────>│ POST /games/start
   │                           │ ├─ Crear Game
   │                           │ ├─ Repartir cartas
   │                           │ └─ Calcular posiciones
   │                           │
   │<──── socket: gameState ────┤ Emitir estado inicial
   │ (setGameId, setGamePhase)  │
   │                           │
```

### Durante el Juego
```
Frontend                    Backend
   │                           │
   ├─ userAction (fold, etc)  >│ WebSocket: playerAction
   │                           │ ├─ Validar acción
   │                           │ ├─ Actualizar estado
   │                           │ └─ Avanzar turno
   │                           │
   │<─── socket: gameState ────┤ Emitir a todos
   │ (actualiza UI)            │
   │                           │
```

### Final del Juego
```
Frontend                    Backend
   │                           │
   │                           │ → Showdown
   │                           │ ├─ Comparar manos
   │                           │ ├─ Distribuir pots
   │                           │ ├─ Calcular chip odd
   │                           │ └─ Crear array winners[]
   │                           │
   │<─── socket: showdown ─────┤ Emitir resultado
   │ (mostrar ganadores)       │
   │                           │
```

---

## 🔄 Estado del Hook usePokerGame

### Desde Backend
```javascript
// El backend envía esto vía WebSocket:
{
  id: "game-123",
  status: "pre-flop",
  pot: 2000,
  sidePots: [...],
  players: [{id, username, chips, bet, folded, holeCards}, ...],
  communityCards: [],
  currentBet: 100,
  minRaise: 100,
  dealerIndex: 0,
  
  // ✨ NUEVOS:
  winners: [
    {userId, username, hand: "pair of aces", chipsWon: 1000},
    {userId, username, hand: "pair of aces", chipsWon: 1000}
  ],
  winnerIds: ["user-1", "user-2"]
}

// El hook los mapea a su estado React
pokerGame.gameId        // "game-123"
pokerGame.gamePhase     // "pre-flop"
pokerGame.pot           // 2000
pokerGame.winners       // [...]
pokerGame.winnerIds     // ["user-1", "user-2"]
```

---

## ⚠️ Importante: Respeta Estructura Existente

✅ **QUÉ NO CAMBIAR:**
- CSS (todos los estilos están en TablePage.css)
- Estructura de componentes (PokerTable, BettingActions, etc)
- Props de componentes (excepto agregar winners, winnerIds)
- Estructura de App.jsx

✅ **QUÉ CAMBIAR:**
- Lógica de conexión con backend ✅ HECHO
- Hook usePokerGame ✅ HECHO
- API service ✅ HECHO
- TablePage para integración ✅ HECHO
- Componentes para mostrar múltiples ganadores (minimal)

---

## 📝 Checklist Pendiente

- [ ] Instalar socket.io-client en frontend
- [ ] Verificar CORS en backend
- [ ] Verificar Socket.IO configurado en backend
- [ ] Actualizar PokerTable para mostrar winners
- [ ] Actualizar componente de jugador para mostrar chip odd
- [ ] Test manual: crear juego y jugar
- [ ] Test manual: split pot con múltiples ganadores
- [ ] Test manual: chip odd al jugador correcto

---

**Última actualización**: 29/01/2026
