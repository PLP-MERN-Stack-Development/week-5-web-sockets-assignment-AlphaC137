import { useState } from 'react';
import { useSocketContext } from '../context/SocketContext';

function RoomList() {
  const { rooms, currentRoom, joinRoom, leaveRoom } = useSocketContext();
  const [showRoomInfo, setShowRoomInfo] = useState(null);

  const handleJoinRoom = (roomId) => {
    if (currentRoom !== roomId) {
      joinRoom(roomId);
    }
  };

  const handleLeaveRoom = (roomId) => {
    if (currentRoom === roomId) {
      leaveRoom(roomId);
    }
  };

  const toggleRoomInfo = (roomId) => {
    setShowRoomInfo(showRoomInfo === roomId ? null : roomId);
  };

  return (
    <div className="sidebar-section">
      <h3>Chat Rooms</h3>
      <ul className="room-list">
        {rooms.map((room) => (
          <li
            key={room.id}
            className={`room-item ${currentRoom === room.id ? 'active' : ''}`}
          >
            <div 
              className="room-header" 
              onClick={() => toggleRoomInfo(room.id)}
            >
              <div className="room-name">
                {room.name}
                {currentRoom === room.id && <span className="current-room-indicator"> (Current)</span>}
              </div>
              <button className="room-info-toggle">
                {showRoomInfo === room.id ? '▲' : '▼'}
              </button>
            </div>
            
            {showRoomInfo === room.id && (
              <div className="room-details">
                <p className="room-description">{room.description}</p>
                <div className="room-actions">
                  {currentRoom !== room.id ? (
                    <button 
                      className="btn btn-sm btn-success"
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      Join Room
                    </button>
                  ) : room.id !== 'general' && (
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleLeaveRoom(room.id)}
                    >
                      Leave Room
                    </button>
                  )}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RoomList;
