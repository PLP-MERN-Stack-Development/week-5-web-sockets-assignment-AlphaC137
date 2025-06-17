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
          <strong>{notification.sender}:</strong> {notification.message}
        </div>
      )}

      <ChatHeader selectedUser={selectedUser} currentRoom={currentRoom} />
      
      <div className="chat-main">
        <div className="chat-sidebar">
          <UserList onSelectUser={handleSelectUser} />
          
          {selectedUser && (
            <div className="mt-4">
              <button onClick={clearSelectedUser} className="btn btn-secondary">
                Return to Global Chat
              </button>
            </div>
          )}
          
          <RoomList />
        </div>
        
        <div className="chat-messages">
          <MessageList
            messages={filteredMessages}
            typingUsers={typingUsers}
          />
          
          <MessageInput 
            onSendMessage={handleSendMessage} 
            onTyping={handleTyping}
          />
          
          {!isConnected && (
            <div className="connection-status">
              Disconnected. Trying to reconnect...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
