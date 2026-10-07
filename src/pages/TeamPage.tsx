import React, { useState, useEffect } from 'react';

import { useAuth } from '../context/AuthContext';
import { Search, Plus, Mail, MoreVertical, X, Check, Clock, User as UserIcon, Shield, Crown } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  email: string;
  role: string;
  joined_at: string;
}

interface Invitation {
  id: number;
  email: string;
  role: string;
  inviter_name: string;
  created_at: string;
  expires_at: string;
  status: string;
  token: string;
}

export default function TeamPage() {
  const { currentWorkspace, user } = useAuth();
  
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All roles');
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Active member actions
  const [showRemoveConfirm, setShowRemoveConfirm] = useState<number | null>(null);

  const fetchTeam = async () => {
    if (!currentWorkspace) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`http://localhost:5000/api/workspaces/members?workspace_id=${currentWorkspace.id}`, {credentials: 'include'});
      if (!res.ok) throw new Error('Failed to load team members');
      const data = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/invitations`, {credentials: 'include'});
      const membersData = await res.json();
      setMembers(membersData.members);
      
      if (data.ok) {
        const invData = await data.json();
        setInvitations(invData.invitations || []);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [currentWorkspace]);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All roles' || m.role.toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentWorkspace) return;
    setInviteError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send invite');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
      fetchTeam(); // Refresh lists
    } catch (err: any) {
      setInviteError(err.message);
    }
  };

  const cancelInvite = async (id: number) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/invitations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const resendInvite = async (id: number) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/invitations/${id}/resend`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        alert('Invitation resent successfully!');
        fetchTeam();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to resend invite.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (memberId: number, newRole: string) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
        credentials: 'include'
      });
      if (res.ok) fetchTeam();
    } catch (err) {
      console.error(err);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`http://localhost:5000/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setShowRemoveConfirm(null);
        fetchTeam();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentUserRole = currentWorkspace?.role || 'member';
  const canManage = currentUserRole === 'owner' || currentUserRole === 'admin';

  const getRoleBadge = (role: string) => {
    return (
      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 500, border: '1px solid hsl(var(--border-subtle))', color: 'hsl(var(--text-primary))', textTransform: 'capitalize' }}>
        {role}
      </span>
    );
  };

  return (
    <div style={{ backgroundColor: '#000000', margin: '-2rem', padding: '2.5rem 3rem', minHeight: 'calc(100vh - 72px)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ color: '#6366F1', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Workspace</div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'white', letterSpacing: '-0.02em' }}>Team Management</h1>
            <p style={{ color: '#9CA3AF', fontSize: '0.95rem' }}>Manage your workspace members, roles, and invitations.</p>
          </div>
          <button 
            onClick={() => setShowInviteModal(true)}
            style={{ 
              backgroundColor: '#6366F1', color: '#111827', border: 'none', 
              padding: '0.625rem 1.25rem', borderRadius: '8px', 
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              display: 'inline-block'
            }}
          >
            + Invite Member
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Members', value: members.length },
            { label: 'Admins', value: members.filter(m => m.role === 'admin' || m.role === 'owner').length },
            { label: 'Active', value: members.length },
            { label: 'Pending Invites', value: invitations.length }
          ].map((stat, idx) => (
            <div key={idx} style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '12px', minHeight: '90px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginBottom: '0.25rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '8px', padding: '0 1rem', display: 'flex', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', border: 'none', outline: 'none', padding: '0.875rem 0', fontSize: '0.875rem', color: '#374151' }}
            />
          </div>
          <select 
            style={{ width: '140px', backgroundColor: 'white', border: 'none', borderRadius: '8px', padding: '0 1rem', outline: 'none', fontSize: '0.875rem', color: '#374151', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23374151%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All roles</option>
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
          </select>
        </div>

        {/* List Container */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '1.5rem', minHeight: '300px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#E5E7EB', marginBottom: '0.35rem' }}>Workspace Members</h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>People who currently have access to TeamFlow.</p>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#9CA3AF', marginTop: '1rem' }}>
              {filteredMembers.length} members
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredMembers.map((member, index) => (
              <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 0', borderTop: index === 0 ? '1px solid #F3F4F6' : '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                    {member.email}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <span style={{ padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #E5E7EB', color: '#374151', textTransform: 'capitalize' }}>
                    {member.role}
                  </span>
                  
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#10B981', fontWeight: 500 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} /> Active
                  </span>

                  <div style={{ width: '60px', textAlign: 'right' }}>
                    {member.role === 'owner' ? (
                      <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Protected</span>
                    ) : canManage ? (
                      <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                        <span style={{ fontSize: '0.875rem', color: '#6366F1', cursor: 'pointer', fontWeight: 500 }} onClick={(e) => {
                          const menu = e.currentTarget.nextElementSibling as HTMLElement;
                          if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                        }}>Manage</span>
                        <div className="dropdown-menu" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '0.5rem', minWidth: '150px', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                          {member.role === 'member' && <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => changeRole(member.id, 'admin')}>Promote to Admin</button>}
                          {member.role === 'admin' && <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => changeRole(member.id, 'member')}>Demote to Member</button>}
                          <div style={{ height: '1px', backgroundColor: '#E5E7EB', margin: '0.25rem 0' }} />
                          <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', fontSize: '0.875rem' }} onClick={() => setShowRemoveConfirm(member.id)}>Remove</button>
                        </div>
                      </div>
                    ) : <span style={{ fontSize: '0.875rem', color: 'transparent' }}>Manage</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Invitations */}
        {invitations.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', marginTop: '2rem', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Pending Invitations</h3>
                <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>Invitations waiting to be accepted.</p>
              </div>
            </div>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                    <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation, index) => (
                    <tr key={invitation.id} style={{ borderBottom: index === invitations.length - 1 ? 'none' : '1px solid #E5E7EB' }}>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#111827', fontWeight: 500 }}>
                        {invitation.email}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#374151', textTransform: 'capitalize' }}>
                        {invitation.role}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#D97706', fontWeight: 500 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#D97706' }} />
                          Pending
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                          <button onClick={() => {
                            navigator.clipboard.writeText(`http://localhost:5173/accept-invite?token=${invitation.token}`);
                            alert('Invite link copied to clipboard!');
                          }} style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Copy Link</button>
                          <button onClick={() => resendInvite(invitation.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Resend</button>
                          <button onClick={() => cancelInvite(invitation.id)} style={{ padding: '0.375rem 0.75rem', borderRadius: '6px', border: '1px solid #E5E7EB', background: 'white', fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer', color: '#DC2626' }}>Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modals */}
        {showInviteModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', color: '#111827' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invite Member</h2>
                <button onClick={() => setShowInviteModal(false)} style={{ color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
              </div>
              
              {inviteError && (
                <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  {inviteError}
                </div>
              )}
              
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
                    <input
                      type="email"
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="colleague@example.com"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none' }}
                    />
                  </div>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
                  <select 
                    style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', outline: 'none', backgroundColor: 'white' }}
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 500, cursor: 'pointer' }} onClick={() => setShowInviteModal(false)}>Cancel</button>
                  <button type="submit" style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: 'none', background: '#6366F1', color: 'white', fontWeight: 500, cursor: 'pointer' }}>Send Invite</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Remove Confirm Modal */}
        {showRemoveConfirm && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', textAlign: 'center', color: '#111827' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FEE2E2', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <X size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Remove this member?</h2>
              <p style={{ color: '#6B7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                They will lose access to this workspace and its projects. This action cannot be undone.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: '1px solid #E5E7EB', background: 'white', fontWeight: 500, cursor: 'pointer' }} onClick={() => setShowRemoveConfirm(null)}>Cancel</button>
                <button style={{ padding: '0.625rem 1rem', borderRadius: '8px', border: 'none', background: '#DC2626', color: 'white', fontWeight: 500, cursor: 'pointer' }} onClick={() => removeMember(showRemoveConfirm)}>Remove Member</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
