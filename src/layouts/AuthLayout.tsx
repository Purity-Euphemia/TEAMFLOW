import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      {/* LEFT SIDE: Branding */}
      <div className="auth-branding" style={{ 
        flex: 1, 
        backgroundColor: '#F8FAFC', 
        padding: '3rem', 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRight: '1px solid #E2E8F0',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Decorative Blob */}
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '120%', height: '120%', background: 'radial-gradient(circle, hsla(235, 85%, 60%, 0.08) 0%, transparent 60%)', zIndex: 0 }}></div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4rem' }}>
            <div style={{ width: '32px', height: '32px', background: 'hsl(var(--accent-primary))', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold' }}>TF</div>
            <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'hsl(var(--text-primary))' }}>TeamFlow</span>
          </Link>

          <div style={{ maxWidth: '400px' }}>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.2, marginBottom: '1.5rem', letterSpacing: '-0.02em', color: 'hsl(var(--text-primary))' }}>
              Build better work, together.
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'hsl(var(--text-secondary))', lineHeight: 1.6 }}>
              Create your TeamFlow workspace and start organizing your team's work in one place.
            </p>
          </div>
        </div>

        <div style={{ position: 'relative', zIndex: 1, color: 'hsl(var(--text-muted))', fontSize: '0.875rem' }}>
          &copy; {new Date().getFullYear()} TeamFlow. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: Form Outlet */}
      <div className="auth-content" style={{ 
        flex: 1, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '3rem'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <Outlet />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 992px) {
          .auth-branding { display: none !important; }
        }
        @media (max-width: 576px) {
          .auth-content { padding: 1.5rem !important; align-items: flex-start !important; padding-top: 4rem !important; }
        }
      `}} />
    </div>
  );
}
