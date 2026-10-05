import React, { forwardRef } from 'react';

export const Input = forwardRef(
  (
    {
      label,
      name,
      type = 'text',
      value,
      onChange,
      placeholder,
      error,
      helperText,
      required = false,
      disabled = false,
      icon = null,
      rightElement = null,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`ui-form-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <div className="ui-input-wrapper">
          {icon && <span className="ui-input-icon-left">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={`ui-input ${icon ? 'has-icon-left' : ''} ${rightElement ? 'has-element-right' : ''}`}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightElement && <div className="ui-input-element-right">{rightElement}</div>}
        </div>
        {error && (
          <span id={`${inputId}-error`} className="ui-error-text" role="alert">
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${inputId}-helper`} className="ui-helper-text">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
