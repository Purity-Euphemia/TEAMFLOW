import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, X, Loader, Building } from 'lucide-react';

interface InviteDetails {
  id: number;
  email: string;
  workspace_name: string;
  role: string;
  inviter_name: string;
  inviter_email: string;
  status: string;
  token: string;
}

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, checkAuth } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'pending' | 'success' | 'error' | 'unauth'>('loading');
  const [message, setMessage] = useState('');
  const [invite, setInvite] = useState<InviteDetails | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link.');
      return;
    }
    
    const fetchInvite = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/invitations/${token}`);
        const data = await res.json();
        
        if (res.ok) {
          setInvite(data);
          if (data.status !== 'pending') {
            setStatus('error');
            setMessage(`This invitation is already ${data.status}.`);
          } else if (!user) {
            setStatus('unauth');
          } else if (user.email !== data.email) {
            setStatus('error');
            setMessage('This invitation was sent to a different email address.');
          } else {
            setStatus('pending');
          }
        } else {
          setStatus('error');
          setMessage(data.error || 'Invitation not found.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error while loading invitation.');
      }
    };
    
    fetchInvite();
  }, [token, user]);

  const handleAccept = async () => {
    setStatus('loading');
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${token}/accept`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        await checkAuth(); // refresh workspaces
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

  const handleDecline = async () => {
    if (!confirm('Decline Invitation?\n\nYou will not join this workspace.')) return;
    
    setStatus('loading');
    try {
      const res = await fetch(`http://localhost:5000/api/invitations/${token}/decline`, {
        method: 'POST',
        credentials: 'include'
      });
      const data = await res.json();
      
      if (res.ok) {
        setStatus('error');
        setMessage('You have declined the invitation.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to decline invitation.');
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Network error.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'hsl(var(--bg-primary))', padding: '1rem' }}>
      <div className="glass" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center', border: '1px solid hsl(var(--border-subtle))' }}>
        
        {status === 'loading' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader size={32} style={{ color: 'hsl(var(--accent-primary))', animation: 'spin 1s linear infinite' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Invitation...</h2>
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invitation Status</h2>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>{message}</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Go to Dashboard</Link>
          </div>
        )}

        {(status === 'pending' || status === 'unauth') && invite && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ width: 56, height: 56, borderRadius: '12px', backgroundColor: 'hsla(var(--accent-primary), 0.1)', color: 'hsl(var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '-0.5rem' }}>
              <Building size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Workspace Invitation</h2>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.95rem' }}>You've been invited to join:</p>
              <p style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--text-primary))', marginTop: '0.5rem' }}>{invite.workspace_name}</p>
            </div>
            
            <div style={{ backgroundColor: 'hsla(var(--bg-secondary), 0.5)', padding: '1rem', borderRadius: '8px', width: '100%', textAlign: 'left', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Invited by:</span>
                <span style={{ fontWeight: 500 }}>{invite.inviter_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Role:</span>
                <span style={{ fontWeight: 500, textTransform: 'capitalize' }}>{invite.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'hsl(var(--text-muted))' }}>Status:</span>
                <span style={{ fontWeight: 500, color: '#D97706' }}>Pending</span>
              </div>
            </div>

            {status === 'pending' ? (
              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '0.5rem' }}>
                <button onClick={handleDecline} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', border: '1px solid hsl(var(--border-subtle))', borderRadius: '0.5rem', fontWeight: 500, color: 'hsl(var(--text-primary))', background: 'transparent', cursor: 'pointer' }}>
                  Decline
                </button>
                <button onClick={handleAccept} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
                  Accept Invitation
                </button>
              </div>
            ) : (
              <div style={{ width: '100%', marginTop: '0.5rem' }}>
                <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  Please log in or create an account to accept your invitation.
                </p>
                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <Link to="/login" state={{ from: { pathname: '/accept-invite', search: `?token=${token}` } }} className="btn btn-primary" style={{ flex: 1, padding: '0.75rem', textAlign: 'center' }}>
                    Log In
                  </Link>
                  <Link to="/register" state={{ from: { pathname: '/accept-invite', search: `?token=${token}` } }} style={{ flex: 1, padding: '0.75rem', textAlign: 'center', border: '1px solid hsl(var(--border-subtle))', borderRadius: '0.5rem', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>
                    Register
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
