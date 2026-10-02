import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, UserPlus, LayoutDashboard, CheckCircle2, AlertCircle, Clock, 
  Folder, Calendar, ChevronRight, Activity, Bell, Users, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  // Modals state
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Form states
  const [wsName, setWsName] = useState('');
  const [projName, setProjName] = useState('');
  const [projDeadline, setProjDeadline] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskProjectId, setTaskProjectId] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/dashboard', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsName) return;
    try {
      const res = await fetch('http://localhost:5000/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: wsName })
      });
      if (res.ok) {
        setShowWorkspaceModal(false);
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName) return;
    try {
      const res = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          workspace_id: data.workspace.id,
          name: projName,
          deadline: projDeadline ? new Date(projDeadline).toISOString() : null
        })
      });
      if (res.ok) {
        setShowProjectModal(false);
        setProjName('');
        setProjDeadline('');
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    try {
      const res = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          workspace_id: data.workspace.id,
          project_id: taskProjectId || null,
          title: taskTitle,
          priority: taskPriority,
          due_date: taskDueDate ? new Date(taskDueDate).toISOString() : null
        })
      });
      if (res.ok) {
        setShowTaskModal(false);
        setTaskTitle('');
        setTaskPriority('Medium');
        setTaskProjectId('');
        setTaskDueDate('');
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete`, {
        method: 'POST',
        credentials: 'include'
      });
      if (res.ok) {
        fetchDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'low': return 'hsl(var(--text-muted))';
      case 'high': return 'hsl(var(--warning))';
      case 'urgent': return 'hsl(var(--danger))';
      default: return 'hsl(var(--accent-primary))';
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ height: '80px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '120px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
        <style dangerouslySetInnerHTML={{__html: `@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 0.3; } 100% { opacity: 0.6; } }`}} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 0' }}>
        <AlertCircle size={48} style={{ color: 'hsl(var(--danger))', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{error}</h2>
        <button onClick={fetchDashboard} className="btn btn-primary" style={{ marginTop: '1rem' }}>Retry</button>
      </div>
    );
  }

  const renderModal = (title: string, show: boolean, onClose: () => void, children: React.ReactNode) => {
    if (!show) return null;
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="glass" style={{
          backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)',
          width: '100%', maxWidth: '400px', position: 'relative'
        }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', color: 'hsl(var(--text-muted))' }}>
            <X size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>{title}</h2>
          {children}
        </div>
      </div>
    );
  };

  if (!data?.has_workspace) {
    return (
      <>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 0' }}>
          <div style={{ width: '80px', height: '80px', background: 'hsla(var(--accent-primary), 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'hsl(var(--accent-primary))' }}>
            <LayoutDashboard size={40} />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textAlign: 'center' }}>Welcome to TeamFlow 👋</h1>
          <p style={{ color: 'hsl(var(--text-secondary))', textAlign: 'center', maxWidth: '400px', marginBottom: '2rem' }}>
            Your workspace is ready to be created. Create a workspace to start organizing your projects and collaborating with your team.
          </p>
          <button className="btn btn-primary" onClick={() => setShowWorkspaceModal(true)}>Create Workspace</button>
        </div>

        {renderModal('Create Workspace', showWorkspaceModal, () => setShowWorkspaceModal(false), (
          <form onSubmit={handleCreateWorkspace} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Workspace Name</label>
              <input type="text" value={wsName} onChange={(e) => setWsName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create</button>
          </form>
        ))}
      </>
    );
  }

  const { workspace, stats, projects, my_tasks, upcoming_deadlines, recent_activity, notifications, team_members } = data;
  const firstName = user?.full_name?.split(' ')[0] || 'User';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>{getGreeting()}, {firstName} 👋</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Here's what's happening with <span style={{ fontWeight: 600 }}>{workspace.name}</span> today.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {(workspace.role === 'owner' || workspace.role === 'admin') && (
            <button className="btn btn-secondary" onClick={() => setShowProjectModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Project
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Task
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'ACTIVE PROJECTS', value: stats.active_projects, icon: Folder, color: 'var(--accent-primary)' },
          { label: 'MY OPEN TASKS', value: stats.my_open_tasks, icon: CheckCircle2, color: 'var(--accent-primary)' },
          { label: 'COMPLETED TASKS', value: stats.completed_tasks, icon: CheckCircle2, color: 'var(--success)' },
          { label: 'OVERDUE TASKS', value: stats.overdue_tasks, icon: AlertCircle, color: 'var(--danger)' }
        ].map((kpi, idx) => (
          <div key={idx} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>{kpi.label}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `hsla(${kpi.color}, 0.1)`, color: `hsl(${kpi.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <kpi.icon size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{kpi.value || 0}</div>
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.125rem' }}>My Tasks</h2>
            </div>
            {my_tasks?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {my_tasks.map((task: any) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'hsl(var(--bg-secondary))' }}>
                    <button 
                      onClick={() => task.status !== 'completed' && handleCompleteTask(task.id)}
                      style={{ color: task.status === 'completed' ? 'hsl(var(--success))' : 'hsl(var(--border-focus))', marginTop: '0.125rem', cursor: task.status === 'completed' ? 'default' : 'pointer' }}
                    >
                      <CheckCircle2 size={20} />
                    </button>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem', textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}>{task.title}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                        <span>{task.project_name}</span>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'hsl(var(--border-subtle))' }}></span>
                        <span style={{ color: getPriorityColor(task.priority), fontWeight: 500 }}>{task.priority}</span>
                        {task.due_date && (
                          <>
                            <span style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'hsl(var(--border-subtle))' }}></span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={12} /> {new Date(task.due_date).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <CheckCircle2 size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>You're all caught up!</p>
              </div>
            )}
          </section>

          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Project Progress</h2>
            {projects?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {projects.map((proj: any) => (
                  <div key={proj.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{proj.name}</div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{proj.progress}%</div>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '9999px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${proj.progress}%`, backgroundColor: 'hsl(var(--accent-primary))', borderRadius: '9999px' }}></div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>
                      <span>{proj.total_tasks > 0 ? `${proj.total_tasks} tasks` : 'No tasks yet'}</span>
                      {proj.deadline && <span>Due {new Date(proj.deadline).toLocaleDateString()}</span>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Folder size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No active projects</p>
              </div>
            )}
          </section>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Upcoming Deadlines</h2>
            {upcoming_deadlines?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {upcoming_deadlines.map((task: any) => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'hsl(var(--bg-tertiary))' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', backgroundColor: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid hsl(var(--border-subtle))' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(var(--danger))', textTransform: 'uppercase' }}>
                        {new Date(task.due_date).toLocaleString('default', { month: 'short' })}
                      </span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                        {new Date(task.due_date).getDate()}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{task.project_name}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Clock size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <div style={{ fontWeight: 500, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>You're all caught up</div>
                <p style={{ fontSize: '0.875rem' }}>No upcoming deadlines.</p>
              </div>
            )}
          </section>

          <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ fontSize: '1.125rem', marginBottom: '1.25rem' }}>Recent Activity</h2>
            {recent_activity?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {recent_activity.map((act: any) => (
                  <div key={act.id} style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                      {act.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                        <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{act.user_name}</span> {act.action} <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{act.target_name}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', marginTop: '0.125rem' }}>
                        {new Date(act.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'hsl(var(--text-muted))' }}>
                <Activity size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
                <p>No recent activity</p>
              </div>
            )}
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Team</h2>
              {team_members?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {team_members.map((member: any) => (
                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                       <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'hsl(var(--text-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 600 }}>
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))', textTransform: 'capitalize' }}>{member.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))' }}>No members found</div>
              )}
            </section>

            <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Notifications</h2>
              {notifications?.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                   {notifications.map((n: any) => (
                    <div key={n.id} style={{ fontSize: '0.875rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <Bell size={14} style={{ color: 'hsl(var(--accent-primary))' }} />
                        <span style={{ fontWeight: 500 }}>{n.type}</span>
                      </div>
                      <div style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {n.message}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-muted))', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '1rem 0' }}>
                   <Bell size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                   No new notifications
                </div>
              )}
            </section>
          </div>

        </div>
      </div>

      {renderModal('New Project', showProjectModal, () => setShowProjectModal(false), (
        <form onSubmit={handleCreateProject} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Project Name</label>
            <input type="text" value={projName} onChange={(e) => setProjName(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Deadline</label>
            <input type="date" value={projDeadline} onChange={(e) => setProjDeadline(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Project</button>
        </form>
      ))}

      {renderModal('New Task', showTaskModal, () => setShowTaskModal(false), (
        <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Task Title</label>
            <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} required style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Project</label>
            <select value={taskProjectId} onChange={(e) => setTaskProjectId(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}>
              <option value="">No Project</option>
              {projects?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Priority</label>
              <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Due Date</label>
              <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Task</button>
        </form>
      ))}
    </div>
  );
}
