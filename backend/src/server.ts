import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocket from 'ws';

dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
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