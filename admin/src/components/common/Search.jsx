import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';

export const Search = ({
  value: controlledValue,
  onChange,
  onSearch,
  placeholder = 'Search plywood, sku, code...',
  debounceMs = 300,
  className = '',
  size = 'md',
  ...props
}) => {
  const [internalValue, setInternalValue] = useState(controlledValue || '');

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue);
    }
  }, [controlledValue]);

  useEffect(() => {
    if (debounceMs && onSearch) {
      const handler = setTimeout(() => {
        onSearch(internalValue);
      }, debounceMs);
      return () => clearTimeout(handler);
    }
  }, [internalValue, debounceMs, onSearch]);

  const handleChange = (e) => {
    const val = e.target.value;
    setInternalValue(val);
    if (onChange) onChange(e);
  };

  const handleClear = () => {
    setInternalValue('');
    if (onChange) {
      onChange({ target: { value: '' } });
    }
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <div className={`ui-search-wrapper ui-search-${size} ${className}`}>
      <SearchIcon className="ui-search-icon" size={16} aria-hidden="true" />
      <input
        type="text"
        value={internalValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="ui-search-input"
        {...props}
      />
      {internalValue && (
        <button
          type="button"
          onClick={handleClear}
          className="ui-search-clear"
          title="Clear search"
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Search;
