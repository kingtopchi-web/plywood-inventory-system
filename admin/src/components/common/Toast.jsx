import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast = { id, title, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ title, message, type: 'success' }),
    error: (message, title = 'Error') => addToast({ title, message, type: 'error' }),
    warning: (message, title = 'Warning') => addToast({ title, message, type: 'warning' }),
    info: (message, title = 'Info') => addToast({ title, message, type: 'info' }),
    // Compatible addToast for components that destructure { addToast }
    addToast: (typeOrMessage, messageOrTitle, title) => {
      // Handle addToast('error', 'Message')
      if (['success', 'error', 'warning', 'info'].includes(typeOrMessage)) {
        return addToast({ type: typeOrMessage, message: messageOrTitle, title });
      }
      // Handle addToast('Message', 'error')
      if (['success', 'error', 'warning', 'info'].includes(messageOrTitle)) {
        return addToast({ type: messageOrTitle, message: typeOrMessage, title });
      }
      // Fallback
      return addToast({ type: 'info', message: typeOrMessage, title: messageOrTitle });
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon success" />;
      case 'error':
        return <AlertCircle size={18} className="toast-icon error" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon warning" />;
      default:
        return <Info size={18} className="toast-icon info" />;
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="ui-toast-container" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`ui-toast-item type-${item.type}`} role="status">
            <div className="toast-icon-box">{getIcon(item.type)}</div>
            <div className="toast-body">
              {item.title && <div className="toast-title">{item.title}</div>}
              {item.message && <div className="toast-message">{item.message}</div>}
            </div>
            <button
              type="button"
              className="toast-close-btn"
              onClick={() => removeToast(item.id)}
              aria-label="Dismiss toast"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;
