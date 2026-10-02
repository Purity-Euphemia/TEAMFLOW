import { Outlet, Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <header className="glass" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        borderBottom: '1px solid hsl(var(--border-subtle))'
      }}>
        <div className="container" style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '72px'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', zIndex: 60 }}>
            <div style={{ 
              width: '32px', 
              height: '32px', 
              background: 'hsl(var(--accent-primary))', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '18px'
            }}>
              TF
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>
              TeamFlow
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'none' }} className="desktop-nav">
            <a href="#features" style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500, padding: '0.5rem 1rem' }}>Features</a>
            <a href="#how-it-works" style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500, padding: '0.5rem 1rem' }}>How It Works</a>
            <a href="#for-teams" style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500, padding: '0.5rem 1rem' }}>For Teams</a>
            <a href="#pricing" style={{ color: 'hsl(var(--text-secondary))', fontWeight: 500, padding: '0.5rem 1rem' }}>Pricing</a>
          </nav>
          
          <style dangerouslySetInnerHTML={{__html: `
            @media (min-width: 768px) {
              .desktop-nav { display: flex !important; align-items: center; gap: 1rem; }
              .desktop-auth { display: flex !important; align-items: center; gap: 1rem; }
              .mobile-toggle { display: none !important; }
            }
          `}} />

          {/* Auth Buttons */}
          <div style={{ display: 'none' }} className="desktop-auth">
            <Link to="/login" style={{ color: 'hsl(var(--text-primary))', fontWeight: 500 }}>Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started</Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ color: 'hsl(var(--text-primary))', zIndex: 60 }}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '100vh',
            background: 'hsl(var(--bg-primary))',
            paddingTop: '80px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            zIndex: 55
          }}>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '1.25rem' }}>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'hsl(var(--text-primary))', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border-subtle))' }}>Features</a>
              <a href="#how-it-works" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'hsl(var(--text-primary))', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border-subtle))' }}>How It Works</a>
              <a href="#for-teams" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'hsl(var(--text-primary))', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border-subtle))' }}>For Teams</a>
              <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'hsl(var(--text-primary))', fontWeight: 500, padding: '0.5rem 0', borderBottom: '1px solid hsl(var(--border-subtle))' }}>Pricing</a>
            </nav>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-secondary" style={{ width: '100%' }}>Log In</Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary" style={{ width: '100%' }}>Get Started Free</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ 
        borderTop: '1px solid hsl(var(--border-subtle))', 
        backgroundColor: 'white',
        padding: '4rem 0 2rem 0'
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '24px', height: '24px', background: 'hsl(var(--accent-primary))', borderRadius: '6px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold' }}>TF</div>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>TeamFlow</span>
              </div>
              <p style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Work together. Get more done.</p>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#features" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Features</a></li>
                <li><a href="#pricing" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Pricing</a></li>
                <li><a href="#how-it-works" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>How It Works</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Company</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>About</a></li>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resources</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Documentation</a></li>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Legal</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Privacy</a></li>
                <li><a href="#" style={{ color: 'hsl(var(--text-secondary))', fontSize: '0.875rem' }}>Terms</a></li>
              </ul>
            </div>

          </div>
          
          <div style={{ paddingTop: '2rem', borderTop: '1px solid hsl(var(--border-subtle))', textAlign: 'center', color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
            &copy; {new Date().getFullYear()} TeamFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
