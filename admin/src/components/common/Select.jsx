import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export const Select = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      options = [],
      placeholder = 'Select option...',
      error,
      helperText,
      required = false,
      disabled = false,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`ui-form-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={selectId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <div className="ui-select-wrapper">
          <select
            ref={ref}
            id={selectId}
            name={name}
            value={value}
            onChange={onChange}
            disabled={disabled}
            required={required}
            className="ui-select"
            aria-invalid={Boolean(error)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => {
              const optVal = typeof opt === 'object' ? opt.value : opt;
              const optLabel = typeof opt === 'object' ? opt.label : opt;
              return (
                <option key={optVal} value={optVal}>
                  {optLabel}
                </option>
              );
            })}
          </select>
          <ChevronDown className="ui-select-icon" size={16} aria-hidden="true" />
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

Select.displayName = 'Select';
export default Select;
