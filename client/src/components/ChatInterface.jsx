import React, { useEffect, useState } from 'react';
import { useChat } from '../context/ChatContext';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import PrivateChat from './PrivateChat';
import { Menu, X } from 'lucide-react';

function ChatInterface({ userInfo, onLogout }) {
  const { socket, dispatch, requestNotificationPermission } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState('room'); // 'room' or 'private'
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (socket && userInfo) {
      console.log('Joining chat with user info:', userInfo);
      
      // Join the chat with user info
      socket.emit('user join', userInfo);
      
      // Request notification permission
      requestNotificationPermission();
      
      // Get initial rooms list
      socket.emit('get rooms');
    }
  }, [socket, userInfo, requestNotificationPermission, dispatch]);

  const handlePrivateChat = (user) => {
    setSelectedUser(user);
    setCurrentView('private');
    setSidebarOpen(false);
  };

  const handleBackToRoom = () => {
    setCurrentView('room');
    setSelectedUser(null);
  };

  return (
    <div className="chat-container">
      {/* Mobile sidebar toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1001,
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '44px',
          height: '44px',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar 
          onPrivateChat={handlePrivateChat}
          onLogout={onLogout}
          currentView={currentView}
          selectedUser={selectedUser}
        />
      </div>

      {/* Main chat area */}
      <div className="main-chat">
        {currentView === 'room' ? (
          <ChatArea />
        ) : (
          <PrivateChat 
            selectedUser={selectedUser}
            onBack={handleBackToRoom}
          />
        )}
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default ChatInterface;
