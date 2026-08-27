// pages/admin/settings.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { apiFetch } from '../../lib/api';

export default function AdminSettings() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    if (!localStorage.getItem('accessToken')) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/users/me');
      if (!res.ok) throw new Error('Unable to load your account.');
      setUser(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters.');
      return;
    }
    setChangingPassword(true);
    try {
      const res = await apiFetch('/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Unable to change password.');
      setMessage('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e) {
      setError(e.message);
    } finally {
      setChangingPassword(false);
    }
  };

  const uploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/users/me/photos', { method: 'POST', body: formData });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setUser((prev) => ({ ...prev, profile_photo: data.url }));
      setMessage('Profile photo updated.');
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 style={{ marginBottom: 20 }}>Admin Settings</h1>

      {message && <div style={s.success}>{message}</div>}
      {error && <div style={s.error}>{error}</div>}

      <div style={s.panel}>
        <h3 style={{ marginTop: 0 }}>Profile photo</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={s.avatarWrap}>
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="Profile" style={s.avatarImg} />
            ) : (
              <div style={s.avatarPlaceholder}>{(user?.display_name || user?.username || '?')[0]?.toUpperCase()}</div>
            )}
          </div>
          <div>
            <button type="button" style={s.uploadBtn} onClick={() => fileInputRef.current?.click()} disabled={uploading}>
              {uploading ? 'Uploading…' : 'Change photo'}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadPhoto} />
          </div>
        </div>
      </div>

      <div style={s.panel}>
        <h3 style={{ marginTop: 0 }}>Change password</h3>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
          <input
            style={s.input}
            type="password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <input
            style={s.input}
            type="password"
            placeholder="New password (min. 10 characters)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            style={s.input}
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button type="submit" style={s.saveBtn} disabled={changingPassword}>
            {changingPassword ? 'Saving…' : 'Update password'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

const s = {
  success: { color: '#8f8', background: '#1a3a1a', padding: 12, borderRadius: 8, marginBottom: 16 },
  error: { color: '#ff6b6b', marginBottom: 16 },
  panel: { background: '#161625', border: '1px solid #2a2a3e', borderRadius: 12, padding: 20, marginBottom: 20 },
  avatarWrap: { width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { width: '100%', height: '100%', background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold', color: '#fff' },
  uploadBtn: { background: '#2a2a3e', border: '1px solid #444', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer' },
  input: { background: '#0f0f1a', border: '1px solid #333', borderRadius: 8, padding: 10, color: '#fff' },
  saveBtn: { background: 'linear-gradient(135deg, #ff3f9d 0%, #ff5da8 35%, #9b35ff 100%)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 'bold', marginTop: 6 }
};
