import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Building, Check, X, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/user/invitations/pending', {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations || []);
      } else {
        setError('Failed to load invitations.');
      }
    } catch (err) {
      setError('Network error while loading invitations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
        <Loader size={32} style={{ color: 'hsl(var(--accent-primary))', animation: 'spin 1s linear infinite' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Invitations...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Workspace Invitations</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Manage your pending workspace invitations.</p>
        </div>
      </div>

      {error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--danger))', backgroundColor: 'hsla(var(--danger), 0.1)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={fetchInvitations}>Retry</button>
        </div>
      ) : invitations.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: '1px dashed hsl(var(--border-subtle))', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white'
        }}>
          <div style={{ width: '64px', height: '64px', backgroundColor: 'hsla(var(--accent-primary), 0.1)', color: 'hsl(var(--accent-primary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Building size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No pending invitations</h3>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>You don't have any pending workspace invitations right now.</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.5rem' }}>Return to Dashboard</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {invitations.map((inv) => (
            <div key={inv.id} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid hsl(var(--border-subtle))', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'white' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: '12px', backgroundColor: 'hsla(var(--accent-primary), 0.1)', color: 'hsl(var(--accent-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Building size={24} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>
                    {inv.workspace_name}
                  </h3>
                  <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>
                    Invited by <span style={{ fontWeight: 500 }}>{inv.inviter_name}</span> &middot; Role: <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{inv.role}</span>
                  </p>
                </div>
              </div>
              <Link to={`/accept-invite?token=${inv.token}`} className="btn btn-primary" style={{ padding: '0.625rem 1.25rem' }}>
                Review
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
