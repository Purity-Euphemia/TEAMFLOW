import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, MessageSquare, AtSign, Settings, Users, Check, CircleDot, AlertCircle, Bell } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
  workspace_id: number | null;
  project_id: number | null;
  task_id: number | null;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  
  const { fetchUnreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications(1);
  }, [filter]);

  const fetchNotifications = async (pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      setError(null);
      
      const res = await fetch(`http://localhost:5000/api/notifications?page=${pageNumber}&per_page=20`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        let notifs = data.notifications || [];
        
        if (filter === 'unread') {
          notifs = notifs.filter((n: Notification) => !n.is_read);
        }
        
        if (pageNumber === 1) {
          setNotifications(notifs);
        } else {
          setNotifications(prev => [...prev, ...notifs]);
        }
        setHasMore(data.has_more || false);
        setPage(pageNumber);
      } else {
        setError('Unable to load notifications.');
      }
    } catch (err) {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number, navigateTo?: string) => {
    const notif = notifications.find(n => n.id === id);
    if (!notif) return;

    if (!notif.is_read) {
      // Optimistic UI update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      try {
        await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
          method: 'PATCH',
          credentials: 'include'
        });
        fetchUnreadCount();
      } catch (err) {
        console.error('Failed to mark notification as read', err);
      }
    }

    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  const markAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    try {
      await fetch(`http://localhost:5000/api/notifications/read-all`, {
        method: 'PATCH',
        credentials: 'include'
      });
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleNotificationClick = (notif: Notification) => {
    let navigateTo = undefined;
    
    if (notif.task_id && notif.project_id) {
      navigateTo = `/projects/${notif.project_id}?task=${notif.task_id}`;
    } else if (notif.project_id) {
      navigateTo = `/projects/${notif.project_id}`;
    } else if (notif.type === 'ROLE_CHANGED') {
      navigateTo = `/team`;
    }
    
    markAsRead(notif.id, navigateTo);
  };

  const getIcon = (type: string, isRead: boolean) => {
    const props = { size: 18, color: isRead ? 'hsl(var(--text-muted))' : 'hsl(var(--accent-primary))' };
    switch (type) {
      case 'TASK_ASSIGNED': return <CheckSquare {...props} />;
      case 'TASK_COMMENTED': return <MessageSquare {...props} />;
      case 'TASK_MENTIONED': return <AtSign {...props} />;
      case 'ROLE_CHANGED': return <Settings {...props} />;
      case 'WORKSPACE_INVITATION': return <Users {...props} />;
      case 'TASK_COMPLETED': return <Check {...props} />;
      case 'TASK_STATUS_CHANGED': return <CircleDot {...props} />;
      default: return <AlertCircle {...props} />;
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  // Group notifications by date
  const groupedNotifications: Record<string, Notification[]> = {};
  notifications.forEach(n => {
    const date = new Date(n.created_at);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    let group = 'OLDER';
    if (isToday) group = 'TODAY';
    else if (isYesterday) group = 'YESTERDAY';
    else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) group = 'EARLIER THIS WEEK';
    
    if (!groupedNotifications[group]) groupedNotifications[group] = [];
    groupedNotifications[group].push(n);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Notifications</h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', backgroundColor: 'hsl(var(--bg-secondary))', padding: '0.25rem', borderRadius: 'var(--radius-md)' }}>
            <button 
              onClick={() => setFilter('all')}
              style={{
                padding: '0.25rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: filter === 'all' ? 'white' : 'transparent',
                boxShadow: filter === 'all' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-sm)',
                color: filter === 'all' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
              }}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('unread')}
              style={{
                padding: '0.25rem 1rem',
                fontSize: '0.875rem',
                fontWeight: 500,
                backgroundColor: filter === 'unread' ? 'white' : 'transparent',
                boxShadow: filter === 'unread' ? 'var(--shadow-sm)' : 'none',
                borderRadius: 'var(--radius-sm)',
                color: filter === 'unread' ? 'hsl(var(--text-primary))' : 'hsl(var(--text-secondary))',
              }}
            >
              Unread
            </button>
          </div>
          
          <button 
            className="btn btn-secondary" 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.is_read)}
            style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {loading && page === 1 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Loading notifications...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--danger))' }}>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => fetchNotifications(1)}>Retry</button>
        </div>
      ) : notifications.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: '1px dashed hsl(var(--border-subtle))', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white'
        }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'hsl(var(--bg-secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Bell size={24} color="hsl(var(--text-muted))" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>You're all caught up</h3>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>You don't have any notifications right now.</p>
        </div>
      ) : (
        <div style={{ backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          {['TODAY', 'YESTERDAY', 'EARLIER THIS WEEK', 'OLDER'].map(group => {
            if (!groupedNotifications[group] || groupedNotifications[group].length === 0) return null;
            
            return (
              <div key={group}>
                <div style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: 'hsl(var(--bg-secondary))', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: 'hsl(var(--text-muted))',
                  borderBottom: '1px solid hsl(var(--border-subtle))',
                  borderTop: group !== 'TODAY' ? '1px solid hsl(var(--border-subtle))' : 'none'
                }}>
                  {group}
                </div>
                
                {groupedNotifications[group].map(notif => (
                  <div 
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      gap: '1rem',
                      borderBottom: '1px solid hsl(var(--border-subtle))',
                      backgroundColor: notif.is_read ? 'white' : 'hsla(var(--accent-primary), 0.05)',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'hsl(var(--bg-secondary))' : 'hsla(var(--accent-primary), 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = notif.is_read ? 'white' : 'hsla(var(--accent-primary), 0.05)'}
                  >
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: notif.is_read ? 'hsl(var(--bg-secondary))' : 'white',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: notif.is_read ? 'none' : 'var(--shadow-sm)'
                    }}>
                      {getIcon(notif.type, notif.is_read)}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                        <div style={{ fontWeight: notif.is_read ? 500 : 600, color: 'hsl(var(--text-primary))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {!notif.is_read && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))' }}></div>}
                          {notif.title || 'Notification'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                          {formatTime(notif.created_at)}
                        </div>
                      </div>
                      
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.5 }}>
                        {notif.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
          
          {hasMore && (
            <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'hsl(var(--bg-secondary))' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => fetchNotifications(page + 1)}
                style={{ fontSize: '0.875rem' }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
