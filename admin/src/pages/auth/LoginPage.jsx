import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Boxes, Lock, Mail, AlertCircle, ArrowRight, Loader2, Fingerprint } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import '../../styles/auth.css';

export const LoginPage = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect straight to dashboard
  if (!isLoading && isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!identifier.trim() || !password) {
      setError('Please provide your admin email or username and password');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(identifier.trim(), password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="auth-container">
        <LoadingSpinner text="Checking authentication status..." />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-icon">
            <Boxes size={28} />
          </div>
          <h1 className="auth-title">Plywood Inventory OS</h1>
          <p className="auth-subtitle">Enterprise Stock & Warehouse Management</p>
          {/* <div className="auth-badge">SUPER ADMIN PORTAL</div> */}
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="identifier">
              Email or Username
            </label>
            <div className="input-wrapper">
              <Mail className="input-icon" />
              <input
                id="identifier"
                type="text"
                className="form-input"
                placeholder="admin@gmail.com (or username: superadmin)"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password" style={{ marginBottom: 0 }}>
                Password
              </label>
              <Link to="/admin/forgot-password" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" />
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          <button type="submit" className={`submit-btn ${isSubmitting ? 'loading' : ''}`} disabled={isSubmitting}>
            {isSubmitting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Loader2 size={18} className="spin-animation" />
                <span style={{ letterSpacing: '1px' }}>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* <div className="auth-notice">
          Access restricted strictly to authorized <strong>Super Administrator</strong>.
          <br />
          Initial credentials are seeded via <code>npm run seed:admin</code>.
        </div> */}
      </div>
    </div>
  );
};

export default LoginPage;
