import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

export const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`ui-error-state ${className}`}>
      <div className="ui-error-icon-wrapper">
        <AlertCircle size={38} className="ui-error-icon" />
      </div>
      <h3 className="ui-error-title">{title}</h3>
      <p className="ui-error-message">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw size={14} />}
          onClick={onRetry}
          style={{ marginTop: '8px' }}
        >
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
