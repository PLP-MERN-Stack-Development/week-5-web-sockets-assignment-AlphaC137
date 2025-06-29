import React, { useState, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import socketManager from '../socket/socket';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Plus,
  Hash,
  MessageCircle,
  Bell,
  BellOff,
  Volume2,
  VolumeX
} from 'lucide-react';

function Sidebar({ onPrivateChat, onLogout, currentView, selectedUser }) {
  const { 
    user, 
    currentRoom, 
    rooms, 
    onlineUsers, 
    unreadCounts, 
    socket,
    notifications,
    dispatch
  } = useChat();
  
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [activeTab, setActiveTab] = useState('rooms');

  // Debug logging
  useEffect(() => {
    console.log('Current rooms state:', rooms);
    console.log('Current room:', currentRoom);
  }, [rooms, currentRoom]);

  const handleJoinRoom = (roomId) => {
    console.log('Joining room with ID:', roomId);
    
    // Check if we're already in this room
    if (currentRoom === roomId) {
      console.log('Already in this room, no need to join again');
      return;
    }
    
    const socketInstance = socketManager.getSocket();
    if (socketInstance) {
      console.log('Emitting join room event for roomId:', roomId);
      socketInstance.emit('join room', roomId);
    } else {
      console.error('Socket is not available for joining room');
    }
  };

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    
    console.log('Creating room:', newRoomName.trim());
    
    const roomData = {
      name: newRoomName.trim(),
      type: 'public'
    };
    console.log('Emitting create_room event with data:', roomData);
    
    // Always get the most up-to-date socket from socketManager
    const socketInstance = socketManager.getSocket();
    
    if (socketInstance) {
      console.log('Socket instance available, emitting create room event');
      socketInstance.emit('create room', roomData);
      console.log('Event emitted');
    } else {
      console.error('Socket is not available');
    }
    
    setNewRoomName('');
    setShowCreateRoom(false);
  };

  const toggleNotificationSetting = (type) => {
    dispatch({
      type: 'TOGGLE_NOTIFICATION_SETTING',
      payload: {
        type,
        value: !notifications[type]
      }
    });
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ marginBottom: '4px' }}>Socket Chat</h3>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {user?.username}
            </p>
          </div>
          <button
            onClick={onLogout}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      <div className="sidebar-content">
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          borderBottom: '1px solid #e9ecef',
          background: 'white'
        }}>
          <button
            onClick={() => setActiveTab('rooms')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'rooms' ? '#007bff' : 'transparent',
              color: activeTab === 'rooms' ? 'white' : '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem'
            }}
          >
            <Hash size={16} />
            Rooms
          </button>
          <button
            onClick={() => setActiveTab('users')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'users' ? '#007bff' : 'transparent',
              color: activeTab === 'users' ? 'white' : '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem'
            }}
          >
            <Users size={16} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            style={{
              flex: 1,
              padding: '12px',
              border: 'none',
              background: activeTab === 'settings' ? '#007bff' : 'transparent',
              color: activeTab === 'settings' ? 'white' : '#6c757d',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontSize: '0.875rem'
            }}
          >
            <Settings size={16} />
            Settings
          </button>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="rooms-list">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h3>Chat Rooms</h3>
              <button
                onClick={() => setShowCreateRoom(!showCreateRoom)}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Create new room"
              >
                <Plus size={16} />
              </button>
            </div>

            {showCreateRoom && (
              <form onSubmit={handleCreateRoom} style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #e9ecef',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    marginBottom: '8px'
                  }}
                  autoFocus
                />
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    style={{
                      flex: 1,
                      padding: '6px 12px',
                      background: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '0.875rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Room List */}
            {activeTab === 'rooms' && (
              <div className="room-list">
                <h4>Public Rooms ({rooms?.length || 0})</h4>
                {/* Debug info */}
                {process.env.NODE_ENV === 'development' && (
                  <div style={{ fontSize: '10px', color: '#888', marginBottom: '8px' }}>
                    Current room: {currentRoom || 'none'}
                  </div>
                )}
                <ul>
                  {rooms && rooms.map((room) => (
                    <li
                      key={room.id}
                      className={currentRoom === room.id ? 'active' : ''}
                      onClick={() => handleJoinRoom(room.id)}
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        background: currentRoom === room.id ? '#007bff' : 'transparent',
                        color: currentRoom === room.id ? 'white' : 'inherit'
                      }}
                    >
                      <Hash size={16} style={{ marginRight: '8px' }} />
                      {room.name}
                      {unreadCounts.get(room.id) > 0 && (
                        <span style={{
                          marginLeft: '8px',
                          background: '#dc3545',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem'
                        }}>
                          {unreadCounts.get(room.id)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="online-users">
            <h3>Online Users ({onlineUsers.length})</h3>
            <ul className="user-list">
              {onlineUsers
                .filter(onlineUser => onlineUser.id !== user?.id)
                .map(onlineUser => {
                  const isSelected = selectedUser?.id === onlineUser.id && currentView === 'private';
                  
                  return (
                    <li
                      key={onlineUser.id}
                      className={`user-item ${isSelected ? 'active' : ''}`}
                      onClick={() => onPrivateChat(onlineUser)}
                      style={{
                        background: isSelected ? '#007bff' : 'transparent',
                        color: isSelected ? 'white' : 'inherit'
                      }}
                    >
                      <div className="user-status"></div>
                      <span>{onlineUser.username}</span>
                      <MessageCircle size={14} style={{ marginLeft: 'auto' }} />
                    </li>
                  );
                })}
            </ul>
            {onlineUsers.filter(u => u.id !== user?.id).length === 0 && (
              <p style={{ 
                color: '#6c757d', 
                fontStyle: 'italic', 
                textAlign: 'center',
                marginTop: '20px'
              }}>
                No other users online
              </p>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div style={{ padding: '16px' }}>
            <h3 style={{ marginBottom: '16px' }}>Notification Settings</h3>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notifications.sound ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Sound Notifications</span>
              </div>
              <button
                onClick={() => toggleNotificationSetting('sound')}
                style={{
                  background: notifications.sound ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                {notifications.sound ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px',
              padding: '12px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {notifications.browser ? <Bell size={16} /> : <BellOff size={16} />}
                <span>Browser Notifications</span>
              </div>
              <button
                onClick={() => toggleNotificationSetting('browser')}
                style={{
                  background: notifications.browser ? '#28a745' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontSize: '0.75rem'
                }}
              >
                {notifications.browser ? 'ON' : 'OFF'}
              </button>
            </div>

            <div style={{
              padding: '12px',
              background: '#f8f9fa',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: '#6c757d',
              lineHeight: '1.4'
            }}>
              <strong>Features Available:</strong>
              <ul style={{ marginTop: '8px', marginLeft: '16px' }}>
                <li>Real-time messaging</li>
                <li>Private conversations</li>
                <li>File & image sharing</li>
                <li>Message reactions</li>
                <li>Typing indicators</li>
                <li>Read receipts</li>
                <li>Multiple chat rooms</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
