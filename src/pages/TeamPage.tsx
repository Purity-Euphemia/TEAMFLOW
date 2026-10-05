import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
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
      const res = await fetch(`/api/workspaces/members?workspace_id=${currentWorkspace.id}`, {credentials: 'include'});
      if (!res.ok) throw new Error('Failed to load team members');
      const data = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {credentials: 'include'});
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
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations`, {
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
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/invitations/${id}`, {
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

  const changeRole = async (memberId: number, newRole: string) => {
    if (!currentWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
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
      const res = await fetch(`/api/workspaces/${currentWorkspace.id}/members/${memberId}`, {
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
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>Team</h1>
            <p style={{ color: 'hsl(var(--text-secondary))' }}>Manage your workspace members, roles, and invitations.</p>
          </div>
          {canManage && (
            <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Invite Member
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>Total Members</h3>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{members.length}</span>
          </div>
          <div className="glass" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>Admins</h3>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{members.filter(m => m.role === 'admin' || m.role === 'owner').length}</span>
          </div>
          <div className="glass" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>Active</h3>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{members.length}</span>
          </div>
          <div className="glass" style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>Pending Invites</h3>
            <span style={{ fontSize: '2rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{invitations.length}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="input-group" style={{ flex: 1, backgroundColor: 'white', borderRadius: 'var(--radius-md)', border: 'none', boxShadow: 'var(--shadow-sm)' }}>
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '1rem', border: 'none', backgroundColor: 'transparent' }}
            />
          </div>
          <select 
            className="input-field" 
            style={{ width: '150px', backgroundColor: 'white', border: 'none', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-sm)' }}
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option>All roles</option>
            <option>Owner</option>
            <option>Admin</option>
            <option>Member</option>
          </select>
        </div>

        {loading ? (
          <div>Loading team...</div>
        ) : error ? (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', borderRadius: 'var(--radius-lg)' }}>
            <p>{error}</p>
            <button className="btn btn-secondary" onClick={fetchTeam} style={{ marginTop: '1rem' }}>Retry</button>
          </div>
        ) : members.length === 1 && invitations.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your team is just getting started.</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Invite teammates to start collaborating.</p>
            {canManage && (
              <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                <Plus size={18} style={{ marginRight: '0.5rem' }} /> Invite Member
              </button>
            )}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="glass" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: 'var(--radius-lg)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>No team members found.</h3>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Try another name or email.</p>
            <button className="btn btn-secondary" onClick={() => setSearchTerm('')}>Clear Search</button>
          </div>
        ) : (
          <div className="glass" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>Workspace Members</h2>
                <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginTop: '0.25rem' }}>People who currently have access to TeamFlow.</p>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                {filteredMembers.length} members
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredMembers.map((member, index) => (
                <div key={member.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderTop: index === 0 ? '1px solid hsl(var(--border-subtle))' : '1px solid hsl(var(--border-subtle))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'hsl(var(--bg-tertiary))', color: 'hsl(var(--text-primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem' }}>
                      {member.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2)}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>{member.email}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    {getRoleBadge(member.role)}
                    
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'hsl(142, 70%, 40%)', fontWeight: 500 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'currentColor' }} /> Active
                    </span>

                    <div style={{ width: '80px', textAlign: 'right' }}>
                      {member.role === 'owner' ? (
                        <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>Protected</span>
                      ) : canManage ? (
                        <div className="dropdown" style={{ position: 'relative', display: 'inline-block' }}>
                          <span style={{ fontSize: '0.875rem', color: 'hsl(240, 80%, 60%)', cursor: 'pointer', fontWeight: 500 }} onClick={(e) => {
                            const menu = e.currentTarget.nextElementSibling as HTMLElement;
                            if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                          }}>Manage</span>
                          <div className="dropdown-menu" style={{ display: 'none', position: 'absolute', right: 0, top: '100%', backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', padding: '0.5rem', minWidth: '150px', zIndex: 10, boxShadow: 'var(--shadow-md)' }}>
                            {member.role === 'member' && <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => changeRole(member.id, 'admin')}>Promote to Admin</button>}
                            {member.role === 'admin' && <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }} onClick={() => changeRole(member.id, 'member')}>Demote to Member</button>}
                            <div style={{ height: '1px', backgroundColor: 'hsl(var(--border-subtle))', margin: '0.25rem 0' }} />
                            <button className="btn" style={{ width: '100%', textAlign: 'left', padding: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--danger))', fontSize: '0.875rem' }} onClick={() => setShowRemoveConfirm(member.id)}>Remove</button>
                          </div>
                        </div>
                      ) : <span style={{ fontSize: '0.875rem', color: 'transparent' }}>Manage</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Invites */}
        {invitations.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Pending Invitations</h3>
            <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ backgroundColor: 'hsla(var(--bg-secondary), 0.5)', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Email</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Role</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Invited By</th>
                    {canManage && <th style={{ padding: '1rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase' }}>Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {invitations.map(inv => (
                    <tr key={inv.id} style={{ borderBottom: '1px solid hsl(var(--border-subtle))' }}>
                      <td style={{ padding: '1rem', fontWeight: 500 }}>{inv.email}</td>
                      <td style={{ padding: '1rem' }}>{getRoleBadge(inv.role)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>{inv.inviter_name}</td>
                      {canManage && (
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button className="btn btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem', color: 'hsl(var(--danger))', borderColor: 'hsl(var(--border-subtle))' }} onClick={() => cancelInvite(inv.id)}>Cancel</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Invite Member</h2>
              <button onClick={() => setShowInviteModal(false)} style={{ color: 'hsl(var(--text-muted))', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>
            
            {inviteError && (
              <div style={{ backgroundColor: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {inviteError}
              </div>
            )}
            
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
                <div className="input-group">
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="input-field"
                    style={{ paddingLeft: '2.75rem' }}
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Role</label>
                <select 
                  className="input-field"
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirm Modal */}
      {showRemoveConfirm && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'hsla(var(--danger), 0.1)', color: 'hsl(var(--danger))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <X size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Remove this member?</h2>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              They will lose access to this workspace and its projects. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowRemoveConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'hsl(var(--danger))', color: 'white', borderColor: 'hsl(var(--danger))' }} onClick={() => removeMember(showRemoveConfirm)}>Remove Member</button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
