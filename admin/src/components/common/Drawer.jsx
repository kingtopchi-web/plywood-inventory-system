import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Drawer = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  placement = 'right',
  width = '380px',
  className = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="ui-drawer-portal">
      <div className="ui-drawer-backdrop" onClick={onClose} />
      <div
        className={`ui-drawer-container placement-${placement} ${className}`}
        style={{ '--drawer-width': width }}
        role="dialog"
        aria-modal="true"
      >
        <div className="ui-drawer-header">
          {title && <h3 className="ui-drawer-title">{title}</h3>}
          <button
            type="button"
            className="ui-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ui-drawer-body">{children}</div>

        {footer && <div className="ui-drawer-footer">{footer}</div>}
      </div>
    </div>
  );
};

export default Drawer;
