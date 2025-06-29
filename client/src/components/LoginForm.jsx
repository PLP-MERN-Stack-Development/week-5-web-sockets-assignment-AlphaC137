import React, { useState } from 'react';
import { User, MessageCircle } from 'lucide-react';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;

    setIsLoading(true);
    
    // Simulate a brief loading state
    setTimeout(() => {
      const userInfo = {
        id: Date.now().toString(),
        username: username.trim()
      };
      onLogin(userInfo);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="login-form">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <MessageCircle size={48} color="#007bff" style={{ marginBottom: '16px' }} />
          <h2>Join the Chat</h2>
          <p style={{ color: '#6c757d', marginTop: '8px' }}>
            Enter your username to start chatting
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">
              <User size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              required
              disabled={isLoading}
            />
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? 'Joining...' : 'Join Chat'}
          </button>
        </form>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '16px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.875rem',
          color: '#6c757d'
        }}>
          <h4 style={{ marginBottom: '8px', color: '#495057' }}>Features:</h4>
          <ul style={{ marginLeft: '16px', lineHeight: '1.6' }}>
            <li>Real-time messaging</li>
            <li>Private conversations</li>
            <li>Multiple chat rooms</li>
            <li>File sharing</li>
            <li>Message reactions</li>
            <li>Typing indicators</li>
            <li>Online status</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
