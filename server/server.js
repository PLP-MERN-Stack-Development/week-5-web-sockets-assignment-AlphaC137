const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  methods: ["GET", "POST"]
}));

app.use(express.json());
app.use(express.static('uploads'));

// Configure Socket.io with CORS
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"]
  }
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// In-memory data stores
const users = new Map(); // socketId -> user info
const onlineUsers = new Map(); // userId -> user info
const rooms = new Map(); // roomId -> room info
const messages = new Map(); // roomId -> messages array
const privateMessages = new Map(); // conversationId -> messages array
const typingUsers = new Map(); // roomId -> Set of typing users
const unreadCounts = new Map(); // userId -> Map of roomId -> count

// Replace default room with "Global Brozone"
const globalBrozone = {
  id: 'global-brozone',
  name: 'Global Brozone',
  type: 'public',
  members: new Set(),
  createdAt: new Date()
};
rooms.set('global-brozone', globalBrozone);
messages.set('global-brozone', []);

// Add topic channels
const topicChannels = [
  { id: 'frontend-bros', name: '#frontend-bros' },
  { id: 'backend-bros', name: '#backend-bros' },
  { id: 'bug-hunters', name: '#bug-hunters' },
  { id: 'help-im-dying', name: '#help-im-dying' }
];

topicChannels.forEach(channel => {
  rooms.set(channel.id, {
    id: channel.id,
    name: channel.name,
    type: 'public',
    members: new Set(),
    createdAt: new Date()
  });
  messages.set(channel.id, []);
});

// File upload endpoint
app.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileInfo = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `http://localhost:8000/${req.file.filename}`
    };
    
    res.json(fileInfo);
  } catch (error) {
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // User join/authentication
  socket.on('user join', (userData) => {
    const user = {
      id: userData.id || uuidv4(),
      username: userData.username,
      socketId: socket.id,
      joinedAt: new Date(),
      isOnline: true
    };

    users.set(socket.id, user);
    onlineUsers.set(user.id, user);

    // Add user to "Global Brozone"
    const room = rooms.get('global-brozone');
    room.members.add(user.id);
    socket.join('global-brozone');

    // Convert room object for serialization
    const roomToSend = {
      ...room,
      members: Array.from(room.members)
    };

    // Notify the user of the available rooms
    socket.emit('rooms list', Array.from(rooms.values()).map(r => ({
      ...r,
      members: Array.from(r.members)
    })));
    
    // Send room joined event for the global room
    socket.emit('room joined', {
      room: roomToSend,
      messages: messages.get('global-brozone') || []
    });

    console.log(`${user.username} joined Global Brozone`);
  });

  // Handle messages
  socket.on('message', (messageData, acknowledgeFn) => {
    const user = users.get(socket.id);
    if (!user) {
      if (acknowledgeFn) acknowledgeFn({ success: false, error: 'User not found' });
      return;
    }

    const message = {
      id: uuidv4(),
      content: messageData.content,
      sender: {
        id: user.id,
        username: user.username
      },
      roomId: messageData.roomId || 'global-brozone',
      timestamp: new Date(),
      type: messageData.type || 'text',
      fileInfo: messageData.fileInfo || null,
      reactions: new Map(),
      readBy: new Set([user.id])
    };

    // Store message
    if (!messages.has(message.roomId)) {
      messages.set(message.roomId, []);
    }
    messages.get(message.roomId).push(message);

    // Emit to room
    io.to(message.roomId).emit('new message', message);

    // Send acknowledgment
    if (acknowledgeFn) {
      acknowledgeFn({ 
        success: true, 
        messageId: message.id,
        timestamp: message.timestamp 
      });
    }

    // Update unread counts for other users in the room
    const room = rooms.get(message.roomId);
    if (room) {
      room.members.forEach(memberId => {
        if (memberId !== user.id) {
          const userUnreadCounts = unreadCounts.get(memberId) || new Map();
          const currentCount = userUnreadCounts.get(message.roomId) || 0;
          userUnreadCounts.set(message.roomId, currentCount + 1);
          unreadCounts.set(memberId, userUnreadCounts);
          
          // Send unread count update to user if online
          const onlineUser = onlineUsers.get(memberId);
          if (onlineUser) {
            io.to(onlineUser.socketId).emit('unread count updated', {
              roomId: message.roomId,
              count: currentCount + 1
            });
          }
        }
      });
    }

    console.log(`Message from ${user.username} in ${message.roomId}: ${message.content}`);
  });

  // Handle private messages
  socket.on('private message', (messageData) => {
    const user = users.get(socket.id);
    if (!user) return;

    const recipientId = messageData.recipientId;
    const recipient = onlineUsers.get(recipientId);
    
    // Create conversation ID (sorted to ensure consistency)
    const conversationId = [user.id, recipientId].sort().join('-');

    const message = {
      id: uuidv4(),
      content: messageData.content,
      sender: {
        id: user.id,
        username: user.username
      },
      recipientId: recipientId,
      conversationId: conversationId,
      timestamp: new Date(),
      type: messageData.type || 'text',
      fileInfo: messageData.fileInfo || null,
      readBy: new Set([user.id])
    };

    // Store private message
    if (!privateMessages.has(conversationId)) {
      privateMessages.set(conversationId, []);
    }
    privateMessages.get(conversationId).push(message);

    // Send to sender
    socket.emit('new private message', message);

    // Send to recipient if online
    if (recipient) {
      io.to(recipient.socketId).emit('new private message', message);
    }

    console.log(`Private message from ${user.username} to ${recipientId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomId = data.roomId || 'global-brozone';
    
    if (!typingUsers.has(roomId)) {
      typingUsers.set(roomId, new Set());
    }
    
    typingUsers.get(roomId).add(user.id);
    
    // Broadcast to others in room
    socket.to(roomId).emit('user typing', {
      userId: user.id,
      username: user.username,
      roomId: roomId
    });

    // Clear typing after 3 seconds
    setTimeout(() => {
      const typingSet = typingUsers.get(roomId);
      if (typingSet) {
        typingSet.delete(user.id);
        socket.to(roomId).emit('user stopped typing', {
          userId: user.id,
          roomId: roomId
        });
      }
    }, 3000);
  });

  socket.on('stop typing', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const roomId = data.roomId || 'global-brozone';
    const typingSet = typingUsers.get(roomId);
    if (typingSet) {
      typingSet.delete(user.id);
      socket.to(roomId).emit('user stopped typing', {
        userId: user.id,
        roomId: roomId
      });
    }
  });

  // Handle room creation
  socket.on('create room', (roomData) => {
    console.log('Received create room event:', roomData);
    const user = users.get(socket.id);
    if (!user) {
      console.log('User not found for socket ID:', socket.id);
      return;
    }

    const room = {
      id: uuidv4(),
      name: roomData.name,
      type: roomData.type || 'public',
      members: new Set([user.id]),
      createdBy: user.id,
      createdAt: new Date()
    };

    rooms.set(room.id, room);
    messages.set(room.id, []);

    socket.join(room.id);
    // Convert Set to Array for serialization before sending
    // Convert room object for serialization (Sets and Maps aren't JSON serializable)
    const roomToSend = {
      ...room,
      members: Array.from(room.members),
      reactions: room.reactions ? Object.fromEntries(
        Array.from(room.reactions.entries()).map(([key, value]) => [key, Array.from(value)])
      ) : {},
      readBy: room.readBy ? Array.from(room.readBy) : []
    };
    
    console.log('Emitting room created:', roomToSend);
    socket.emit('room created', roomToSend);
    
    // Broadcast new room to all users if public
    if (room.type === 'public') {
      console.log('Broadcasting new room available:', roomToSend);
      io.emit('new room available', roomToSend);
    }

    console.log(`Room ${room.name} created by ${user.username}`);
  });

  // Handle joining rooms
  socket.on('join room', (roomId) => {
    const user = users.get(socket.id);
    if (!user) return;

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    socket.join(roomId);
    room.members.add(user.id);

    // Clear unread count for this room
    const userUnreadCounts = unreadCounts.get(user.id) || new Map();
    userUnreadCounts.set(roomId, 0);
    unreadCounts.set(user.id, userUnreadCounts);

    // Convert Set to Array for serialization
    const roomToSend = {
      ...room,
      members: Array.from(room.members)
    };

    socket.emit('room joined', {
      room: roomToSend,
      messages: messages.get(roomId) || []
    });

    socket.to(roomId).emit('user joined room', {
      user: user,
      room: roomId,
      timestamp: new Date()
    });

    console.log(`User ${user.username} joined room ${room.name}`);
  });

  // Handle message reactions
  socket.on('message reaction', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const { messageId, roomId, reaction } = data;
    const roomMessages = messages.get(roomId);
    
    if (roomMessages) {
      const message = roomMessages.find(m => m.id === messageId);
      if (message) {
        if (!message.reactions) {
          message.reactions = new Map();
        }
        
        const currentReaction = message.reactions.get(reaction) || new Set();
        
        if (currentReaction.has(user.id)) {
          currentReaction.delete(user.id);
        } else {
          currentReaction.add(user.id);
        }
        
        message.reactions.set(reaction, currentReaction);
        
        io.to(roomId).emit('message reaction updated', {
          messageId: messageId,
          reaction: reaction,
          users: Array.from(currentReaction),
          roomId: roomId
        });
      }
    }
  });

  // Handle read receipts
  socket.on('mark messages read', (data) => {
    const user = users.get(socket.id);
    if (!user) return;

    const { roomId, messageIds } = data;
    const roomMessages = messages.get(roomId);
    
    if (roomMessages) {
      messageIds.forEach(messageId => {
        const message = roomMessages.find(m => m.id === messageId);
        if (message && message.readBy) {
          message.readBy.add(user.id);
        }
      });
      
      // Clear unread count
      const userUnreadCounts = unreadCounts.get(user.id) || new Map();
      userUnreadCounts.set(roomId, 0);
      unreadCounts.set(user.id, userUnreadCounts);
      
      socket.emit('unread count updated', {
        roomId: roomId,
        count: 0
      });
      
      socket.to(roomId).emit('messages marked read', {
        userId: user.id,
        messageIds: messageIds,
        roomId: roomId
      });
    }
  });

  // Handle getting conversation history
  socket.on('get conversation history', (recipientId) => {
    const user = users.get(socket.id);
    if (!user) return;

    const conversationId = [user.id, recipientId].sort().join('-');
    const conversation = privateMessages.get(conversationId) || [];
    
    socket.emit('conversation history', {
      recipientId: recipientId,
      messages: conversation
    });
  });

  // Handle getting rooms list
  socket.on('get rooms', () => {
    const user = users.get(socket.id);
    if (!user) return;

    const availableRooms = Array.from(rooms.values())
      .filter(room => room.type === 'public' || room.members.has(user.id))
      .map(room => ({
        ...room,
        members: Array.from(room.members) // Convert Set to Array for serialization
      }));
    
    socket.emit('rooms list', availableRooms);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`User ${user.username} disconnected`);
      
      // Remove from users maps
      users.delete(socket.id);
      onlineUsers.delete(user.id);
      
      // Remove from all rooms
      rooms.forEach((room, roomId) => {
        if (room.members.has(user.id)) {
          room.members.delete(user.id);
          socket.to(roomId).emit('user left room', {
            user: user,
            room: roomId,
            timestamp: new Date()
          });
        }
      });
      
      // Remove from typing indicators
      typingUsers.forEach((typingSet, roomId) => {
        if (typingSet.has(user.id)) {
          typingSet.delete(user.id);
          socket.to(roomId).emit('user stopped typing', {
            userId: user.id,
            roomId: roomId
          });
        }
      });
      
      // Update online users list
      const onlineUsersList = Array.from(onlineUsers.values());
      io.emit('users online', onlineUsersList);
    }
  });
});

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
