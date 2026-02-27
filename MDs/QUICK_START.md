# 🚀 GUÍA RÁPIDA - Ejecutar Frontend + Backend Integrados

## 📋 Requisitos Previos

```
✅ Node.js instalado
✅ PostgreSQL corriendo
✅ git clone de PokerKings
✅ socket.io-client instalado (npm install ya hecho)
```

---

## 🎮 OPCIÓN 1: Ejecutar en Dos Terminales (RECOMENDADO)

### Terminal 1: Backend

```powershell
cd C:\Users\Pablo\Desktop\PROJECTE\PokerKings\backend
npm run dev
```

**Output esperado:**
```
Server running on port 3000
WebSocket ready
Database connected to PostgreSQL
✅ Listo para recibir conexiones
```

---

### Terminal 2: Frontend

```powershell
cd C:\Users\Pablo\Desktop\PROJECTE\PokerKings\fronted
npm run dev
```

**Output esperado:**
```
VITE ready in XXX ms

➜  Local: http://localhost:5173/
✅ Listo para abrir en navegador
```

---

## 🌐 Abrir en Navegador

1. Ir a **http://localhost:5173/**
2. **Registrarse** o **Login**
3. Ir a **Lobby**
4. **Crear Mesa** o **Unirse**
5. **Esperar** a que cargue el juego

---

## 🧪 VERIFICACIÓN RÁPIDA

### En el Navegador - DevTools (F12)

#### Network Tab:
- [ ] Buscar `WebSocket` en Type
- [ ] Debe haber conexión activa a `localhost:3000`

#### Console:
- [ ] Buscar `gameSocket` 
- [ ] Debe haber logs como:
  ```
  ✅ Conectado al servidor WebSocket
  ```

#### Elements:
- [ ] Ver `<div class="table-page">`
- [ ] Ver `<PokerTable>` componente renderizado

---

## 🎯 Flujo de Testing

### Test 1: Conexión Básica (1 min)
```
1. Login
2. Crear mesa
3. Verificar en console: gameSocket conectado ✓
4. Verificar en Network: WebSocket abierto ✓
```

### Test 2: Inicio del Juego (2 min)
```
1. Mesa creada con 2+ jugadores
2. Verificar que carga
3. Ver cartas comunitarias
4. Ver pot y ciegas
```

### Test 3: Acciones de Juego (5 min)
```
1. Click en FOLD
2. Verificar que se envía al backend
3. Siguiente jugador recibe turno
4. Console debe mostrar sin errores
```

### Test 4: Múltiples Ganadores (5 min)
```
1. Jugar hasta showdown con 2+ ganadores
2. Verificar winners array en console:
   console.log(pokerGame.winners)
3. Debería mostrar:
   [{userId, username, hand, chipsWon}, ...]
```

### Test 5: Chip Odd Distribution (5 min)
```
1. Split pot con chips impar (ej: 1001 chips)
2. Verificar en backend console:
   [DEBUG][CHIP_ODD] Assigned to position X
3. Verificar que se da al más cercano al dealer
4. NO se da al dealer mismo
```

---

## 🔍 DEBUGGING - Qué Ver si Algo Falla

### Error: "WebSocket connection failed"
```
❌ Backend no está corriendo
✅ Solución: Asegurar que terminal 1 está con "npm run dev"
```

### Error: "CORS error"
```
❌ Backend CORS no permitiendo frontend
✅ Solución: Verificar CORS en backend/src/app.js
   app.use(cors({
     origin: 'http://localhost:5173',
     credentials: true
   }))
```

### Error: "Table not found"
```
❌ El ID de mesa no existe
✅ Solución: Crear mesa nueva desde Lobby
```

### Error: "Cannot read property 'handleFold'"
```
❌ Hook usePokerGame no inicializó correctamente
✅ Solución: Verificar que gameSocket.connect() se ejecutó
```

---

## 📊 Ver Logs del Backend en Tiempo Real

En el terminal del backend, busca estos logs:

```
// Cuando alguien crea un juego:
✅ Game created: game-123

// Cuando alguien entra al juego:
✅ Player joined: userId-456

// Cuando alguien hace una acción:
Player action: fold

// En showdown (lo importante):
[DEBUG][SPLIT_POT] Multiple winners detected
[DEBUG][CHIP_ODD] Distance from dealer: 1
[DEBUG][WINNERS] Winners: [{id, name, hand}, ...]
```

---

## 🎬 Ver Eventos WebSocket

### En DevTools → Network

1. Abrir DevTools (F12)
2. Tab: **Network**
3. Filtro: **WS** (WebSocket)
4. Click en la conexión a `localhost:3000`
5. Tab: **Messages**
6. Ver eventos enviados/recibidos:

```
← {"event":"gameStateUpdated","data":{...}}
→ {"event":"playerAction","action":"fold"}
← {"event":"phaseChanged","phase":"flop"}
```

---

## 💾 Archivos Importantes

```
Backend:
├── src/services/game.service.js     ← Lógica del juego
├── src/config/socket.js             ← Configuración WebSocket
└── src/models/Game.js               ← Schema con winners

Frontend:
├── src/services/gameSocket.js       ← Conexión WebSocket
├── src/hooks/usePokerGame.js        ← Hook con integración
├── src/pages/TablePage.jsx          ← Página principal
└── src/services/api.js              ← API REST endpoints
```

---

## 📞 Si Algo No Funciona

### Paso 1: Verificar que ambos están corriendo
```powershell
# Terminal 1 (backend)
netstat -ano | findstr :3000

# Terminal 2 (frontend)
netstat -ano | findstr :5173
```

Si no aparecen, reiniciar con:
```
Backend: npm run dev
Frontend: npm run dev
```

### Paso 2: Limpiar cache
```powershell
# Backend
rm -r node_modules package-lock.json
npm install

# Frontend
rm -r node_modules package-lock.json
npm install
npm install socket.io-client
```

### Paso 3: Verificar base de datos
```powershell
# En terminal del backend
# Los logs deben mostrar: "Database connected to PostgreSQL"
```

### Paso 4: Ver logs completos
```powershell
# En terminal del backend, buscar errores:
# - TypeError
# - Error: 
# - Cannot read property

# En console del navegador:
# - Error
# - Uncaught
# - CORS
```

---

## ✅ Checklist - Está Funcionando Si...

- [x] Backend muestra "Server running on port 3000"
- [x] Frontend muestra "Local: http://localhost:5173"
- [x] Puedo login en http://localhost:5173
- [x] Puedo crear mesa
- [x] Puedo unirme a mesa
- [x] Veo "Iniciando juego..." brevemente
- [x] Veo mesa con cartas y fichas
- [x] Veo botones de acciones (Fold, Check, etc)
- [x] En DevTools Network veo conexión WebSocket (WS)
- [x] En Console no hay errores rojos

---

## 🎮 COMANDOS RÁPIDOS

### Abrir todo en VS Code
```powershell
# Terminal 1
cd C:\Users\Pablo\Desktop\PROJECTE\PokerKings\backend
code .  # Abre VS Code
npm run dev

# Terminal 2 (nueva ventana)
cd C:\Users\Pablo\Desktop\PROJECTE\PokerKings\fronted
code .  # Abre VS Code  
npm run dev
```

### Limpiar todo y empezar de cero
```powershell
# Backend
cd backend
rm -r node_modules package-lock.json
npm install

# Frontend
cd ../fronted
rm -r node_modules package-lock.json
npm install
npm install socket.io-client
```

---

## 📝 NOTAS IMPORTANTES

1. **Puerto 3000** es el backend (REST + WebSocket)
2. **Puerto 5173** es el frontend (React + Vite)
3. **Socket.IO** es el WebSocket que conecta ambos
4. Los cambios en código se reflejan automáticamente (hot reload)
5. La BD debe estar corriendo antes de iniciar backend

---

## 🚀 ESTÁ LISTO PARA USAR!

Ahora puedes:
- ✅ Crear juegos desde el frontend
- ✅ Ver el estado en tiempo real
- ✅ Hacer acciones que se sincronizan
- ✅ Ver múltiples ganadores en split pots
- ✅ Ver chip odd distribution correcta

**Próximas mejoras:**
- Timeouts automáticos
- Rake system
- Animaciones
- Chat en vivo

---

**Última actualización**: 29/01/2026
**Estado**: LISTO PARA PRODUCCIÓN 🎮
