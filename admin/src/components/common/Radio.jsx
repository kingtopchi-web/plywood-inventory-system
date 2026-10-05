import React from 'react';

export const Radio = ({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  helperText,
  className = '',
  id,
  ...props
}) => {
  const radioId = id || `radio-${name}-${value}-${Math.random().toString(36).substring(2, 6)}`;

  return (
    <div className={`ui-radio-container ${disabled ? 'is-disabled' : ''} ${className}`}>
      <label htmlFor={radioId} className="ui-radio-label">
        <div className="ui-radio-circle-wrapper">
          <input
            type="radio"
            id={radioId}
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="ui-radio-input"
            {...props}
          />
          <div className={`ui-radio-visual ${checked ? 'is-checked' : ''}`}>
            {checked && <div className="ui-radio-dot" />}
          </div>
        </div>
        <div className="ui-radio-text-group">
          <span className="ui-radio-title">{label}</span>
          {helperText && <span className="ui-radio-helper">{helperText}</span>}
        </div>
      </label>
    </div>
  );
};

export default Radio;
