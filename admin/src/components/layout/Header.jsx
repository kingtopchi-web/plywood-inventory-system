import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  Bell,
  Volume2,
  VolumeX,
  LogOut,
  User,
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  PackageX,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Breadcrumb } from '../common/Breadcrumb';
import { Dropdown, DropdownItem, DropdownDivider } from '../common/Dropdown';
import { ConfirmationDialog } from '../common/ConfirmationDialog';
import inventoryService from '../../services/inventoryService';

export const Header = ({
  isCollapsed,
  onToggleCollapse,
  onOpenMobile,
}) => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const prevTotalRef = useRef(null);

  // Play a chime sound using Web Audio API
  const playAlertSound = useCallback((type = 'low') => {
    if (isSoundMuted) return; // respect mute toggle
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const beepSequence = type === 'out' ? [880, 660, 440] : [660, 880]; // urgent triple vs soft double

      beepSequence.forEach((freq, i) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.18);

        gainNode.gain.setValueAtTime(0, ctx.currentTime + i * 0.18);
        gainNode.gain.linearRampToValueAtTime(0.35, ctx.currentTime + i * 0.18 + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.18 + 0.16);

        oscillator.start(ctx.currentTime + i * 0.18);
        oscillator.stop(ctx.currentTime + i * 0.18 + 0.18);
      });

      // Close context after sound finishes
      setTimeout(() => ctx.close(), beepSequence.length * 200 + 200);
    } catch {
      // Browser may block audio without user interaction — silently skip
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchAlerts = async () => {
      try {
        const [lowRes, outRes] = await Promise.all([
          inventoryService.getLowStockAlerts(),
          inventoryService.getOutOfStockAlerts(),
        ]);
        if (isMounted) {
          const lowItems = lowRes?.data || lowRes || [];
          const outItems = outRes?.data || outRes || [];
          const newLow = Array.isArray(lowItems) ? lowItems.length : 0;
          const newOut = Array.isArray(outItems) ? outItems.length : 0;
          const newTotal = newLow + newOut;

          // Play sound only if alert count INCREASED (not on first load)
          if (prevTotalRef.current !== null && newTotal > prevTotalRef.current) {
            // Out of stock is more urgent
            if (newOut > outOfStockCount) {
              playAlertSound('out');
            } else {
              playAlertSound('low');
            }
          }
          prevTotalRef.current = newTotal;

          setLowStockCount(newLow);
          setOutOfStockCount(newOut);
        }
      } catch {
        // non-critical
      }
    };

    fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 15000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [playAlertSound]);

  const totalAlerts = lowStockCount + outOfStockCount;
  const allClear = totalAlerts === 0;

  const handleConfirmLogout = async () => {
    await logout();
    setIsLogoutDialogOpen(false);
    navigate('/admin/login');
  };

  return (
    <header className="admin-header">
      {/* Left controls: Mobile Hamburger & Desktop Collapse & Breadcrumb */}
      <div className="header-left">
        {/* Mobile Hamburger (visible on mobile/tablet) */}
        <button
          type="button"
          className="header-icon-btn mobile-menu-toggle"
          onClick={onOpenMobile}
          aria-label="Open navigation drawer"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="header-breadcrumb-wrapper">
          <Breadcrumb />
        </div>
      </div>

      {/* Right controls: Branch status, Notifications, Super Admin profile menu */}
      <div className="header-right">
        <div id="dashboard-header-portal" style={{ display: 'flex', gap: '16px', alignItems: 'center', marginRight: '16px' }}></div>

        {/* Speaker Mute/Unmute Toggle — left of bell */}
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setIsSoundMuted(prev => !prev)}
          title={isSoundMuted ? 'Sound muted — click to unmute' : 'Sound on — click to mute'}
          aria-label={isSoundMuted ? 'Unmute alerts' : 'Mute alerts'}
          style={{ color: isSoundMuted ? 'var(--text-muted, #94a3b8)' : 'var(--color-success, #22c55e)' }}
        >
          {isSoundMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* Notifications Dropdown */}}
        <Dropdown
          align="right"
          trigger={
            <button
              type="button"
              className="header-icon-btn notification-btn"
              title="Stock Alerts"
              aria-label="Stock Alerts"
              style={{ position: 'relative' }}
            >
              {/* Plain Bell icon */}
              <Bell size={18} />
              {totalAlerts > 0 && (
                <span className="notification-badge">{totalAlerts}</span>
              )}
            </button>
          }
        >
          <div className="notification-dropdown-header">
            <span className="notif-title">Stock Alerts</span>
            {totalAlerts > 0 && (
              <span className="notif-count-pill">{totalAlerts} active</span>
            )}
          </div>
          <div className="notification-list">
            {allClear ? (
              <div className="notif-item empty">
                <CheckCircle2 size={16} color="var(--color-success)" />
                <span>All warehouse stock levels normal</span>
              </div>
            ) : (
              <>
                {lowStockCount > 0 && (
                  <div
                    className="notif-item warning"
                    onClick={() => navigate('/admin/low-stock')}
                    style={{ cursor: 'pointer' }}
                  >
                    <AlertTriangle size={16} className="notif-icon" />
                    <div className="notif-text">
                      <strong>Low Stock</strong>
                      <span>{lowStockCount} items below reorder threshold</span>
                    </div>
                  </div>
                )}
                {outOfStockCount > 0 && (
                  <div
                    className="notif-item danger"
                    onClick={() => navigate('/admin/out-of-stock')}
                    style={{ cursor: 'pointer', borderLeft: '3px solid #ef4444' }}
                  >
                    <PackageX size={16} className="notif-icon" style={{ color: '#ef4444' }} />
                    <div className="notif-text">
                      <strong style={{ color: '#ef4444' }}>Out of Stock</strong>
                      <span>{outOfStockCount} items completely out of stock</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Dropdown>

        {/* Admin Profile Dropdown Menu */}
        <Dropdown
          align="right"
          trigger={
            <div className="admin-profile-trigger">
              <div className={`admin-profile-avatar ${admin?.profileImage ? 'has-image' : ''}`}>
                {admin?.profileImage ? (
                  <img src={admin.profileImage} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'
                )}
              </div>
              <div className="admin-profile-meta">
                <span className="admin-profile-name">{admin?.name || 'Super Admin'}</span>
                <span className="admin-profile-role">SUPER ADMIN</span>
              </div>
              <ChevronDown size={14} className="profile-chevron" />
            </div>
          }
        >
          <div className="profile-menu-header">
            <div className="menu-user-name">{admin?.name || 'Super Administrator'}</div>
            <div className="menu-user-email">{admin?.email}</div>
            <div className="menu-role-chip">
              <ShieldCheck size={12} />
              <span>Full System Authority</span>
            </div>
          </div>

          <DropdownDivider />

          <DropdownItem
            icon={<User size={15} />}
            onClick={() => navigate('/admin/profile')}
          >
            Administrator Profile
          </DropdownItem>

          <DropdownItem
            icon={<Settings size={15} />}
            onClick={() => navigate('/admin/settings')}
          >
            System Settings
          </DropdownItem>

          <DropdownDivider />

          <DropdownItem
            icon={<LogOut size={15} />}
            danger
            onClick={() => setIsLogoutDialogOpen(true)}
          >
            Sign Out
          </DropdownItem>
        </Dropdown>
      </div>

      {/* Confirmation Dialog for Logout */}
      <ConfirmationDialog
        isOpen={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out of Super Admin Console?"
        message="Your active session will be ended securely. You will need to log in again to access the inventory system."
        confirmText="Yes, Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
      />
    </header>
  );
};

export default Header;
