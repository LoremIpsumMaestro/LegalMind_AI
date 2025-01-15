import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocket from 'ws';
import cors from 'cors';
import authRoutes from './routes/auth';
import { authenticateToken } from './middleware/auth';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'Access granted to protected route' });
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    console.log('received: %s', message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
