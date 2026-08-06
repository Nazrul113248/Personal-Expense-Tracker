import express from 'express';
import 'dotenv/config';

import authRoutes from '../server/routes/auth';
import userRoutes from '../server/routes/user';
import transactionRoutes from '../server/routes/transactions';

const app = express();

// JSON Body Parser Middleware
app.use(express.json());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel' });
});
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), platform: 'vercel' });
});

// Mount API Routers (supporting both with and without /api prefix for local vs Vercel environment)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/user', userRoutes);
app.use('/user', userRoutes);

app.use('/api/transactions', transactionRoutes);
app.use('/transactions', transactionRoutes);

// Export the Express app instance for Vercel Serverless Functions
export default app;
