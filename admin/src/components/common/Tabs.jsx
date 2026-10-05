import React from 'react';

export const Tabs = ({
  tabs = [],
  activeTab,
  onChange,
  className = '',
  children,
}) => {
  return (
    <div className={`ui-tabs-container ${className}`}>
      <div className="ui-tabs-list" role="tablist">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`ui-tab-btn ${isActive ? 'is-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.icon && <span className="ui-tab-icon">{tab.icon}</span>}
              <span className="ui-tab-label">{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`ui-tab-badge ${isActive ? 'active' : ''}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {children && <div className="ui-tabs-content">{children}</div>}
    </div>
  );
};

export const TabPanel = ({ id, activeTab, children, className = '' }) => {
  if (id !== activeTab) return null;
  return (
    <div className={`ui-tab-panel ${className}`} role="tabpanel">
      {children}
    </div>
  );
};

export default Tabs;
