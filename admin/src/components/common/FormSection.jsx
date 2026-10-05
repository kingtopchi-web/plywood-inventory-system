import React from 'react';

export const FormSection = ({
  title,
  description,
  children,
  columns = 2,
  className = '',
}) => {
  return (
    <div className={`ui-form-section ${className}`}>
      {(title || description) && (
        <div className="ui-form-section-header">
          {title && <h5 className="ui-form-section-title">{title}</h5>}
          {description && <p className="ui-form-section-desc">{description}</p>}
        </div>
      )}
      <div className={`ui-form-section-grid cols-${columns}`}>
        {children}
      </div>
    </div>
  );
};

export default FormSection;
