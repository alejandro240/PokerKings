import { createServer } from 'http';
import app from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { setupSocket } from './config/socket.js';

const server = createServer(app);

// Setup Socket.IO
setupSocket(server);

// Connect to database
connectDB();

// Start server
server.listen(config.port, () => {
  console.log(`🚀 Server running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
});
