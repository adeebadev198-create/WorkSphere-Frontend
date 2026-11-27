import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/common/ConfirmModal';
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
  Pencil,
  X,
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

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [endDate, setEndDate] = useState('');
  const [managerId, setManagerId] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [projectToDelete, setProjectToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [projectToEdit, setProjectToEdit] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPriority, setEditPriority] = useState('Medium');
  const [editStatus, setEditStatus] = useState('Planning');
  const [editEndDate, setEditEndDate] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/projects');
      if (res?.data) {
        setProjects(res.data);
      }
    } catch (err) {
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

  const openDeleteModal = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToDelete(project);
  };

  const handleConfirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/projects/${projectToDelete._id}`);
      setProjectToDelete(null);
      fetchProjects();
    } catch (err) {
      setFormError(err.message || 'Failed to archive project');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openEditModal = (project, e) => {
    e.preventDefault();
    e.stopPropagation();
    setProjectToEdit(project);
    setEditName(project.name || '');
    setEditDesc(project.description || '');
    setEditPriority(project.priority || 'Medium');
    setEditStatus(project.status || 'Planning');
    setEditEndDate(project.endDate ? project.endDate.split('T')[0] : '');
    setEditError('');
  };

  const handleUpdateProject = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim()) {
      setEditError('Project title is required');
      return;
    }

    try {
      setEditSubmitting(true);
      await api.patch(`/projects/${projectToEdit._id}`, {
        name: editName.trim(),
        description: editDesc.trim(),
        priority: editPriority,
        status: editStatus,
        endDate: editEndDate || undefined,
      });
      setProjectToEdit(null);
      fetchProjects();
    } catch (err) {
      setEditError(err.message || 'Failed to update project');
    } finally {
      setEditSubmitting(false);
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Projects</h1>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium text-xs border border-blue-100/80">
              {projects.length}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-normal">
            Real-time departmental project cards, team allocation, and progress tracking.
          </p>
        </div>

        {isAuthorizedToCreate && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Create Project
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4">

        <div className="flex items-center gap-1 overflow-x-auto w-full md:w-auto border-b border-slate-200 pb-0.5">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab
                  ? 'text-blue-600'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 flex items-center justify-center bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="w-7 h-7 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
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
                className="group p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between relative"
              >
                <div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconStyle} shadow-xs`}>
                      <FolderKanban className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {(activeWorkspace?.memberRole === 'Owner' ||
                        (activeWorkspace?.memberRole === 'Manager' &&
                          (p.manager?._id === (user?._id || user?.id) ||
                           p.manager === (user?._id || user?.id)))) && (
                        <button
                          onClick={(e) => openEditModal(p, e)}
                          className="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit Project"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {(activeWorkspace?.memberRole === 'Owner' ||
                        (activeWorkspace?.memberRole === 'Manager' &&
                          (p.manager?._id === (user?._id || user?.id) ||
                           p.manager === (user?._id || user?.id) ||
                           p.manager?.toString() === (user?._id || user?.id)?.toString()))) && (
                        <button
                          onClick={(e) => openDeleteModal(p, e)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Archive Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <Link to={`/projects/${p._id}`} className="block group-hover:text-indigo-600 transition-colors">
                    <h3 className="text-sm font-semibold text-slate-900 truncate tracking-tight mb-1">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 font-normal">
                    {p.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex -space-x-2 overflow-hidden">
                      {p.members && p.members.length > 0 ? (
                        p.members.slice(0, 4).map((m, idx) => (
                          <div
                            key={idx}
                            title={m.fullName || 'Member'}
                            className="w-7 h-7 rounded-full bg-slate-200 ring-2 ring-white flex items-center justify-center text-[10px] font-medium text-slate-700 uppercase"
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
                      <span className="text-[10px] font-medium text-slate-500">
                        +{p.members.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
                    <span className="text-[11px] text-slate-400">Progress</span>
                    <span className="text-indigo-600 font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-normal">
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
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
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
        <div className="p-16 text-center bg-white rounded-2xl border border-slate-200">
          <FolderKanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">No projects found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-normal">
            {search
              ? 'No projects match your search keywords.'
              : 'Create your first departmental project to coordinate team workflows and tasks.'}
          </p>
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Create New Project</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Set deadlines, designate project manager, and allocate initial team.
            </p>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Redesign 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Description</label>
                <textarea
                  rows="3"
                  placeholder="Goals and expectations..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Deadline Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Project Manager</label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
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
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {projectToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/90 max-w-lg w-full p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 tracking-tight">Edit Project</h2>
                <p className="text-xs text-slate-500 font-normal">Update project details, timeline, and status.</p>
              </div>
              <button
                type="button"
                onClick={() => setProjectToEdit(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Deadline Date</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setProjectToEdit(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleConfirmDeleteProject}
        title="Archive Project"
        message={`Are you sure you want to archive "${projectToDelete?.name}"?`}
        confirmText="Archive Project"
        cancelText="Cancel"
        type="danger"
        loading={deleteLoading}
      />

    </div>
  );
};

export default Projects;
