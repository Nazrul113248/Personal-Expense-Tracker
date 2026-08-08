import express from 'express';
import 'dotenv/config';

import authRoutes from '../server/routes/auth';
import userRoutes from '../server/routes/user';
import transactionRoutes from '../server/routes/transactions';

const app = express();

// Middleware to restore original request URL on Vercel after internal rewrites
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'];
  if (matchedPath) {
    const originalPath = Array.isArray(matchedPath) ? matchedPath[0] : matchedPath;
    // Keep any existing query parameters from the request
    const queryIndex = req.url.indexOf('?');
    const query = queryIndex !== -1 ? req.url.substring(queryIndex) : '';
    req.url = originalPath + query;
  }
  next();
});

// JSON Body Parser Middleware
app.use(express.json());

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

// Export the Express app instance for Vercel Serverless Functions
export default app;
