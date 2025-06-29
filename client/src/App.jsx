import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { ChatProvider } from './context/ChatContext';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';
import FeaturesShowcase from './components/FeaturesShowcase';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const handleLogin = (user) => {
    setUserInfo(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserInfo(null);
  };

  return (
    <div className="App">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      
      {!isLoggedIn ? (
        <>
          <LoginForm onLogin={handleLogin} />
          <FeaturesShowcase />
        </>
      ) : (
        <ChatProvider>
          <ChatInterface userInfo={userInfo} onLogout={handleLogout} />
          <FeaturesShowcase />
        </ChatProvider>
      )}
    </div>
  );
}

export default App;
