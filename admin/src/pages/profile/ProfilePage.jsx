import React, { useState } from 'react';
import { PageHeader, Button, Input } from '../../components/common';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../components/common/Toast';
import { User, Mail, Shield, Key, Camera, Image as ImageIcon } from 'lucide-react';
import { authService } from '../../services/authService';

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = (error) => reject(error);
});

export const ProfilePage = () => {
  const { admin } = useAuth();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || '',
    email: admin?.email || '',
    profileImage: admin?.profileImage || '',
    logo: admin?.logo || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        addToast('error', 'Image size should be less than 2MB');
        return;
      }
      try {
        const base64 = await fileToBase64(file);
        setFormData((prev) => ({ ...prev, [field]: base64 }));
      } catch (err) {
        addToast('error', 'Failed to read file');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.updateProfile(formData.name, formData.email, formData.profileImage, formData.logo);
      addToast('success', 'Profile updated successfully');
    } catch (error) {
      addToast('error', error.response?.data?.message || error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      addToast('error', 'New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(formData.currentPassword, formData.newPassword);
      addToast('success', 'Password updated successfully');
      setFormData(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
    } catch (error) {
      addToast('error', error.response?.data?.message || error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Admin Profile"
        subtitle="Manage your personal information and security settings."
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '24px', alignItems: 'start' }}>
        {/* Personal Information */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderRadius: '8px' }}>
              <User size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Personal Information</h3>
          </div>
          
          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
               <div>
                 <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Profile Image</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {formData.profileImage ? <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={24} color="var(--text-muted)" />}
                   </div>
                   <label style={{ cursor: 'pointer', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                     <Camera size={14} /> Upload Image
                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'profileImage')} />
                   </label>
                 </div>
               </div>
               
               <div>
                 <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600 }}>Company Logo</label>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                     {formData.logo ? <img src={formData.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ImageIcon size={24} color="var(--text-muted)" />}
                   </div>
                   <label style={{ cursor: 'pointer', background: 'var(--bg-secondary)', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', border: '1px solid var(--border-subtle)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                     <ImageIcon size={14} /> Upload Logo
                     <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileChange(e, 'logo')} />
                   </label>
                 </div>
               </div>
            </div>
            
            <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '4px 0' }}></div>

            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                <User size={14} /> Full Name
              </label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                <Mail size={14} /> Email Address (Non-editable)
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                disabled
                style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                <Shield size={14} /> Role
              </label>
              <Input
                value={admin?.role || 'SUPER_ADMIN'}
                disabled
                style={{ background: 'rgba(255, 255, 255, 0.02)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '8px' }}>
              <Key size={20} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)' }}>Security & Password</h3>
          </div>
          
          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
              <Button type="submit" variant="secondary" disabled={loading}>
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
