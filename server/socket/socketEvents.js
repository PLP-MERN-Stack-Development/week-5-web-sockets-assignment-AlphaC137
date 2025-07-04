// socket/socketEvents.js - Socket.io event handlers setup
const User = require('../models/User');
const Message = require('../models/Message');

// Store connected users and their socket connections
const connectedUsers = new Map();
const typingUsers = new Map();

/**
 * Setup Socket.io events
 * @param {SocketIO.Server} io - Socket.io server instance
 */
const setupSocketEvents = (io) => {
  // Socket.io connection handler with JWT validation
  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.id})`);
    
    try {
      // ✅ On connection: verify JWT, add user to online list
      await User.findByIdAndUpdate(socket.user.id, {
        isOnline: true,
        socketId: socket.id,
        lastSeen: new Date()
      });

      // Store user connection
      connectedUsers.set(socket.user.id, {
        socketId: socket.id,
        user: socket.user
      });

      // Join user to a default room
      socket.join('general');

      // Emit updated user list to all clients
      const onlineUsers = await User.find({ isOnline: true })
        .select('username avatar isOnline');
      io.emit('user_list', onlineUsers);

      // Notify others that user joined
      socket.broadcast.emit('user_joined', {
        id: socket.user.id,
        username: socket.user.username,
        avatar: socket.user.avatar
      });

    } catch (error) {
      console.error('Error updating user status:', error);
    }

    // Handle user joining a room
    socket.on('join_room', async (room) => {
      try {
        socket.leave('general');
        socket.join(room);
        
        socket.emit('joined_room', { room, message: `Joined room: ${room}` });
        socket.to(room).emit('user_joined_room', {
          username: socket.user.username,
          room
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // ✅ On 'chat message': broadcast message with username, timestamp
    socket.on('chat message', async (messageData) => {
      try {
        const message = new Message({
          sender: socket.user.id,
          content: messageData.message || messageData,
          room: messageData.room || 'general',
          messageType: messageData.type || 'text'
        });

        await message.save();
        
        // Populate sender information
        await message.populate('sender', 'username avatar');

        const messageResponse = {
          id: message._id,
          content: message.content,
          sender: {
            id: message.sender._id,
            username: message.sender.username,
            avatar: message.sender.avatar
          },
          room: message.room,
          messageType: message.messageType,
          timestamp: message.createdAt,
          reactions: message.reactions
        };

        // Broadcast to room with username and timestamp
        io.to(messageData.room || 'general').emit('chat message', messageResponse);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Alternative event name for compatibility
    socket.on('send_message', async (messageData) => {
      try {
        const message = new Message({
          sender: socket.user.id,
          content: messageData.message,
          room: messageData.room || 'general',
          messageType: messageData.type || 'text'
        });

        await message.save();
        
        // Populate sender information
        await message.populate('sender', 'username avatar');

        const messageResponse = {
          id: message._id,
          content: message.content,
          sender: message.sender,
          room: message.room,
          messageType: message.messageType,
          timestamp: message.createdAt,
          reactions: message.reactions
        };

        // Emit to room
        io.to(messageData.room || 'general').emit('receive_message', messageResponse);
        
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ✅ On 'typing': emit 'Bro is typing...'
    socket.on('typing', (data) => {
      try {
        const { isTyping, room = 'general' } = data;
        
        if (isTyping) {
          typingUsers.set(socket.user.id, {
            username: socket.user.username,
            room
          });
          
          // Emit "Bro is typing..." style message
          socket.to(room).emit('typing', {
            message: `${socket.user.username} is typing...`,
            username: socket.user.username,
            isTyping: true
          });
        } else {
          typingUsers.delete(socket.user.id);
          
          socket.to(room).emit('typing', {
            message: `${socket.user.username} stopped typing`,
            username: socket.user.username,
            isTyping: false
          });
        }
        
        // Get typing users for the specific room
        const roomTypingUsers = Array.from(typingUsers.values())
          .filter(user => user.room === room)
          .map(user => user.username);
        
        socket.to(room).emit('typing_users', roomTypingUsers);
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    // Handle private messages
    socket.on('private_message', async ({ to, message }) => {
      try {
        const recipient = await User.findById(to);
        if (!recipient) {
          socket.emit('error', { message: 'Recipient not found' });
          return;
        }

        const privateMessage = new Message({
          sender: socket.user.id,
          recipient: to,
          content: message,
          isPrivate: true,
          messageType: 'text'
        });

        await privateMessage.save();
        await privateMessage.populate(['sender', 'recipient'], 'username avatar');

        const messageData = {
          id: privateMessage._id,
          content: privateMessage.content,
          sender: privateMessage.sender,
          recipient: privateMessage.recipient,
          timestamp: privateMessage.createdAt,
          isPrivate: true
        };

        // Send to recipient if online
        const recipientConnection = connectedUsers.get(to);
        if (recipientConnection) {
          io.to(recipientConnection.socketId).emit('private_message', messageData);
        }
        
        // Send back to sender
        socket.emit('private_message', messageData);
        
      } catch (error) {
        console.error('Error sending private message:', error);
        socket.emit('error', { message: 'Failed to send private message' });
      }
    });

    // ✅ On disconnect: update user status
    socket.on('disconnect', async () => {
      try {
        console.log(`User disconnected: ${socket.user.username} (${socket.id})`);
        
        // Update user status in database
        await User.findByIdAndUpdate(socket.user.id, {
          isOnline: false,
          lastSeen: new Date(),
          socketId: null
        });

        // Remove from connected users and typing users
        connectedUsers.delete(socket.user.id);
        typingUsers.delete(socket.user.id);

        // Emit updated user list
        const onlineUsers = await User.find({ isOnline: true })
          .select('username avatar isOnline');
        io.emit('user_list', onlineUsers);

        // Notify others that user left
        socket.broadcast.emit('user_left', {
          id: socket.user.id,
          username: socket.user.username
        });

        // Update typing users
        const remainingTypingUsers = Array.from(typingUsers.values())
          .map(user => user.username);
        io.emit('typing_users', remainingTypingUsers);
        
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // Additional custom events
    socket.on('user_join', (username) => {
      // Legacy support for username-based join
      socket.broadcast.emit('user_joined', {
        username: username || socket.user.username,
        id: socket.user.id
      });
    });

    // Handle message reactions
    socket.on('react_to_message', async ({ messageId, emoji }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user already reacted with this emoji
        const existingReaction = message.reactions.find(
          reaction => reaction.user.toString() === socket.user.id && reaction.emoji === emoji
        );

        if (existingReaction) {
          // Remove reaction
          message.reactions = message.reactions.filter(
            reaction => !(reaction.user.toString() === socket.user.id && reaction.emoji === emoji)
          );
        } else {
          // Add reaction
          message.reactions.push({
            user: socket.user.id,
            emoji
          });
        }

        await message.save();

        // Broadcast reaction update
        io.emit('message_reaction', {
          messageId,
          reactions: message.reactions,
          user: socket.user.username
        });

      } catch (error) {
        console.error('Error handling reaction:', error);
        socket.emit('error', { message: 'Failed to react to message' });
      }
    });
  });

  return { connectedUsers, typingUsers };
};

module.exports = {
  setupSocketEvents,
  connectedUsers,
  typingUsers
};
