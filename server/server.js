import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import authRoutes from './routes/auth.js';
import marinaRoutes from './routes/marinas.js';
import boatRoutes from './routes/boats.js';
import availabilityRoutes from './routes/availability.js';
import reservationRoutes from './routes/reservations.js';
import customerRoutes from './routes/customers.js';
import paymentRoutes from './routes/payments.js';

dotenv.config();

const app = express();

function normalizeOrigin(url) {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return url.replace(/\/+$/, '');
  }
}

const allowedOrigins = [
  normalizeOrigin(process.env.CLIENT_URL),
  normalizeOrigin(process.env.WIDGET_URL),
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || /\.vercel\.app$/i.test(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Lake Pass API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/marinas', marinaRoutes);
app.use('/api/boats', boatRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = Number(process.env.PORT) || 5000;

mongoose
  .connect(process.env.MONGODB_URI, { dbName: 'lakepass' })
  .then(() => {
    console.log('MongoDB connected');
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Set PORT in server/.env or stop the process using it.`);
      } else {
        console.error('Server error:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

export default app;
