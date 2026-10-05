import React from 'react';

/**
 * Enterprise Button Component
 * @param {'primary' | 'secondary' | 'outline' | 'danger' | 'ghost'} variant
 * @param {'sm' | 'md' | 'lg'} size
 * @param {boolean} isLoading
 * @param {React.ReactNode} icon - Leading icon
 * @param {React.ReactNode} rightIcon - Trailing icon
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon = null,
  rightIcon = null,
  type = 'button',
  className = '',
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      className={`ui-btn ui-btn-${variant} ui-btn-${size} ${isLoading ? 'is-loading' : ''} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="ui-btn-spinner" aria-hidden="true" />
      ) : (
        icon && <span className="ui-btn-icon-left">{icon}</span>
      )}
      <span className="ui-btn-text">{children}</span>
      {!isLoading && rightIcon && <span className="ui-btn-icon-right">{rightIcon}</span>}
    </button>
  );
};

export default Button;
