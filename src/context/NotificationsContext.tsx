import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface NotificationsContextType {
  unreadCount: number;
  recentNotifications: any[];
  fetchUnreadCount: () => Promise<void>;
  setUnreadCount: (count: number) => void;
  markAsRead: (id: number) => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const { user } = useAuth();

  const fetchUnreadCount = async () => {
    if (!user) return;
    try {
      const resCount = await fetch('http://localhost:5000/api/notifications/unread-count', {
        credentials: 'include'
      });
      if (resCount.ok) {
        const data = await resCount.json();
        setUnreadCount(data.unread_count || 0);
      }
      
      const resNotifs = await fetch('http://localhost:5000/api/notifications?page=1&per_page=5', {
        credentials: 'include'
      });
      if (resNotifs.ok) {
        const data = await resNotifs.json();
        setRecentNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PATCH',
        credentials: 'include'
      });
      setRecentNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadCount(0);
    }
  }, [user]);

  return (
    <NotificationsContext.Provider value={{ unreadCount, recentNotifications, fetchUnreadCount, setUnreadCount, markAsRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
