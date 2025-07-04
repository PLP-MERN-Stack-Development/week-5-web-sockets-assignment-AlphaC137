// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/database');
const { socketAuth } = require('./middleware/auth');
const { setupSocketEvents } = require('./socket/socketEvents');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/users', require('./routes/users'));

// Import models
const User = require('./models/User');
const Message = require('./models/Message');

// Socket.io authentication middleware
io.use(socketAuth);

// Setup Socket.io events using modular function
const { connectedUsers, typingUsers } = setupSocketEvents(io);

// API routes
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Socket.io Chat Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <h1>Socket.io Chat Server</h1>
    <p>Server is running and ready for connections.</p>
    <p>API endpoints:</p>
    <ul>
      <li>POST /api/auth/register - Register new user</li>
      <li>POST /api/auth/login - Login user</li>
      <li>GET /api/auth/me - Get current user</li>
      <li>GET /api/messages - Get messages</li>
      <li>GET /api/users - Get all users</li>
    </ul>
  `);
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 