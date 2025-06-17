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
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo">
          <img src="/chat-icon.png" alt="Chat App Logo" />
          <h1>Socket.io Chat</h1>
        </div>
        
        <div className="login-card">
          <h2>Welcome!</h2>
          <p className="login-subtitle">Join the conversation with Socket.io real-time chat</p>
          
          <form onSubmit={handleSubmit}>
            {error && <div className="alert alert-danger">{error}</div>}
            
            <div className="form-group">
              <label htmlFor="username">Choose a username</label>
              <div className="input-with-icon">
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
            </div>
            
            <button type="submit" className="btn btn-primary login-button">
              Join Chat
            </button>
          </form>
          
          <p className="login-footer">
            Real-time chat powered by Socket.io and React
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
