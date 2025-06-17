import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocketContext } from '../context/SocketContext';

function Login() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { connect } = useSocketContext();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Username is required');
      return;
    }
    
    // Login and connect to socket
    const user = login(username.trim());
    connect(username.trim());
    
    // Navigate to chat
    navigate('/chat');
  };

  return (
    <div className="flex justify-center items-center" style={{ height: '80vh' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <h1 className="text-center mb-4">Socket.io Chat</h1>
        
        <div style={{ background: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
          <h2 className="mb-4">Login</h2>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-control"
                placeholder="Enter your username"
                autoFocus
              />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Join Chat
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
