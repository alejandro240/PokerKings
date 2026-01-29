import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tableRoutes from './routes/table.routes.js';
import gameRoutes from './routes/game.routes.js';
import shopRoutes from './routes/shop.routes.js';
import friendRoutes from './routes/friend.routes.js';
import handRoutes from './routes/hand.routes.js';
import missionRoutes from './routes/mission.routes.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/hands', handRoutes);
app.use('/api/missions', missionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PokerKings API is running' });
});

// Error handling
app.use(errorMiddleware);

export default app;
