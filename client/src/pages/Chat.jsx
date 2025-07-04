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
    setTyping
  } = useSocket(localStorage.getItem('token'));

  const [messageInput, setMessageInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isBroMode, setIsBroMode] = useState(false);
  const messagesEndRef = useRef(null);

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
    };
  }, [socket, isConnected, connect, disconnect]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    if (isPrivateMode && selectedUser) {
      sendPrivateMessage(selectedUser.id, messageInput.trim());
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
            <div className="user-list">
              {users.map((chatUser) => (
                <div 
                  key={chatUser.id || chatUser._id} 
                  className={`user-item ${selectedUser?.id === chatUser.id ? 'selected' : ''}`}
                  onClick={() => handlePrivateMessage(chatUser)}
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
                  <span className="username">{chatUser.username}</span>
                  <span className="online-indicator">🟢</span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="chat-main">
          {/* Chat Header */}
          <div className="chat-room-header">
            <h3>
              {isPrivateMode 
                ? `💬 Private chat with ${selectedUser?.username}` 
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
                    {displayMessage(message)}
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
            <div className="message-input-container">
              <input
                type="text"
                value={messageInput}
                onChange={handleTyping}
                placeholder={
                  isPrivateMode 
                    ? `Send a private message to ${selectedUser?.username}...`
                    : `Type a message in #${currentRoom}...`
                }
                className="message-input"
                disabled={!isConnected}
              />
              <button 
                type="submit" 
                className="send-button"
                disabled={!isConnected || !messageInput.trim()}
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
