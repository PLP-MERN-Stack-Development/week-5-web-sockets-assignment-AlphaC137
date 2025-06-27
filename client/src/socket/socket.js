// socket.js - Socket.io client setup

import { io } from 'socket.io-client';
import { useEffect, useState, useCallback } from 'react';

// Socket.io connection URL
// Dynamically determine the backend URL for GitHub Codespaces
const getServerUrl = () => {
  // If we're in a GitHub Codespace environment
  if (window.location.host.includes('.app.github.dev')) {
    // Extract the codespace name and use port 5000 for backend
    const codespaceHost = window.location.host.replace('5173-', '5000-');
    return `https://${codespaceHost}`;
  }
  // If running locally, check if ports are directly accessible
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  }
  // Default for local development
  return import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
};

const SOCKET_URL = getServerUrl();
const API_URL = SOCKET_URL; // Using same base URL for API
console.log('Current window.location.host:', window.location.host);
console.log('Connecting to socket server at:', SOCKET_URL);
console.log('API URL:', API_URL);

// Create socket instance
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  withCredentials: true,
});

// Custom hook for using socket.io
export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastMessage, setLastMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageReactions, setMessageReactions] = useState({});
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState('general');
  const [hasMoreMessages, setHasMoreMessages] = useState(true);

  // Connect to socket server
  const connect = (username) => {
    socket.connect();
    if (username) {
      socket.emit('user_join', username);
    }
  };

  // Load older messages with pagination
  const loadOlderMessages = useCallback(async (page = 1, roomId = currentRoom) => {
    try {
      const limit = 20; // Number of messages per page
      const skip = (page - 1) * limit;
      
      const response = await fetch(`${API_URL}/api/messages?room=${roomId}&skip=${skip}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch older messages');
      }
      
      const olderMessages = await response.json();
      
      if (olderMessages.length === 0) {
        setHasMoreMessages(false);
        return false;
      }
      
      // Prepend older messages to the existing messages
      setMessages(prevMessages => {
        // Filter out duplicates based on message ID
        const existingIds = new Set(prevMessages.map(msg => msg.id));
        const uniqueOlderMessages = olderMessages.filter(msg => !existingIds.has(msg.id));
        
        // Return combined messages in chronological order
        return [...uniqueOlderMessages, ...prevMessages];
      });
      
      return olderMessages.length === limit; // If we got fewer than limit, we're at the end
    } catch (error) {
      console.error('Error loading older messages:', error);
      return false;
    }
  }, [currentRoom]);

  // Disconnect from socket server
  const disconnect = () => {
    socket.disconnect();
  };

  // Send a message
  const sendMessage = (message, roomId = currentRoom) => {
    socket.emit('send_message', { message, roomId });
  };

  // Send a private message
  const sendPrivateMessage = (to, message) => {
    socket.emit('private_message', { to, message });
  };

  // Set typing status
  const setTyping = (isTyping) => {
    socket.emit('typing', isTyping);
  };
  
  // Add reaction to a message
  const addReaction = (messageId, reaction) => {
    socket.emit('add_reaction', { messageId, reaction });
  };
  
  // Mark message as read
  const markMessageRead = (messageId) => {
    socket.emit('mark_read', { messageId });
  };
  
  // Decrement unread count
  const decrementUnreadCount = () => {
    setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
  };
  
  // Join a room
  const joinRoom = (roomId) => {
    socket.emit('join_room', roomId);
    setCurrentRoom(roomId);
  };
  
  // Leave a room
  const leaveRoom = (roomId) => {
    if (roomId !== 'general') {
      socket.emit('leave_room', roomId);
      setCurrentRoom('general');
    }
  };

  // Socket event listeners
  useEffect(() => {
    // Connection events
    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
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
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} joined the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    const onUserLeft = (user) => {
      // You could add a system message here
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          system: true,
          message: `${user.username} left the chat`,
          timestamp: new Date().toISOString(),
        },
      ]);
    };

    // Typing events
    const onTypingUsers = (users) => {
      setTypingUsers(users);
    };

    // Handle message reactions
    const onMessageReaction = ({ messageId, reactions }) => {
      setMessageReactions(prev => ({
        ...prev,
        [messageId]: reactions
      }));
    };
    
    // Handle message read receipts
    const onMessageRead = ({ messageId, readBy }) => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, readBy } : msg
        )
      );
    };
    
    // Handle room list
    const onRoomList = (roomList) => {
      setRooms(roomList);
    };
    
    // Handle room messages
    const onRoomMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };
    
    // Register event listeners
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('receive_message', onReceiveMessage);
    socket.on('private_message', onPrivateMessage);
    socket.on('user_list', onUserList);
    socket.on('user_joined', onUserJoined);
    socket.on('user_left', onUserLeft);
    socket.on('typing_users', onTypingUsers);
    socket.on('message_reaction', onMessageReaction);
    socket.on('message_read', onMessageRead);
    socket.on('room_list', onRoomList);
    socket.on('room_message', onRoomMessage);

    // Clean up event listeners
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('receive_message', onReceiveMessage);
      socket.off('private_message', onPrivateMessage);
      socket.off('user_list', onUserList);
      socket.off('user_joined', onUserJoined);
      socket.off('user_left', onUserLeft);
      socket.off('typing_users', onTypingUsers);
      socket.off('message_reaction', onMessageReaction);
      socket.off('message_read', onMessageRead);
      socket.off('room_list', onRoomList);
      socket.off('room_message', onRoomMessage);
    };
  }, []);
  return {
    socket,
    isConnected,
    lastMessage,
    messages,
    users,
    typingUsers,
    unreadCount,
    messageReactions,
    rooms,
    currentRoom,
    connect,
    disconnect,
    sendMessage,
    sendPrivateMessage,
    setTyping,
    addReaction,
    markMessageRead,
    decrementUnreadCount,
    joinRoom,
    leaveRoom,
    loadOlderMessages,
    hasMoreMessages,
  };
};

export default socket;