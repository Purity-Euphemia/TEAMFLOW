import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Loader } from 'lucide-react';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link.');
      return;
    }
    
    if (!user) {
      navigate('/login');
      return;
    }

    const accept = async () => {
      try {
        const res = await fetch(`/api/invitations/${token}/accept`, {
          method: 'POST',
          credentials: 'include'
        });
        const data = await res.json();
        
        if (res.ok) {
          setStatus('success');
          setMessage('You have successfully joined the workspace.');
          setTimeout(() => navigate('/dashboard'), 2000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to accept invitation.');
        }
      } catch (err: any) {
        setStatus('error');
        setMessage(err.message || 'Network error.');
      }
    };
    
    accept();
  }, [token, user, navigate]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--bg-primary))', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
        
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader size={32} style={{ color: 'hsl(var(--accent-primary))', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Joining Workspace...</h2>
          </div>
        )}
        
        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'hsla(142, 70%, 40%, 0.1)', color: 'hsl(142, 70%, 40%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Success!</h2>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>{message}</p>
            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>Redirecting to dashboard...</p>
          </div>
        )}
        
        {status === 'error' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invitation Error</h2>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>{message}</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Dashboard</Link>
          </div>
        )}

      </div>
    </div>
  );
}
