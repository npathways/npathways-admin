import React, { useState } from 'react';
import { Settings, Lock, User, Key, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../Components/Common/Toast';
import './Pages.css';

const UserSettings = () => {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Toggle password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const adminUserJson = localStorage.getItem('adminUser');
  const currentUser = adminUserJson ? JSON.parse(adminUserJson) : null;

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787/api';
  const token = localStorage.getItem('adminToken');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      addToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${baseUrl}/auth/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        addToast('Password updated successfully', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        addToast(data.message || 'Failed to update password', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      addToast('Server error. Please try again later.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page premium-layout" style={{ maxWidth: '800px', margin: '0 auto', padding: '24px' }}>
      <div className="page-header-premium" style={{ marginBottom: '24px' }}>
        <div className="header-text">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={28} /> Settings
          </h1>
          <p>Update your personal password and view your profile information.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Profile Card */}
        {currentUser && (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} /> User Profile
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Full Name</label>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '4px' }}>{currentUser.name}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Email Address</label>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '4px' }}>{currentUser.email}</div>
              </div>
              <div>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>Access Level</label>
                <div style={{ fontSize: '1rem', fontWeight: '600', marginTop: '4px', textTransform: 'capitalize' }}>
                  {currentUser.role}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Password Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={20} /> Change Password
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{
                    padding: '10px 40px 10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    width: '100%',
                    fontSize: '0.95rem',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    padding: '10px 40px 10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    width: '100%',
                    fontSize: '0.95rem',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: '500' }}>Confirm New Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    padding: '10px 40px 10px 12px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    width: '100%',
                    fontSize: '0.95rem',
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: 'var(--color-brand-primary)',
                color: 'var(--text-on-accent)',
                padding: '12px',
                borderRadius: '4px',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '8px',
              }}
            >
              {loading ? (
                <div className="npath-spinner npath-spinner-sm" style={{ borderColor: 'rgba(255,255,255,0.1)', borderTopColor: '#fff' }} />
              ) : (
                <Key size={18} />
              )}
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
