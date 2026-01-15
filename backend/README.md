# PokerKings Backend

Backend server para la plataforma de juego de poker en tiempo real.

## Características

- Autenticación de usuarios con JWT
- Juego de Texas Hold'em multijugador en tiempo real con Socket.IO
- Sistema de amigos y solicitudes de amistad
- Historial completo de manos con replayer
- Sistema de misiones y asólimientos
- Tienda de fichas con compras simuladas (Stripe test)
- Anuncios in-app
- PostgreSQL para relaciones complejas
- Arquitectura preparada para escalabilidad

## Instalación

```bash
npm install
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pokerkings
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your-super-secret-jwt-key
```

## Ejecutar

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

### Docker
```bash
docker-compose up
```

## Estructura de Base de Datos

### Usuarios
- `id` (UUID)
- `username`, `email`, `password`
- `chips`, `level`, `experience`
- `avatar`, `highestWinning`, `totalWinnings`
- `gamesPlayed`, `gamesWon`

### Sistema de Amigos
- `friends` - Relación bidireccional entre usuarios
- `friend_requests` - Solicitudes pendientes/aceptadas/rechazadas

### Juego
- `tables` - Mesas de poker
- `games` - Partidas activas
- `hands` - Historial de manos jugadas
- `hand_actions` - Acciones en cada mano (fold, call, raise, etc.)

### Economía
- `transactions` - Historial de movimientos de fichas
- `missions` - Misiones diarias/semanales
- `achievements` - Logros desbloqueados

## API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil (protegido)

### Usuarios
- `GET /api/users/:id` - Obtener usuario
- `PUT /api/users/:id` - Actualizar usuario
- `GET /api/users/:id/stats` - Obtener estadísticas

### Amigos
- `POST /api/friends/request` - Enviar solicitud
- `POST /api/friends/request/:requestId/accept` - Aceptar solicitud
- `POST /api/friends/request/:requestId/reject` - Rechazar solicitud
- `GET /api/friends/:id` - Obtener amigos
- `GET /api/friends/requests/pending` - Solicitudes pendientes
- `DELETE /api/friends/:friendId` - Eliminar amigo

### Mesas
- `GET /api/tables` - Obtener mesas disponibles
- `GET /api/tables/:id` - Obtener mesa específica
- `POST /api/tables` - Crear mesa
- `POST /api/tables/:id/join` - Unirse a mesa
- `POST /api/tables/:id/leave` - Salir de mesa

### Historial de Manos
- `GET /api/hands/history/:userId` - Historial de manos
- `GET /api/hands/:handId` - Detalles de una mano
- `POST /api/hands` - Guardar mano
- `POST /api/hands/action` - Guardar acción de mano
- `GET /api/hands/stats/:userId` - Estadísticas

### Tienda
- `GET /api/shop/items` - Obtener items de tienda
- `POST /api/shop/purchase` - Comprar item

### Misiones
- `GET /api/missions/:userId` - Obtener misiones
- `POST /api/missions/check/:userId` - Verificar progreso
- `POST /api/missions/:missionId/claim` - Reclamar recompensa

## Socket.IO Events

### Lobby
- `lobby:join` - Unirse al lobby
- `lobby:leave` - Salir del lobby
- `lobby:refresh` - Actualizar lista de mesas

### Tabla
- `table:join` - Unirse a una mesa
- `table:leave` - Salir de una mesa
- `game:start` - Iniciar partida
- `game:action` - Acción del jugador
- `game:update` - Actualización del estado

## Tecnologías

- **Node.js & Express** - Servidor
- **PostgreSQL** - Base de datos relacional
- **Sequelize** - ORM
- **Socket.IO** - Comunicación en tiempo real
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas
- **Docker** - Contenedorización

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración
│   ├── models/          # Modelos Sequelize
│   ├── routes/          # Rutas API
│   ├── controllers/     # Controladores
│   ├── services/        # Lógica de negocio
│   ├── sockets/         # Manejadores Socket.IO
│   ├── middlewares/     # Middlewares
│   ├── app.js           # Configuración Express
│   └── server.js        # Punto de entrada
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Próximas Mejoras

- Bots con IA avanzada
- Estadísticas detalladas de jugador
- Torneos y eventos temporales
- Skins premium
- Subscripciones VIP
- Análisis de manos postpartida
