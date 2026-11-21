// src/pages/TaskBoard.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  X,
  Send,
  User,
  Paperclip,
  CheckSquare,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

const COLUMNS = [
  { key: 'To Do', label: 'To - Do', color: 'bg-blue-50/80 text-blue-700 border border-blue-100/70', dot: 'bg-blue-500' },
  { key: 'In Progress', label: 'In Progress', color: 'bg-indigo-50/80 text-indigo-700 border border-indigo-100/70', dot: 'bg-indigo-500' },
  { key: 'In Review', label: 'In Review', color: 'bg-purple-50/80 text-purple-700 border border-purple-100/70', dot: 'bg-purple-500' },
  { key: 'Completed', label: 'Done', color: 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/70', dot: 'bg-emerald-500' },
];

const TaskBoard = () => {
  const { activeWorkspace, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [search, setSearch] = useState('');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Active Task Modal State (for task details & comments)
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailsLoading, setTaskDetailsLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Create Task Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createColumnStatus, setCreateColumnStatus] = useState('To Do');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newProjectId, setNewProjectId] = useState('');
  const [newPriority, setNewPriority] = useState('Medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newAssigneeId, setNewAssigneeId] = useState('');
  const [newLabels, setNewLabels] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchBoardData = async () => {
    try {
      setLoading(true);
      const [tasksRes, projectsRes, membersRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects'),
        api.get(`/workspaces/${activeWorkspace?._id || activeWorkspace?.id}/members`),
      ]);

      if (tasksRes?.data) setTasks(tasksRes.data);
      if (projectsRes?.data) {
        setProjects(projectsRes.data);
        if (projectsRes.data.length > 0 && !newProjectId) {
          setNewProjectId(projectsRes.data[0]._id);
        }
      }
      if (membersRes?.data) setMembers(membersRes.data);
    } catch (err) {
      console.error('Failed to load board data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchBoardData();
    }
  }, [activeWorkspace]);

  // Drag and drop handlers
  const handleDragStart = (e, taskId) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const currentTask = tasks.find((t) => t._id === taskId);
    if (!currentTask || currentTask.status === targetStatus) {
      setDraggedTaskId(null);
      return;
    }

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: targetStatus } : t))
    );

    try {
      setIsUpdatingStatus(true);
      await api.patch(`/tasks/${taskId}/status`, { status: targetStatus });
    } catch (err) {
      alert(err.message || 'Failed to move task. Check permissions or dependencies.');
      setTasks(previousTasks);
    } finally {
      setIsUpdatingStatus(false);
      setDraggedTaskId(null);
    }
  };

  // Open Task Details Modal
  const openTaskModal = async (taskId) => {
    try {
      setTaskDetailsLoading(true);
      setShowCreateModal(false);
      const res = await api.get(`/tasks/${taskId}`);
      if (res?.data) {
        setSelectedTask(res.data);
      }
    } catch (err) {
      alert(err.message || 'Failed to fetch task details');
    } finally {
      setTaskDetailsLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTask) return;

    try {
      setSubmittingComment(true);
      const res = await api.post(`/tasks/${selectedTask._id}/comments`, {
        content: newComment.trim(),
      });
      if (res?.data) {
        setSelectedTask((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data],
        }));
        setNewComment('');
      }
    } catch (err) {
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setModalError('');

    if (!newTitle.trim() || !newProjectId || !newDueDate) {
      setModalError('Title, project, and due date are required');
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        project: newProjectId,
        priority: newPriority,
        status: createColumnStatus,
        dueDate: newDueDate,
        assignedTo: newAssigneeId ? [newAssigneeId] : [],
        labels: newLabels
          ? newLabels.split(',').map((l) => l.trim()).filter(Boolean)
          : [],
      };

      const res = await api.post('/tasks', payload);
      if (res?.data) {
        setTasks((prev) => [res.data, ...prev]);
        setShowCreateModal(false);
        setNewTitle('');
        setNewDescription('');
        setNewDueDate('');
        setNewLabels('');
      }
    } catch (err) {
      setModalError(err.message || 'Failed to create task');
    } finally {
      setCreateLoading(false);
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchProj = selectedProject === 'All' ? true : t.project?._id === selectedProject;
    const matchPrio = selectedPriority === 'All' ? true : t.priority === selectedPriority;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase()));
    return matchProj && matchPrio && matchSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            Tasks <span className="text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100/80 px-2 py-0.5 rounded-full">{tasks.length}</span>
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Interactive drag &amp; drop Kanban workflow with real-time MongoDB database sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setCreateColumnStatus('To Do');
              setShowCreateModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-medium text-xs rounded-xl shadow-xs shadow-indigo-500/20 transition-all flex items-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" /> Add Task
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Project selector dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search task by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
          />
        </div>
      </div>

      {/* ── 4-Column Soft Pastel Kanban Board ── */}
      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs font-medium text-slate-500">Loading board from MongoDB...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
                className="flex flex-col rounded-2xl bg-slate-50/70 border border-slate-200/70 p-4 min-h-[550px] transition-colors"
              >
                {/* Column Pill Header */}
                <div className={`flex items-center justify-between px-3.5 py-2 rounded-xl ${col.color} mb-3.5 font-medium text-xs`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className="font-semibold">{col.label}</span>
                    <span className="text-[11px] opacity-75">({colTasks.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setCreateColumnStatus(col.key);
                      setShowCreateModal(true);
                    }}
                    className="w-5 h-5 rounded-lg bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Column Cards Stream */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.length > 0 ? (
                    colTasks.map((task) => {
                      const priorityColor =
                        task.priority === 'Critical' || task.priority === 'High'
                          ? 'text-rose-600 bg-rose-50 border-rose-100'
                          : task.priority === 'Medium'
                          ? 'text-amber-600 bg-amber-50 border-amber-100'
                          : 'text-slate-600 bg-slate-100 border-slate-200';

                      return (
                        <div
                          key={task._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task._id)}
                          onClick={() => openTaskModal(task._id)}
                          className="group p-4 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-grab active:cursor-grabbing"
                        >
                          {/* Label tag & Priority */}
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] uppercase font-medium text-indigo-600 tracking-wider truncate max-w-[140px]">
                              {task.labels && task.labels[0] ? task.labels[0] : (task.project?.name || 'Task')}
                            </span>
                            <span className={`text-[9px] font-medium px-2 py-0.5 rounded-full border ${priorityColor}`}>
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs font-medium text-slate-800 line-clamp-2 leading-snug mb-3 group-hover:text-indigo-600 transition-colors">
                            {task.title}
                          </h4>

                          {/* Assignees & Meta Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            {/* Avatar Stack */}
                            <div className="flex -space-x-1.5 overflow-hidden">
                              {task.assignedTo && task.assignedTo.length > 0 ? (
                                task.assignedTo.slice(0, 3).map((u, i) => (
                                  <div
                                    key={i}
                                    title={u.fullName}
                                    className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-[9px] font-medium flex items-center justify-center ring-2 ring-white uppercase"
                                  >
                                    {u.fullName?.charAt(0) || 'U'}
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                              )}
                            </div>

                            {/* Due date & Comments info */}
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-normal">
                              {task.dueDate && (
                                <span className="flex items-center gap-1 font-normal">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-32 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-xs text-slate-400 font-normal">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Task Details & Comments Modal ── */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full p-6 max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <span className="text-[10px] font-medium uppercase text-indigo-600 bg-indigo-50 border border-indigo-100/80 px-2 py-0.5 rounded-full">
                  {selectedTask.project?.name || 'Project'}
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-1">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div>
                <h5 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1">Description</h5>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 font-normal">
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>

              {/* Comments Section */}
              <div className="pt-2">
                <h5 className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" /> Comments ({selectedTask.comments?.length || 0})
                </h5>

                <div className="space-y-2.5 mb-3 max-h-48 overflow-y-auto">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((c) => (
                      <div key={c._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-medium text-slate-800">{c.user?.fullName || 'Member'}</span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-slate-700 font-normal">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">No comments on this task yet.</p>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Task Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Create Task in {createColumnStatus}</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Add task details, project, assignee, and target deadline.
            </p>

            {modalError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Customer Journey Mapping"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project *</label>
                <select
                  required
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows="2"
                  placeholder="Task instructions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Assign To</label>
                  <select
                    value={newAssigneeId}
                    onChange={(e) => setNewAssigneeId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">Unassigned</option>
                    {members.map((m) => (
                      <option key={m.user?._id} value={m.user?._id}>
                        {m.user?.fullName} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Label Tag</label>
                  <input
                    type="text"
                    placeholder="e.g. Design, API"
                    value={newLabels}
                    onChange={(e) => setNewLabels(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {createLoading ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TaskBoard;
