import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

function ChatHeader({ selectedUser, currentRoom, onToggleSearch }) {
  const { user, logout } = useAuth();
  const { disconnect, users, rooms, isConnected } = useSocketContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const handleLogout = () => {
    disconnect();
    logout();
  };
  
  // Find current room details
  const currentRoomData = rooms.find(room => room.id === currentRoom);
  const roomName = currentRoomData?.name || 'Global Chat';
  const roomDescription = currentRoomData?.description || 'General discussion';
  const roomParticipants = users.filter(u => u.room === currentRoom).length;
  
  // Generate color based on name for avatar background
  const generateColor = (name) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };
  
  // Check if selected user is online
  const isSelectedUserOnline = selectedUser ? users.some(u => u.id === selectedUser.id) : false;
  
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div 
          className="chat-header-icon"
          style={selectedUser ? { backgroundColor: generateColor(selectedUser.username) } : {}}
        >
          {selectedUser ? (
            <div className="user-avatar">
              <span>{selectedUser.username.charAt(0).toUpperCase()}</span>
              <span className={`user-status-indicator ${isSelectedUserOnline ? 'online' : 'offline'}`}></span>
            </div>
          ) : (
            <div className="room-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </div>
        <div className="header-title-container">
          <h2>
            {selectedUser ? `Chat with ${selectedUser.username}` : roomName}
          </h2>
          {selectedUser ? (
            <small className="header-subtitle">
              <span className={`status-indicator ${isSelectedUserOnline ? 'online' : 'offline'}`}></span>
              {isSelectedUserOnline ? 'Online' : 'Offline'} • Private conversation
            </small>
          ) : (
            <small className="header-subtitle">
              <span className="room-participants">{roomParticipants} {roomParticipants === 1 ? 'participant' : 'participants'}</span> • {roomDescription}
            </small>
          )}
        </div>
        
        {/* Connection status indicator */}
        <div className={`connection-badge ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? 'Connected' : 'Reconnecting...'}
        </div>
      </div>
      
      {/* Mobile menu toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setShowMobileMenu(!showMobileMenu)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>
      
      <div className={`chat-header-actions ${showMobileMenu ? 'show-mobile' : ''}`}>        <div className="header-action-buttons">
          {/* Search button */}
          <button 
            className="btn btn-icon" 
            title="Search conversations"
            onClick={() => onToggleSearch && onToggleSearch()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          
          {/* Settings dropdown */}
          <div className="dropdown">
            <button 
              className="btn btn-icon dropdown-toggle" 
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
              </svg>
            </button>
            
            {showDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item">Profile Settings</button>
                <button className="dropdown-item">Notification Settings</button>
                <button className="dropdown-item">Dark Mode</button>
                <div className="dropdown-divider"></div>
                <button className="dropdown-item text-danger" onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        </div>
        
        <div className="user-info">
          <div className="user-avatar-small" style={{ backgroundColor: generateColor(user?.username || '') }}>
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-name-container">
            <span className="user-label">Logged in as</span>
            <strong className="user-name">{user?.username}</strong>
          </div>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
