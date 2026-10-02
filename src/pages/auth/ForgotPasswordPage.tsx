import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: 'hsl(var(--text-primary))' }}>Reset Password</h2>
        <p style={{ color: 'hsl(var(--text-secondary))' }}>Enter your email address to reset your password.</p>
      </div>

      <div style={{ background: 'hsl(38 92% 95%)', color: 'hsl(38 92% 40%)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', border: '1px solid hsl(38 92% 85%)' }}>
        <strong>Not implemented yet.</strong> Password reset infrastructure is currently under construction.
      </div>

      <form onSubmit={(e) => e.preventDefault()} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', opacity: 0.5, pointerEvents: 'none' }}>
        <div>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Email Address</label>
          <input 
            type="email" 
            id="email" 
            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #E2E8F0', fontSize: '0.95rem' }}
            disabled 
          />
        </div>

        <button 
          type="button" 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
          disabled
        >
          Send Reset Link
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '2rem', fontSize: '0.875rem', color: 'hsl(var(--text-secondary))' }}>
        Remember your password? <Link to="/login" style={{ color: 'hsl(var(--accent-primary))', fontWeight: 600 }}>Log in</Link>
      </div>
    </div>
  );
}
