import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Header Placeholder */}
      <header className="glass" style={{ 
        padding: '1rem 2rem', 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 className="text-gradient" style={{ fontSize: '1.5rem' }}>TeamFlow</h1>
        <div style={{ 
          height: '32px', 
          width: '32px', 
          borderRadius: '50%', 
          backgroundColor: 'hsl(var(--surface-glass-border))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.875rem'
        }}>
          US
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        zIndex: 1
      }}>
        {/* Background glow effects */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(var(--accent-primary), 0.15) 0%, transparent 70%)',
          zIndex: -1,
          pointerEvents: 'none'
        }} />
        
        <Outlet />
      </main>

      {/* Footer Placeholder */}
      <footer style={{ 
        padding: '1rem 2rem', 
        borderTop: '1px solid hsl(var(--border-subtle))', 
        textAlign: 'center', 
        color: 'hsl(var(--text-muted))',
        fontSize: '0.875rem'
      }}>
        <p>&copy; {new Date().getFullYear()} TeamFlow. Architectural Foundation.</p>
      </footer>
    </div>
  );
}
