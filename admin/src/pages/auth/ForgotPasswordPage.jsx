import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Boxes, Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import '../../styles/auth.css';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState(null); // Just for testing

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!identifier.trim()) {
      setError('Please provide your admin email or username');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await authService.forgotPassword(identifier.trim());
      setSuccess('If an account exists, a password reset link has been sent.');
      
      // Extremely robust check for token in case of weird nesting
      const token = res?.resetToken || res?.data?.resetToken || (typeof res === 'string' ? res : null);
      if (token) {
        setResetToken(token);
      } else {
        // Just for debugging why it's missing
        console.log("Response was:", res);
      }
    } catch (err) {
      setError(err.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-brand-icon">
            <Boxes size={28} />
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your admin credentials to reset</p>
        </div>

        {error && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={18} flexShrink={0} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-error-banner" style={{ backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #10b981' }} role="alert">
            <span>{success}</span>
          </div>
        )}

        {resetToken && (
          <div style={{ marginTop: '1rem', padding: '1rem', background: '#f3f4f6', borderRadius: '4px', fontSize: '14px', wordBreak: 'break-all' }}>
            <p style={{ fontWeight: 'bold' }}>DEV MODE: Reset Token (Click below)</p>
            <Link to={`/admin/reset-password/${resetToken}`}>Reset Link</Link>
          </div>
        )}

        {!success && !resetToken && (
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
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoadingSpinner size={18} text="" />
              ) : (
                <>
                  <span>Request Reset</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/admin/login" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
