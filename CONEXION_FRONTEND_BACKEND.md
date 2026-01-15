# 🎯 CONEXIÓN FRONTEND-BACKEND COMPLETADA

## ✅ Estado Actual

### Backend
- **URL**: http://localhost:3000
- **Framework**: Express.js + Node.js
- **Base de Datos**: PostgreSQL (Docker)
- **Estado**: ✅ Corriendo
- **Puertos**:
  - API REST: 3000
  - PostgreSQL: 5432

### Frontend
- **URL**: http://localhost:5173
- **Framework**: React + Vite
- **Estado**: ✅ Corriendo

---

## 📁 Estructura de Servicios Creados

```
fronted/src/services/
├── api.js          # Wrapper de Axios para todas las peticiones HTTP
├── socket.js       # Gestión de conexión en tiempo real con Socket.IO
└── auth.js         # Manejo de autenticación y sesión
```

### **1. api.js** - Wrapper HTTP
Contiene funciones organizadas por módulo:
- `authAPI` - login, register, getProfile
- `userAPI` - getProfile, getUserById, updateProfile
- `tableAPI` - getAllTables, createTable, joinTable, leaveTable
- `shopAPI` - buyChips, getPackages
- `friendAPI` - getFriends, sendFriendRequest, acceptFriendRequest
- `handAPI` - getHandHistory, getHandById, getHandStats
- `missionAPI` - getAllMissions, claimReward, checkProgress

**Características**:
- ✅ Token JWT automático en cada petición
- ✅ Manejo de errores global
- ✅ Redirección automática a login si el token expira

**Ejemplo de uso**:
```javascript
import { tableAPI } from './services/api';

// Obtener todas las mesas
const response = await tableAPI.getAllTables();
const tables = response.data;

// Unirse a una mesa
await tableAPI.joinTable('mesa-id-123');
```

---

### **2. socket.js** - WebSocket en Tiempo Real
Gestiona toda la comunicación en tiempo real:
- `connect(token)` - Conectar al servidor
- `disconnect()` - Desconectar
- Eventos de Lobby: `joinLobby`, `leaveLobby`, `refreshLobby`
- Eventos de Mesa: `joinTable`, `leaveTable`
- Eventos de Juego: `startGame`, `playAction`
- Eventos de Chat: `sendMessage`

**Características**:
- ✅ Reconexión automática
- ✅ Manejo de errores
- ✅ Listeners y removal de listeners

**Ejemplo de uso**:
```javascript
import { socketService } from './services/socket';

// Conectar
socketService.connect(token);

// Unirse a una mesa en tiempo real
socketService.joinTable('mesa-123', (response) => {
  console.log('Te uniste a la mesa:', response);
});

// Escuchar actualizaciones
socketService.onTableUpdate((data) => {
  console.log('Actualización de mesa:', data);
});

// Hacer una acción (fold, call, raise)
socketService.playAction('mesa-123', 'raise', 100);
```

---

### **3. auth.js** - Autenticación
Gestiona login, registro y sesión del usuario:
- `register(username, email, password)` - Crear cuenta
- `login(email, password)` - Iniciar sesión
- `logout()` - Cerrar sesión
- `getCurrentUser()` - Obtener usuario en localStorage
- `getToken()` - Obtener token JWT
- `isAuthenticated()` - Verificar si está autenticado
- `getProfile()` - Obtener perfil del servidor

**Características**:
- ✅ Almacenamiento de token y usuario en localStorage
- ✅ Conexión automática de Socket.IO
- ✅ Manejo de errores

**Ejemplo de uso**:
```javascript
import { authService } from './services/auth';

// Registrarse
const result = await authService.register('pablo', 'pablo@email.com', 'password123');
if (result.success) {
  const user = result.user;
  console.log('Usuario creado:', user.username);
}

// Iniciar sesión
const loginResult = await authService.login('pablo@email.com', 'password123');
if (loginResult.success) {
  console.log('Bienvenido:', loginResult.user.username);
}

// Obtener usuario actual
const user = authService.getCurrentUser();
console.log('Jugando como:', user.username);
console.log('Chips disponibles:', user.chips);

// Cerrar sesión
authService.logout();
```

---

## 🔄 Cómo Usa App.jsx Los Servicios

```javascript
import { authService } from './services/auth';
import { tableAPI } from './services/api';

function App() {
  const [user, setUser] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Obtener usuario actual
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Cargar mesas disponibles
    const loadTables = async () => {
      const response = await tableAPI.getAllTables();
      setTables(response.data);
    };
    
    loadTables();
  }, []);

  return (
    <div>
      {user ? (
        <p>Bienvenido {user.username}</p>
      ) : (
        <p>Inicia sesión primero</p>
      )}
    </div>
  );
}
```

---

## 📊 Datos de Prueba Disponibles

El backend cargó automáticamente datos de prueba:

**Usuarios:**
```
- usuario1 / usuario2 / usuario3
- Contraseña: password123
- Chips iniciales: 1000
```

**Mesas:**
1. Mesa 1: No Limit Hold'em (SB: 1, BB: 2)
2. Mesa 2: Limit Hold'em (SB: 5, BB: 10)
3. Mesa 3: Pot Limit Omaha (SB: 10, BB: 20)

---

## 🧪 Pruebas Rápidas

### Test 1: Login y Obtener Usuario
```javascript
// Abrir la consola del navegador (F12)
import { authService } from './services/auth';

await authService.login('usuario1@test.com', 'password123');
authService.getCurrentUser();
// Debería mostrar el usuario con sus datos
```

### Test 2: Obtener Mesas
```javascript
import { tableAPI } from './services/api';

const result = await tableAPI.getAllTables();
console.log(result.data);
// Debería mostrar las 3 mesas disponibles
```

### Test 3: Socket.IO en Tiempo Real
```javascript
import { socketService } from './services/socket';

socketService.onTableUpdate((data) => {
  console.log('Actualización:', data);
});

socketService.joinTable('uuid-de-mesa');
```

---

## 🚀 Próximos Pasos

1. ✅ **Servicios creados y funcionales**
2. ⏳ Crear componentes de Login/Register
3. ⏳ Crear componente de Lobby de Mesas
4. ⏳ Crear componente de Tabla de Poker
5. ⏳ Implementar interfaz de juego
6. ⏳ Conectar eventos de Socket.IO a componentes
7. ⏳ Sistema de notificaciones en tiempo real
8. ⏳ Deploy en VPS

---

## 📝 Notas Importantes

### ⚠️ CORS
El backend está configurado con CORS habilitado para `http://localhost:5173`, así que la conexión es segura.

### 🔐 JWT
- El token se almacena en `localStorage['token']`
- Se envía automáticamente en el header `Authorization: Bearer <token>` de cada petición
- Si expira, se redirige automáticamente a login

### 🔌 Socket.IO
- Se conecta automáticamente cuando hay sesión activa
- Usa el token JWT para autenticación
- Reconecta automáticamente si se pierde la conexión

---

## 🛠️ Comandos Útiles

```bash
# Terminal 1: Backend (en c:\Users\Pablo\Desktop\PROJECTE\PokerKings\backend)
npm run dev

# Terminal 2: Frontend (en c:\Users\Pablo\Desktop\PROJECTE\PokerKings\fronted)
npm run dev

# Ver en navegador
http://localhost:5173
```

---

## 📞 Errores Comunes

**Error: "Cannot find module 'socket.io-client'"**
→ Ejecuta: `npm install socket.io-client axios` en la carpeta fronted

**Error: "CORS error"**
→ El backend debe tener CORS habilitado (ya está configurado)

**Error: "Token inválido"**
→ Ejecuta `authService.logout()` y vuelve a iniciar sesión

---

**¡Backend y Frontend conectados correctamente! 🎉**
