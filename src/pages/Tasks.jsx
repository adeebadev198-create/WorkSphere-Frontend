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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-purple-600" /> Tasks Review & List
          </h1>
          <p className="text-xs text-gray-400">Review status, deadlines, assignees, and progress</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" /> Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-1.5 bg-white font-semibold text-gray-700 focus:outline-none"
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
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab
                  ? 'bg-purple-100 text-purple-700 shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
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
            className="text-xs border border-gray-200 rounded-xl px-3 py-2 bg-white font-semibold text-gray-700 focus:outline-none"
          >
            <option value="All">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Urgent">Urgent</option>
          </select>

          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-[#7C3AED] animate-spin mb-2" />
            <p className="text-xs text-gray-500 font-semibold">Loading tasks...</p>
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Task Title</th>
                  <th className="py-3.5 px-6">Project</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6">Due Date</th>
                  <th className="py-3.5 px-6">Assignee</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTasks.map((t) => {
                  const isOverdue = t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now;
                  const priorityColors = {
                    Low: 'text-gray-500',
                    Medium: 'text-blue-600',
                    High: 'text-orange-600',
                    Urgent: 'text-rose-600 font-bold',
                  };

                  return (
                    <tr key={t._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <p className="font-bold text-gray-900 line-clamp-1">{t.title}</p>
                        {t.description && (
                          <p className="text-[11px] text-gray-400 line-clamp-1">{t.description}</p>
                        )}
                      </td>

                      <td className="py-3.5 px-6 font-semibold text-purple-700">
                        {t.project?.name || 'Project'}
                      </td>

                      <td className={`py-3.5 px-6 ${priorityColors[t.priority] || 'text-gray-500'}`}>
                        {t.priority}
                      </td>

                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-600 font-bold' : 'text-gray-600'}`}>
                          <Clock className="w-3 h-3" />
                          {new Date(t.dueDate).toLocaleDateString()}
                          {isOverdue && ' (Overdue)'}
                        </span>
                      </td>

                      <td className="py-3.5 px-6">
                        {t.assignedTo && t.assignedTo.length > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] flex items-center justify-center">
                              {t.assignedTo[0].fullName?.charAt(0)}
                            </span>
                            <span className="text-gray-700">{t.assignedTo[0].fullName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6">
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-gray-200 bg-gray-50 focus:outline-none"
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
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
          <div className="p-12 text-center text-xs text-gray-400">
            No tasks found matching current filters.
          </div>
        )}
      </div>

    </div>
  );
};

export default Tasks;

