// src/pages/Team.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  ShieldCheck, 
  Trash2, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';

const Team = () => {
  const { activeWorkspace, user } = useAuth();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null); // { type: 'success' | 'error', text: '' }

  // Invite state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Member');
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/members`);
      if (res?.data) {
        setMembers(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchMembers();
    }
  }, [activeWorkspace]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');

    if (!inviteEmail) return;

    try {
      setSubmittingInvite(true);
      const res = await api.post(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/invitations`, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setInviteSuccess(res.message || 'Invitation sent successfully!');
      setInviteEmail('');
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
        fetchMembers();
      }, 1500);
    } catch (err) {
      setInviteError(err.message || 'Failed to send invitation');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (memberUserId, newRole) => {
    try {
      await api.patch(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/members/${memberUserId}/role`, {
        role: newRole,
      });
      setFeedbackNotice({ type: 'success', text: 'Member role updated successfully.' });
      setTimeout(() => setFeedbackNotice(null), 3000);
      fetchMembers();
    } catch (err) {
      setFeedbackNotice({ type: 'error', text: err.message || 'Failed to change role' });
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      setRemoveLoading(true);
      const res = await api.delete(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/members/${memberToRemove.id}`);
      let note = `${memberToRemove.name} has been removed from the workspace.`;
      if (res?.data?.uncompletedTasksNeedingReassignment > 0) {
        note += ` (${res.data.uncompletedTasksNeedingReassignment} uncompleted tasks are now flagged for reassignment)`;
      }
      setFeedbackNotice({ type: 'success', text: note });
      setTimeout(() => setFeedbackNotice(null), 5000);
      setMemberToRemove(null);
      fetchMembers();
    } catch (err) {
      setFeedbackNotice({ type: 'error', text: err.message || 'Failed to remove member' });
      setTimeout(() => setFeedbackNotice(null), 4000);
    } finally {
      setRemoveLoading(false);
    }
  };

  const filteredMembers = members.filter((m) => {
    const roleMatch = roleFilter === 'All' ? true : m.role === roleFilter;
    const nameMatch = m.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = m.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && (nameMatch || emailMatch);
  });

  const isOwner = activeWorkspace?.memberRole === 'Owner';

  const getRoleStyle = (role) => {
    switch (role) {
      case 'Owner': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Manager': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Member': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Team Members & Roles
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Manage departmental access, permissions, and employee assignments
          </p>
        </div>

        {isOwner && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <UserPlus className="w-4 h-4" /> Invite New Member
          </button>
        )}
      </div>

      {/* Feedback Banner */}
      {feedbackNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 animate-in fade-in duration-200 ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedbackNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedbackNotice.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1.5">
          {['All', 'Owner', 'Manager', 'Member'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                roleFilter === r
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-semibold">Loading members...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Member</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Title / Designation</th>
                  <th className="py-3.5 px-6">Workspace Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  {isOwner && <th className="py-3.5 px-6 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.map((m) => {
                  const u = m.user || {};
                  return (
                    <tr key={m._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                            {u.fullName?.charAt(0) || 'U'}
                          </span>
                          <div>
                            <p className="font-bold text-gray-900">{u.fullName || 'User'}</p>
                            <span className="text-[10px] text-gray-400">{u.phone || 'No phone'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-6 text-gray-600 font-medium">
                        {u.email}
                      </td>

                      <td className="py-3.5 px-6 text-gray-500">
                        {u.title || 'Team Member'}
                      </td>

                      <td className="py-3.5 px-6">
                        {isOwner && u._id !== user?.id ? (
                          <select
                            value={m.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 focus:outline-none"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Manager">Manager</option>
                            <option value="Member">Member</option>
                          </select>
                        ) : (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getRoleStyle(m.role)}`}>
                            {m.role}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-gray-400">
                        {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : 'N/A'}
                      </td>

                      {isOwner && (
                        <td className="py-3.5 px-6 text-right">
                          {u._id !== user?.id && (
                            <button
                              onClick={() => setMemberToRemove({ id: u._id, name: u.fullName || 'this member' })}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Remove member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Member Modal (FR-MEM-001) */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Invite Team Member</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Add employees to <span className="font-medium text-indigo-600">{activeWorkspace?.name}</span>
            </p>

            {inviteSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{inviteSuccess}</span>
              </div>
            )}

            {inviteError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{inviteError}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Employee Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ahmed@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Assigned Workspace Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 bg-white"
                >
                  <option value="Member">Team Member (Can view & update assigned work)</option>
                  <option value="Manager">Project Manager (Can create projects & assign tasks)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingInvite}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submittingInvite ? 'Inviting...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      <ConfirmModal
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Member from Workspace"
        message={`Are you sure you want to remove ${memberToRemove?.name} from this workspace? Historical task logs, comments, and activities will be retained, and any uncompleted tasks will be flagged for reassignment.`}
        confirmText="Remove Member"
        cancelText="Cancel"
        type="danger"
        loading={removeLoading}
      />

    </div>
  );
};

export default Team;
