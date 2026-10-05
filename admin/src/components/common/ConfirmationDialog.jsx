import React from 'react';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const ConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  const getIcon = () => {
    switch (variant) {
      case 'danger':
        return <AlertOctagon size={24} className="confirm-icon danger" />;
      case 'warning':
        return <AlertTriangle size={24} className="confirm-icon warning" />;
      default:
        return <Info size={24} className="confirm-icon info" />;
    }
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', width: '100%' }}>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        {cancelText}
      </Button>
      <Button
        variant={variant === 'danger' ? 'danger' : 'primary'}
        onClick={onConfirm}
        isLoading={isLoading}
      >
        {confirmText}
      </Button>
    </div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" footer={footer}>
      <div className="confirm-dialog-content">
        <div className="confirm-icon-wrapper">{getIcon()}</div>
        <div className="confirm-text-wrapper">
          <h4 className="confirm-title">{title}</h4>
          <p className="confirm-message">{message}</p>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmationDialog;
