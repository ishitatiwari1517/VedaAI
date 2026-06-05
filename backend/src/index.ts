import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import mongoose from 'mongoose';
import assignmentRoutes from './routes/assignments';
import { initSocketServer } from './socket/socketServer';
import { startGenerationWorker } from './workers/generationWorker';

const app = express();
const httpServer = createServer(app);

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/assignments', assignmentRoutes);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Initialize Socket.io
initSocketServer(httpServer);

// Start BullMQ worker
startGenerationWorker();

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('[MongoDB] Connected successfully');
    httpServer.listen(PORT, () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Socket] WebSocket server active`);
    });
  })
  .catch((err) => {
    console.error('[MongoDB] Connection failed:', err);
    process.exit(1);
  });

export default app;
