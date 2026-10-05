import React, { forwardRef } from 'react';
import { Calendar } from 'lucide-react';

export const DatePicker = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      error,
      helperText,
      required = false,
      disabled = false,
      min,
      max,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `date-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`ui-form-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <div className="ui-input-wrapper">
          <Calendar className="ui-input-icon-left" size={16} aria-hidden="true" />
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="date"
            value={value || ''}
            onChange={onChange}
            disabled={disabled}
            required={required}
            min={min}
            max={max}
            className="ui-input has-icon-left"
            aria-invalid={Boolean(error)}
            {...props}
          />
        </div>
        {error && (
          <span className="ui-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && <span className="ui-helper-text">{helperText}</span>}
      </div>
    );
  }
);

DatePicker.displayName = 'DatePicker';
export default DatePicker;
