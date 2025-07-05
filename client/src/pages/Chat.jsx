// pages/Chat.jsx - Chat page component
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../socket/socket';
import './Chat.css';

const Chat = () => {
  const { user, logout } = useAuth();
  const {
    socket,
    isConnected,
    messages,
    setMessages,
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
    markMessageDelivered,
    markMessageSeen
  } = useSocket(localStorage.getItem('token'));

  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isBroMode, setIsBroMode] = useState(false);
  const [dailyPrivateChats, setDailyPrivateChats] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [originalTitle] = useState(document.title);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageObserver = useRef(null);
  const audioRef = useRef(null);

  // Initialize daily private chats from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedChats = localStorage.getItem(`dailyPrivateChats-${today}`);
    if (storedChats) {
      setDailyPrivateChats(new Set(JSON.parse(storedChats)));
    }

    // Clean up old daily chat data and set up midnight reset
    const cleanupOldData = () => {
      // Remove data from previous days
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('dailyPrivateChats-') && !key.includes(today)) {
          localStorage.removeItem(key);
        }
      });
    };

    cleanupOldData();

    // Set up midnight reset
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight.getTime() - now.getTime();

    const midnightTimer = setTimeout(() => {
      setDailyPrivateChats(new Set());
      localStorage.removeItem(`dailyPrivateChats-${today}`);
      
      // Set up recurring daily reset
      const dailyReset = setInterval(() => {
        setDailyPrivateChats(new Set());
        const currentDay = new Date().toDateString();
        localStorage.removeItem(`dailyPrivateChats-${currentDay}`);
      }, 24 * 60 * 60 * 1000); // 24 hours

      return () => clearInterval(dailyReset);
    }, msUntilMidnight);

    return () => clearTimeout(midnightTimer);
  }, []);

  // Save daily chats to localStorage whenever it changes
  useEffect(() => {
    if (dailyPrivateChats.size > 0) {
      const today = new Date().toDateString();
      localStorage.setItem(`dailyPrivateChats-${today}`, JSON.stringify([...dailyPrivateChats]));
    }
  }, [dailyPrivateChats]);

  // Connect to socket when component mounts
  useEffect(() => {
    if (!isConnected && socket) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        disconnect();
      }
      // Clear typing timeout if it exists
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [socket, isConnected, connect, disconnect, typingTimeout]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize notification permissions and settings
  useEffect(() => {
    // Request notification permissions
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    } else if ('Notification' in window && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
    }

    // Load sound preference from localStorage
    const savedSoundSetting = localStorage.getItem('soundEnabled');
    if (savedSoundSetting !== null) {
      setSoundEnabled(JSON.parse(savedSoundSetting));
    }

    // Create notification sound using Web Audio API
    const createNotificationSound = () => {
      audioRef.current = {
        play: () => {
          if (!soundEnabled) return Promise.resolve();
          
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // Create a pleasant notification tone
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            return Promise.resolve();
          } catch (error) {
            console.log('Could not create notification sound:', error);
            return Promise.reject(error);
          }
        }
      };
    };
    
    createNotificationSound();
  }, []);

  // Save sound preference to localStorage
  useEffect(() => {
    localStorage.setItem('soundEnabled', JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    // If there's a file selected, send it
    if (selectedFile) {
      sendFile();
      return;
    }
    
    // If there's text, send it
    if (!messageInput.trim()) return;

    if (isPrivateMode && selectedUser) {
      sendPrivateMessage(selectedUser.id || selectedUser._id, messageInput.trim());
    } else {
      sendMessage(messageInput.trim(), currentRoom);
    }

    setMessageInput('');
    
    // Stop typing indicator
    setTyping(false, currentRoom);
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    // Start typing indicator
    setTyping(true, currentRoom);

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Stop typing after 3 seconds of inactivity
    const timeout = setTimeout(() => {
      setTyping(false, currentRoom);
    }, 3000);

    setTypingTimeout(timeout);
  };

  const handleRoomChange = (room) => {
    joinRoom(room);
    setIsPrivateMode(false);
    setSelectedUser(null);
  };

  const handlePrivateMessage = (user) => {
    setSelectedUser(user);
    setIsPrivateMode(true);
    
    // Get user ID (handle both id and _id fields)
    const userId = user.id || user._id;
    
    // Check if this is the first private message of the day with this user
    const today = new Date().toDateString();
    const chatKey = `${userId}-${today}`;
    
    if (!dailyPrivateChats.has(chatKey)) {
      // Add to daily chats set
      setDailyPrivateChats(prev => new Set([...prev, chatKey]));
      
      // Send automatic "Bro" message after a short delay
      setTimeout(() => {
        sendPrivateMessage(userId, "Bro");
        
        // Add a local system message to show what happened
        const broGreetingMessage = {
          id: Date.now() + 1,
          system: true,
          content: `📱 Sent automatic daily greeting: "Bro" to ${user.username}`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, broGreetingMessage]);
      }, 500);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleLogout = async () => {
    await logout();
  };

  // Bro Mode functions
  const toggleBroMode = () => {
    const newBroMode = !isBroMode;
    setIsBroMode(newBroMode);
    
    // Add a system message to indicate mode change
    const broMessage = {
      id: Date.now(),
      system: true,
      content: newBroMode 
        ? '😎 BRO MODE ACTIVATED! Messages are now extra bro-friendly!' 
        : '😎 BRO MODE DEACTIVATED! Back to normal chat.',
      timestamp: new Date().toISOString(),
    };
    
    // Add the message to local state (this won't be sent to other users)
    setMessages(prev => [...prev, broMessage]);
  };

  const broify = (text) => {
    if (!isBroMode) return text;
    
    // Bro Mode transformations 😎
    const broTransforms = {
      'hello': 'sup bro',
      'hi': 'yo bro',
      'hey': 'hey bro',
      'thanks': 'thanks bro',
      'thank you': 'thanks bro',
      'yes': 'yea bro',
      'no': 'nah bro',
      'okay': 'aight bro',
      'ok': 'aight bro',
      'cool': 'sick bro',
      'awesome': 'sick bro',
      'great': 'sick bro',
      'good': 'solid bro',
      'bad': 'weak bro',
      'really': 'for real bro',
      'seriously': 'for real bro',
      'definitely': 'totally bro',
      'maybe': 'maybe bro',
      'probably': 'prolly bro',
      'because': 'cuz bro',
      'you': 'u bro',
      'your': 'ur',
      'going to': 'gonna',
      'want to': 'wanna',
      'have to': 'gotta',
      'what\'s up': 'sup bro',
      'how are you': 'how u doing bro',
      'see you later': 'catch u later bro',
      'goodbye': 'later bro',
      'bye': 'later bro'
    };

    let broText = text.toLowerCase();
    
    // Apply transformations
    Object.entries(broTransforms).forEach(([original, bro]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      broText = broText.replace(regex, bro);
    });

    // Add random bro expressions
    const broExpressions = [' bro', ' dude', ' man'];
    const shouldAddBro = Math.random() > 0.7; // 30% chance
    
    if (shouldAddBro && !broText.includes('bro') && !broText.includes('dude')) {
      broText += broExpressions[Math.floor(Math.random() * broExpressions.length)];
    }

    // Capitalize first letter
    return broText.charAt(0).toUpperCase() + broText.slice(1);
  };

  const displayMessage = (message) => {
    if (isBroMode && message.sender?.username !== user?.username) {
      return broify(message.content);
    }
    return message.content;
  };

  // File handling functions
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setUploadError(`File size exceeds 5MB limit. Selected file is ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendFile = async () => {
    if (!selectedFile) return;

    try {
      const base64 = await convertFileToBase64(selectedFile);
      
      const fileMessage = {
        message: selectedFile.name,
        type: 'file',
        fileData: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: base64
        }
      };

      if (isPrivateMode && selectedUser) {
        // Send file via private message
        socket.emit('private_file', {
          to: selectedUser.id || selectedUser._id,
          fileData: fileMessage.fileData
        });
      } else {
        // Send file to room
        socket.emit('send_file', {
          room: currentRoom,
          fileData: fileMessage.fileData
        });
      }

      // Clear file selection
      clearFileSelection();
      
    } catch (error) {
      console.error('Error sending file:', error);
      setUploadError('Failed to send file. Please try again.');
    }
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadFile = (fileData) => {
    try {
      const link = document.createElement('a');
      link.href = fileData.data;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessageStatus = (message) => {
    // Only show status for own messages
    if (message.sender?.id !== user?.id && message.sender?.username !== user?.username) {
      return null;
    }

    // Don't show status for system messages
    if (message.system) {
      return null;
    }

    const { deliveryStatus, readStatus } = message;

    return (
      <div className="message-status">
        {readStatus?.read ? (
          <span className="read-receipt" title={`Read at ${new Date(readStatus.readAt).toLocaleTimeString()}`}>
            ✓✓
          </span>
        ) : deliveryStatus?.delivered ? (
          <span className="delivery-receipt" title={`Delivered at ${new Date(deliveryStatus.deliveredAt).toLocaleTimeString()}`}>
            ✓
          </span>
        ) : (
          <span className="sending" title="Sending...">
            ⏳
          </span>
        )}
      </div>
    );
  };

  const renderMessage = (message) => {
    if (message.messageType === 'file' || message.type === 'file') {
      const fileData = message.fileData;
      const isImage = fileData?.type?.startsWith('image/');
      
      return (
        <div className="file-message">
          {isImage ? (
            <div className="image-preview">
              <img 
                src={fileData.data} 
                alt={fileData.name}
                className="message-image"
                onClick={() => window.open(fileData.data, '_blank')}
              />
              <div className="file-info">
                <span className="file-name">{fileData.name}</span>
                <span className="file-size">{formatFileSize(fileData.size)}</span>
              </div>
            </div>
          ) : (
            <div className="file-attachment">
              <div className="file-icon">📎</div>
              <div className="file-details">
                <span className="file-name">{fileData.name}</span>
                <span className="file-size">{formatFileSize(fileData.size)}</span>
              </div>
              <button 
                className="download-btn"
                onClick={() => downloadFile(fileData)}
                title="Download file"
              >
                ⬇️
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return displayMessage(message);
  };

  // Track chat visibility for read receipts and notifications
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsChatVisible(isVisible);
      
      if (isVisible) {
        // Clear unread count when tab becomes visible
        setUnreadCount(0);
      }
    };

    const handleFocus = () => {
      setIsChatVisible(true);
      setUnreadCount(0);
    };
    
    const handleBlur = () => setIsChatVisible(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Mark messages as seen when they become visible
  useEffect(() => {
    if (!isChatVisible || !messages.length) return;

    const unseenMessages = messages.filter(
      (msg) =>
        msg.sender?.id !== user?.id &&
        msg.sender?.username !== user?.username &&
        !msg.system &&
        !msg.readStatus?.read
    );

    unseenMessages.forEach((msg) => {
      if (msg.id) {
        markMessageSeen(msg.id);
      }
    });
  }, [messages, isChatVisible, user, markMessageSeen]);

  // Show browser notification for new messages
  const showNotification = (message) => {
    if (!notificationsEnabled || isChatVisible) return;

    const title = message.isPrivate 
      ? `New private message from ${message.sender?.username}`
      : `New message in #${message.room || currentRoom}`;
    
    const body = message.messageType === 'file' 
      ? `📎 ${message.sender?.username} sent a file: ${message.content}`
      : message.content;

    const notification = new Notification(title, {
      body: body.length > 100 ? body.substring(0, 100) + '...' : body,
      icon: '/chat-icon.svg',
      tag: 'chat-message',
      requireInteraction: false,
      silent: false
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close notification after 5 seconds
    setTimeout(() => notification.close(), 5000);
  };

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled && audioRef.current && !isChatVisible) {
      audioRef.current.play().catch(e => console.log('Could not play notification sound:', e));
    }
  };

  // Update tab title with unread count
  const updateTabTitle = () => {
    if (unreadCount > 0 && !isChatVisible) {
      document.title = `(${unreadCount}) ${originalTitle}`;
    } else {
      document.title = originalTitle;
    }
  };

  // Effect to handle notifications, sound, and title updates
  useEffect(() => {
    // Handle new message notifications
    const handleNewMessage = (message) => {
      // Show notification if enabled
      showNotification(message);

      // Play sound if enabled
      playNotificationSound();

      // Update unread count
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to new message events
    socket.on('new_message', handleNewMessage);

    return () => {
      // Unsubscribe from events on cleanup
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, notificationsEnabled, soundEnabled, isChatVisible]);

  // Update tab title when unread count or visibility changes
  useEffect(() => {
    updateTabTitle();
  }, [unreadCount, isChatVisible, originalTitle]);

  // Handle new messages for notifications and unread count
  useEffect(() => {
    if (!messages.length) return;

    const lastMessage = messages[messages.length - 1];
    
    // Only process messages from other users
    if (lastMessage.sender?.id === user?.id || 
        lastMessage.sender?.username === user?.username || 
        lastMessage.system) {
      return;
    }

    // If chat is not visible, increment unread count and show notification
    if (!isChatVisible) {
      setUnreadCount(prev => prev + 1);
      showNotification(lastMessage);
      playNotificationSound();
    }
  }, [messages, user, isChatVisible, notificationsEnabled, soundEnabled]);

  return (
    <div className={`chat-container ${isBroMode ? 'bro-mode' : ''}`}>
      {/* Header */}
      <header className="chat-header">
        <div className="chat-title">
          <h2>💬 Real-Time Chat</h2>
          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>
          </div>
        </div>
        
        <div className="user-info">
          {/* Notification Controls */}
          <div className="notification-controls">
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`notification-btn ${notificationsEnabled ? 'active' : ''}`}
              title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
              disabled={!('Notification' in window) || Notification.permission === 'denied'}
            >
              {notificationsEnabled ? '🔔' : '🔕'}
            </button>
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`sound-btn ${soundEnabled ? 'active' : ''}`}
              title={soundEnabled ? 'Disable message sounds' : 'Enable message sounds'}
            >
              {soundEnabled ? '🔊' : '🔇'}
            </button>
          </div>
          
          <button 
            onClick={toggleBroMode} 
            className={`bro-mode-btn ${isBroMode ? 'active' : ''}`}
            title={isBroMode ? 'Disable Bro Mode 😎' : 'Enable Bro Mode 😎'}
          >
            {isBroMode ? '😎 BRO MODE ON' : '😎 BRO MODE'}
          </button>
          <span>Welcome, {user?.username}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </header>

      <div className="chat-layout">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          {/* Room Selection */}
          <div className="room-section">
            <h3>Rooms</h3>
            <div className="room-list">
              <button 
                className={`room-item ${currentRoom === 'general' && !isPrivateMode ? 'active' : ''}`}
                onClick={() => handleRoomChange('general')}
              >
                # General
              </button>
              <button 
                className={`room-item ${currentRoom === 'random' && !isPrivateMode ? 'active' : ''}`}
                onClick={() => handleRoomChange('random')}
              >
                # Random
              </button>
              <button 
                className={`room-item ${currentRoom === 'tech' && !isPrivateMode ? 'active' : ''}`}
                onClick={() => handleRoomChange('tech')}
              >
                # Tech Talk
              </button>
            </div>
          </div>

          {/* Online Users */}
          <div className="users-section">
            <h3>Online Users ({users.length})</h3>
            <p className="users-hint">💬 Click a user to start private chat</p>
            <div className="user-list">
              {users.map((chatUser) => {
                const today = new Date().toDateString();
                const chatKey = `${chatUser.id || chatUser._id}-${today}`;
                const hasChattedToday = dailyPrivateChats.has(chatKey);
                
                return (
                  <div 
                    key={chatUser.id || chatUser._id} 
                    className={`user-item ${selectedUser?.id === (chatUser.id || chatUser._id) ? 'selected' : ''} ${hasChattedToday ? 'chatted-today' : ''}`}
                    onClick={() => handlePrivateMessage(chatUser)}
                    title={hasChattedToday ? `Already said "Bro" to ${chatUser.username} today` : `Click to start private chat with ${chatUser.username}`}
                  >
                    <div className="user-avatar">
                      {chatUser.avatar ? (
                        <img src={chatUser.avatar} alt={chatUser.username} />
                      ) : (
                        <div className="default-avatar">
                          {chatUser.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="username">{chatUser.username}</span>
                      {hasChattedToday && <span className="bro-indicator">😎</span>}
                    </div>
                    <span className="online-indicator">🟢</span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {/* Chat Header */}
          <div className="chat-room-header">
            <h3>
              {isPrivateMode 
                ? (
                  <span>
                    💬 Private chat with {selectedUser?.username}
                    {(() => {
                      const today = new Date().toDateString();
                      const userId = selectedUser?.id || selectedUser?._id;
                      const chatKey = `${userId}-${today}`;
                      const hasChattedToday = dailyPrivateChats.has(chatKey);
                      return hasChattedToday ? <span className="daily-bro-sent"> 😎 Daily Bro Sent</span> : null;
                    })()}
                  </span>
                )
                : `# ${currentRoom}`
              }
              {isBroMode && <span className="bro-mode-indicator"> 😎 BRO MODE</span>}
            </h3>
            {connectionError && (
              <div className="error-message">
                Connection error: {connectionError}
              </div>
            )}
          </div>

          {/* Messages Area */}
          <div className="messages-container">
            <div className="messages-list">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message ${message.system ? 'system-message' : ''} ${
                    message.sender?.id === user?.id || message.sender?.username === user?.username 
                      ? 'own-message' 
                      : ''
                  }`}
                >
                  {!message.system && (
                    <div className="message-header">
                      <span className="message-sender">
                        {message.sender?.username || 'Unknown'}
                      </span>
                      <span className="message-timestamp">
                        {formatTimestamp(message.timestamp || message.createdAt)}
                      </span>
                    </div>
                  )}
                  <div className="message-content">
                    {renderMessage(message)}
                  </div>
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="message-reactions">
                      {message.reactions.map((reaction, index) => (
                        <span key={index} className="reaction">
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}
                  {renderMessageStatus(message)}
                </div>
              ))}
              
              {/* Typing Indicators */}
              {typingUsers.length > 0 && (
                <div className="typing-indicator">
                  <span>
                    {typingUsers.length === 1 
                      ? `${typingUsers[0]} is typing...` 
                      : `${typingUsers.slice(0, -1).join(', ')} and ${typingUsers[typingUsers.length - 1]} are typing...`
                    }
                  </span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="message-form">
            {/* File Preview Section */}
            {selectedFile && (
              <div className="file-preview-section">
                <div className="file-preview-header">
                  <span>📎 File to send:</span>
                  <button 
                    type="button" 
                    onClick={clearFileSelection}
                    className="clear-file-btn"
                    title="Remove file"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="file-preview-content">
                  {filePreview ? (
                    <div className="image-preview-small">
                      <img src={filePreview} alt={selectedFile.name} />
                    </div>
                  ) : (
                    <div className="file-icon-preview">📎</div>
                  )}
                  
                  <div className="file-details-preview">
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{formatFileSize(selectedFile.size)}</span>
                    <span className="file-type">{selectedFile.type || 'Unknown type'}</span>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={sendFile}
                  className="send-file-btn"
                  disabled={!isConnected}
                >
                  Send File
                </button>
              </div>
            )}

            {/* Upload Error */}
            {uploadError && (
              <div className="upload-error">
                ⚠️ {uploadError}
              </div>
            )}

            <div className="message-input-container">
              {/* File Input Button */}
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="file-input-btn"
                title="Attach file (Max 5MB)"
                disabled={!isConnected}
              >
                📎
              </button>
              
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                accept="*/*"
              />

              <input
                type="text"
                value={messageInput}
                onChange={handleTyping}
                placeholder={
                  selectedFile 
                    ? `Send "${selectedFile.name}" or type a message...`
                    : isPrivateMode 
                      ? `Send a private message to ${selectedUser?.username}...`
                      : `Type a message in #${currentRoom}...`
                }
                className="message-input"
                disabled={!isConnected}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!isConnected || (!messageInput.trim() && !selectedFile)}
              >
                Send
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default Chat;
