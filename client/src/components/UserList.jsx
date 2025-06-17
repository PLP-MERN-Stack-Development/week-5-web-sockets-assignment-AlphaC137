import { useState, useEffect } from 'react';
import { useSocketContext } from '../context/SocketContext';

function UserList({ onSelectUser }) {
  const { users, socket } = useSocketContext();
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleSelectUser = (user) => {
    setSelectedUserId(user.id);
    if (onSelectUser) {
      onSelectUser(user);
    }
  };

  return (
    <div className="sidebar-section">
      <h3>Online Users ({users.length})</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li 
            key={user.id} 
            className={`user-item ${selectedUserId === user.id ? 'selected' : ''}`}
            onClick={() => handleSelectUser(user)}
          >
            <div className="user-status status-online"></div>
            <div className="user-name">{user.username}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
