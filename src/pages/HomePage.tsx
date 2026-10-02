export default function HomePage() {
  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      textAlign: 'center', 
      padding: '4rem 0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1
    }}>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        backgroundColor: 'hsla(var(--accent-primary), 0.1)',
        border: '1px solid hsla(var(--accent-primary), 0.2)',
        borderRadius: 'var(--radius-full, 9999px)',
        color: 'hsl(var(--accent-primary))',
        fontSize: '0.875rem',
        fontWeight: 500,
        marginBottom: '2rem'
      }}>
        Architecture Setup Complete
      </div>
      
      <h2 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: 1.1 }}>
        Welcome to the <br />
        <span className="text-gradient">TeamFlow</span> Foundation
      </h2>
      
      <p style={{ 
        color: 'hsl(var(--text-secondary))', 
        fontSize: '1.125rem', 
        marginBottom: '3rem',
        maxWidth: '600px',
        lineHeight: 1.6
      }}>
        The project structure, routing, and premium design system are successfully initialized. 
        Ready to start building out the dashboard and application features.
      </p>
      
      <div className="glass" style={{ 
        padding: '2.5rem', 
        borderRadius: 'var(--radius-xl)',
        width: '100%',
        textAlign: 'left'
      }}>
        <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Project Architecture</h3>
        <ul style={{ 
          listStyle: 'none',
          display: 'grid',
          gap: '1rem',
          color: 'hsl(var(--text-secondary))'
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>▹</span>
            <code>src/components</code> - Reusable UI elements
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>▹</span>
            <code>src/pages</code> - Route-level views
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>▹</span>
            <code>src/layouts</code> - Application shells and wrappers
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'hsl(var(--accent-primary))' }}>▹</span>
            <code>src/hooks & src/utils</code> - Logic and helpers
          </li>
        </ul>
      </div>
    </div>
  );
}
