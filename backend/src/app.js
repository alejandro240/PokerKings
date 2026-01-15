import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import tableRoutes from './routes/table.routes.js';
import shopRoutes from './routes/shop.routes.js';
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
app.use('/api/shop', shopRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'PokerKings API is running' });
});

// Error handling
app.use(errorMiddleware);

export default app;
