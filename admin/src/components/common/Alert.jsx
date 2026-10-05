import React from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle2 size={18} className="alert-icon success" />;
      case 'danger':
      case 'error':
        return <AlertCircle size={18} className="alert-icon danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="alert-icon warning" />;
      default:
        return <Info size={18} className="alert-icon info" />;
    }
  };

  return (
    <div className={`ui-alert variant-${variant} ${className}`} role="alert">
      <div className="alert-icon-box">{getIcon()}</div>
      <div className="alert-content">
        {title && <h5 className="alert-title">{title}</h5>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="alert-close-btn"
          aria-label="Close alert"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;
