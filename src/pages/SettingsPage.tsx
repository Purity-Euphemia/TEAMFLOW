import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Shield, Briefcase, Bell, Palette, AlertTriangle, Save, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

export default function SettingsPage() {
  const { user, currentWorkspace, checkAuth } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form states
  const [profileData, setProfileData] = useState({ full_name: user?.full_name || '', avatar_url: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [workspaceData, setWorkspaceData] = useState({ name: currentWorkspace?.name || '', role: 'member' });
  const [workspaceConfirm, setWorkspaceConfirm] = useState('');
  
  const [notifications, setNotifications] = useState({
    task_assigned: true,
    task_status_changed: true,
    task_completed: true,
    comments: true,
    mentions: true,
    role_changes: true,
    workspace_invitations: true,
    activity_updates: true
  });
  const [theme, setTheme] = useState('system');

  useEffect(() => {
    fetchProfile();
    fetchNotifications();
    fetchWorkspace();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/profile`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setProfileData({ full_name: data.full_name, avatar_url: data.avatar_url || '' });
        setTheme(data.theme || 'system');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/settings/notifications`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchWorkspace = async () => {
    if (!currentWorkspace?.id) return;
    try {
      const res = await fetch(`${API_URL}/settings/workspace`, {
        headers: { 'X-Workspace-ID': currentWorkspace.id.toString() },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setWorkspaceData({ name: data.name, role: data.role });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });
      if (res.ok) {
        showToast('Profile updated successfully');
        checkAuth();
      } else {
        showToast('Failed to update profile', 'error');
      }
    } catch (e) {
      showToast('Error updating profile', 'error');
    }
    setLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      return showToast('New passwords do not match', 'error');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Password changed successfully');
        setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
      } else {
        showToast(data.error || 'Failed to change password', 'error');
      }
    } catch (e) {
      showToast('Error changing password', 'error');
    }
    setLoading(false);
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    try {
      await fetch(`${API_URL}/settings/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ [key]: value })
      });
      showToast('Notification preferences updated');
    } catch (e) {
      showToast('Failed to update preferences', 'error');
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme);
    try {
      await fetch(`${API_URL}/settings/appearance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ theme: newTheme })
      });
      showToast('Appearance updated');
    } catch (e) {
      showToast('Failed to update appearance', 'error');
    }
  };

  const handleWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/workspace`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-Workspace-ID': currentWorkspace?.id.toString() || ''
        },
        credentials: 'include',
        body: JSON.stringify({ name: workspaceData.name })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Workspace updated successfully');
        checkAuth();
      } else {
        showToast(data.error || 'Failed to update workspace', 'error');
      }
    } catch (e) {
      showToast('Error updating workspace', 'error');
    }
    setLoading(false);
  };

  const handleDeleteWorkspace = async () => {
    if (workspaceConfirm !== workspaceData.name) {
      return showToast('Confirmation name does not match', 'error');
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/workspace`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'X-Workspace-ID': currentWorkspace?.id.toString() || ''
        },
        credentials: 'include',
        body: JSON.stringify({ confirmation: workspaceConfirm })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Workspace deleted permanently');
        setTimeout(() => window.location.href = '/dashboard', 2000);
      } else {
        showToast(data.error || 'Failed to delete workspace', 'error');
      }
    } catch (e) {
      showToast('Error deleting workspace', 'error');
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST', credentials: 'include' });
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/settings/account`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/login');
      } else {
        showToast(data.error || 'Failed to delete account', 'error');
      }
    } catch (e) {
      showToast('Error deleting account', 'error');
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Account & Security', icon: Shield },
    { id: 'workspace', label: 'Workspace', icon: Briefcase },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', gap: '2rem', padding: '2rem 1rem', flexWrap: 'wrap' }}>
      
      {/* Sidebar */}
      <div style={{ width: '250px', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Settings</h1>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
                backgroundColor: activeTab === tab.id ? 'hsl(var(--bg-tertiary))' : 'transparent',
                color: activeTab === tab.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
                textAlign: 'left'
              }}
            >
              <tab.icon size={18} style={{ color: activeTab === tab.id ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-muted))' }} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="glass" style={{ flex: 1, minWidth: '300px', borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
        
        {toast && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.875rem',
            backgroundColor: toast.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            color: toast.type === 'success' ? 'hsl(var(--success))' : 'hsl(var(--danger))',
            border: `1px solid ${toast.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
          }}>
            {toast.type === 'success' ? <Save size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Profile Settings</h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Manage your personal information.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.full_name}
                  onChange={e => setProfileData({...profileData, full_name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: 'hsl(var(--bg-tertiary))',
                    color: 'hsl(var(--text-muted))',
                    fontSize: '0.875rem',
                    cursor: 'not-allowed'
                  }}
                />
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.5rem' }}>Email cannot be changed directly.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Account & Security</h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Manage your password and sessions.</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid hsl(var(--border-subtle))', paddingBottom: '0.5rem' }}>Change Password</h3>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: 'hsl(var(--bg-secondary))',
                    color: 'hsl(var(--text-primary))',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-secondary"
                style={{ alignSelf: 'flex-start', marginTop: '0.5rem' }}
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>

            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, borderBottom: '1px solid hsl(var(--border-subtle))', paddingBottom: '0.5rem', marginBottom: '1rem' }}>Active Session</h3>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem' }}>Current browser</p>
                  <p style={{ fontSize: '0.75rem', color: 'hsl(var(--success))' }}>Status: Active</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Workspace Settings</h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Manage your active workspace information.</p>
            </div>
            
            <form onSubmit={handleWorkspaceSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '400px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Workspace Name</label>
                <input
                  type="text"
                  required
                  disabled={workspaceData.role === 'member'}
                  value={workspaceData.name}
                  onChange={e => setWorkspaceData({...workspaceData, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--border-subtle))',
                    backgroundColor: workspaceData.role === 'member' ? 'hsl(var(--bg-tertiary))' : 'hsl(var(--bg-secondary))',
                    color: workspaceData.role === 'member' ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              {['owner', 'admin'].includes(workspaceData.role) ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {loading ? 'Saving...' : 'Save Workspace'}
                </button>
              ) : (
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--warning))', backgroundColor: 'hsla(var(--warning), 0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsla(var(--warning), 0.2)' }}>
                  Only the Workspace Owner or Admins can edit these settings.
                </p>
              )}
            </form>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Notification Preferences</h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Choose what you want to be notified about.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '500px' }}>
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
                  <p style={{ fontWeight: 500, fontSize: '0.875rem', textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</p>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}>
                    <input 
                      type="checkbox" 
                      style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
                      checked={value as boolean}
                      onChange={(e) => handleNotificationToggle(key, e.target.checked)}
                    />
                    <div style={{
                      width: '44px',
                      height: '24px',
                      backgroundColor: value ? 'hsl(var(--accent-primary))' : 'hsl(var(--border-subtle))',
                      borderRadius: '999px',
                      position: 'relative',
                      transition: 'background-color 0.2s'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: value ? '22px' : '2px',
                        transition: 'left 0.2s',
                        boxShadow: 'var(--shadow-sm)'
                      }}></div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>Appearance</h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Customize how TeamFlow looks on your device.</p>
            </div>
            
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1rem' }}>Theme</h3>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['light', 'dark', 'system'].map(t => (
                  <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                    <input 
                      type="radio" 
                      name="theme" 
                      value={t} 
                      checked={theme === t}
                      onChange={() => handleThemeChange(t)}
                      style={{ accentColor: 'hsl(var(--accent-primary))', width: '16px', height: '16px' }}
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} />
                Danger Zone
              </h2>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Destructive actions for your account and workspace.</p>
            </div>
            
            {workspaceData.role === 'owner' && (
              <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid hsla(var(--danger), 0.3)', backgroundColor: 'hsla(var(--danger), 0.05)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--danger))', marginBottom: '0.5rem' }}>Delete Workspace</h3>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
                  Permanently delete this workspace and all its data (projects, tasks, members). This action cannot be undone.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '350px' }}>
                  <label style={{ fontSize: '0.875rem' }}>Type <strong style={{ color: 'hsl(var(--text-primary))' }}>{workspaceData.name}</strong> to confirm</label>
                  <input
                    type="text"
                    value={workspaceConfirm}
                    onChange={e => setWorkspaceConfirm(e.target.value)}
                    placeholder="Workspace Name"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid hsla(var(--danger), 0.3)',
                      backgroundColor: 'hsl(var(--bg-secondary))',
                      color: 'hsl(var(--text-primary))',
                      fontSize: '0.875rem'
                    }}
                  />
                  <button 
                    onClick={handleDeleteWorkspace}
                    disabled={workspaceConfirm !== workspaceData.name || loading}
                    style={{
                      padding: '0.75rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'hsl(var(--danger))',
                      color: 'white',
                      fontWeight: 500,
                      border: 'none',
                      cursor: workspaceConfirm !== workspaceData.name || loading ? 'not-allowed' : 'pointer',
                      opacity: workspaceConfirm !== workspaceData.name || loading ? 0.5 : 1,
                      alignSelf: 'flex-start'
                    }}
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            )}

            <div style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid hsla(var(--danger), 0.3)', backgroundColor: 'hsla(var(--danger), 0.05)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--danger))', marginBottom: '0.5rem' }}>Delete Account</h3>
              <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>
                Permanently delete your user account. This action cannot be undone. If you are a workspace owner, you must delete or transfer your workspaces first.
              </p>
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  color: 'hsl(var(--danger))',
                  border: '1px solid hsl(var(--danger))',
                  fontWeight: 500,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  alignSelf: 'flex-start'
                }}
              >
                Delete Account
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
