import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Lock,
  Bell,
  Globe,
  Download,
  Shield,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Moon,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const SettingsPage = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form
  const [name, setName] = useState(user?.name || 'Shreya Yadav');
  const [avatar, setAvatar] = useState(user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ text: '', type: '' });

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  // Preferences
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [negativeSpikeAlert, setNegativeSpikeAlert] = useState(true);
  const [language, setLanguage] = useState('en');
  const [exporting, setExporting] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMessage({ text: '', type: '' });
    try {
      const res = await api.put('/settings/profile', { name, avatar });
      updateUserProfile(res.data.user);
      setProfileMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setProfileMessage({ text: err.response?.data?.detail || 'Failed to update profile.', type: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ text: '', type: '' });
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setPasswordSaving(true);
    try {
      await api.put('/settings/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      setPasswordMessage({ text: 'Password changed successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ text: err.response?.data?.detail || 'Failed to change password.', type: 'error' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleExportAllData = async () => {
    try {
      setExporting(true);
      const res = await api.get('/settings/export-data');
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(res.data, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `sentiment_scope_data_export_${user?.id || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Account & System Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Manage your analyst profile, security credentials, notification channels, and cloud data backups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Profile & Password */}
        <div className="lg:col-span-7 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">User Profile</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt={name}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-purple-100 shadow-xs shrink-0"
                />
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Avatar Image URL
                  </label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email || 'shreya@sentimentscope.com'}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              {profileMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  profileMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {profileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Change Password</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white"
                />
              </div>

              {passwordMessage.text && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  passwordMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {passwordMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column (5 cols): Preferences & Account Management */}
        <div className="lg:col-span-5 space-y-6">
          {/* Role & Subscription Info */}
          <div className="bg-gradient-to-br from-purple-700 to-indigo-700 rounded-3xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                Current Access Tier
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/20 text-white text-[10px] font-bold flex items-center gap-1">
                <Shield className="w-3 h-3" />
                {user?.role || 'Super Admin'}
              </span>
            </div>
            <h4 className="text-xl font-black">
              {user?.plan || 'Pro Enterprise Plan'}
            </h4>
            <p className="text-xs text-purple-100/80 mt-1 leading-relaxed">
              Unlimited single-text evaluations, parallel WebSocket streams, and high-throughput bulk dataset imports.
            </p>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <Bell className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Alert Preferences
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Email Digest</p>
                  <p className="text-[11px] text-slate-500">Receive weekly consolidated summaries.</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyDigest}
                  onChange={(e) => setWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-bold text-slate-800">Negative Grievance Spike</p>
                  <p className="text-[11px] text-slate-500">Alert immediately when negative threshold exceeds 25%.</p>
                </div>
                <input
                  type="checkbox"
                  checked={negativeSpikeAlert}
                  onChange={(e) => setNegativeSpikeAlert(e.target.checked)}
                  className="w-4 h-4 accent-purple-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Data Export & Account Actions */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Data Portability</h3>
            <p className="text-xs text-slate-500">
              Download a complete JSON export of all your analysis evaluations and uploaded datasets.
            </p>

            <button
              onClick={handleExportAllData}
              disabled={exporting}
              className="w-full py-2.5 rounded-xl border border-purple-200 hover:bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              <span>Download Complete JSON Backup</span>
            </button>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
