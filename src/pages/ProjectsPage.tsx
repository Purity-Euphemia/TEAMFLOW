import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, FolderKanban, MoreVertical, Calendar, 
  Users, AlertCircle, CheckCircle2, ChevronRight, X
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date: string | null;
  deadline: string | null;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  members: { id: number; name: string; email: string }[];
  updated_at: string;
}

interface WorkspaceMember {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function ProjectsPage() {
  const { user } = useAuth();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Form states
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formStatus, setFormStatus] = useState('Planning');
  const [formStart, setFormStart] = useState('');
  const [formDeadline, setFormDeadline] = useState('');
  const [formMembers, setFormMembers] = useState<number[]>([]);
  
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);
  
  // Archiving
  const [showArchiveConfirm, setShowArchiveConfirm] = useState<number | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/projects', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch projects');
      const json = await res.json();
      setProjects(json.projects || []);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load projects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/workspaces/members', {
        credentials: 'include'
      });
      if (res.ok) {
        const json = await res.json();
        setWorkspaceMembers(json.members || []);
      }
    } catch (err) {
      console.error("Failed to fetch workspace members");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditId(null);
    setFormName('');
    setFormDesc('');
    setFormStatus('Planning');
    setFormStart('');
    setFormDeadline('');
    setFormMembers([]);
    setShowModal(true);
  };

  const openEditModal = (p: Project) => {
    setModalMode('edit');
    setEditId(p.id);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormStatus(p.status);
    setFormStart(p.start_date ? p.start_date.split('T')[0] : '');
    setFormDeadline(p.deadline ? p.deadline.split('T')[0] : '');
    setFormMembers(p.members.map(m => m.id));
    setShowModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;
    
    const payload = {
      name: formName,
      description: formDesc,
      status: formStatus,
      start_date: formStart ? new Date(formStart).toISOString() : null,
      deadline: formDeadline ? new Date(formDeadline).toISOString() : null,
      members: formMembers
    };

    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:5000/api/projects' 
        : `http://localhost:5000/api/projects/${editId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchProjects();
      } else {
        console.error("Failed to save project");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/projects/${id}/archive`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        setShowArchiveConfirm(null);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const toggleMemberSelection = (id: number) => {
    if (formMembers.includes(id)) {
      setFormMembers(formMembers.filter(m => m !== id));
    } else {
      setFormMembers([...formMembers, id]);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Planning': return 'hsl(var(--text-muted))';
      case 'Active': return 'hsl(var(--accent-primary))';
      case 'On Hold': return 'hsl(var(--warning))';
      case 'Completed': return 'hsl(var(--success))';
      case 'Archived': return 'hsl(var(--text-muted))';
      default: return 'hsl(var(--text-muted))';
    }
  };

  // Filter and Search logic
  const filteredProjects = projects.filter(p => {
    if (filterStatus !== 'All' && p.status !== filterStatus) {
      // If filtering by anything other than Archived, don't show Archived
      if (filterStatus !== 'Archived' && p.status === 'Archived') return false;
      return false;
    }
    // If 'All' is selected, don't show Archived unless specifically searched? Or just show all non-archived.
    if (filterStatus === 'All' && p.status === 'Archived') return false;
    
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !(p.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FolderKanban size={28} style={{ color: 'hsl(var(--accent-primary))' }} />
            Projects
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>
            Manage your team's projects, track progress, and keep work moving forward.
          </p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Project
          </button>
        </div>
      </div>

      {/* Toolbar: Search and Filters */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem 0.6rem 2.5rem',
              borderRadius: '9999px',
              border: '1px solid hsl(var(--border-subtle))',
              backgroundColor: 'white',
              outline: 'none',
              fontSize: '0.875rem'
            }} 
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }}>
              <X size={14} />
            </button>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>Status:</span>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border-subtle))',
              backgroundColor: 'white',
              fontSize: '0.875rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="All">All Active</option>
            <option value="Planning">Planning</option>
            <option value="Active">Active</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3].map(i => <div key={i} style={{ height: '240px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'hsl(var(--danger))' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchProjects}>Retry</button>
        </div>
      ) : projects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed hsl(var(--border-subtle))' }}>
          <FolderKanban size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--text-muted))' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No projects yet</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Create your first project to start organizing your team's work.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Project
          </button>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--text-muted))' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No projects found</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Try a different search term or clear your filters.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setFilterStatus('All'); }}>Clear Filters</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {filteredProjects.map(proj => (
            <div key={proj.id} className="glass" style={{ 
              backgroundColor: 'white', 
              borderRadius: 'var(--radius-lg)', 
              padding: '1.5rem',
              display: 'flex', flexDirection: 'column', gap: '1.25rem',
              border: '1px solid hsl(var(--border-subtle))',
              position: 'relative'
            }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem', color: 'hsl(var(--text-primary))' }}>{proj.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {proj.description || 'No description provided.'}
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', 
                    borderRadius: '9999px', textTransform: 'uppercase',
                    backgroundColor: `hsla(from ${getStatusColor(proj.status)} h s l / 0.1)`,
                    color: getStatusColor(proj.status)
                  }}>
                    {proj.status}
                  </span>
                  
                  {/* Action Menu (Simple dropdown implementation for now) */}
                  <div className="dropdown" style={{ position: 'relative' }}>
                    <button style={{ color: 'hsl(var(--text-muted))', padding: '0.25rem' }} onClick={(e) => {
                      const menu = e.currentTarget.nextElementSibling as HTMLElement;
                      if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                    }}>
                      <MoreVertical size={16} />
                    </button>
                    <div style={{ 
                      display: 'none', position: 'absolute', right: 0, top: '100%', 
                      backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))',
                      borderRadius: 'var(--radius-md)', padding: '0.5rem 0', minWidth: '120px',
                      boxShadow: 'var(--shadow-md)', zIndex: 10
                    }}>
                      <button style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => window.location.href = `/project.html?id=${proj.id}`}>Open</button>
                      <button style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => openEditModal(proj)}>Edit</button>
                      {proj.status !== 'Archived' && (
                        <button style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'hsl(var(--danger))' }} onClick={() => setShowArchiveConfirm(proj.id)}>Archive</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>Progress</span>
                  <span style={{ fontWeight: 600 }}>{proj.progress}%</span>
                </div>
                <div style={{ height: '8px', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${proj.progress}%`, backgroundColor: 'hsl(var(--accent-primary))', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
                </div>
              </div>

              {/* Meta info */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <CheckCircle2 size={14} />
                  <span>{proj.completed_tasks} / {proj.total_tasks > 0 ? proj.total_tasks : 0} tasks</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <Calendar size={14} />
                  <span>{proj.deadline ? `Due ${new Date(proj.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : 'No deadline'}</span>
                </div>
              </div>

              {/* Members Footer */}
              <div style={{ borderTop: '1px solid hsl(var(--border-subtle))', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {proj.members.slice(0, 3).map((m, i) => (
                    <div key={m.id} style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', 
                      color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', 
                      fontWeight: 600, border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0' 
                    }} title={m.name}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {proj.members.length > 3 && (
                    <div style={{ 
                      width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'hsl(var(--bg-tertiary))', 
                      color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', 
                      fontWeight: 600, border: '2px solid white', marginLeft: '-8px' 
                    }}>
                      +{proj.members.length - 3}
                    </div>
                  )}
                  {proj.members.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>No members</span>
                  )}
                </div>
                
                <button 
                  className="btn btn-secondary" 
                  onClick={() => window.location.href = `/project.html?id=${proj.id}`}
                  style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'hsl(var(--bg-tertiary))', border: 'none' }}
                >
                  Open Project
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Archive Confirmation Modal */}
      {showArchiveConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'hsl(var(--danger))' }}>Archive Project?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--text-secondary))' }}>
              Archived projects will no longer appear in active project views. You can restore them later if needed.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowArchiveConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'hsl(var(--danger))', color: 'white', border: 'none' }} onClick={() => handleArchive(showArchiveConfirm)}>Archive Project</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{modalMode === 'create' ? 'New Project' : 'Edit Project'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'hsl(var(--text-muted))' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Project Name *</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={e => setFormName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} 
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Description</label>
                <textarea 
                  value={formDesc} 
                  onChange={e => setFormDesc(e.target.value)} 
                  rows={3}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', resize: 'vertical' }} 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option>Planning</option>
                    <option>Active</option>
                    <option>On Hold</option>
                    <option>Completed</option>
                    <option>Archived</option>
                  </select>
                </div>
                <div />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Start Date</label>
                  <input 
                    type="date" 
                    value={formStart} 
                    onChange={e => setFormStart(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Deadline</label>
                  <input 
                    type="date" 
                    value={formDeadline} 
                    onChange={e => setFormDeadline(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} 
                  />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Project Members</label>
                <div style={{ border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', padding: '0.5rem', maxHeight: '150px', overflowY: 'auto', backgroundColor: 'hsl(var(--bg-secondary))' }}>
                  {workspaceMembers.length > 0 ? workspaceMembers.map(member => (
                    <label key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', cursor: 'pointer', borderRadius: 'var(--radius-sm)', transition: 'background-color 0.2s' }} className="hover-bg">
                      <input 
                        type="checkbox" 
                        checked={formMembers.includes(member.id)}
                        onChange={() => toggleMemberSelection(member.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600 }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.875rem' }}>{member.name}</span>
                    </label>
                  )) : (
                    <div style={{ padding: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>No workspace members found.</div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modalMode === 'create' ? 'Create Project' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        .hover-bg:hover { background-color: hsl(var(--bg-tertiary)); }
      `}} />
    </div>
  );
}
