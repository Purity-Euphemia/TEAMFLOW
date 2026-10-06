import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, CheckSquare, Clock, CheckCircle2, 
  AlertCircle, ChevronRight, X
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  project_name: string | null;
  assignee_name: string;
  priority: string;
  status: string;
  due_date: string | null;
  updated_at: string;
}

interface Project {
  id: number;
  name: string;
}

interface WorkspaceMember {
  id: number;
  name: string;
}

export default function TasksPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterProject, setFilterProject] = useState('All');
  const [filterDue, setFilterDue] = useState('All');

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formStatus, setFormStatus] = useState('To Do');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');

  // Dropdown data
  const [projects, setProjects] = useState<Project[]>([]);
  const [workspaceMembers, setWorkspaceMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('http://localhost:5000/api/tasks', {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const json = await res.json();
      setTasks(json.tasks || []);
    } catch (err: any) {
      console.error(err);
      setError('Unable to load your tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [projRes, memRes] = await Promise.all([
        fetch('http://localhost:5000/api/projects', { credentials: 'include' }),
        fetch('http://localhost:5000/api/workspaces/members', { credentials: 'include' })
      ]);
      
      if (projRes.ok) {
        const json = await projRes.json();
        setProjects(json.projects || []);
      }
      if (memRes.ok) {
        const json = await memRes.json();
        setWorkspaceMembers(json.members || []);
      }
    } catch (err) {
      console.error("Failed to fetch metadata");
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchMetadata();
  }, []);

  const openCreateModal = () => {
    setModalMode('create');
    setEditId(null);
    setFormTitle('');
    setFormDesc('');
    setFormProjectId('');
    setFormPriority('Medium');
    setFormStatus('To Do');
    setFormDueDate('');
    setFormAssigneeId(user?.id?.toString() || '');
    setShowModal(true);
  };

  const openEditModal = (t: Task) => {
    // In this simple implementation, we don't have task description in GET /tasks
    // but the backend does send it now!
    setModalMode('edit');
    setEditId(t.id);
    setFormTitle(t.title);
    setFormDesc(t.description || '');
    setFormProjectId(t.project_id ? t.project_id.toString() : '');
    setFormPriority(t.priority);
    setFormStatus(t.status);
    setFormDueDate(t.due_date ? t.due_date.split('T')[0] : '');
    setFormAssigneeId(''); // We might not have the assignee ID in the task model from GET, just assignee_name. We'd need to map it if we want to change it. For now, we'll just send empty to keep current if not provided.
    
    // Attempt to map assignee ID
    const member = workspaceMembers.find(m => m.name === t.assignee_name);
    if (member) setFormAssigneeId(member.id.toString());

    setShowModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle,
      description: formDesc,
      project_id: formProjectId ? parseInt(formProjectId) : null,
      priority: formPriority,
      status: formStatus,
      due_date: formDueDate ? new Date(formDueDate).toISOString() : null,
      assignee_id: formAssigneeId ? parseInt(formAssigneeId) : null,
    };

    try {
      const url = modalMode === 'create' 
        ? 'http://localhost:5000/api/tasks' 
        : `http://localhost:5000/api/tasks/${editId}`;
      const method = modalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        setShowModal(false);
        fetchTasks();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Failed');
    } catch (err) {
      console.error(err);
      setTasks(previousTasks);
      alert('Unable to update task status. Please try again.');
    }
  };

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'Done' || task.status === 'completed' ? 'To Do' : 'Done';
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Optimistic UI update
        setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'Done' || task.status === 'completed') return false;
    if (!task.due_date) return false;
    return new Date(task.due_date).getTime() < new Date().getTime();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'hsl(var(--text-muted))';
      case 'High': return 'hsl(var(--warning))';
      case 'Urgent': return 'hsl(var(--danger))';
      case 'Medium':
      default: return 'hsl(var(--accent-primary))';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'To Do': 
      case 'todo': return 'hsl(var(--text-muted))';
      case 'In Progress': return 'hsl(var(--accent-primary))';
      case 'Review': return 'hsl(var(--warning))';
      case 'Done': 
      case 'completed': return 'hsl(var(--success))';
      default: return 'hsl(var(--text-muted))';
    }
  };

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done' || t.status === 'completed').length;
  const openTasks = totalTasks - completedTasks;
  const overdueTasks = tasks.filter(isOverdue).length;

  // Filter logic
  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== 'All') {
      if (filterStatus === 'To Do' && t.status !== 'To Do' && t.status !== 'todo') return false;
      if (filterStatus === 'Done' && t.status !== 'Done' && t.status !== 'completed') return false;
      if (filterStatus !== 'To Do' && filterStatus !== 'Done' && t.status !== filterStatus) return false;
    }
    
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    
    if (filterProject !== 'All' && t.project_id?.toString() !== filterProject) return false;
    
    if (filterDue !== 'All') {
      if (filterDue === 'Overdue' && !isOverdue(t)) return false;
      if (filterDue === 'Today') {
        if (!t.due_date) return false;
        const due = new Date(t.due_date);
        const today = new Date();
        if (due.toDateString() !== today.toDateString()) return false;
      }
      if (filterDue === 'This Week') {
        if (!t.due_date) return false;
        const due = new Date(t.due_date).getTime();
        const now = new Date().getTime();
        const week = 7 * 24 * 60 * 60 * 1000;
        if (due < now || due > now + week) return false;
      }
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = (t.description || '').toLowerCase().includes(q);
      const matchProj = (t.project_name || '').toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchProj) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckSquare size={28} style={{ color: 'hsl(var(--accent-primary))' }} />
            My Tasks
          </h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>
            Stay on top of your work and keep your tasks moving forward.
          </p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={openCreateModal} style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> New Task
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'TOTAL TASKS', value: totalTasks, icon: CheckSquare, color: 'var(--text-primary)' },
          { label: 'OPEN TASKS', value: openTasks, icon: CheckCircle2, color: 'var(--accent-primary)' },
          { label: 'COMPLETED', value: completedTasks, icon: CheckCircle2, color: 'var(--success)' },
          { label: 'OVERDUE', value: overdueTasks, icon: AlertCircle, color: 'var(--danger)' }
        ].map((stat, idx) => (
          <div key={idx} className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>{stat.label}</span>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `hsla(${stat.color}, 0.1)`, color: `hsl(${stat.color})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={18} />
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div className="glass" style={{ padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', borderRadius: '9999px', border: '1px solid hsl(var(--border-subtle))', outline: 'none', fontSize: '0.875rem' }} 
          />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Done">Done</option>
          </select>
          
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="filter-select">
            <option value="All">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select value={filterDue} onChange={(e) => setFilterDue(e.target.value)} className="filter-select">
            <option value="All">Any Due Date</option>
            <option value="Today">Due Today</option>
            <option value="This Week">Due This Week</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[1,2,3,4,5].map(i => <div key={i} style={{ height: '70px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'hsl(var(--danger))' }}>
          <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
          <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-primary" onClick={fetchTasks}>Retry</button>
        </div>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed hsl(var(--border-subtle))' }}>
          <CheckSquare size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--text-muted))' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>You're all caught up 🎉</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>You don't have any tasks assigned to you yet.</p>
          <button className="btn btn-primary" onClick={openCreateModal}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Task
          </button>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem' }}>
          <Search size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--text-muted))' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No tasks found</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Try changing your filters or search term.</p>
          <button className="btn btn-secondary" onClick={() => { setSearchTerm(''); setFilterStatus('All'); setFilterPriority('All'); setFilterProject('All'); setFilterDue('All'); }}>Clear Filters</button>
        </div>
      ) : (
        <div className="glass" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: 'hsla(var(--bg-tertiary), 0.5)', borderBottom: '1px solid hsl(var(--border-subtle))', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: 'hsl(var(--text-muted))', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '1rem 1.5rem', width: '40px' }}></th>
                  <th style={{ padding: '1rem 1.5rem' }}>Task</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Project</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Priority</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem' }}>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => {
                  const isDone = task.status === 'Done' || task.status === 'completed';
                  const overdue = isOverdue(task);
                  
                  return (
                    <tr key={task.id} style={{ borderBottom: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white', transition: 'background-color 0.2s' }} className="task-row">
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div 
                          onClick={() => handleToggleComplete(task)}
                          style={{ 
                            width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${isDone ? 'hsl(var(--success))' : 'hsl(var(--border-focus))'}`, 
                            backgroundColor: isDone ? 'hsl(var(--success))' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            color: 'white'
                          }}
                        >
                          {isDone && <CheckCircle2 size={14} />}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div 
                          style={{ fontWeight: 500, color: 'hsl(var(--text-primary))', cursor: 'pointer', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.6 : 1 }}
                          onClick={() => openEditModal(task)}
                        >
                          {task.title}
                        </div>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
                        {task.project_name ? (
                           <span style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${task.project_id}`)}>{task.project_name}</span>
                        ) : 'No Project'}
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '9999px',
                          color: getPriorityColor(task.priority), backgroundColor: `hsla(from ${getPriorityColor(task.priority)} h s l / 0.1)`
                        }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <select
                          value={task.status === 'completed' ? 'Done' : task.status === 'todo' ? 'To Do' : task.status}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                          style={{
                            fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.5rem', borderRadius: '9999px',
                            color: getStatusColor(task.status), backgroundColor: `hsla(from ${getStatusColor(task.status)} h s l / 0.1)`,
                            border: '1px solid transparent', outline: 'none', cursor: 'pointer', appearance: 'none', textAlign: 'center'
                          }}
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Review">Review</option>
                          <option value="Done">Done</option>
                        </select>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem' }}>
                        {task.due_date ? (
                          <span style={{ 
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            color: overdue ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))',
                            fontWeight: overdue ? 600 : 400
                          }}>
                            {overdue && <AlertCircle size={14} />}
                            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            {overdue && ' (Overdue)'}
                          </span>
                        ) : (
                          <span style={{ color: 'hsl(var(--text-muted))' }}>No date</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{modalMode === 'create' ? 'New Task' : 'Edit Task'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'hsl(var(--text-muted))' }}><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSaveTask} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Task Title *</label>
                <input 
                  type="text" 
                  value={formTitle} 
                  onChange={e => setFormTitle(e.target.value)} 
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Project *</label>
                  <select 
                    value={formProjectId} 
                    onChange={e => setFormProjectId(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option value="" disabled>Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Assignee</label>
                  <select 
                    value={formAssigneeId} 
                    onChange={e => setFormAssigneeId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option value="">Unassigned</option>
                    {workspaceMembers.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option>To Do</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Done</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Priority</label>
                  <select 
                    value={formPriority} 
                    onChange={e => setFormPriority(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Due Date</label>
                  <input 
                    type="date" 
                    value={formDueDate} 
                    onChange={e => setFormDueDate(e.target.value)} 
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))' }} 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{modalMode === 'create' ? 'Create Task' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .filter-select {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid hsl(var(--border-subtle));
          background-color: white;
          font-size: 0.875rem;
          outline: none;
          cursor: pointer;
        }
        .task-row:hover {
          background-color: hsl(var(--bg-secondary)) !important;
        }
      `}} />
    </div>
  );
}
