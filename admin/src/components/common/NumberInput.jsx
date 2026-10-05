import React, { forwardRef } from 'react';
import { Plus, Minus } from 'lucide-react';

export const NumberInput = forwardRef(
  (
    {
      label,
      name,
      value,
      onChange,
      min = 0,
      max,
      step = 1,
      suffix = '',
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
    const inputId = id || name || `num-${Math.random().toString(36).substring(2, 9)}`;

    const handleIncrement = () => {
      if (disabled) return;
      const current = Number(value) || 0;
      const next = current + step;
      if (max !== undefined && next > max) return;
      if (onChange) {
        onChange({ target: { name, value: next } });
      }
    };

    const handleDecrement = () => {
      if (disabled) return;
      const current = Number(value) || 0;
      const next = current - step;
      if (min !== undefined && next < min) return;
      if (onChange) {
        onChange({ target: { name, value: next } });
      }
    };

    return (
      <div className={`ui-form-group ${error ? 'has-error' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
            {required && <span className="ui-required-mark">*</span>}
          </label>
        )}
        <div className="ui-number-wrapper">
          <button
            type="button"
            className="ui-stepper-btn"
            onClick={handleDecrement}
            disabled={disabled || (min !== undefined && Number(value) <= min)}
            aria-label="Decrease value"
          >
            <Minus size={14} />
          </button>
          <input
            ref={ref}
            id={inputId}
            name={name}
            type="number"
            value={value ?? ''}
            onChange={onChange}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            required={required}
            className="ui-number-input"
            aria-invalid={Boolean(error)}
            {...props}
          />
          {suffix && <span className="ui-input-suffix">{suffix}</span>}
          <button
            type="button"
            className="ui-stepper-btn"
            onClick={handleIncrement}
            disabled={disabled || (max !== undefined && Number(value) >= max)}
            aria-label="Increase value"
          >
            <Plus size={14} />
          </button>
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

NumberInput.displayName = 'NumberInput';
export default NumberInput;
