import { Link } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Check, 
  CircleDot, 
  MessageSquare, 
  UserPlus, 
  Users, 
  Archive,
  Trash2,
  ShieldAlert
} from 'lucide-react';

export interface ActivityRecord {
  id: number;
  actor: {
    id: number | null;
    name: string;
  };
  action_type: string;
  entity_type: string;
  entity_id: number | null;
  project_id: number | null;
  task_id: number | null;
  metadata: any;
  created_at: string;
}

export function getActivityIcon(actionType: string) {
  const props = { size: 16, color: 'hsl(var(--text-secondary))' };
  switch (actionType) {
    case 'WORKSPACE_CREATED': return <FolderKanban {...props} />;
    case 'MEMBER_JOINED': return <UserPlus {...props} />;
    case 'MEMBER_INVITED': return <Users {...props} />;
    case 'MEMBER_REMOVED': return <Users {...props} />;
    case 'MEMBER_INVITE_CANCELED': return <Users {...props} />;
    case 'ROLE_CHANGED': return <ShieldAlert {...props} />;
    case 'PROJECT_CREATED': return <FolderKanban {...props} />;
    case 'PROJECT_UPDATED': return <FolderKanban {...props} />;
    case 'PROJECT_ARCHIVED': return <Archive {...props} />;
    case 'TASK_CREATED': return <CheckSquare {...props} />;
    case 'TASK_UPDATED': return <CheckSquare {...props} />;
    case 'TASK_ASSIGNED': return <Users {...props} />;
    case 'TASK_STATUS_CHANGED': return <CircleDot {...props} />;
    case 'TASK_COMPLETED': return <Check {...props} color="hsl(var(--success))" />;
    case 'TASK_DELETED': return <Trash2 {...props} />;
    case 'COMMENT_CREATED': return <MessageSquare {...props} />;
    default: return <CircleDot {...props} />;
  }
}

export function ActivityMessage({ act }: { act: ActivityRecord }) {
  const actorName = act.actor.name;
  
  const renderResource = (name: string, link?: string) => {
    if (!name) return null;
    if (link) {
      return <Link to={link} style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>"{name}"</Link>;
    }
    return <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>"{name}"</span>;
  };

  let message: React.ReactNode = '';
  
  const projectLink = act.project_id ? `/projects/${act.project_id}` : undefined;
  const taskLink = act.project_id && act.task_id ? `/projects/${act.project_id}?task=${act.task_id}` : undefined;
  
  switch (act.action_type) {
    case 'WORKSPACE_CREATED':
      message = <>created the workspace</>;
      break;
    case 'MEMBER_JOINED':
      message = <>joined the workspace</>;
      break;
    case 'MEMBER_INVITED':
      message = <>invited <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{act.metadata?.email}</span></>;
      break;
    case 'MEMBER_REMOVED':
      message = <>removed <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{act.metadata?.target_name}</span></>;
      break;
    case 'MEMBER_INVITE_CANCELED':
      message = <>canceled the invitation for <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{act.metadata?.email}</span></>;
      break;
    case 'ROLE_CHANGED':
      message = <>changed <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{act.metadata?.target_name}</span>'s role to {act.metadata?.new_role}</>;
      break;
    case 'PROJECT_CREATED':
      message = <>created project {renderResource(act.metadata?.name, projectLink)}</>;
      break;
    case 'PROJECT_UPDATED':
      message = <>updated project {renderResource(act.metadata?.name, projectLink)}</>;
      break;
    case 'PROJECT_ARCHIVED':
      message = <>archived project {renderResource(act.metadata?.name, undefined)}</>;
      break;
    case 'TASK_CREATED':
      message = <>created task {renderResource(act.metadata?.title, taskLink)}</>;
      break;
    case 'TASK_UPDATED':
      message = <>updated task {renderResource(act.metadata?.title, taskLink)}</>;
      break;
    case 'TASK_ASSIGNED':
      message = <>assigned {renderResource(act.metadata?.title, taskLink)}</>;
      break;
    case 'TASK_STATUS_CHANGED':
      message = <>moved task {renderResource(act.metadata?.title, taskLink)} from {act.metadata?.old_status} to {act.metadata?.new_status}</>;
      break;
    case 'TASK_COMPLETED':
      message = <>completed task {renderResource(act.metadata?.title, taskLink)}</>;
      break;
    case 'TASK_DELETED':
      message = <>deleted task {renderResource(act.metadata?.title)}</>;
      break;
    case 'COMMENT_CREATED':
      message = <>commented on task {renderResource(act.metadata?.task_title, taskLink)}</>;
      break;
    default:
      message = <>performed an action</>;
  }

  return (
    <span style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
      <span style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{actorName}</span> {message}
    </span>
  );
}

export function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  
  return date.toLocaleDateString();
}
