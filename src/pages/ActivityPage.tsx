import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity } from 'lucide-react';
import { ActivityMessage, formatRelativeTime, getActivityIcon } from '../components/ActivityItem';
import type { ActivityRecord } from '../components/ActivityItem';

export default function ActivityPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchActivity(1);
  }, []);

  const fetchActivity = async (pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      setError(null);
      
      const res = await fetch(`http://localhost:5000/api/activity?page=${pageNumber}&limit=20`, {
        credentials: 'include'
      });
      
      if (res.ok) {
        const data = await res.json();
        const items = data.activities || [];
        
        if (pageNumber === 1) {
          setActivities(items);
        } else {
          setActivities(prev => [...prev, ...items]);
        }
        
        setHasMore(data.pagination?.has_more || false);
        setPage(pageNumber);
      } else {
        setError('Unable to load activity.');
      }
    } catch (err) {
      setError('Unable to load activity.');
    } finally {
      setLoading(false);
    }
  };

  // Group by date
  const groupedActivities: Record<string, ActivityRecord[]> = {};
  activities.forEach(a => {
    const date = new Date(a.created_at);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
    
    let group = 'OLDER';
    if (isToday) group = 'TODAY';
    else if (isYesterday) group = 'YESTERDAY';
    else if (now.getTime() - date.getTime() < 7 * 24 * 60 * 60 * 1000) group = 'EARLIER THIS WEEK';
    
    if (!groupedActivities[group]) groupedActivities[group] = [];
    groupedActivities[group].push(a);
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>Activity</h1>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Workspace activity and recent changes.</p>
        </div>
      </div>

      {loading && page === 1 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Loading activity...
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--danger))' }}>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={() => fetchActivity(1)}>Retry</button>
        </div>
      ) : activities.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: '1px dashed hsl(var(--border-subtle))', 
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'white'
        }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: 'hsl(var(--bg-secondary))', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
            <Activity size={24} color="hsl(var(--text-muted))" />
          </div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>No activity yet</h3>
          <p style={{ color: 'hsl(var(--text-secondary))' }}>Workspace activity will appear here as your team works together.</p>
        </div>
      ) : (
        <div style={{ position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: '2rem', 
            bottom: '2rem', 
            left: '20px', 
            width: '2px', 
            backgroundColor: 'hsl(var(--border-subtle))',
            zIndex: 0
          }} />
          
          {['TODAY', 'YESTERDAY', 'EARLIER THIS WEEK', 'OLDER'].map(group => {
            if (!groupedActivities[group] || groupedActivities[group].length === 0) return null;
            
            return (
              <div key={group} style={{ marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
                <div style={{ 
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem', 
                  backgroundColor: 'hsl(var(--bg-primary))',
                  border: '1px solid hsl(var(--border-subtle))',
                  borderRadius: '9999px',
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  color: 'hsl(var(--text-secondary))',
                  marginBottom: '1.5rem',
                  marginLeft: '20px',
                  transform: 'translateX(-50%)'
                }}>
                  {group}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {groupedActivities[group].map(act => (
                    <div key={act.id} style={{ display: 'flex', gap: '1.25rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        backgroundColor: 'white',
                        border: '1px solid hsl(var(--border-subtle))',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        flexShrink: 0,
                        zIndex: 2,
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        {getActivityIcon(act.action_type)}
                      </div>
                      
                      <div style={{ 
                        flex: 1, 
                        backgroundColor: 'white', 
                        border: '1px solid hsl(var(--border-subtle))',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem',
                        boxShadow: 'var(--shadow-sm)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '24px', 
                              height: '24px', 
                              borderRadius: '50%', 
                              backgroundColor: 'hsl(var(--bg-secondary))', 
                              color: 'hsl(var(--text-primary))', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              fontSize: '0.625rem', 
                              fontWeight: 600, 
                              flexShrink: 0 
                            }}>
                              {act.actor.name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--text-primary))' }}>
                              {act.actor.name}
                            </span>
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'hsl(var(--text-muted))' }}>
                            {formatRelativeTime(act.created_at)}
                          </span>
                        </div>
                        <div style={{ marginLeft: '2.25rem' }}>
                          <ActivityMessage act={act} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          
          {hasMore && (
            <div style={{ padding: '1rem', textAlign: 'center' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => fetchActivity(page + 1)}
                style={{ fontSize: '0.875rem' }}
              >
                Load More
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
