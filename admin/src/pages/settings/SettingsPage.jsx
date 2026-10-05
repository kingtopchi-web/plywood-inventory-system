import React, { useState, useEffect } from 'react';
import { PageHeader, Button, Input } from '../../components/common';
import { useToast } from '../../components/common/Toast';
import { Settings, Bell, Globe, Database } from 'lucide-react';
import { settingsService } from '../../services/settingsService';

export const SettingsPage = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: 'National Plywood',
    lowStockThreshold: 10,
    enableEmailAlerts: true,
    enableSmsAlerts: false,
    sessionTimeout: 60,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsService.getSettings();
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      addToast('error', error.message || 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updated = await settingsService.updateSettings(settings);
      setSettings(updated);
      window.dispatchEvent(new CustomEvent('settingsUpdated'));
      addToast('success', 'System settings saved successfully');
    } catch (error) {
      addToast('error', error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const sectionStyle = {
    marginBottom: '24px',
    paddingBottom: '24px',
    borderBottom: '1px solid var(--border-primary)',
  };


  return (
    <div className="page-container">
      <PageHeader
        title="System Settings"
        subtitle="Configure application preferences and defaults."
        actions={
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        }
      />

      <div className="card" style={{ padding: '24px' }}>
        <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '32px' }}>
          
          {/* Left Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* General Setup */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Globe size={18} color="var(--text-secondary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>General Setup</h3>
              </div>
              <Input
                label="Company Name"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                required
              />
            </div>

            {/* Notifications */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Bell size={18} color="var(--text-secondary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Notifications</h3>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', height: '42px' }}>
                <input
                  type="checkbox"
                  name="enableEmailAlerts"
                  checked={settings.enableEmailAlerts}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                Enable Email Alerts for Low Stock
              </label>
            </div>
          </div>

          {/* Right Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Inventory Preferences */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Database size={18} color="var(--text-secondary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Inventory Defaults</h3>
              </div>
              <Input
                label="Global Low Stock Threshold"
                type="number"
                name="lowStockThreshold"
                value={settings.lowStockThreshold}
                onChange={handleChange}
                min="1"
                required
              />
            </div>

            {/* Security */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Settings size={18} color="var(--text-secondary)" />
                <h3 style={{ margin: 0, fontSize: '15px', color: 'var(--text-primary)' }}>Security</h3>
              </div>
              <Input
                label="Session Timeout (Minutes)"
                type="number"
                name="sessionTimeout"
                value={settings.sessionTimeout}
                onChange={handleChange}
                min="5"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
