import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FolderKanban, 
  Users, 
  Bell, 
  Settings, 
  Search, 
  LogOut,
  User as UserIcon,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';

export default function DashboardLayout() {
  const { user, setUser } = useAuth();
  const { unreadCount, recentNotifications, markAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      // Navigate to the public home page first, so we exit the ProtectedRoute
      navigate('/');
      // Then clear the user state in the next tick to prevent ProtectedRoute from catching the state change and redirecting to /login
      setTimeout(() => {
        setUser(null);
      }, 10);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Tasks', path: '/tasks', icon: CheckSquare },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    { name: 'Team', path: '/team', icon: Users },
    { name: 'Activity', path: '/activity', icon: Activity },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleNotificationClick = (notif: any) => {
    setIsDropdownOpen(false);
    
    let navigateTo = undefined;
    if (notif.task_id && notif.project_id) {
      navigateTo = `/projects/${notif.project_id}?task=${notif.task_id}`;
    } else if (notif.project_id) {
      navigateTo = `/projects/${notif.project_id}`;
    } else if (notif.type === 'ROLE_CHANGED') {
      navigateTo = `/team`;
    }
    
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
    
    if (navigateTo) {
      navigate(navigateTo);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: 'white',
        borderRight: '1px solid hsl(var(--border-subtle))',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
          <div style={{ width: '32px', height: '32px', background: 'hsl(var(--accent-primary))', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>TF</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>TeamFlow</span>
        </div>

        {/* Navigation */}
        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                  backgroundColor: isActive ? 'hsla(var(--accent-primary), 0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '0.75rem' }}>
                  <Icon size={20} />
                  {item.name}
                </div>
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span style={{
                    backgroundColor: 'hsl(var(--danger))',
                    color: 'white',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '0.1rem 0.5rem',
                    borderRadius: '9999px',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Footer */}
        <div style={{ padding: '1.5rem 1rem', borderTop: '1px solid hsl(var(--border-subtle))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '50%',
              backgroundColor: 'hsl(var(--accent-primary))', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 600
            }}>
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'hsl(var(--text-primary))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.full_name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {user?.email}
              </div>
            </div>
            <button onClick={handleLogout} style={{ color: 'hsl(var(--text-muted))', padding: '0.5rem' }} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{
          height: '72px',
          backgroundColor: 'white',
          borderBottom: '1px solid hsl(var(--border-subtle))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          zIndex: 5
        }}>
          {/* Header Left (Placeholder for workspace selector logic added in page or context, wait let's add it here if it's layout wide) */}
          <div id="top-header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             {/* The dashboard page will portal into this or we fetch workspaces here. Let's keep it simple. */}
             <div style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                Workspace App
             </div>
          </div>

          {/* Header Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'hsl(var(--text-muted))' }} />
              <input 
                type="text" 
                placeholder="Search..." 
                style={{
                  padding: '0.5rem 1rem 0.5rem 2.5rem',
                  borderRadius: '9999px',
                  border: '1px solid hsl(var(--border-subtle))',
                  backgroundColor: 'hsl(var(--bg-primary))',
                  outline: 'none',
                  fontSize: '0.875rem',
                  width: '240px'
                }} 
              />
            </div>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{ position: 'relative', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: '-4px', right: '-4px',
                    width: '16px', height: '16px', borderRadius: '50%',
                    backgroundColor: 'hsl(var(--danger))',
                    color: 'white',
                    fontSize: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  width: '320px',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  border: '1px solid hsl(var(--border-subtle))',
                  overflow: 'hidden',
                  zIndex: 100
                }}>
                  <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>Notifications</h3>
                    <Link to="/notifications" onClick={() => setIsDropdownOpen(false)} style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-primary))', fontWeight: 500 }}>
                      View all
                    </Link>
                  </div>
                  
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map(notif => (
                        <div 
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          style={{ 
                            padding: '0.75rem 1rem', 
                            borderBottom: '1px solid hsl(var(--border-subtle))',
                            backgroundColor: notif.is_read ? 'white' : 'hsla(var(--accent-primary), 0.05)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.75rem'
                          }}
                        >
                          {!notif.is_read && <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', marginTop: '6px', flexShrink: 0 }} />}
                          <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: notif.is_read ? 500 : 600, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>
                              {notif.title || 'Notification'}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                              {notif.message}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
                        You're all caught up!
                      </div>
                    )}
                  </div>
                  
                  <div style={{ padding: '0.5rem', borderTop: '1px solid hsl(var(--border-subtle))', textAlign: 'center' }}>
                    <Link to="/notifications" onClick={() => setIsDropdownOpen(false)} style={{ display: 'block', padding: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-primary))', fontWeight: 500 }}>
                      Go to Notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
