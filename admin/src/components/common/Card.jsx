import React from 'react';

export const Card = ({ children, className = '', hover = false, ...props }) => {
  return (
    <div className={`ui-card ${hover ? 'has-hover' : ''} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '', action = null }) => {
  return (
    <div className={`ui-card-header ${className}`}>
      <div className="ui-card-title-group">{children}</div>
      {action && <div className="ui-card-action">{action}</div>}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return <h4 className={`ui-card-title ${className}`}>{children}</h4>;
};

export const CardSubtitle = ({ children, className = '' }) => {
  return <p className={`ui-card-subtitle ${className}`}>{children}</p>;
};

export const CardBody = ({ children, className = '', noPadding = false }) => {
  return (
    <div className={`ui-card-body ${noPadding ? 'no-padding' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return <div className={`ui-card-footer ${className}`}>{children}</div>;
};

export default Card;
