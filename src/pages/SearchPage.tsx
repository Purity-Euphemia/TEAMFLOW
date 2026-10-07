import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderKanban, CheckSquare, User as UserIcon, Loader2 } from 'lucide-react';

interface SearchResult {
  projects: any[];
  tasks: any[];
  people: any[];
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const filter = searchParams.get('type') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [results, setResults] = useState<SearchResult>({ projects: [], tasks: [], people: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { currentWorkspace } = useAuth();

  useEffect(() => {
    if (!query || query.trim().length < 2) return;
    
    const fetchResults = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const workspaceQuery = currentWorkspace ? `&workspace_id=${currentWorkspace.id}` : '';
        const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}&type=${filter}&page=${page}&limit=20${workspaceQuery}`, {
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data);
      } catch (err) {
        setError('Unable to complete search.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResults();
  }, [query, filter, page, currentWorkspace]);

  const handleFilterChange = (newFilter: string) => {
    setSearchParams({ q: query, type: newFilter, page: '1' });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ q: query, type: filter, page: newPage.toString() });
  };

  const hasResults = results.projects.length > 0 || results.tasks.length > 0 || results.people.length > 0;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Search Results</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input 
            type="text" 
            value={query}
            onChange={(e) => setSearchParams({ q: e.target.value, type: filter, page: '1' })}
            placeholder="Search TeamFlow..."
            style={{
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid hsl(var(--border-subtle))',
              width: '100%',
              maxWidth: '400px',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid hsl(var(--border-subtle))' }}>
        {['all', 'projects', 'tasks', 'people'].map((t) => (
          <button
            key={t}
            onClick={() => handleFilterChange(t)}
            style={{
              padding: '0.75rem 1rem',
              borderBottom: filter === t ? '2px solid hsl(var(--accent-primary))' : '2px solid transparent',
              color: filter === t ? 'hsl(var(--accent-primary))' : 'hsl(var(--text-secondary))',
              fontWeight: filter === t ? 600 : 500,
              textTransform: 'capitalize'
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem', color: 'hsl(var(--text-muted))' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : error ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--danger))', backgroundColor: 'hsla(var(--danger), 0.1)', borderRadius: 'var(--radius-md)' }}>
          {error}
          <button 
            onClick={() => handleFilterChange(filter)}
            style={{ display: 'block', margin: '1rem auto 0', padding: '0.5rem 1rem', backgroundColor: 'hsl(var(--danger))', color: 'white', borderRadius: 'var(--radius-sm)' }}
          >
            Retry
          </button>
        </div>
      ) : (!query || query.trim().length < 2) ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          Enter at least 2 characters to search.
        </div>
      ) : !hasResults ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-muted))' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: '0.5rem' }}>No results found</div>
          <div>Try searching for a project name, a task, or a team member.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {(filter === 'all' || filter === 'projects') && results.projects.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderKanban size={20} /> Projects
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {results.projects.map(p => (
                  <Link key={p.id} to={`/projects/${p.id}`} style={{ display: 'block', padding: '1rem', backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>{p.name}</div>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>{p.description || 'No description provided.'}</div>
                    <div style={{ fontSize: '0.75rem', display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '4px', fontWeight: 500 }}>
                      Status: {p.status}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(filter === 'all' || filter === 'tasks') && results.tasks.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={20} /> Tasks
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {results.tasks.map(t => (
                  <Link key={t.id} to={`/projects/${t.project_id}?taskId=${t.id}`} style={{ display: 'block', padding: '1rem', backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ fontWeight: 600, color: 'hsl(var(--text-primary))', marginBottom: '0.25rem' }}>{t.title}</div>
                    <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))', marginBottom: '0.5rem' }}>
                      Project: <span style={{ fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{t.project_name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '4px', fontWeight: 500 }}>
                        {t.status}
                      </div>
                      <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '4px', fontWeight: 500 }}>
                        Priority: {t.priority}
                      </div>
                      <div style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', backgroundColor: 'hsl(var(--bg-tertiary))', borderRadius: '4px', fontWeight: 500 }}>
                        Assignee: {t.assignee_name || 'Unassigned'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(filter === 'all' || filter === 'people') && results.people.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserIcon size={20} /> People
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {results.people.map(person => (
                  <Link key={person.id} to="/team" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'white', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', textDecoration: 'none', color: 'inherit' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'hsl(var(--accent-primary))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'hsl(var(--text-primary))' }}>{person.name}</div>
                      <div style={{ fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>{person.role} {person.email ? `• ${person.email}` : ''}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Simple Pagination */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid hsl(var(--border-subtle))' }}>
            <button 
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              style={{ padding: '0.5rem 1rem', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', backgroundColor: page === 1 ? 'hsl(var(--bg-tertiary))' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'hsl(var(--text-muted))' : 'hsl(var(--text-primary))' }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem' }}>Page {page}</span>
            <button 
              onClick={() => handlePageChange(page + 1)}
              style={{ padding: '0.5rem 1rem', border: '1px solid hsl(var(--border-subtle))', borderRadius: 'var(--radius-md)', backgroundColor: 'white', cursor: 'pointer' }}
            >
              Next
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
