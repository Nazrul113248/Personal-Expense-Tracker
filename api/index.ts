import express from 'express';
import 'dotenv/config';

import authRoutes from '../server/routes/auth';
import userRoutes from '../server/routes/user';
import transactionRoutes from '../server/routes/transactions';

const app = express();

// JSON Body Parser Middleware
app.use(express.json());

// Diagnostics endpoint to help troubleshoot Vercel routing
app.get('/api/debug', (req, res) => {
  res.json({
    url: req.url,
    originalUrl: req.originalUrl,
    headers: req.headers,
    env: {
      NODE_ENV: process.env.NODE_ENV,
    }
  });
});

// Default and Welcome API endpoints
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the Expense Tracker API', status: 'ok' });
});
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Expense Tracker API', status: 'ok' });
});

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

// Global Error Handler Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[API Unhandled Error]:', err);
  res.status(500).json({
    message: 'Unhandled API Error',
    error: err?.message || String(err),
    stack: err?.stack
  });
});

// Export the Express app instance for Vercel Serverless Functions
export default app;
