// src/pages/ProjectDetails.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  Loader2,
  AlertCircle,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Activity,
  Trash2,
  User,
  Flag,
  Info,
} from 'lucide-react';

/* ─── Helper: status colour map ────────────────────────────── */
const STATUS_COLORS = {
  'To Do':       { bg: 'bg-gray-100',   text: 'text-gray-700'   },
  'In Progress': { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  'In Review':   { bg: 'bg-amber-100',  text: 'text-amber-700'  },
  'Completed':   { bg: 'bg-emerald-100',text: 'text-emerald-700'},
};
const PRIORITY_COLORS = {
  Low:      'bg-sky-100 text-sky-700',
  Medium:   'bg-yellow-100 text-yellow-700',
  High:     'bg-orange-100 text-orange-700',
  Urgent:   'bg-red-100 text-red-700',
  Critical: 'bg-rose-100 text-rose-800',
};
const PROJECT_STATUS_COLORS = {
  'Planning':    'bg-indigo-100 text-indigo-700',
  'In Progress': 'bg-blue-100   text-blue-700',
  'On Hold':     'bg-yellow-100 text-yellow-700',
  'Completed':   'bg-emerald-100 text-emerald-700',
  'Cancelled':   'bg-red-100    text-red-700',
};

/* ─── Tab definitions ──────────────────────────────────────── */
const TABS = [
  { id: 'overview',  label: 'Overview & Timeline', icon: Info         },
  { id: 'tasks',     label: 'Tasks',               icon: CheckSquare  },
  { id: 'team',      label: 'Team Members',        icon: Users        },
  { id: 'activity',  label: 'Activity History',    icon: Activity     },
];

/* ════════════════════════════════════════════════════════════
   TAB 1 — Overview & Timeline
════════════════════════════════════════════════════════════ */
const OverviewTab = ({ project }) => {
  const startDate = project.startDate ? new Date(project.startDate) : null;
  const endDate   = project.endDate   ? new Date(project.endDate)   : null;
  const now       = new Date();

  // Timeline progress (days elapsed vs total duration)
  let timelineProgress = 0;
  if (startDate && endDate) {
    const total   = endDate - startDate;
    const elapsed = Math.min(now - startDate, total);
    timelineProgress = total > 0 ? Math.round((elapsed / total) * 100) : 0;
    timelineProgress = Math.max(0, timelineProgress);
  }

  const daysLeft = endDate
    ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    : null;

  const statusColors = PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">

      {/* Project info grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Completion */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl p-5">
          <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-1">Completion</p>
          <p className="text-3xl font-extrabold text-purple-700">{project.progress || 0}%</p>
          <div className="mt-3 w-full h-2 bg-purple-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-purple-400 mt-1.5">
            <span>{project.completedTasks || 0} done</span>
            <span>{project.pendingTasks || 0} pending</span>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Total Tasks</p>
          <p className="text-3xl font-extrabold text-gray-900">{project.totalTasks || 0}</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-blue-50 text-blue-700 font-semibold px-2 py-1 text-center">
              {project.tasks?.filter(t => t.status === 'In Progress').length || 0} In Progress
            </div>
            <div className="rounded-xl bg-amber-50 text-amber-700 font-semibold px-2 py-1 text-center">
              {project.tasks?.filter(t => t.status === 'In Review').length || 0} In Review
            </div>
          </div>
        </div>

        {/* Deadline */}
        <div className={`bg-white border rounded-2xl p-5 shadow-sm ${daysLeft !== null && daysLeft < 0 ? 'border-red-200' : 'border-gray-100'}`}>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Deadline</p>
          <p className="text-xl font-extrabold text-gray-900">
            {endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
          </p>
          {daysLeft !== null && (
            <p className={`mt-1 text-xs font-semibold ${daysLeft < 0 ? 'text-red-600' : daysLeft < 7 ? 'text-orange-600' : 'text-gray-400'}`}>
              {daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : daysLeft === 0 ? 'Due today!' : `${daysLeft} days remaining`}
            </p>
          )}
        </div>
      </div>

      {/* Timeline bar */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          Project Timeline
        </h3>

        <div className="relative">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
            <span>{startDate ? startDate.toLocaleDateString() : 'Start'}</span>
            <span className="font-semibold text-purple-600">
              {timelineProgress}% elapsed
            </span>
            <span>{endDate ? endDate.toLocaleDateString() : 'End'}</span>
          </div>
          <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
              style={{ width: `${timelineProgress}%` }}
            />
            {/* Today marker */}
            {timelineProgress > 2 && timelineProgress < 98 && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-orange-400"
                style={{ left: `${timelineProgress}%` }}
                title="Today"
              />
            )}
          </div>
        </div>

        {/* Phase milestones */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { phase: 'Planning',    icon: Flag,          done: ['In Progress', 'On Hold', 'Completed'].includes(project.status) },
            { phase: 'In Progress', icon: Clock,         done: ['Completed'].includes(project.status) },
            { phase: 'Completed',   icon: CheckCircle2,  done: project.status === 'Completed' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold ${
              m.done ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-gray-50 border-gray-100 text-gray-400'
            }`}>
              <m.icon className="w-3.5 h-3.5 shrink-0" />
              {m.phase}
            </div>
          ))}
        </div>
      </div>

      {/* Meta info */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-800 mb-4">Project Details</h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-xs">
          <div>
            <dt className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Status</dt>
            <dd>
              <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${statusColors}`}>
                {project.status}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Priority</dt>
            <dd>
              <span className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${PRIORITY_COLORS[project.priority] || ''}`}>
                {project.priority}
              </span>
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Manager</dt>
            <dd className="font-semibold text-gray-800">{project.manager?.fullName || 'Unassigned'}</dd>
          </div>
          <div>
            <dt className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Members</dt>
            <dd className="font-semibold text-gray-800">{project.members?.length || 0} member(s)</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-400 font-semibold uppercase tracking-wider mb-0.5">Description</dt>
            <dd className="text-gray-700 leading-relaxed">{project.description || 'No description provided.'}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   TAB 2 — Tasks
════════════════════════════════════════════════════════════ */
const TasksTab = ({ project, isOwnerOrManager, onTaskCreated }) => {
  const [showModal, setShowModal]         = useState(false);
  const [title, setTitle]                 = useState('');
  const [description, setDescription]    = useState('');
  const [priority, setPriority]           = useState('Medium');
  const [dueDate, setDueDate]             = useState('');
  const [assignedTo, setAssignedTo]       = useState('');
  const [submitting, setSubmitting]       = useState(false);
  const [filterStatus, setFilterStatus]   = useState('All');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;
    try {
      setSubmitting(true);
      await api.post('/tasks', {
        project: project._id,
        title,
        description,
        priority,
        dueDate,
        assignedTo: assignedTo ? [assignedTo] : [],
      });
      setShowModal(false);
      setTitle(''); setDescription(''); setDueDate(''); setAssignedTo('');
      onTaskCreated();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const tasks = project.tasks || [];
  const statuses = ['All', 'To Do', 'In Progress', 'In Review', 'Completed'];
  const filtered = filterStatus === 'All' ? tasks : tasks.filter(t => t.status === filterStatus);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status filter tabs */}
        <div className="flex gap-1 flex-wrap">
          {statuses.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                filterStatus === s
                  ? 'bg-[#7C3AED] text-white shadow-sm'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {s}
              {s !== 'All' && (
                <span className="ml-1.5 opacity-70">
                  {tasks.filter(t => t.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {isOwnerOrManager && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Task table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Task</th>
                <th className="py-3 px-5">Assignee</th>
                <th className="py-3 px-5">Priority</th>
                <th className="py-3 px-5">Due Date</th>
                <th className="py-3 px-5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length > 0 ? (
                filtered.map(t => {
                  const sc = STATUS_COLORS[t.status] || { bg: 'bg-gray-100', text: 'text-gray-700' };
                  const pc = PRIORITY_COLORS[t.priority] || '';
                  const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < new Date();
                  return (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-5 font-semibold text-gray-900 max-w-[260px] truncate">
                        {t.title}
                        {isOverdue && <span className="ml-2 text-[10px] font-bold text-red-500">OVERDUE</span>}
                      </td>
                      <td className="py-3.5 px-5">
                        {t.assignedTo && t.assignedTo.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                              {t.assignedTo[0].fullName?.charAt(0).toUpperCase()}
                            </span>
                            <span className="text-gray-700 truncate">{t.assignedTo[0].fullName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${pc}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className={`py-3.5 px-5 ${isOverdue ? 'text-red-500 font-semibold' : 'text-gray-500'}`}>
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${sc.bg} ${sc.text}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-10 text-center text-gray-400">
                    {filterStatus === 'All' ? 'No tasks added to this project yet.' : `No tasks with status "${filterStatus}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Task</h2>
            <p className="text-xs text-gray-500 mb-5">{project.name}</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Title *</label>
                <input
                  required value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Implement user login API"
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  rows="2" value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Task details..."
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={priority} onChange={e => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  >
                    {['Low','Medium','High','Urgent','Critical'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Due Date *</label>
                  <input
                    type="date" required value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              </div>

              {/* Assignee select from project members */}
              {project.members && project.members.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Assign To</label>
                  <select
                    value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  >
                    <option value="">Unassigned</option>
                    {project.manager && (
                      <option value={project.manager._id}>{project.manager.fullName} (Manager)</option>
                    )}
                    {project.members.map(m => (
                      <option key={m._id} value={m._id}>{m.fullName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={submitting}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-purple-700 rounded-xl shadow-md shadow-purple-200 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   TAB 3 — Team Members
════════════════════════════════════════════════════════════ */
const TeamTab = ({ project }) => {
  const manager = project.manager;
  const members = project.members || [];
  const allMembers = [
    ...(manager ? [{ ...manager, roleLabel: 'Project Manager', isManager: true }] : []),
    ...members
      .filter(m => !manager || m._id !== manager._id)
      .map(m => ({ ...m, roleLabel: 'Member', isManager: false })),
  ];

  if (allMembers.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm font-medium">No members assigned to this project yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {allMembers.map(member => (
        <div
          key={member._id}
          className={`bg-white rounded-2xl border p-5 shadow-sm flex items-start gap-4 ${
            member.isManager ? 'border-purple-200' : 'border-gray-100'
          }`}
        >
          {/* Avatar */}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-lg shrink-0 ${
            member.isManager ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {member.profilePicture && member.profilePicture.startsWith('http') ? (
              <img src={member.profilePicture} alt={member.fullName} className="w-12 h-12 rounded-2xl object-cover" />
            ) : (
              member.fullName?.charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-sm truncate">{member.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{member.email}</p>
            <div className="mt-2 flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                member.isManager
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {member.roleLabel}
              </span>
              {member.title && (
                <span className="text-[10px] text-gray-400">{member.title}</span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   TAB 4 — Activity History
════════════════════════════════════════════════════════════ */
const ActivityTab = ({ projectId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  useEffect(() => {
    if (!projectId) return;
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await api.get('/activities', { params: { projectId, limit: 50 } });
        setActivities(res?.data || []);
      } catch (err) {
        setError(err.message || 'Failed to load activity history');
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-7 h-7 text-purple-600 animate-spin mb-2" />
        <p className="text-xs text-gray-400 font-medium">Loading activity history…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-xs text-red-700 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>{error}</span>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
        <Activity className="w-10 h-10 text-gray-200 mx-auto mb-3" />
        <p className="text-gray-400 text-sm font-medium">No activity recorded for this project yet.</p>
      </div>
    );
  }

  const ACTION_STYLES = {
    PROJECT_CREATED:  { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    PROJECT_UPDATED:  { bg: 'bg-blue-100',    text: 'text-blue-700'    },
    PROJECT_ARCHIVED: { bg: 'bg-red-100',     text: 'text-red-700'     },
    TASK_CREATED:     { bg: 'bg-indigo-100',  text: 'text-indigo-700'  },
    TASK_UPDATED:     { bg: 'bg-sky-100',     text: 'text-sky-700'     },
    TASK_COMPLETED:   { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    TASK_ASSIGNED:    { bg: 'bg-violet-100',  text: 'text-violet-700'  },
    COMMENT_ADDED:    { bg: 'bg-amber-100',   text: 'text-amber-700'   },
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-50 flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Project Activity</h3>
        <span className="text-xs text-gray-400">{activities.length} event(s)</span>
      </div>

      <div className="divide-y divide-gray-50">
        {activities.map((act, i) => {
          const style = ACTION_STYLES[act.action] || { bg: 'bg-gray-100', text: 'text-gray-700' };
          const actor = act.actor;
          const relTime = new Date(act.createdAt).toLocaleString();
          return (
            <div key={act._id || i} className="flex items-start gap-3 px-5 py-4 hover:bg-gray-50/60 transition-colors">
              {/* Actor avatar */}
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                {actor?.fullName?.charAt(0).toUpperCase() || '?'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-800 leading-relaxed">
                  {act.description}
                </p>
                <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${style.bg} ${style.text}`}>
                    {act.action?.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] text-gray-400">{relTime}</span>
                  {act.task?.title && (
                    <span className="text-[10px] text-gray-500">· Task: <strong>{act.task.title}</strong></span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════ */
const ProjectDetails = () => {
  const { id }                            = useParams();
  const { activeWorkspace }               = useAuth();
  const [project, setProject]             = useState(null);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');
  const [activeTab, setActiveTab]         = useState('overview');

  const isOwnerOrManager =
    activeWorkspace?.memberRole === 'Owner' ||
    activeWorkspace?.memberRole === 'Manager';

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res?.data) setProject(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  /* ── Loading state ── */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mb-2" />
        <p className="text-xs text-gray-500 font-semibold">Loading project details…</p>
      </div>
    );
  }

  /* ── Error / not found ── */
  if (error || !project) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-sm">
        <p className="font-bold">Error loading project</p>
        <p className="mt-1">{error || 'Project not found'}</p>
        <Link to="/projects" className="mt-4 inline-block text-xs font-bold text-purple-600 underline">
          Back to Projects
        </Link>
      </div>
    );
  }

  const statusColors = PROJECT_STATUS_COLORS[project.status] || 'bg-gray-100 text-gray-700';

  return (
    <div className="space-y-6">

      {/* Back link */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects Directory
      </Link>

      {/* Project header card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors}`}>
              {project.status}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold ${PRIORITY_COLORS[project.priority] || ''}`}>
              {project.priority} Priority
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {project.name}
          </h1>

          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            {project.description || 'No description provided.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" /> Deadline:{' '}
              <strong className="text-gray-800">
                {new Date(project.endDate).toLocaleDateString()}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4 text-gray-400" /> Manager:{' '}
              <strong className="text-gray-800">{project.manager?.fullName || 'Unassigned'}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" /> {project.members?.length || 0} Members
            </span>
          </div>
        </div>

        {/* Progress KPI */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/80 rounded-2xl p-5 min-w-[220px]">
          <div className="flex justify-between items-center mb-2 text-xs font-bold">
            <span className="text-gray-600">Completion</span>
            <span className="text-purple-700 text-base">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-3 border border-purple-100">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>{project.completedTasks || 0} Done</span>
            <span>{project.pendingTasks || 0} Pending</span>
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex gap-1 flex-wrap bg-white border border-gray-100 rounded-2xl p-1.5 shadow-sm w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-[#7C3AED] text-white shadow-md shadow-purple-200'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ── */}
      {activeTab === 'overview' && (
        <OverviewTab project={project} />
      )}
      {activeTab === 'tasks' && (
        <TasksTab
          project={project}
          isOwnerOrManager={isOwnerOrManager}
          onTaskCreated={fetchProject}
        />
      )}
      {activeTab === 'team' && (
        <TeamTab project={project} />
      )}
      {activeTab === 'activity' && (
        <ActivityTab projectId={project._id} />
      )}

    </div>
  );
};

export default ProjectDetails;
