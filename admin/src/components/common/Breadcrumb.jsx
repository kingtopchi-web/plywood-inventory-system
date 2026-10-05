import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export const Breadcrumb = ({ items, className = '' }) => {
  const location = useLocation();

  // If items not provided, parse path segments
  const resolvedItems = items || (() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    // pathParts e.g. ['admin', 'products']
    const list = [{ label: 'Dashboard', path: '/admin/dashboard' }];

    if (pathParts.length > 1 && pathParts[1] !== 'dashboard') {
      const formatted = pathParts[1]
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      list.push({ label: formatted, path: location.pathname });
    }
    return list;
  })();

  return (
    <nav className={`ui-breadcrumb ${className}`} aria-label="Breadcrumb">
      <ol className="ui-breadcrumb-list">

        {resolvedItems.map((item, idx) => {
          const isLast = idx === resolvedItems.length - 1;
          // Skip first if it's already dashboard
          if (idx === 0 && item.label === 'Dashboard') return null;

          return (
            <React.Fragment key={item.path || idx}>
              <li className="ui-breadcrumb-separator" aria-hidden="true">
                <ChevronRight size={13} />
              </li>
              <li className="ui-breadcrumb-item">
                {isLast ? (
                  <span className="ui-breadcrumb-current" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link to={item.path} className="ui-breadcrumb-link">
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
