import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

interface Comment {
  id: number;
  task_id: number;
  author_id: number;
  author_name: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface TaskCommentsProps {
  taskId: number;
}

const TaskComments: React.FC<TaskCommentsProps> = ({ taskId }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    fetchComments(1);
  }, [taskId]);

  const fetchComments = async (pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setIsLoadingMore(true);
      
      setError(null);
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/comments?page=${pageNumber}&per_page=20`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        if (pageNumber === 1) {
          setComments(data.comments || []);
        } else {
          setComments([...comments, ...(data.comments || [])]);
        }
        setTotal(data.total || 0);
        setHasMore(data.has_more || false);
        setPage(pageNumber);
      } else {
        setError('Unable to load comments.');
      }
    } catch (err) {
      setError('Unable to load comments.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = newComment.trim();
    if (!content) return;
    
    try {
      setIsSubmitting(true);
      const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        setComments([data, ...comments]); // Prepend new comment
        setTotal(total + 1);
        setNewComment('');
      } else {
        const err = await res.json();
        alert(err.error || 'Your comment could not be posted. Please try again.');
      }
    } catch (err) {
      alert('Your comment could not be posted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (e: React.FormEvent, commentId: number) => {
    e.preventDefault();
    const content = editContent.trim();
    if (!content) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        credentials: 'include'
      });
      
      if (res.ok) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, content, updated_at: new Date().toISOString() } : c
        ));
        setEditingId(null);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to update comment.');
      }
    } catch (err) {
      alert('Failed to update comment.');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!window.confirm('Delete comment?\n\nThis action cannot be undone.')) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (res.ok) {
        setComments(comments.filter(c => c.id !== commentId));
        setTotal(total - 1);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete comment.');
      }
    } catch (err) {
      alert('Failed to delete comment.');
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div style={{ borderTop: '1px solid hsl(var(--border-subtle))', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        Comments 
        {!loading && !error && <span style={{ fontSize: '0.75rem', fontWeight: 500, backgroundColor: 'hsl(var(--bg-tertiary))', padding: '0.1rem 0.5rem', borderRadius: '999px', color: 'hsl(var(--text-secondary))' }}>{total}</span>}
      </h3>
      
      {/* Comment Input */}
      <div style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleAddComment}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{ 
              width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', 
              border: '1px solid hsl(var(--border-subtle))', fontSize: '0.875rem', 
              resize: 'vertical', minHeight: '80px', marginBottom: '0.5rem', fontFamily: 'inherit'
            }}
            maxLength={5000}
            disabled={isSubmitting}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
              {newComment.length} / 5000
            </span>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !newComment.trim()}
              style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}
            >
              {isSubmitting ? 'Posting...' : 'Add Comment'}
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--text-muted))' }}>Loading comments...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: 'hsl(var(--danger))' }}>
            <p style={{ marginBottom: '0.5rem' }}>{error}</p>
            <button className="btn btn-secondary" onClick={() => fetchComments(1)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Retry</button>
          </div>
        ) : comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', border: '1px dashed hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', color: 'hsl(var(--text-muted))' }}>
            <p style={{ fontSize: '0.875rem', marginBottom: '0.25rem', fontWeight: 500, color: 'hsl(var(--text-secondary))' }}>No comments yet</p>
            <p style={{ fontSize: '0.8rem' }}>Start the conversation with your team.</p>
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                {comment.author_name.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{comment.author_name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                    {formatTimeAgo(comment.created_at)}
                    {new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 1000 && ' · Edited'}
                  </span>
                </div>
                
                {editingId === comment.id ? (
                  <form onSubmit={(e) => handleEditComment(e, comment.id)} style={{ marginTop: '0.5rem' }}>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      style={{ 
                        width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', 
                        border: '1px solid hsl(var(--accent-primary))', fontSize: '0.875rem', 
                        resize: 'vertical', minHeight: '60px', marginBottom: '0.5rem', fontFamily: 'inherit'
                      }}
                      maxLength={5000}
                      autoFocus
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button type="button" className="btn btn-secondary" onClick={() => setEditingId(null)} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={!editContent.trim()} style={{ padding: '0.3rem 0.8rem', fontSize: '0.8rem' }}>Save Changes</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-primary))', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5 }}>
                      {comment.content}
                    </div>
                    {user && user.id === comment.author_id && (
                      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <button 
                          onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}
                          style={{ background: 'none', border: 'none', color: 'hsl(var(--text-muted))', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          style={{ background: 'none', border: 'none', color: 'hsl(var(--danger))', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
        
        {hasMore && !loading && !error && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => fetchComments(page + 1)}
              disabled={isLoadingMore}
              style={{ fontSize: '0.875rem' }}
            >
              {isLoadingMore ? 'Loading...' : 'Load More Comments'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskComments;
