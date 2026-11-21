// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Trash2,
  ArrowUpDown
} from 'lucide-react';

const Tasks = () => {
  const { activeWorkspace, user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [sortBy, setSortBy] = useState('dueDate');

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const endpoint = activeTab === 'My Tasks' ? '/tasks/my-tasks' : '/tasks';
      const res = await api.get(endpoint, {
        params: { sortBy },
      });
      if (res?.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchTasks();
    }
  }, [activeWorkspace, activeTab, sortBy]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Archive this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const now = new Date();

  const filteredTasks = tasks.filter((t) => {
    const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now;

    if (activeTab === 'In Progress' && t.status !== 'In Progress') return false;
    if (activeTab === 'In Review' && t.status !== 'In Review') return false;
    if (activeTab === 'Completed' && t.status !== 'Completed') return false;
    if (activeTab === 'Overdue' && !isOverdue) return false;

    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;

    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !(t.description && t.description.toLowerCase().includes(search.toLowerCase()))
    ) {
      return false;
    }

    return true;
  });

  const tabs = ['All', 'My Tasks', 'In Progress', 'In Review', 'Completed', 'Overdue'];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" /> Tasks Review & List
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">Review status, deadlines, assignees, and progress</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" /> Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="dueDate">Due Date</option>
            <option value="newest">Newest First</option>
            <option value="priority">Priority</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-white font-medium text-slate-700 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 text-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs text-slate-500 font-medium">Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-6">Task Title</th>
                  <th className="py-3 px-6">Project</th>
                  <th className="py-3 px-6">Priority</th>
                  <th className="py-3 px-6">Due Date</th>
                  <th className="py-3 px-6">Assignee</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((t) => {
                  const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now;
                  const priorityColors = {
                    Low: 'text-slate-500 bg-slate-100 border-slate-200',
                    Medium: 'text-blue-700 bg-blue-50 border-blue-100',
                    High: 'text-amber-700 bg-amber-50 border-amber-100',
                    Urgent: 'text-rose-700 bg-rose-50 border-rose-100',
                  };

                  return (
                    <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-medium text-slate-900 line-clamp-1">{t.title}</p>
                        {t.description && (
                          <p className="text-[11px] text-slate-400 line-clamp-1 font-normal">{t.description}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-6 font-medium text-indigo-600">
                        {t.project?.name || 'Project'}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${priorityColors[t.priority] || 'text-slate-500 bg-slate-100 border-slate-200'}`}>
                          {t.priority}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-medium' : 'text-slate-600'}`}>
                          <Clock className="w-3 h-3 text-slate-400" />
                          {new Date(t.dueDate).toLocaleDateString()}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        {t.assignedTo && t.assignedTo.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-[10px] flex items-center justify-center">
                              {t.assignedTo[0].fullName?.charAt(0)}
                            </span>
                            <span className="text-slate-700 font-normal">{t.assignedTo[0].fullName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 bg-slate-50/80 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="In Review">In Review</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteTask(t._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Archive Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400 font-normal">
            No tasks found matching current filters.
          </div>
        )}
      </div>

    </div>
  );
};

export default Tasks;

