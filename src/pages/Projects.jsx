// src/pages/Projects.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  Layers,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  ListFilter
} from 'lucide-react';

const Projects = () => {
  const { activeWorkspace, user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [endDate, setEndDate] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res?.data) {
        setProjects(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/members`);
      if (res?.data) {
        setMembers(res.data);
        if (res.data.length > 0 && !managerId) {
          setManagerId(res.data[0].user?._id || user?.id);
        }
      }
    } catch (e) {
      // quiet
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchProjects();
      fetchMembers();
    }
  }, [activeWorkspace]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !endDate) {
      setFormError('Project title and deadline date are required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name,
        description,
        priority,
        endDate,
        manager: managerId || user?.id,
        members: selectedMemberIds,
      };

      const res = await api.post('/projects', payload);
      if (res?.data) {
        setShowCreateModal(false);
        setName('');
        setDescription('');
        setEndDate('');
        setSelectedMemberIds([]);
        fetchProjects();
      }
    } catch (err) {
      setFormError(err.message || 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to archive this project?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert(err.message || 'Failed to archive project');
    }
  };

  const tabs = ['All', 'In Progress', 'Planning', 'Completed', 'On Hold'];

  const filteredProjects = projects.filter((p) => {
    const matchTab = activeTab === 'All' ? true : p.status === activeTab;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));
    return matchTab && matchSearch;
  });

  const isAuthorizedToCreate =
    activeWorkspace?.memberRole === 'Owner' || activeWorkspace?.memberRole === 'Manager';

  // Aesthetic project icon colors matching user reference image 2
  const iconBgPalette = [
    'bg-amber-500/10 text-amber-600 border-amber-200',
    'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    'bg-rose-500/10 text-rose-600 border-rose-200',
    'bg-sky-500/10 text-sky-600 border-sky-200',
    'bg-indigo-500/10 text-indigo-600 border-indigo-200',
    'bg-purple-500/10 text-purple-600 border-purple-200',
  ];

  return (
    <div className="space-y-6">
      
      {/* Top Header & Project Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-xs border border-slate-200/70">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Projects</h1>
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center">
              {projects.length}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time departmental project cards, team allocation, and progress tracking.
          </p>
        </div>

        {isAuthorizedToCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 bg-[#6366F1] hover:bg-indigo-600 text-white font-bold text-xs rounded-2xl shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        )}
      </div>

      {/* Tabs and Search Bar (matching reference image 2 subheader) */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Underline Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto border-b border-slate-200/80 pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-[#6366F1]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#6366F1] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white border border-slate-200/80 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/10 placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* Projects Grid (Soft white 3D cards matching user reference image 2) */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-200/70">
          <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-400">Loading projects from MongoDB...</p>
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p, i) => {
            const iconStyle = iconBgPalette[i % iconBgPalette.length];
            const progress = p.progress ?? 0;
            const daysLeft = p.endDate
              ? Math.ceil((new Date(p.endDate) - new Date()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={p._id}
                className="group p-6 rounded-3xl bg-white border border-slate-200/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_32px_rgba(99,102,241,0.08)] hover:border-indigo-200 transition-all duration-300 flex flex-col justify-between relative"
              >
                <div>
                  {/* Top Icon Badge & Delete action */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${iconStyle} shadow-xs`}>
                      <FolderKanban className="w-6 h-6" />
                    </div>

                    {activeWorkspace?.memberRole === 'Owner' && (
                      <button
                        onClick={(e) => handleDeleteProject(p._id, e)}
                        className="text-slate-300 hover:text-rose-600 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Archive Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title and Short Description */}
                  <Link to={`/projects/${p._id}`} className="block group-hover:text-[#6366F1] transition-colors">
                    <h3 className="text-base font-extrabold text-slate-900 truncate tracking-tight mb-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {p.description || 'No description provided.'}
                  </p>

                  {/* Team Avatars cluster */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {p.members && p.members.length > 0 ? (
                        p.members.slice(0, 4).map((m, idx) => (
                          <div
                            key={idx}
                            title={m.fullName || 'Member'}
                            className="w-7 h-7 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-slate-700 uppercase"
                          >
                            {m.fullName?.charAt(0) || 'U'}
                          </div>
                        ))
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 ring-2 ring-white flex items-center justify-center text-[10px] text-slate-400">
                          -
                        </div>
                      )}
                    </div>
                    {p.members && p.members.length > 4 && (
                      <span className="text-[10px] font-bold text-slate-400">
                        +{p.members.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar & Footer */}
                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="text-[11px] text-slate-400">Progress</span>
                    <span className="text-[#6366F1]">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-[#6366F1] rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {daysLeft !== null
                        ? daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? 'Due today'
                          : `${Math.abs(daysLeft)} days overdue`
                        : 'No deadline'}
                    </span>

                    <Link
                      to={`/projects/${p._id}`}
                      className="text-xs font-bold text-[#6366F1] hover:underline flex items-center gap-1"
                    >
                      Open &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/70">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {search
              ? 'No projects match your search keywords.'
              : 'Create your first departmental project to coordinate team workflows and tasks.'}
          </p>
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Create New Project</h2>
            <p className="text-xs text-slate-400 mb-4">
              Set deadlines, designate project manager, and allocate initial team.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  placeholder="Goals and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/10 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366F1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Project Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#6366F1]"
                >
                  {members.map((m) => (
                    <option key={m.user?._id} value={m.user?._id}>
                      {m.user?.fullName} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#6366F1] hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Projects;
