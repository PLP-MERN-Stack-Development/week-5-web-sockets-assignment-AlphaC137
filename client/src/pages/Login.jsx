// pages/Login.jsx - Login page with auth forms
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login';
import Register from '../components/Register';
import './Login.css';

const LoginPage = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const { login, register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (user, token) => {
    try {
      clearError();
      // The login is already handled in the context
      navigate('/chat');
    } catch (error) {
      console.error('Login navigation error:', error);
    }
  };

  const handleRegister = async (user, token) => {
    try {
      clearError();
      // The registration is already handled in the context
      navigate('/chat');
    } catch (error) {
      console.error('Register navigation error:', error);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    clearError();
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>💬 Real-Time Chat</h1>
          <p>Connect and chat with people in real-time!</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab ${isLoginMode ? 'active' : ''}`}
            onClick={() => setIsLoginMode(true)}
          >
            Login
          </button>
          <button 
            className={`tab ${!isLoginMode ? 'active' : ''}`}
            onClick={() => setIsLoginMode(false)}
          >
            Register
          </button>
        </div>

        <div className="auth-form-container">
          {error && (
            <div className="error-banner">
              {error}
              <button onClick={clearError} className="error-close">×</button>
            </div>
          )}

          {isLoginMode ? (
            <Login onLogin={handleLogin} />
          ) : (
            <Register onRegister={handleRegister} />
          )}
        </div>

        <div className="auth-switch">
          {isLoginMode ? (
            <p>
              Don't have an account?{' '}
              <button onClick={toggleMode} className="link-button">
                Sign up here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button onClick={toggleMode} className="link-button">
                Sign in here
              </button>
            </p>
          )}
        </div>

        <div className="features-preview">
          <h3>Features</h3>
          <ul>
            <li>🚀 Real-time messaging</li>
            <li>👥 Multiple chat rooms</li>
            <li>💬 Private messaging</li>
            <li>⌨️ Typing indicators</li>
            <li>👤 Online user presence</li>
            <li>😊 Message reactions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
