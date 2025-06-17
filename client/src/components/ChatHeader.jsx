import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

function ChatHeader({ selectedUser, currentRoom }) {
  const { user, logout } = useAuth();
  const { disconnect, rooms } = useSocketContext();
  
  const handleLogout = () => {
    disconnect();
    logout();
  };
  
  // Find current room name
  const roomName = rooms.find(room => room.id === currentRoom)?.name || 'Global Chat';
  return (
    <div className="chat-header">
      <div className="chat-header-info">
        <div className="chat-header-icon">
          {selectedUser ? (
            <div className="user-avatar">{selectedUser.username.charAt(0).toUpperCase()}</div>
          ) : (
            <div className="room-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <h2>
            {selectedUser ? `Chat with ${selectedUser.username}` : roomName}
          </h2>
          {selectedUser ? (
            <small>Private conversation</small>
          ) : (
            <small>Room chat • {rooms.find(room => room.id === currentRoom)?.description}</small>
          )}
        </div>
      </div>
      <div className="chat-header-actions">
        <div className="user-info">
          <span>Logged in as</span>
          <strong>{user?.username}</strong>
        </div>
        <button onClick={handleLogout} className="btn btn-danger">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M16 17v-3H9v-4h7V7l5 5-5 5M14 2a2 2 0 012 2v2h-2V4H5v16h9v-2h2v2a2 2 0 01-2 2H5a2 2 0 01-2-2V4a2 2 0 012-2h9z" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
