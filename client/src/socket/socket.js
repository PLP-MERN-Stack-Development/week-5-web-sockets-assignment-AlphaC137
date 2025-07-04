// socket.js - Socket.io client setup with JWT authentication

import { io } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Socket.io connection URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// Create socket instance (don't auto-connect)
let socket = null;

// Initialize socket with JWT token
export const initializeSocket = (token) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io(SOCKET_URL, {
    auth: {
      token: token
    },
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  return socket;
};

// Get current socket instance
export const getSocket = () => socket;

// Custom hook for using socket.io with authentication
export const useSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [connectionError, setConnectionError] = useState(null);

  // Initialize socket when token changes
  useEffect(() => {
    if (token) {
      const socketInstance = initializeSocket(token);
      setConnectionError(null);
    }
  }, [token]);

  // Connect to socket server
  const connect = () => {
    if (socket && token) {
      socket.connect();
    }
  };

  // Disconnect from socket server
  const disconnect = () => {
    if (socket) {
      socket.disconnect();
    }
  };

  // Join a room
  const joinRoom = (room) => {
    if (socket && socket.connected) {
      socket.emit('join_room', room);
      setCurrentRoom(room);
    }
  };

  // Send a message
  const sendMessage = (message, room = currentRoom) => {
    if (socket && socket.connected) {
      socket.emit('send_message', { message, room });
    }
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    if (socket && socket.connected) {
      socket.emit('private_message', { to, message });
    }
  };

  // Set typing status
  const setTyping = (isTyping, room = currentRoom) => {
    if (socket && socket.connected) {
      socket.emit('typing', { isTyping, room });
    }
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Connection events
    const onConnect = () => {
      console.log('Connected to server');
      setIsConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = (reason) => {
      console.log('Disconnected from server:', reason);
      setIsConnected(false);
    };

    const onConnectError = (error) => {
      console.error('Connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    };

    // Message events
    const onReceiveMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    const onPrivateMessage = (message) => {
      setLastMessage(message);
      setMessages((prev) => [...prev, message]);
    };

    // User events
    const onUserList = (userList) => {
      setUsers(userList);
    };

    const onUserJoined = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          content: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          content: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserJoinedRoom = (data) => {
      if (data.room === currentRoom) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            system: true,
            content: `${data.username} joined the room`,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    };

    const onJoinedRoom = (data) => {
      setCurrentRoom(data.room);
      setMessages([]); // Clear messages when switching rooms
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Error events
    const onError = (error) => {
      console.error('Socket error:', error);
      setConnectionError(error.message);
    };

    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('user_joined_room', onUserJoinedRoom);
    socket.on('joined_room', onJoinedRoom);
    socket.on('typing_users', onTypingUsers);
    socket.on('error', onError);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('user_joined_room', onUserJoinedRoom);
      socket.off('joined_room', onJoinedRoom);
      socket.off('typing_users', onTypingUsers);
      socket.off('error', onError);
    };
  }, [currentRoom]);

  return {
    socket: getSocket(),
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    currentRoom,
    connectionError,
    connect,
    disconnect,
    joinRoom,
    sendMessage,
    sendPrivateMessage,
    setTyping,
  };
};

export default { initializeSocket, getSocket, useSocket }; 