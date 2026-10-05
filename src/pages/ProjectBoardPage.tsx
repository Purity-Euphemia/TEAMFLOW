import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Search, Clock, ChevronRight, AlertCircle, X, CheckCircle2, MoreVertical
} from 'lucide-react';

interface Project {
  id: number;
  name: string;
  description: string | null;
  status: string;
  deadline: string | null;
  progress: number;
  total_tasks: number;
  completed_tasks: number;
  members: { id: number; name: string; email: string }[];
}

interface Task {
  id: number;
  title: string;
  description: string | null;
  project_id: number | null;
  assignee_name: string;
  priority: string;
  status: string;
  due_date: string | null;
}

interface WorkspaceMember {
  id: number;
  name: string;
}

const COLUMNS = ['To Do', 'In Progress', 'Review', 'Done'];

export default function ProjectBoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterAssignee, setFilterAssignee] = useState('All');
  const [filterDue, setFilterDue] = useState('All');

  // Drag state
  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editId, setEditId] = useState<number | null>(null);
  
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('Medium');
  const [formStatus, setFormStatus] = useState('To Do');
  const [formDueDate, setFormDueDate] = useState('');
  const [formAssigneeId, setFormAssigneeId] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [projRes, tasksRes, memRes] = await Promise.all([
        fetch(`http://localhost:5000/api/projects/${id}`, { credentials: 'include' }),
        fetch(`http://localhost:5000/api/tasks?project_id=${id}`, { credentials: 'include' }),
        fetch(`http://localhost:5000/api/workspaces/members`, { credentials: 'include' })
      ]);
      
      if (!projRes.ok) throw new Error('Failed to fetch project');
      const projJson = await projRes.json();
      setProject(projJson);
      
      if (tasksRes.ok) {
        const tasksJson = await tasksRes.json();
        // The API might return tasks not mapped strictly if it was old, but we just updated it.
        // It returns all tasks for this project_id.
        setTasks(tasksJson.tasks || []);
      }
      
      if (memRes.ok) {
        const memJson = await memRes.json();
        setMembers(memJson.members || []);
      }
      
    } catch (err: any) {
      console.error(err);
      setError('Unable to load project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id]);

  const openCreateModal = (defaultStatus = 'To Do') => {
    setModalMode('create');
    setEditId(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('Medium');
    setFormStatus(defaultStatus);
    setFormDueDate('');
    setFormAssigneeId(user?.id?.toString() || '');
    setShowModal(true);
  };

  const openEditModal = (t: Task) => {
    setModalMode('edit');
    setEditId(t.id);
    setFormTitle(t.title);
    setFormDesc(t.description || '');
    setFormPriority(t.priority);
    setFormStatus(t.status === 'todo' ? 'To Do' : t.status === 'completed' ? 'Done' : t.status);
    setFormDueDate(t.due_date ? t.due_date.split('T')[0] : '');
    
    const member = members.find(m => m.name === t.assignee_name);
    setFormAssigneeId(member ? member.id.toString() : '');
    
    setShowModal(true);
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const payload = {
      title: formTitle,
      description: formDesc,
      project_id: parseInt(id!),
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
        fetchProjectData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save task");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTaskStatus = async (taskId: number, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const isDone = newStatus === 'Done' || newStatus === 'completed';
    const wasDone = task.status === 'Done' || task.status === 'completed';
    const prevProject = project;
    
    if (isDone !== wasDone && project) {
      const diff = isDone ? 1 : -1;
      const completed_tasks = project.completed_tasks + diff;
      const progress = project.total_tasks > 0 ? Math.floor((completed_tasks / project.total_tasks) * 100) : 0;
      setProject({...project, completed_tasks, progress});
    }

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
      // Revert on failure
      setTasks(previousTasks);
      setProject(prevProject);
      alert('Unable to update task status. Please try again.');
    }
  };

  const handleDeleteTask = async () => {
    if (!showDeleteConfirm) return;
    try {
      const res = await fetch(`http://localhost:5000/api/tasks/${showDeleteConfirm}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        setShowDeleteConfirm(null);
        setShowModal(false);
        fetchProjectData(); // Refetch to update project progress and task list
      } else {
        alert("Permission denied or failed to delete task.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    setDraggingTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    if (draggingTaskId === null) return;
    
    const task = tasks.find(t => t.id === draggingTaskId);
    if (task && task.status !== status) {
      updateTaskStatus(draggingTaskId, status);
    }
    setDraggingTaskId(null);
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

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ height: '120px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[1,2,3,4].map(i => <div key={i} style={{ height: '400px', background: 'hsl(var(--border-subtle))', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />)}
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'hsl(var(--danger))' }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem' }} />
        <p style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>{error || 'Project not found.'}</p>
        <button className="btn btn-primary" onClick={fetchProjectData}>Retry</button>
      </div>
    );
  }

  // Filter tasks
  const filteredTasks = tasks.map(t => ({
    ...t,
    status: t.status === 'todo' ? 'To Do' : t.status === 'completed' ? 'Done' : t.status
  })).filter(t => {
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    
    if (filterAssignee !== 'All') {
      const isUnassigned = filterAssignee === 'Unassigned';
      if (isUnassigned && t.assignee_name !== 'Unassigned') return false;
      if (!isUnassigned) {
        const mem = members.find(m => m.id.toString() === filterAssignee);
        if (mem && t.assignee_name !== mem.name) return false;
      }
    }
    
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
      if (!matchTitle && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
      
      {/* Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
        <Link to="/projects" style={{ color: 'hsl(var(--accent-primary))', textDecoration: 'none' }}>Projects</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'hsl(var(--text-primary))', fontWeight: 500 }}>{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: 'hsl(var(--text-primary))' }}>{project.name}</h1>
            <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1rem', maxWidth: '800px' }}>
              {project.description || 'No description provided.'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <span style={{ 
                fontSize: '0.75rem', fontWeight: 600, padding: '0.25rem 0.6rem', borderRadius: '9999px',
                backgroundColor: 'hsla(var(--accent-primary), 0.1)', color: 'hsl(var(--accent-primary))', textTransform: 'uppercase'
              }}>
                {project.status}
              </span>
              <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={14} />
                {project.deadline ? `Due ${new Date(project.deadline).toLocaleDateString()}` : 'No deadline'}
              </span>
            </div>
          </div>
          
          <div style={{ minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 500 }}>Progress</span>
              <span style={{ fontWeight: 600 }}>{project.total_tasks > 0 ? `${project.completed_tasks} completed / ${project.total_tasks} total (${project.progress}%)` : 'No tasks yet (0%)'}</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '9999px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ height: '100%', width: `${project.progress}%`, backgroundColor: 'hsl(var(--accent-primary))', transition: 'width 0.3s ease' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {project.members.slice(0, 4).map((m, i) => (
                  <div key={m.id} style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', 
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', 
                    fontWeight: 600, border: '2px solid white', marginLeft: i > 0 ? '-8px' : '0' 
                  }} title={m.name}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {project.members.length > 4 && (
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'hsl(var(--bg-tertiary))', 
                    color: 'hsl(var(--text-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', 
                    fontWeight: 600, border: '2px solid white', marginLeft: '-8px' 
                  }}>
                    +{project.members.length - 4}
                  </div>
                )}
                {project.members.length === 0 && (
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>No members</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  Project Settings
                </button>
                <button className="btn btn-primary" onClick={() => openCreateModal()} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                  <Plus size={16} style={{ marginRight: '0.375rem' }} /> Add Task
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid hsl(var(--border-subtle))', paddingBottom: '0.25rem' }}>
        {['Overview', 'Board', 'Tasks', 'Members', 'Activity'].map(tab => (
          <div key={tab} style={{ 
            fontSize: '0.875rem', fontWeight: tab === 'Board' ? 600 : 400, 
            color: tab === 'Board' ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))', 
            cursor: tab === 'Board' ? 'default' : 'pointer', 
            borderBottom: tab === 'Board' ? '2px solid hsl(var(--accent-primary))' : 'none', 
            paddingBottom: '0.5rem', marginBottom: '-0.25rem' 
          }}>
            {tab}
          </div>
        ))}
      </div>

      {/* Filters Toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px', minWidth: '200px', maxWidth: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-muted))' }} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.25rem', borderRadius: '9999px', border: '1px solid hsl(var(--border-subtle))', outline: 'none', fontSize: '0.875rem', backgroundColor: 'white' }} 
          />
        </div>
        
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="filter-select">
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>

        <select value={filterAssignee} onChange={(e) => setFilterAssignee(e.target.value)} className="filter-select">
          <option value="All">All Assignees</option>
          <option value="Unassigned">Unassigned</option>
          {project.members.map(m => (
            <option key={m.id} value={m.id.toString()}>{m.name}</option>
          ))}
        </select>

        <select value={filterDue} onChange={(e) => setFilterDue(e.target.value)} className="filter-select">
          <option value="All">Any Due Date</option>
          <option value="Today">Due Today</option>
          <option value="This Week">Due This Week</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 1rem', backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px dashed hsl(var(--border-subtle))' }}>
          <CheckCircle2 size={48} style={{ margin: '0 auto 1rem', color: 'hsl(var(--text-muted))' }} />
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>This project has no tasks yet.</h2>
          <p style={{ color: 'hsl(var(--text-secondary))', marginBottom: '1.5rem' }}>Start by creating your first task.</p>
          <button className="btn btn-primary" onClick={() => openCreateModal()}>
            <Plus size={16} style={{ marginRight: '0.5rem' }} /> Create Task
          </button>
        </div>
      ) : (
        /* Kanban Board */
        <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }} className="kanban-container">
          {COLUMNS.map(columnStatus => {
            const columnTasks = filteredTasks.filter(t => t.status === columnStatus);
            
            return (
              <div 
                key={columnStatus}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, columnStatus)}
                style={{ 
                  flex: '0 0 320px', 
                  backgroundColor: 'hsla(var(--bg-tertiary), 0.5)', 
                  borderRadius: 'var(--radius-lg)', 
                  display: 'flex', flexDirection: 'column', 
                  maxHeight: '100%',
                  border: '1px solid hsl(var(--border-subtle))'
                }}
              >
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-secondary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {columnStatus}
                    </h3>
                    <span style={{ fontSize: '0.75rem', backgroundColor: 'hsl(var(--border-subtle))', color: 'hsl(var(--text-secondary))', padding: '0.125rem 0.375rem', borderRadius: '9999px', fontWeight: 600 }}>
                      {columnTasks.length}
                    </span>
                  </div>
                  <button onClick={() => openCreateModal(columnStatus)} style={{ color: 'hsl(var(--text-muted))', padding: '0.25rem', cursor: 'pointer', background: 'none', border: 'none' }}>
                    <Plus size={16} />
                  </button>
                </div>

                <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flex: 1, minHeight: '150px' }}>
                  {columnTasks.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '2px dashed hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
                      No tasks here.<br/>You can drag a task here.
                    </div>
                  ) : (
                    columnTasks.map(task => {
                      const overdue = isOverdue(task);
                      return (
                        <div 
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          className="glass"
                          style={{ 
                            backgroundColor: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', 
                            border: '1px solid hsl(var(--border-subtle))', cursor: 'grab',
                            boxShadow: 'var(--shadow-sm)', transition: 'transform 0.2s, box-shadow 0.2s',
                            opacity: draggingTaskId === task.id ? 0.5 : 1
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <span style={{ 
                              fontSize: '0.65rem', fontWeight: 600, padding: '0.125rem 0.375rem', borderRadius: '9999px', textTransform: 'uppercase',
                              color: getPriorityColor(task.priority), backgroundColor: `hsla(from ${getPriorityColor(task.priority)} h s l / 0.1)`
                            }}>
                              {task.priority}
                            </span>
                            
                            <div className="dropdown" style={{ position: 'relative' }}>
                              <button style={{ color: 'hsl(var(--text-muted))', padding: '0.125rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={(e) => {
                                const menu = e.currentTarget.nextElementSibling as HTMLElement;
                                if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
                              }}>
                                <MoreVertical size={14} />
                              </button>
                              <div style={{ 
                                display: 'none', position: 'absolute', right: 0, top: '100%', 
                                backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))',
                                borderRadius: 'var(--radius-md)', padding: '0.5rem 0', minWidth: '120px',
                                boxShadow: 'var(--shadow-md)', zIndex: 10
                              }}>
                                <button style={{ width: '100%', textAlign: 'left', padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => openEditModal(task)}>Edit</button>
                                <div style={{ borderTop: '1px solid hsl(var(--border-subtle))', margin: '0.25rem 0' }} />
                                <div style={{ padding: '0.25rem 1rem', fontSize: '0.7rem', color: 'hsl(var(--text-muted))', textTransform: 'uppercase', fontWeight: 600 }}>Move to</div>
                                {COLUMNS.map(c => (
                                  c !== task.status && <button key={c} style={{ width: '100%', textAlign: 'left', padding: '0.375rem 1rem', fontSize: '0.875rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => {
                                    updateTaskStatus(task.id, c);
                                    const menu = document.activeElement?.parentElement;
                                    if (menu) menu.style.display = 'none';
                                  }}>{c}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>{task.title}</h4>
                          {task.description && (
                            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {task.description}
                            </p>
                          )}
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: overdue ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))', fontWeight: overdue ? 600 : 400 }}>
                              {task.due_date ? (
                                <>
                                  <Clock size={12} />
                                  {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </>
                              ) : null}
                            </div>
                            
                            {task.assignee_name !== 'Unassigned' && (
                              <div 
                                style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 600 }}
                                title={task.assignee_name}
                              >
                                {task.assignee_name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                  
                  <button 
                    onClick={() => openCreateModal(columnStatus)} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-secondary))', 
                      fontSize: '0.875rem', padding: '0.5rem', background: 'transparent', border: '1px dashed hsl(var(--border-subtle))', 
                      borderRadius: 'var(--radius-md)', cursor: 'pointer', justifyContent: 'center'
                    }}
                    className="add-task-btn"
                  >
                    <Plus size={14} /> Add Task
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm !== null && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-lg)', maxWidth: '400px', width: '100%' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'hsl(var(--danger))' }}>Delete this task?</h3>
            <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--text-secondary))' }}>
              This action cannot be undone. Are you sure you want to proceed?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'hsl(var(--danger))', color: 'white', border: 'none' }} onClick={handleDeleteTask}>Delete Task</button>
            </div>
          </div>
        </div>
      )}
      {/* Create/Edit Task Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass" style={{ backgroundColor: 'white', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{modalMode === 'create' ? 'New Task' : 'Edit Task'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'hsl(var(--text-muted))', background: 'none', border: 'none', cursor: 'pointer' }}><X size={20}/></button>
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
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Assignee</label>
                  <select 
                    value={formAssigneeId} 
                    onChange={e => setFormAssigneeId(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.id} value={m.id.toString()}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Status</label>
                  <select 
                    value={formStatus} 
                    onChange={e => setFormStatus(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border-subtle))', backgroundColor: 'white' }}
                  >
                    {COLUMNS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginTop: '1rem' }}>
                {modalMode === 'edit' && editId ? (
                  <button type="button" className="btn btn-secondary" style={{ color: 'hsl(var(--danger))', borderColor: 'hsl(var(--danger))' }} onClick={() => setShowDeleteConfirm(editId)}>Delete</button>
                ) : <div />}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{modalMode === 'create' ? 'Create Task' : 'Save Changes'}</button>
                </div>
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
        .add-task-btn:hover {
          background-color: hsla(var(--text-secondary), 0.1);
        }
      `}} />
    </div>
  );
}
