import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();
  
  const stateMessage = (location.state as any)?.message;
  const fromState = (location.state as any)?.from;
  const from = fromState ? `${fromState.pathname}${fromState.search || ''}` : '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Securely retrieve the fresh session context from backend
        await checkAuth();
        navigate(from, { replace: true });
      } else {
        setError(data.error || 'Login failed.');
      }
    } catch (err) {
      setError('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'hsl(var(--text-primary))' }}>Welcome back</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Log in to continue managing your team's work.</p>
      </div>

      {stateMessage && (
        <div style={{ background: 'hsl(142 71% 95%)', color: 'hsl(142 71% 40%)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid hsl(142 71% 85%)' }}>
          {stateMessage}
        </div>
      )}

      {error && (
        <div style={{ background: 'hsl(348 83% 95%)', color: 'hsl(348 83% 47%)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid hsl(348 83% 85%)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
          <input 
            type="email" 
            id="email" 
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
            required 
          />
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
            <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
            <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: 'hsl(var(--accent-primary))', fontWeight: 500 }}>Forgot password?</Link>
          </div>
          <input 
            type="password" 
            id="password" 
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
            required 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input type="checkbox" id="rememberMe" style={{ width: '16px', height: '16px', accentColor: 'hsl(var(--accent-primary))' }} />
          <label htmlFor="rememberMe" style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Remember me</label>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
        Don't have an account? <Link to="/register" state={location.state} style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Create one</Link>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        input:focus { border-color: hsl(var(--accent-primary)) !important; box-shadow: 0 0 0 2px hsla(var(--accent-primary), 0.2); }
      `}} />
    </div>
  );
}
