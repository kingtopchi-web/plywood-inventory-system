import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
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

  return createPortal(
    <div className="ui-modal-portal">
      <div
        className="ui-modal-backdrop"
        onClick={closeOnBackdrop ? onClose : undefined}
      />
      <div className={`ui-modal-container size-${size} ${className}`} role="dialog" aria-modal="true">
        <div className="ui-modal-header">
          <div className="ui-modal-title-group">
            {title && <h3 className="ui-modal-title">{title}</h3>}
            {subtitle && <p className="ui-modal-subtitle">{subtitle}</p>}
          </div>
          <button
            type="button"
            className="ui-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ui-modal-body">{children}</div>

        {footer && <div className="ui-modal-footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
