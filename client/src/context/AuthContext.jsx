import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // Get user from local storage on initial load
    const savedUser = localStorage.getItem('chatUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Update local storage when user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('chatUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('chatUser');
    }
  }, [user]);

  const login = (username) => {
    const newUser = {
      id: Date.now().toString(),
      username,
    };
    setUser(newUser);
    return newUser;
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
