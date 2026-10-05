import React from 'react';

export const Switch = ({
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const switchId = id || name || `switch-${Math.random().toString(36).substring(2, 9)}`;

  const handleToggle = () => {
    if (disabled) return;
    if (onChange) {
      onChange({ target: { name, checked: !checked } });
    }
  };

  return (
    <div className={`ui-switch-container ${disabled ? 'is-disabled' : ''} ${className}`}>
      <label htmlFor={switchId} className="ui-switch-label" onClick={(e) => e.preventDefault()}>
        <button
          type="button"
          role="switch"
          id={switchId}
          aria-checked={checked}
          disabled={disabled}
          onClick={handleToggle}
          className={`ui-switch-track ${checked ? 'is-on' : 'is-off'}`}
          {...props}
        >
          <span className="ui-switch-thumb" />
        </button>
        {(label || helperText) && (
          <div className="ui-switch-text-group" onClick={handleToggle}>
            {label && <span className="ui-switch-title">{label}</span>}
            {helperText && <span className="ui-switch-helper">{helperText}</span>}
          </div>
        )}
      </label>
    </div>
  );
};

export default Switch;
