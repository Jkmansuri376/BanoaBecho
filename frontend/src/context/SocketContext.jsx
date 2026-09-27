import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [activeNotifications, setActiveNotifications] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
      : 'http://localhost:5000';

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('⚡ Connected to BanaoBecho Real-time Socket server:', newSocket.id);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen to user-specific notifications
  useEffect(() => {
    if (socket && currentUser?.id) {
      socket.emit('join_user_notifications', { userId: currentUser.id });

      const handleNotification = (data) => {
        const notif = {
          id: Date.now(),
          ...data,
          receivedAt: new Date(),
        };
        setActiveNotifications((prev) => [notif, ...prev]);

        // Auto clear after 8 seconds
        setTimeout(() => {
          setActiveNotifications((prev) => prev.filter((n) => n.id !== notif.id));
        }, 8000);
      };

      socket.on('notification', handleNotification);
      socket.on('order_confirmed', handleNotification);
      socket.on('order_status_change', handleNotification);

      return () => {
        socket.off('notification', handleNotification);
        socket.off('order_confirmed', handleNotification);
        socket.off('order_status_change', handleNotification);
      };
    }
  }, [socket, currentUser?.id]);

  const joinThread = (listingId, buyerId) => {
    if (socket && listingId && buyerId) {
      socket.emit('join_thread', { listingId, buyerId });
    }
  };

  const leaveThread = (listingId, buyerId) => {
    if (socket && listingId && buyerId) {
      socket.emit('leave_thread', { listingId, buyerId });
    }
  };

  const removeNotification = (id) => {
    setActiveNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        joinThread,
        leaveThread,
        activeNotifications,
        removeNotification
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
