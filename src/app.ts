import express from 'express';
import userRoutes from './routes/userRoutes.js';
import { prisma } from './config/prisma.js';

export const app = express();

app.use(express.json());

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

app.use('/api/users', userRoutes);
