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
    <div className="chat-header flex justify-between items-center">
      <div>
        <h2>
          {selectedUser ? `Chat with ${selectedUser.username}` : roomName}
        </h2>
        {selectedUser ? <small>Private conversation</small> : <small>Room chat</small>}
      </div>
      <div className="flex items-center gap-4">
        <span>Logged in as <strong>{user?.username}</strong></span>
        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
