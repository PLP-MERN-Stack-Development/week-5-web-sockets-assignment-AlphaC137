// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for Codespaces testing
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users and messages
const users = {};
const messages = [];
const typingUsers = {};
const messageReactions = {};
const rooms = {
  'general': { name: 'General', description: 'Main chat room for everyone' },
  'tech': { name: 'Technology', description: 'Discuss the latest tech news and trends' },
  'random': { name: 'Random', description: 'Random discussions about anything' }
};

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Handle user joining
  socket.on('user_join', (username) => {
    users[socket.id] = { username, id: socket.id, rooms: ['general'] };
    
    // Auto-join the general room
    socket.join('general');
    
    io.emit('user_list', Object.values(users));
    io.emit('user_joined', { username, id: socket.id });
    
    // Send available rooms to the user
    socket.emit('room_list', Object.entries(rooms).map(([id, room]) => ({
      id,
      name: room.name,
      description: room.description
    })));
    
    console.log(`${username} joined the chat`);
  });
  
  // Handle room joining
  socket.on('join_room', (roomId) => {
    if (rooms[roomId] && users[socket.id]) {
      // Join the socket.io room
      socket.join(roomId);
      
      // Update user's room list if not already in it
      if (!users[socket.id].rooms.includes(roomId)) {
        users[socket.id].rooms.push(roomId);
      }
      
      // Notify room that user joined
      io.to(roomId).emit('room_message', {
        id: Date.now(),
        room: roomId,
        message: `${users[socket.id].username} joined the room`,
        system: true,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`${users[socket.id].username} joined room: ${roomId}`);
    }
  });
  
  // Handle room leaving
  socket.on('leave_room', (roomId) => {
    if (roomId !== 'general' && users[socket.id]) {
      // Leave the socket.io room
      socket.leave(roomId);
      
      // Update user's room list
      users[socket.id].rooms = users[socket.id].rooms.filter(r => r !== roomId);
      
      // Notify room that user left
      io.to(roomId).emit('room_message', {
        id: Date.now(),
        room: roomId,
        message: `${users[socket.id].username} left the room`,
        system: true,
        timestamp: new Date().toISOString(),
      });
      
      console.log(`${users[socket.id].username} left room: ${roomId}`);
    }
  });

  // Handle chat messages
  socket.on('send_message', (messageData) => {
    const { message, roomId } = messageData;
    
    const messageObj = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      message,
      timestamp: new Date().toISOString(),
      room: roomId || 'general',
    };
    
    messages.push(messageObj);
    
    // Limit stored messages to prevent memory issues
    if (messages.length > 100) {
      messages.shift();
    }
    
    if (roomId) {
      // Send to specific room
      io.to(roomId).emit('receive_message', messageObj);
    } else {
      // Send to all (global)
      io.emit('receive_message', messageObj);
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    if (users[socket.id]) {
      const username = users[socket.id].username;
      
      if (isTyping) {
        typingUsers[socket.id] = username;
      } else {
        delete typingUsers[socket.id];
      }
      
      io.emit('typing_users', Object.values(typingUsers));
    }
  });
  
  // Handle message reactions
  socket.on('add_reaction', ({ messageId, reaction }) => {
    if (!messageReactions[messageId]) {
      messageReactions[messageId] = [];
    }
    
    // Store who reacted with what
    const reactionData = {
      userId: socket.id,
      username: users[socket.id]?.username || 'Anonymous',
      reaction,
      timestamp: new Date().toISOString(),
    };
    
    messageReactions[messageId].push(reactionData);
    
    // Broadcast the reaction to all clients
    io.emit('message_reaction', {
      messageId,
      reactions: messageReactions[messageId],
    });
  });
  
  // Handle read receipts
  socket.on('mark_read', ({ messageId }) => {
    // Find the message in our messages array
    const message = messages.find(msg => msg.id === messageId);
    
    if (message) {
      if (!message.readBy) {
        message.readBy = [];
      }
      
      // Add user to readBy if not already there
      if (!message.readBy.includes(socket.id)) {
        message.readBy.push(socket.id);
        
        // Notify sender that message was read
        if (message.senderId !== socket.id) {
          io.to(message.senderId).emit('message_read', {
            messageId,
            readBy: message.readBy,
          });
        }
      }
    }
  });

  // Handle private messages
  socket.on('private_message', ({ to, message }) => {
    const messageData = {
      id: Date.now(),
      sender: users[socket.id]?.username || 'Anonymous',
      senderId: socket.id,
      receiverId: to,
      message,
      timestamp: new Date().toISOString(),
      isPrivate: true,
    };
    
    socket.to(to).emit('private_message', messageData);
    socket.emit('private_message', messageData);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (users[socket.id]) {
      const { username } = users[socket.id];
      io.emit('user_left', { username, id: socket.id });
      console.log(`${username} left the chat`);
    }
    
    delete users[socket.id];
    delete typingUsers[socket.id];
    
    io.emit('user_list', Object.values(users));
    io.emit('typing_users', Object.values(typingUsers));
  });
});

// API routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.get('/api/users', (req, res) => {
  res.json(Object.values(users));
});

// Root route
app.get('/', (req, res) => {
  res.send('Socket.io Chat Server is running');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io }; 