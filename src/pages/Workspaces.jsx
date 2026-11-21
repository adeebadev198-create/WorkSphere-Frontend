// src/pages/Workspaces.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  FolderKanban,
  ArrowRight
} from 'lucide-react';

const Workspaces = () => {
  const { workspaces, activeWorkspace, switchWorkspace, refreshUserData } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      const res = await api.post('/workspaces', {
        name: name.trim(),
        description: description.trim(),
      });
      if (res?.data) {
        setShowCreateModal(false);
        setName('');
        setDescription('');
        await refreshUserData();
        switchWorkspace(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" /> Workspace Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 font-normal">
            Switch between enterprise workspaces or initialize a new department.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
        >
          <Plus className="w-4 h-4" /> Create Workspace
        </button>
      </div>

      {/* Grid of Workspaces */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces && workspaces.length > 0 ? (
          workspaces.map((ws) => {
            const wsId = ws._id || ws.id;
            const activeId = activeWorkspace?._id || activeWorkspace?.id;
            const isActive = wsId === activeId;

            return (
              <div
                key={wsId}
                className={`p-5 rounded-2xl bg-white border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-600 ring-2 ring-indigo-600/10 shadow-sm'
                    : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-medium flex items-center justify-center text-sm shadow-xs">
                      {ws.name?.charAt(0)?.toUpperCase()}
                    </div>
                    {isActive ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-indigo-600" /> Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        {ws.memberRole || 'Member'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900 truncate mb-1">{ws.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 font-normal">
                    {ws.description || 'No description provided.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-normal">
                    Status: <strong className="text-slate-800 font-medium">{ws.status || 'Active'}</strong>
                  </span>

                  {isActive ? (
                    <span className="text-xs font-medium text-indigo-600">Current</span>
                  ) : (
                    <button
                      onClick={() => switchWorkspace(ws)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      Switch <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200 text-center">
            <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-medium">No workspaces found.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Create Workspace</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Isolate teams, initiatives, and role permissions.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Core Engineering"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="What is this workspace for?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workspaces;
