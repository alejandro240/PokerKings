import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupSocket } from './config/socket.js';
import { seedDatabase } from './database/seed.js';

const server = createServer(app);

// Setup Socket.IO
setupSocket(server);

// Connect to database
connectDB();

// Seed database (solo en desarrollo)
if (config.nodeEnv === 'development') {
  seedDatabase();
}

// Start server
server.listen(config.port, () => {
  console.log(`🚀 Servidor corriendo en puerto ${config.port}`);
  console.log(`📍 Entorno: ${config.nodeEnv}`);
  console.log(`📊 Base de datos: PostgreSQL`);
});
