import React from 'react';
import { PackageOpen } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'No Data Available',
  description = 'There are currently no items recorded in this section.',
  action = null,
  className = '',
}) => {
  return (
    <div className={`ui-empty-state ${className}`}>
      <div className="ui-empty-icon-wrapper">
        <Icon size={40} className="ui-empty-icon" />
      </div>
      <h3 className="ui-empty-title">{title}</h3>
      <p className="ui-empty-description">{description}</p>
      {action && <div className="ui-empty-action">{action}</div>}
    </div>
  );
};

export default EmptyState;
