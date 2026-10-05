import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Boxes, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import { authService } from '../../services/authService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import '../../styles/auth.css';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setIsSubmitting(true);
      await authService.resetPassword(token, newPassword);
      setSuccess('Password has been successfully reset.');
      setTimeout(() => navigate('/admin/login'), 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The token may be invalid or expired.');
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
          <h1 className="auth-title">Create New Password</h1>
          <p className="auth-subtitle">Set a new password for your admin account</p>
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

        {!success && (
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">
                New Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">
                Confirm New Password
              </label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? (
                <LoadingSpinner size={18} text="" />
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <Link to="/admin/login" style={{ color: '#2563eb', textDecoration: 'none', display: 'inline-block' }}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
