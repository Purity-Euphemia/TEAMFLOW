import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, FolderKanban, CheckSquare, User as UserIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SearchResult {
  projects: any[];
  tasks: any[];
  people: any[];
}

export default function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({ projects: [], tasks: [], people: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults({ projects: [], tasks: [], people: [] });
      setIsLoading(false);
      setError(null);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const workspaceQuery = currentWorkspace ? `&workspace_id=${currentWorkspace.id}` : '';
      const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}${workspaceQuery}`, {
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      setError('Unable to complete search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (type: string, id: number, e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    if (type === 'project') navigate(`/projects/${id}`);
    if (type === 'task') navigate(`/tasks?taskId=${id}`); // Assuming /tasks can open a task or we have a specific task modal
    if (type === 'person') navigate(`/team`);
  };

  const hasResults = results.projects.length > 0 || results.tasks.length > 0 || results.people.length > 0;

  return (
    <div ref={dropdownRef} className="global-search-container">
      {/* Mobile Search Toggle Icon */}
      <button 
        className="mobile-search-toggle"
        onClick={() => {
          setIsMobileExpanded(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
        aria-label="Open search"
      >
        <Search size={20} />
      </button>

      {/* Search Input Container */}
      <div className={`search-input-wrapper ${isMobileExpanded ? 'expanded' : ''}`}>
        <Search size={18} className="search-icon" />
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search TeamFlow... (/ or ⌘K)" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim().length >= 2) setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim().length >= 2) setIsOpen(true);
          }}
          className="search-input"
        />
        {(query || isMobileExpanded) && (
          <button 
            onClick={() => { 
              setQuery(''); 
              setIsOpen(false); 
              setIsMobileExpanded(false); 
            }}
            className="search-clear-btn"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isOpen && query.trim().length >= 2 && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '0.5rem',
          backgroundColor: 'white',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid hsl(var(--border-subtle))',
          overflow: 'hidden',
          zIndex: 100,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {isLoading ? (
            <div style={{ padding: '2rem', display: 'flex', justifyContent: 'center', color: 'hsl(var(--text-muted))' }}>
              <Loader2 size={24} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
          ) : error ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: 'hsl(var(--danger))', fontSize: '0.875rem' }}>
              {error}
              <button 
                onClick={() => performSearch(query)}
                style={{ display: 'block', margin: '0.5rem auto 0', color: 'hsl(var(--accent-primary))', fontSize: '0.75rem', fontWeight: 600 }}
              >
                Retry
              </button>
            </div>
          ) : !hasResults ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
              No results found for "{query}".
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                Try searching for a project name, a task, or a team member.
              </div>
            </div>
          ) : (
            <div>
              {results.projects.length > 0 && (
                <div>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--bg-tertiary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Projects
                  </div>
                  {results.projects.map(p => (
                    <a key={p.id} href={`/projects/${p.id}`} onClick={(e) => handleResultClick('project', p.id, e)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}>
                      <FolderKanban size={16} style={{ color: 'hsl(var(--accent-primary))', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{p.status}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {results.tasks.length > 0 && (
                <div>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--bg-tertiary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Tasks
                  </div>
                  {results.tasks.map(t => (
                    <a key={t.id} href={`/projects/${t.project_id}`} onClick={(e) => handleResultClick('project', t.project_id, e)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}>
                      <CheckSquare size={16} style={{ color: 'hsl(var(--success))', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{t.title}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{t.project_name} • {t.status}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              {results.people.length > 0 && (
                <div>
                  <div style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-muted))', backgroundColor: 'hsl(var(--bg-tertiary))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    People
                  </div>
                  {results.people.map(person => (
                    <a key={person.id} href="/team" onClick={(e) => handleResultClick('person', person.id, e)} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 1rem', borderBottom: '1px solid hsl(var(--border-subtle))', textDecoration: 'none', color: 'inherit' }}>
                      <UserIcon size={16} style={{ color: 'hsl(var(--warning))', marginTop: '2px' }} />
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--text-primary))' }}>{person.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'hsl(var(--text-secondary))' }}>{person.role}</div>
                      </div>
                    </a>
                  ))}
                </div>
              )}

              <div style={{ padding: '0.5rem', borderTop: '1px solid hsl(var(--border-subtle))', textAlign: 'center' }}>
                <button 
                  onClick={() => { setIsOpen(false); navigate(`/search?q=${encodeURIComponent(query)}`); }}
                  style={{ display: 'block', width: '100%', padding: '0.5rem', fontSize: '0.875rem', color: 'hsl(var(--accent-primary))', fontWeight: 500 }}
                >
                  View all results
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      <style>{`
        .global-search-container {
          position: relative;
          flex: 1;
          max-width: 400px;
        }
        .mobile-search-toggle {
          display: none;
          color: hsl(var(--text-secondary));
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          color: hsl(var(--text-muted));
        }
        .search-input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          border-radius: 9999px;
          border: 1px solid hsl(var(--border-subtle));
          background-color: hsl(var(--bg-primary));
          outline: none;
          font-size: 0.875rem;
          width: 100%;
        }
        .search-clear-btn {
          position: absolute;
          right: 1rem;
          color: hsl(var(--text-muted));
          padding: 0.2rem;
          background: none;
          border: none;
          cursor: pointer;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .global-search-container {
            max-width: none;
            position: static;
          }
          .mobile-search-toggle {
            display: flex;
            align-items: center;
          }
          .search-input-wrapper {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            padding: 1rem;
            background: white;
            border-bottom: 1px solid hsl(var(--border-subtle));
            z-index: 101;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .search-input-wrapper.expanded {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
