import React from 'react';
import Badge from './Badge';

export const StatusBadge = ({ status, className = '' }) => {
  if (!status) return null;

  const normalized = String(status).toUpperCase();

  const getStatusConfig = () => {
    switch (normalized) {
      // Stock Statuses
      case 'IN_STOCK':
        return { label: 'In Stock', variant: 'success', dot: true };
      case 'LOW_STOCK':
        return { label: 'Low Stock', variant: 'warning', dot: true };
      case 'OUT_OF_STOCK':
        return { label: 'Out of Stock', variant: 'danger', dot: true };

      // Order & Transfer Statuses
      case 'CONFIRMED':
      case 'RECEIVED':
      case 'DELIVERED':
      case 'COMPLETED':
        return { label: normalized.replace('_', ' '), variant: 'success', dot: true };

      case 'PENDING':
      case 'IN_TRANSIT':
      case 'DISPATCHED':
      case 'PARTIALLY_RECEIVED':
      case 'PARTIALLY_PAID':
        return { label: normalized.replace('_', ' '), variant: 'warning', dot: true };

      case 'CANCELLED':
      case 'VOID':
      case 'REJECTED':
        return { label: normalized.replace('_', ' '), variant: 'danger', dot: true };

      case 'DRAFT':
      case 'ACTIVE':
        return { label: normalized.replace('_', ' '), variant: 'info', dot: true };

      case 'PAID':
        return { label: 'Paid', variant: 'success', dot: true };
      case 'UNPAID':
        return { label: 'Unpaid', variant: 'danger', dot: true };

      case 'INACTIVE':
        return { label: 'Inactive', variant: 'neutral', dot: false };

      default:
        return { label: normalized.replace(/_/g, ' '), variant: 'neutral', dot: false };
    }
  };

  const { label, variant, dot } = getStatusConfig();

  return (
    <Badge variant={variant} dot={dot} className={`ui-status-badge ${className}`}>
      {label}
    </Badge>
  );
};

export default StatusBadge;
