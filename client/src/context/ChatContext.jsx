import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import socketManager from '../socket/socket';
import toast from 'react-hot-toast';

const ChatContext = createContext();

const initialState = {
  user: null,
  currentRoom: null,
  rooms: [
    { id: 'global-brozone', name: 'Global Brozone' },
    { id: 'frontend-bros', name: '#frontend-bros' },
    { id: 'backend-bros', name: '#backend-bros' },
    { id: 'bug-hunters', name: '#bug-hunters' },
    { id: 'help-im-dying', name: '#help-im-dying' }
  ],
  messages: [],
  privateMessages: new Map(),
  onlineUsers: [],
  typingUsers: new Set(),
  unreadCounts: new Map(),
  isConnected: false,
  searchQuery: '',
  filteredMessages: [],
  notifications: {
    sound: true,
    browser: true
  }
};

function chatReducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };
    
    case 'SET_CURRENT_ROOM':
      return { ...state, currentRoom: action.payload };
    
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    
    case 'SET_MESSAGES':
      return { 
        ...state, 
        messages: action.payload,
        filteredMessages: state.searchQuery 
          ? action.payload.filter(msg => 
              msg.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
              msg.sender.username.toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          : action.payload
      };
    
    case 'ADD_MESSAGE':
      const newMessages = [...state.messages, action.payload];
      return { 
        ...state, 
        messages: newMessages,
        filteredMessages: state.searchQuery 
          ? newMessages.filter(msg => 
              msg.content.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
              msg.sender.username.toLowerCase().includes(state.searchQuery.toLowerCase())
            )
          : newMessages
      };
    
    case 'SET_PRIVATE_MESSAGES':
      return { 
        ...state, 
        privateMessages: new Map(state.privateMessages.set(action.payload.conversationId, action.payload.messages))
      };
    
    case 'ADD_PRIVATE_MESSAGE':
      const conversationId = action.payload.conversationId;
      const currentMessages = state.privateMessages.get(conversationId) || [];
      return {
        ...state,
        privateMessages: new Map(state.privateMessages.set(conversationId, [...currentMessages, action.payload]))
      };
    
    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.payload };
    
    case 'ADD_TYPING_USER':
      const newTypingUsers = new Set(state.typingUsers);
      newTypingUsers.add(action.payload);
      return { ...state, typingUsers: newTypingUsers };
    
    case 'REMOVE_TYPING_USER':
      const updatedTypingUsers = new Set(state.typingUsers);
      updatedTypingUsers.delete(action.payload);
      return { ...state, typingUsers: updatedTypingUsers };
    
    case 'UPDATE_UNREAD_COUNT':
      const newUnreadCounts = new Map(state.unreadCounts);
      newUnreadCounts.set(action.payload.roomId, action.payload.count);
      return { ...state, unreadCounts: newUnreadCounts };
    
    case 'UPDATE_MESSAGE_REACTIONS':
      const updatedMessages = state.messages.map(msg => 
        msg.id === action.payload.messageId 
          ? { ...msg, reactions: action.payload.reactions }
          : msg
      );
      return { ...state, messages: updatedMessages };
    
    case 'TOGGLE_NOTIFICATION_SETTING':
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [action.payload.type]: action.payload.value
        }
      };
    
    case 'SET_SEARCH_QUERY':
      const query = action.payload.toLowerCase();
      return {
        ...state,
        searchQuery: action.payload,
        filteredMessages: query 
          ? state.messages.filter(msg => 
              msg.content.toLowerCase().includes(query) ||
              msg.sender.username.toLowerCase().includes(query)
            )
          : state.messages
      };
    
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [socketInitialized, setSocketInitialized] = useState(false);

  useEffect(() => {
    if (socketInitialized) return;
    
    // Make sure we have an initialized socket
    const socket = socketManager.connect();
    console.log('Socket initialized in ChatProvider:', socket);
    setSocketInitialized(true);

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected event in ChatProvider');
      dispatch({ type: 'SET_CONNECTED', payload: true });
    });

    socket.on('disconnect', () => {
      dispatch({ type: 'SET_CONNECTED', payload: false });
    });

    // User authentication
    socket.on('user authenticated', (user) => {
      dispatch({ type: 'SET_USER', payload: user });
      toast.success(`Welcome, ${user.username}!`);
    });

    // Room events
    socket.on('room joined', (data) => {
      console.log('Room joined event received:', data);
      if (data && data.room && data.room.id) {
        dispatch({ type: 'SET_CURRENT_ROOM', payload: data.room.id });
        dispatch({ type: 'SET_MESSAGES', payload: data.messages || [] });
      } else {
        console.error('Received invalid room data in room joined event:', data);
      }
    });

    socket.on('rooms list', (rooms) => {
      dispatch({ type: 'SET_ROOMS', payload: rooms });
    });

    socket.on('room created', (room) => {
      console.log('Received room_created event with data:', room);
      
      // Make sure we have all the properties we need
      if (!room || !room.name) {
        console.error('Received invalid room data:', room);
        return;
      }
      
      dispatch({ type: 'SET_CURRENT_ROOM', payload: room.id });
      dispatch({ type: 'ADD_ROOM', payload: room });
      toast.success(`Room "${room.name}" created successfully!`);
    });

    socket.on('new room available', (room) => {
      dispatch({ type: 'ADD_ROOM', payload: room });
    });

    // Message events
    socket.on('new message', (message) => {
      dispatch({ type: 'ADD_MESSAGE', payload: message });
      
      // Play notification sound
      if (state.notifications.sound && message.sender.id !== state.user?.id) {
        playNotificationSound();
      }

      // Show browser notification
      if (state.notifications.browser && message.sender.id !== state.user?.id) {
        showBrowserNotification(message);
      }
    });

    socket.on('new private message', (message) => {
      dispatch({ type: 'ADD_PRIVATE_MESSAGE', payload: message });
      
      if (message.sender.id !== state.user?.id) {
        toast(`New message from ${message.sender.username}`, {
          icon: '💬',
        });
        
        if (state.notifications.sound) {
          playNotificationSound();
        }
        
        if (state.notifications.browser) {
          showBrowserNotification(message, true);
        }
      }
    });

    socket.on('conversation history', (data) => {
      dispatch({ 
        type: 'SET_PRIVATE_MESSAGES', 
        payload: { 
          conversationId: [state.user.id, data.recipientId].sort().join('-'),
          messages: data.messages 
        }
      });
    });

    // User events
    socket.on('users online', (users) => {
      dispatch({ type: 'SET_ONLINE_USERS', payload: users });
    });

    socket.on('user joined room', (data) => {
      toast(`${data.user.username} joined the room`, {
        icon: '👋',
      });
    });

    socket.on('user left room', (data) => {
      toast(`${data.user.username} left the room`, {
        icon: '👋',
      });
    });

    // Typing events
    socket.on('user typing', (data) => {
      dispatch({ type: 'ADD_TYPING_USER', payload: `${data.username} (${data.roomId})` });
    });

    socket.on('user stopped typing', (data) => {
      dispatch({ type: 'REMOVE_TYPING_USER', payload: `${data.username} (${data.roomId})` });
    });

    // Unread count events
    socket.on('unread count updated', (data) => {
      dispatch({ type: 'UPDATE_UNREAD_COUNT', payload: data });
    });

    // Reaction events
    socket.on('message reaction updated', (data) => {
      dispatch({ 
        type: 'UPDATE_MESSAGE_REACTIONS', 
        payload: { 
          messageId: data.messageId, 
          reactions: new Map([[data.reaction, new Set(data.users)]]) 
        }
      });
    });

    // Error handling
    socket.on('error', (error) => {
      toast.error(error);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [state.user?.id, state.notifications, socketInitialized]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmMhBjiT3/LNeSsFJHfH8N2QQAoTXrTp66hVFApGn+DyvmMhBjidxvDdkzwIGWy+8OedbQ4NUavq7adUEgtDn+HvwWcxBje8wgAOUa+Ap+DyvmMhBji8wgAOUa+Z0uuiRxQASr/pZ4hcAj+a2uqhSQwPUa+Ad8CZdTcDNHzC8tyNOwoVXLXl7KpVEQxAonbD7tmQQQoVZ7rl7ZdKExPDaAH...');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Ignore errors if audio can't play
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const showBrowserNotification = (message, isPrivate = false) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(
        isPrivate ? `Private message from ${message.sender.username}` : `${message.sender.username}`,
        {
          body: message.content,
          icon: '/vite.svg',
          tag: message.id
        }
      );
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
      }
    }
  };

  const value = {
    ...state,
    dispatch,
    socket: socketManager.getSocket(),
    requestNotificationPermission
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
