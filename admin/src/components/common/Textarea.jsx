import React, { forwardRef } from 'react';

export const Textarea = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      placeholder,
      rows = 3,
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
    const inputId = id || name || `area-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={`ui-form-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="ui-textarea"
          aria-invalid={Boolean(error)}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
export default Textarea;
