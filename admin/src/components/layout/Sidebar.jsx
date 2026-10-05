import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../constants/navigation';
import { useAuth } from '../../hooks/useAuth';
import { settingsService } from '../../services/settingsService';

export const Sidebar = ({
  isCollapsed = false,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const { admin } = useAuth();
  const location = useLocation();
  const [searchFilter, setSearchFilter] = useState('');
  const [companyName, setCompanyName] = useState('Plywood OS');

  // Track expanded/collapsed state of each navigation section
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState = {};
    NAVIGATION_SECTIONS.forEach((section, index) => {
      // Expand ONLY if it contains the currently active path, otherwise collapse
      const hasActiveItem = section.items.some(item => location.pathname === item.path);
      initialState[index] = hasActiveItem; 
    });
    return initialState;
  });

  const toggleSection = (index) => {
    setExpandedSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  React.useEffect(() => {
    let isMounted = true;
    const fetchSettings = () => {
      settingsService.getSettings()
        .then((res) => {
          if (isMounted) {
            // Check if backend wrapped it in data, or if it's the raw object
            const name = res?.data?.companyName || res?.companyName;
            if (name) {
              setCompanyName(name);
            }
          }
        })
        .catch(() => {});
    };
    
    fetchSettings();
    
    // Refresh when settings are explicitly saved
    window.addEventListener('settingsUpdated', fetchSettings);
    
    // Refresh company name occasionally to catch updates across tabs
    const interval = setInterval(fetchSettings, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('settingsUpdated', fetchSettings);
    };
  }, []);

  // Filter items if user typed a search query
  const filteredSections = NAVIGATION_SECTIONS.map((section) => {
    if (!searchFilter.trim()) return section;
    const matchingItems = section.items.filter((item) =>
      item.name.toLowerCase().includes(searchFilter.toLowerCase())
    );
    return { ...section, items: matchingItems };
  }).filter((section) => section.items.length > 0);

  const handleNavClick = () => {
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${isCollapsed ? 'is-collapsed' : ''} ${isMobileOpen ? 'is-mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div className={`brand-icon-box ${admin?.logo ? 'has-image' : ''}`} title="Plywood ERP Console">
            {admin?.logo ? (
              <img src={admin.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }} />
            ) : (
              <LucideIcons.Boxes size={22} />
            )}
          </div>

          {!isCollapsed && (
            <div className="brand-text">
              <h1 style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }}>{companyName}</h1>
              <span>Enterprise Admin</span>
            </div>
          )}

          {/* Close button inside mobile drawer */}
          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-mobile-close-btn"
              onClick={onCloseMobile}
              aria-label="Close sidebar"
            >
              <LucideIcons.X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="sidebar-nav">
          {filteredSections.map((section, sIndex) => {
            const isExpanded = expandedSections[sIndex];
            const SectionIcon = LucideIcons[section.icon] || LucideIcons.Folder;
            
            return (
            <div key={sIndex} className="nav-section">
              {!isCollapsed && (
                <div 
                  className="nav-section-title" 
                  onClick={() => toggleSection(sIndex)}
                >
                  <SectionIcon className="nav-section-title-icon" />
                  <span className="nav-section-title-text">{section.title}</span>
                  <LucideIcons.ChevronDown 
                    size={16} 
                    style={{ 
                      transition: 'transform 0.3s ease',
                      transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                      color: 'var(--text-muted)'
                    }} 
                  />
                </div>
              )}
              
              {/* Only show items if expanded OR if sidebar is collapsed (since title is hidden anyway) */}
              <div className="nav-items-container" style={{
                display: (!isCollapsed && !isExpanded) ? 'none' : 'block'
              }}>
                {section.items.map((item) => {
                  const isActive = location.pathname === item.path;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={handleNavClick}
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      title={isCollapsed ? item.name : undefined}
                    >
                      {!isCollapsed && (
                        <span className="nav-item-text">{item.name}</span>
                      )}
                      {isCollapsed && (
                        /* In collapsed mode, maybe just show a circle or first letter */
                        <span style={{textAlign: 'center', width: '100%', fontWeight: 'bold'}}>{item.name.charAt(0)}</span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
            );
          })}
        </nav>

        {/* Super Admin Badge Footer */}
        <div className="sidebar-footer">
          <div className="admin-badge">
            <div className={`admin-avatar ${admin?.profileImage ? 'has-image' : ''}`}>
              {admin?.profileImage ? (
                <img src={admin.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
              ) : (
                admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'
              )}
            </div>
            {!isCollapsed && (
              <div className="admin-info">
                <div className="name">{admin?.name || 'Super Admin'}</div>
                <div className="role-tag">SUPER ADMIN</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
