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
    <div className="p-4 md:p-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <nav className="flex flex-col gap-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <tab.icon size={18} className={activeTab === tab.id ? 'text-blue-700' : 'text-gray-400'} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        
        {toast && (
          <div className={`mb-6 p-4 rounded-lg text-sm flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {toast.type === 'success' ? <Save size={16} /> : <AlertTriangle size={16} />}
            {toast.message}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
              <p className="text-sm text-gray-500">Manage your personal information.</p>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.full_name}
                  onChange={e => setProfileData({...profileData, full_name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed directly.</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'security' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Account & Security</h2>
              <p className="text-sm text-gray-500">Manage your password and sessions.</p>
            </div>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              <h3 className="text-md font-medium text-gray-800 border-b pb-2">Change Password</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.current_password}
                  onChange={e => setPasswordData({...passwordData, current_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.new_password}
                  onChange={e => setPasswordData({...passwordData, new_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordData.confirm_password}
                  onChange={e => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </form>

            <div className="pt-6">
              <h3 className="text-md font-medium text-gray-800 border-b pb-2 mb-4">Active Session</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg gap-4">
                <div>
                  <p className="font-medium text-gray-900">Current browser</p>
                  <p className="text-sm text-green-600">Status: Active</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <LogOut size={16} /> Log Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Workspace Settings</h2>
              <p className="text-sm text-gray-500">Manage your active workspace information.</p>
            </div>
            
            <form onSubmit={handleWorkspaceSubmit} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Workspace Name</label>
                <input
                  type="text"
                  required
                  disabled={workspaceData.role === 'member'}
                  value={workspaceData.name}
                  onChange={e => setWorkspaceData({...workspaceData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
              {['owner', 'admin'].includes(workspaceData.role) ? (
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Workspace'}
                </button>
              ) : (
                <p className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
                  Only the Workspace Owner or Admins can edit these settings.
                </p>
              )}
            </form>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Notification Preferences</h2>
              <p className="text-sm text-gray-500">Choose what you want to be notified about.</p>
            </div>
            
            <div className="space-y-4 max-w-lg">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-800 capitalize">{key.replace(/_/g, ' ')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={value as boolean}
                      onChange={(e) => handleNotificationToggle(key, e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Appearance</h2>
              <p className="text-sm text-gray-500">Customize how TeamFlow looks on your device.</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Theme</h3>
              <div className="flex gap-4">
                {['light', 'dark', 'system'].map(t => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="theme" 
                      value={t} 
                      checked={theme === t}
                      onChange={() => handleThemeChange(t)}
                      className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                    <span className="capitalize text-gray-800">{t}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* DANGER ZONE TAB */}
        {activeTab === 'danger' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} />
                Danger Zone
              </h2>
              <p className="text-sm text-gray-500 mt-1">Destructive actions for your account and workspace.</p>
            </div>
            
            {workspaceData.role === 'owner' && (
              <div className="border border-red-200 rounded-lg p-5 bg-red-50">
                <h3 className="font-semibold text-red-800 mb-1">Delete Workspace</h3>
                <p className="text-sm text-red-600 mb-4">
                  Permanently delete this workspace and all its data (projects, tasks, members). This action cannot be undone.
                </p>
                <div className="space-y-3 max-w-sm">
                  <label className="block text-sm text-red-700">Type <strong>{workspaceData.name}</strong> to confirm</label>
                  <input
                    type="text"
                    value={workspaceConfirm}
                    onChange={e => setWorkspaceConfirm(e.target.value)}
                    placeholder="Workspace Name"
                    className="w-full px-3 py-2 border border-red-300 rounded-lg outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button 
                    onClick={handleDeleteWorkspace}
                    disabled={workspaceConfirm !== workspaceData.name || loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    Delete Workspace
                  </button>
                </div>
              </div>
            )}

            <div className="border border-red-200 rounded-lg p-5 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-1">Delete Account</h3>
              <p className="text-sm text-red-600 mb-4">
                Permanently delete your user account. This action cannot be undone. If you are a workspace owner, you must delete or transfer your workspaces first.
              </p>
              <button 
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 bg-white text-red-600 border border-red-300 rounded-lg hover:bg-red-50 font-medium disabled:opacity-50 transition-colors"
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
