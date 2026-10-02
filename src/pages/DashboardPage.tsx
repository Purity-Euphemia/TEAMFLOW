import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { 
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'hsl(var(--bg-primary))' }}>
      <header style={{ background: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '32px', height: '32px', background: 'hsl(var(--accent-primary))', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>TF</div>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>TeamFlow Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{user?.full_name}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '2rem' }}>
        <div className="container">
          <div className="glass" style={{ background: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to your Dashboard, {user?.full_name?.split(' ')[0]}!</h1>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>
              This is a protected route. You can only see this if you are authenticated.
              Your email is: <strong>{user?.email}</strong>
            </p>
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'hsla(var(--accent-primary), 0.1)', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-primary))' }}>
              <p>Dashboard functionality (Projects, Tasks, Team Management) is currently under construction.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
