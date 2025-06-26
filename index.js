const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors()); // Allow access from other devices

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('➡️ Client connected');

  ws.on('message', (rawData) => {
    console.log('🔁 Server got:', rawData);
    const msg = JSON.parse(rawData); // Expected format: { type: 'message', data: { sender, text } }

    if (msg.type === 'message') {
      // Broadcast the message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', data: msg.data }));
        }
      });
    }
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
});

server.listen(3001, () => {
  console.log('✅ WebSocket server is running on port 3001');
});
