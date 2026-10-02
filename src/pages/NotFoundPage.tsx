import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      flex: 1, 
      textAlign: 'center' 
    }}>
      <h2 style={{ 
        fontSize: '6rem', 
        marginBottom: '1rem', 
        color: 'transparent',
        WebkitTextStroke: '1px hsl(var(--border-subtle))',
        lineHeight: 1
      }}>
        404
      </h2>
      <p style={{ 
        color: 'hsl(var(--text-primary))', 
        fontSize: '1.5rem', 
        fontWeight: 500,
        marginBottom: '0.5rem' 
      }}>
        Page not found
      </p>
      <p style={{ 
        color: 'hsl(var(--text-secondary))', 
        marginBottom: '2rem' 
      }}>
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="glass" style={{ 
        padding: '0.75rem 1.5rem', 
        color: 'hsl(var(--text-primary))', 
        borderRadius: 'var(--radius-md)',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
        display: 'inline-block'
      }}>
        Return Home
      </Link>
    </div>
  );
}
