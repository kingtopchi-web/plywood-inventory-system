import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span className={`ui-badge variant-${variant} size-${size} ${className}`}>
      {dot && <span className="ui-badge-dot" aria-hidden="true" />}
      <span className="ui-badge-text">{children}</span>
    </span>
  );
};

export default Badge;
