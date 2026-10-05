import React from 'react';
import LoadingSpinner from './LoadingSpinner';

export const LoadingState = ({
  message = 'Loading data...',
  height = '240px',
  className = '',
}) => {
  return (
    <div
      className={`ui-loading-state ${className}`}
      style={{ minHeight: height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <LoadingSpinner text={message} />
    </div>
  );
};

export default LoadingState;
