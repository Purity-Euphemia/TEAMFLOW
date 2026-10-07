import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function RegisterPage() {
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Frontend validation
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const from = (location.state as any)?.from;
        navigate('/login', { state: { message: 'Registration successful. Please log in.', from } });
      } else {
        setError(data.error || 'Registration failed.');
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
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'hsl(var(--text-primary))' }}>Create your account</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Join TeamFlow and get started free.</p>
      </div>

      {error && (
        <div style={{ background: 'hsl(348 83% 95%)', color: 'hsl(348 83% 47%)', padding: '0.75rem 1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid hsl(348 83% 85%)' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="fullName" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Full Name</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName"
            autoComplete="name"
            value={formData.fullName}
            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
            required 
          />
        </div>
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
          <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Password</label>
          <input 
            type="password" 
            id="password" 
            name="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
            required 
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Confirm Password</label>
          <input 
            type="password" 
            id="confirmPassword" 
            name="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem', outline: 'none' }}
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
        Already have an account? <Link to="/login" state={location.state} style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Log in</Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        input:focus { border-color: hsl(var(--accent-primary)) !important; box-shadow: 0 0 0 2px hsla(var(--accent-primary), 0.2); }
      `}} />
    </div>
  );
}
