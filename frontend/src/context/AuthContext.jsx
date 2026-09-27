import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('banaobecho_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch demo users for switching
  useEffect(() => {
    const fetchDemoUsers = async () => {
      try {
        const res = await authAPI.getDemoUsers();
        if (res.data?.users) {
          setDemoUsers(res.data.users);
          // If no user is logged in, default to Buyer 1 (Chef Vikram) or Producer 1 for seamless demo experience
          if (!currentUser && res.data.users.length > 0) {
            const defaultUser = res.data.users.find(u => u.role === 'buyer') || res.data.users[0];
            setCurrentUser(defaultUser);
            localStorage.setItem('banaobecho_user', JSON.stringify(defaultUser));
          }
        }
      } catch (err) {
        console.error('Failed to load demo users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoUsers();
  }, []);

  const switchUser = async (userId) => {
    try {
      const res = await authAPI.switchUser(userId);
      if (res.data?.user) {
        setCurrentUser(res.data.user);
        localStorage.setItem('banaobecho_user', JSON.stringify(res.data.user));
        return res.data.user;
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
      // Fallback from local list
      const localUser = demoUsers.find(u => u.id === userId);
      if (localUser) {
        setCurrentUser(localUser);
        localStorage.setItem('banaobecho_user', JSON.stringify(localUser));
        return localUser;
      }
    }
  };

  const loginWithUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('banaobecho_user', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('banaobecho_user');
  };

  const isProducer = currentUser?.role && currentUser.role !== 'buyer';
  const isBuyer = currentUser?.role === 'buyer';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        demoUsers,
        switchUser,
        loginWithUser,
        logout,
        isProducer,
        isBuyer,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
