// src/pages/Settings.jsx
import React, { useState, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Lock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Save,
  Camera,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react';

const Settings = () => {
  const { user, activeWorkspace, refreshUserData } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [title, setTitle] = useState(user?.title || '');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Workspace Settings State
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || '');
  const [workspaceDesc, setWorkspaceDesc] = useState(activeWorkspace?.description || '');
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [workspaceSuccess, setWorkspaceSuccess] = useState('');
  const [workspaceError, setWorkspaceError] = useState('');

  const isWorkspaceOwner = activeWorkspace?.memberRole === 'Owner';

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file (JPG, PNG, WEBP, or GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setProfileError('Image size must be 5MB or smaller.');
      return;
    }

    setProfileError('');
    setProfileSuccess('');

    // Show immediate local preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/users/profile/avatar', formData);
      await refreshUserData();
      setProfileSuccess('Profile picture uploaded and saved!');
    } catch (err) {
      setAvatarPreview('');
      setProfileError(err.message || 'Failed to upload profile picture');
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    try {
      setProfileSaving(true);
      await api.patch('/users/profile', {
        fullName,
        phone,
        title,
      });
      setProfileSuccess('Profile updated successfully!');
      refreshUserData();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }
    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordSaving(true);
      await api.patch('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    setWorkspaceError('');
    setWorkspaceSuccess('');

    try {
      setWorkspaceSaving(true);
      const res = await api.patch(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}`, {
        name: workspaceName,
        description: workspaceDesc,
      });
      setWorkspaceSuccess('Workspace details updated successfully!');
      refreshUserData();
    } catch (err) {
      setWorkspaceError(err.message || 'Failed to update workspace');
    } finally {
      setWorkspaceSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-purple-100/90">
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Account & Workspace Settings</h1>
        <p className="text-xs text-slate-500 font-normal mt-0.5">Manage your profile credentials and workspace configurations</p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-purple-100 pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-xs shadow-purple-500/20'
              : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50/70'
          }`}
        >
          <User className="w-3.5 h-3.5" /> My Profile
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-xs shadow-purple-500/20'
              : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50/70'
          }`}
        >
          <Lock className="w-3.5 h-3.5" /> Password & Security
        </button>

        {isWorkspaceOwner && (
          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'workspace'
                ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-xs shadow-purple-500/20'
                : 'text-slate-600 hover:text-purple-800 hover:bg-purple-50/70'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" /> Workspace Management
          </button>
        )}
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-purple-100/90">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Personal Details</h2>
          <p className="text-xs text-slate-500 mb-6 font-normal">Update your profile photo and public user information</p>

          {/* Profile Photo Upload Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 mb-6 rounded-2xl bg-purple-50/40 border border-purple-100/80 max-w-lg">
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-sm overflow-hidden ring-2 ring-white">
              {avatarPreview || user?.profilePicture ? (
                <img
                  src={avatarPreview || user.profilePicture}
                  alt={user?.fullName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.fullName?.charAt(0) || 'U').toUpperCase()
              )}
              {avatarUploading && (
                <div className="absolute inset-0 bg-purple-950/60 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900">Profile Picture</p>
              <p className="text-[11px] text-slate-500 mt-0.5">JPG, PNG, WEBP or GIF (max 5MB). Uploaded via Cloudinary.</p>
              <div className="mt-2.5 flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {avatarUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Camera className="w-3.5 h-3.5" /> Change Photo
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <span className="text-[10px] text-slate-400">Email is fixed to your unique account identifier.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Professional Title</label>
              <input
                type="text"
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={profileSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white rounded-xl text-xs font-medium shadow-xs shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {profileSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Security */}
      {activeTab === 'security' && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Update Password</h2>
          <p className="text-xs text-slate-500 mb-6 font-normal">Ensure your account uses a secure password</p>

          {passwordSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrentPwd ? 'text' : 'password'}
                  required
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3.5 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPwd ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type={showNewPwd ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white rounded-xl text-xs font-medium shadow-xs shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {passwordSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Workspace Management (Owner Only) */}
      {activeTab === 'workspace' && isWorkspaceOwner && (
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
          <h2 className="text-base font-semibold text-slate-900 mb-1">Workspace Configuration</h2>
          <p className="text-xs text-slate-500 mb-6 font-normal">Modify details for <span className="font-medium text-indigo-600">{activeWorkspace?.name}</span></p>

          {workspaceSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{workspaceSuccess}</span>
            </div>
          )}

          {workspaceError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{workspaceError}</span>
            </div>
          )}

          <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Workspace Name *</label>
              <input
                type="text"
                required
                value={workspaceName}
                onChange={(e) => setWorkspaceName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows="3"
                value={workspaceDesc}
                onChange={(e) => setWorkspaceDesc(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={workspaceSaving}
                className="px-5 py-2.5 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white rounded-xl text-xs font-medium shadow-xs shadow-purple-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {workspaceSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Workspace Settings
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default Settings;

