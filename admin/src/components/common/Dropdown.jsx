import React, { useState, useRef, useEffect } from 'react';

export const Dropdown = ({
  trigger,
  children,
  align = 'right',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`ui-dropdown ${className}`} ref={dropdownRef}>
      <div
        className="ui-dropdown-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`ui-dropdown-menu align-${align}`}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export const DropdownItem = ({
  children,
  icon = null,
  onClick,
  danger = false,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      className={`ui-dropdown-item ${danger ? 'is-danger' : ''} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {icon && <span className="ui-dropdown-item-icon">{icon}</span>}
      <span className="ui-dropdown-item-text">{children}</span>
    </button>
  );
};

export const DropdownDivider = () => <div className="ui-dropdown-divider" />;

export default Dropdown;
