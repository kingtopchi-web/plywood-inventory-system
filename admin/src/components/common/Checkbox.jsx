import React from 'react';
import { Check } from 'lucide-react';

export const Checkbox = ({
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
  const checkboxId = id || name || `check-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`ui-checkbox-container ${disabled ? 'is-disabled' : ''} ${className}`}>
      <label htmlFor={checkboxId} className="ui-checkbox-label">
        <div className="ui-checkbox-box-wrapper">
          <input
            type="checkbox"
            id={checkboxId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="ui-checkbox-input"
            {...props}
          />
          <div className={`ui-checkbox-visual ${checked ? 'is-checked' : ''}`}>
            {checked && <Check size={12} strokeWidth={3} />}
          </div>
        </div>
        <div className="ui-checkbox-text-group">
          <span className="ui-checkbox-title">{label}</span>
          {helperText && <span className="ui-checkbox-helper">{helperText}</span>}
        </div>
      </label>
    </div>
  );
};

export default Checkbox;
