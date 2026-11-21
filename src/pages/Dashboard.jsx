// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Calendar,
  Loader2,
  Clock,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { activeWorkspace } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/overview');
      if (res?.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchDashboard();
    }
  }, [activeWorkspace]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[480px]">
        <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-normal text-slate-400">Loading workspace intelligence…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
        <p className="font-semibold text-sm">Error loading dashboard</p>
        <p className="mt-1 font-normal">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700 cursor-pointer transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentTasks = data?.recentTasks || [];

  // Top metric cards with balanced typography & logo color accents
  const topMetrics = [
    {
      label: 'Task Completion Rate',
      value: kpis.completionRate || '0%',
      sub: `${kpis.completedTasks ?? 0} tasks finished`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100/60',
    },
    {
      label: 'Active Projects',
      value: kpis.activeProjects ?? 0,
      sub: `${kpis.totalProjects ?? 0} registered`,
      icon: FolderKanban,
      iconBg: 'bg-indigo-50 text-indigo-600 border border-indigo-100/60',
    },
    {
      label: 'Team Velocity',
      value: `${kpis.inProgressTasks ?? 0}`,
      sub: `${kpis.inReviewTasks ?? 0} in review`,
      icon: Zap,
      iconBg: 'bg-blue-50 text-blue-600 border border-blue-100/60',
    },
    {
      label: 'Overdue Warnings',
      value: kpis.overdueTasks ?? 0,
      sub: kpis.overdueTasks > 0 ? 'Requires attention' : 'All on track',
      icon: AlertTriangle,
      iconBg: kpis.overdueTasks > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100/60' : 'bg-slate-50 text-slate-400 border border-slate-100',
    },
  ];

  // ── Normalize Monthly Progress data safely from backend ──
  const rawMonthly = charts?.monthlyCompletion || [];
  const monthlyData = rawMonthly.map((m) => ({
    month: m.month || m.name || '',
    completed: m.completed ?? m.approved ?? 0,
    inReview: m.inReview ?? m.reviewed ?? 0,
  }));
  const totalMonthlyCompleted = monthlyData.reduce((acc, curr) => acc + curr.completed, 0);

  // ── Normalize Productivity Trends (Status Breakdown) data safely ──
  const stageDefinitions = [
    { name: 'To Do', color: '#94A3B8' },
    { name: 'In Progress', color: '#2563EB' },
    { name: 'In Review', color: '#F59E0B' },
    { name: 'Completed', color: '#10B981' },
  ];

  const rawStatus = charts?.statusBreakdown || [];
  const statusMap = {};
  rawStatus.forEach((s) => {
    const key = s.name || s._id;
    if (key) {
      statusMap[key] = s.value ?? s.count ?? 0;
    }
  });

  const statusData = stageDefinitions.map((stage) => ({
    name: stage.name,
    value: statusMap[stage.name] ?? 0,
    color: stage.color,
  }));

  const totalTasksCount = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const pieDisplayData = totalTasksCount > 0
    ? statusData.filter((s) => s.value > 0)
    : [{ name: 'No tasks', value: 1, color: '#E2E8F0' }];

  return (
    <div className="space-y-6">
      
      {/* ── Top Metric Cards Row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between transition-all hover:border-slate-300/80"
            >
              <div>
                <span className="text-xs font-medium text-slate-500">{m.label}</span>
                <div className="text-2xl font-semibold text-slate-800 mt-1 tracking-tight">
                  {m.value}
                </div>
                <span className="text-[11px] text-slate-400 font-normal mt-0.5 block">{m.sub}</span>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Visual Charts Row (Monthly Progress & Productivity Trends) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Progress Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Monthly Progress</h3>
              <p className="text-xs font-normal text-slate-400">Task completion and velocity trends across months</p>
            </div>
            <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100/60">
              Real-time
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.20} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                    fontSize: '12px',
                    fontWeight: 500,
                  }}
                  formatter={(val) => [`${val} tasks`, 'Completed']}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#4F46E5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#velocityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {totalMonthlyCompleted === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none bg-white/40 backdrop-blur-[0.5px]">
                <TrendingUp className="w-6 h-6 text-slate-300 mb-1" />
                <span className="text-xs font-normal text-slate-400">Ready to record completed tasks as progress happens</span>
              </div>
            )}
          </div>
        </div>

        {/* Productivity Trends Donut (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Productivity Trends</h3>
            <p className="text-xs font-normal text-slate-400">Task distribution by workflow stage</p>
          </div>

          <div className="h-48 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDisplayData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={totalTasksCount > 0 ? 4 : 0}
                  dataKey="value"
                  isAnimationActive={true}
                >
                  {pieDisplayData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                {totalTasksCount > 0 && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                    formatter={(val, name) => [`${val} tasks`, name]}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-semibold text-slate-800">{kpis.completionRate || '0%'}</span>
              <span className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                {totalTasksCount > 0 ? 'Done' : 'No Tasks'}
              </span>
            </div>
          </div>

          {/* Clean, balanced legend with real stage names and zero broken dots */}
          <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-100">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50/70 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate font-normal text-slate-600">{s.name}</span>
                </div>
                <span className="font-semibold text-slate-800 ml-1.5 text-xs">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Split: Recent Tasks & Upcoming Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recent Tasks Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Recent Tasks</h3>
                <p className="text-xs font-normal text-slate-400">Latest active assignments in {activeWorkspace?.name || 'Workspace'}</p>
              </div>
              <Link to="/tasks" className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-medium uppercase text-[10px] tracking-wider">
                    <th className="pb-3 px-2">Task</th>
                    <th className="pb-3 px-2">Project</th>
                    <th className="pb-3 px-2">Priority</th>
                    <th className="pb-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentTasks && recentTasks.length > 0 ? (
                    recentTasks.slice(0, 5).map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-2 font-medium text-slate-800 max-w-[220px] truncate">
                          {t.title}
                        </td>
                        <td className="py-3 px-2 text-slate-500 truncate max-w-[150px] font-normal">
                          {t.project?.name || 'Project'}
                        </td>
                        <td className="py-3 px-2 font-normal">
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              t.priority === 'Critical' || t.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-600'
                                : t.priority === 'High'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-[10px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {t.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-xs text-slate-400">
                        <div className="flex flex-col items-center justify-center">
                          <Inbox className="w-6 h-6 text-slate-300 mb-1.5" />
                          <span className="font-normal">No tasks created in this workspace yet.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 tracking-tight">Deadlines</h3>
                <p className="text-xs font-normal text-slate-400">Due within next 7 days</p>
              </div>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-medium text-slate-800 truncate">{t.title}</p>
                      <p className="text-[10px] font-normal text-slate-400 truncate">{t.project?.name}</p>
                    </div>
                    <span className="text-[10px] font-medium text-indigo-700 bg-white px-2 py-1 rounded-lg border border-slate-100 shadow-2xs shrink-0">
                      {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 text-slate-300 mb-1.5" />
                  <span className="font-normal">No upcoming deadlines this week.</span>
                </div>
              )}
            </div>
          </div>

          <Link
            to="/kanban"
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-xs rounded-xl text-center shadow-xs transition-all flex items-center justify-center gap-1.5"
          >
            <span>Open Kanban Board</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
