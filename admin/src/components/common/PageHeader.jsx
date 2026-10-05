import React from 'react';
import Breadcrumb from './Breadcrumb';

export const PageHeader = ({
  title,
  subtitle,
  breadcrumb = true,
  breadcrumbItems,
  actions = null,
  badge = null,
  className = '',
}) => {
  return (
    <div className={`ui-page-header ${className}`}>
      <div className="ui-page-header-main">
        {breadcrumb && <Breadcrumb items={breadcrumbItems} />}
        <div className="ui-page-title-row">
          <div className="ui-page-title-wrapper">
            <h1 className="ui-page-title">{title}</h1>
            {badge && <div className="ui-page-badge">{badge}</div>}
          </div>
          {subtitle && <p className="ui-page-subtitle">{subtitle}</p>}
        </div>
      </div>

      {actions && <div className="ui-page-actions">{actions}</div>}
    </div>
  );
};

export default PageHeader;
