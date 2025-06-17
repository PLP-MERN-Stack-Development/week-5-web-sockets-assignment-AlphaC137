import { useState, useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import ChatHeader from '../components/ChatHeader';
import MessageList from '../components/MessageList';
import MessageInput from '../components/MessageInput';
import UserList from '../components/UserList';
import RoomList from '../components/RoomList';

function Chat() {
  const { user } = useAuth();
  const { 
    messages, 
    users, 
    typingUsers, 
    sendMessage, 
    sendPrivateMessage, 
    setTyping,
    isConnected,
    currentRoom
  } = useSocketContext();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [notification, setNotification] = useState(null);

  // Handle notification for new messages
  useEffect(() => {
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      
      // Only show notifications for messages received (not sent by current user)
      if (latestMessage.senderId !== user?.id && !latestMessage.system) {
        // Create browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Message', {
            body: `${latestMessage.sender}: ${latestMessage.message}`,
            icon: '/chat-icon.png'
          });
        }
        
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play().catch(error => {
          // Handle autoplay restrictions
          console.log('Error playing notification:', error);
        });
        
        // Set in-app notification
        setNotification({
          sender: latestMessage.sender,
          message: latestMessage.message,
          timestamp: new Date().toISOString()
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => {
          setNotification(null);
        }, 3000);
      }
    }
  }, [messages, user?.id]);

  const handleSendMessage = (message) => {
    if (selectedUser) {
      sendPrivateMessage(selectedUser.id, message);
    } else {
      sendMessage(message, currentRoom);
    }
  };

  const handleTyping = (isTyping) => {
    setTyping(isTyping);
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
  };

  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  // Request notification permission
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
  }, []);

  // Filter messages based on whether we're in a private chat, room, or global chat
  const filteredMessages = selectedUser
    ? messages.filter(
        msg => 
          msg.isPrivate && 
          ((msg.senderId === selectedUser.id && msg.receiverId === user?.id) || 
           (msg.senderId === user?.id && msg.receiverId === selectedUser.id))
      )
    : messages.filter(msg => 
        (!msg.isPrivate || msg.system) && 
        (msg.room === currentRoom || !msg.room || msg.system)
      );
  return (
    <div className="chat-container">
      {notification && (
        <div className="notification">
          <div className="notification-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M21 6h-8l-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 12H5V8h14v10z"/>
            </svg>
          </div>
          <div className="notification-content">
            <div className="notification-title">New message from <strong>{notification.sender}</strong></div>
            <div className="notification-message">{notification.message}</div>
          </div>
          <button className="notification-close">×</button>
        </div>
      )}

      <ChatHeader selectedUser={selectedUser} currentRoom={currentRoom} />
      
      <div className="chat-main">
        <div className="chat-sidebar">
          {/* Online users section */}
          <section className="sidebar-section">
            <UserList onSelectUser={handleSelectUser} />
            
            {selectedUser && (
              <div className="back-to-rooms">
                <button onClick={clearSelectedUser} className="btn btn-outline">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                  </svg>
                  Back to Rooms
                </button>
              </div>
            )}
          </section>
          
          {/* Rooms section */}
          <section className="sidebar-section">
            <RoomList />
          </section>
        </div>
        
        <div className="chat-messages">
          <div className="messages-wrapper">
            <MessageList
              messages={filteredMessages}
              typingUsers={typingUsers}
            />
          </div>
          
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onTyping={handleTyping}
          />
          
          {!isConnected && (
            <div className="connection-status">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46C10.21 6.23 11.08 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96zM3 5.27L5.75 8.01C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27zM7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73z"/>
              </svg>
              Disconnected. Trying to reconnect...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
