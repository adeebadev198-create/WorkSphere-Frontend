// src/pages/ProjectDetails.jsx
import React, { useState, useEffect } from 'react';
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
  CheckSquare
} from 'lucide-react';

const ProjectDetails = () => {
  const { id } = useParams();
  const { activeWorkspace, user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTaskModal, setShowTaskModal] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/projects/${id}`);
      if (res?.data) {
        setProject(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!title || !dueDate) return;

    try {
      setSubmittingTask(true);
      await api.post('/tasks', {
        project: id,
        title,
        description,
        priority,
        dueDate,
        assignedTo: assignedTo ? [assignedTo] : [],
      });
      setShowTaskModal(false);
      setTitle('');
      setDescription('');
      setDueDate('');
      fetchProjectDetails();
    } catch (err) {
      alert(err.message || 'Failed to create task');
    } finally {
      setSubmittingTask(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mb-2" />
        <p className="text-xs text-gray-500 font-semibold">Loading project details...</p>
      </div>
    );
  }

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

  const isOwnerOrManager = activeWorkspace?.memberRole === 'Owner' || activeWorkspace?.memberRole === 'Manager';

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects Directory
      </Link>

      {/* Project Header Card */}
      <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
              {project.status}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-orange-100 text-orange-700">
              {project.priority} Priority
            </span>
          </div>

          <h1 className="text-2xl lg:text-3xl font-extrabold text-gray-900 tracking-tight mb-2">
            {project.name}
          </h1>

          <p className="text-xs text-gray-500 max-w-2xl leading-relaxed">
            {project.description || 'No detailed description provided for this project.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-gray-400" /> Deadline:{' '}
              <strong className="text-gray-800">
                {new Date(project.endDate).toLocaleDateString()}
              </strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-gray-400" /> Manager:{' '}
              <strong className="text-gray-800">{project.manager?.fullName || 'Unassigned'}</strong>
            </span>
          </div>
        </div>

        {/* Progress KPI Card */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100/80 rounded-2xl p-5 min-w-[220px]">
          <div className="flex justify-between items-center mb-2 text-xs font-bold">
            <span className="text-gray-600">Completion</span>
            <span className="text-purple-700 text-base">{project.progress || 0}%</span>
          </div>
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden mb-3 border border-purple-100">
            <div
              className="h-full bg-[#7C3AED] rounded-full transition-all"
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>{project.completedTasks || 0} Done</span>
            <span>{project.pendingTasks || 0} Pending</span>
          </div>
        </div>
      </div>

      {/* Tasks Section Header */}
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900">Project Tasks ({project.tasks?.length || 0})</h2>
          <p className="text-xs text-gray-400">All deliverables assigned to this project</p>
        </div>

        {isOwnerOrManager && (
          <button
            onClick={() => setShowTaskModal(true)}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-200 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        )}
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-6">Task Title</th>
                <th className="py-3 px-6">Assignee</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {project.tasks && project.tasks.length > 0 ? (
                project.tasks.map((t) => {
                  const statusColors = {
                    'To Do': 'bg-gray-100 text-gray-700',
                    'In Progress': 'bg-blue-100 text-blue-700',
                    'In Review': 'bg-amber-100 text-amber-700',
                    'Completed': 'bg-emerald-100 text-emerald-700',
                  };
                  return (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-900 max-w-[260px] truncate">
                        {t.title}
                      </td>
                      <td className="py-3.5 px-6">
                        {t.assignedTo && t.assignedTo.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                              {t.assignedTo[0].fullName?.charAt(0)}
                            </span>
                            <span className="text-gray-700 truncate">{t.assignedTo[0].fullName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-gray-600">{t.priority}</td>
                      <td className="py-3.5 px-6 text-gray-500">
                        {new Date(t.dueDate).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${statusColors[t.status] || 'bg-gray-100'}`}>
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-400">
                    No tasks added to this project yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Task to Project</h2>
            <p className="text-xs text-gray-500 mb-4">{project.name}</p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement user login API"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Details for this task..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTask}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#7C3AED] hover:bg-purple-700 rounded-xl shadow-md shadow-purple-200 transition-all disabled:opacity-50"
                >
                  {submittingTask ? 'Saving...' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProjectDetails;

