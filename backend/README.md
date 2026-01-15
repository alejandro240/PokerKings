# PokerKings Backend

Backend server for the PokerKings poker game application.

## Features

- User authentication and authorization
- Real-time multiplayer poker game with Socket.IO
- MongoDB database integration
- RESTful API
- Bot players
- Shop system
- Missions and achievements

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/pokerkings
JWT_SECRET=your-super-secret-jwt-key
```

## Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Docker
```bash
docker-compose up
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/stats` - Get user statistics

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:id` - Get table by ID
- `POST /api/tables` - Create new table
- `POST /api/tables/:id/join` - Join table
- `POST /api/tables/:id/leave` - Leave table

### Shop
- `GET /api/shop/items` - Get shop items
- `POST /api/shop/purchase` - Purchase item

## Socket Events

### Lobby
- `lobby:join` - Join lobby
- `lobby:leave` - Leave lobby
- `lobby:refresh` - Refresh table list

### Table
- `table:join` - Join table
- `table:leave` - Leave table
- `game:start` - Start game
- `game:action` - Player action (fold, call, raise)
- `game:update` - Game state update

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── sockets/         # Socket.IO handlers
│   ├── middlewares/     # Express middlewares
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Technologies

- Node.js & Express
- MongoDB & Mongoose
- Socket.IO
- JWT Authentication
- bcryptjs
- Docker
