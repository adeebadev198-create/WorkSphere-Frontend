// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  FolderKanban, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Calendar,
  Layers,
  ArrowUpRight,
  Activity,
  Loader2,
  Sparkles,
  Zap,
  CheckSquare
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, activeWorkspace } = useAuth();
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
      <div className="flex flex-col items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 text-[#6366F1] animate-spin mb-3" />
        <p className="text-xs font-bold text-slate-400">Loading live workspace intelligence...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-3xl text-rose-700 text-xs">
        <p className="font-bold">Error loading dashboard</p>
        <p className="mt-1">{error}</p>
        <button
          onClick={fetchDashboard}
          className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const statusData = charts?.statusBreakdown || [];
  const monthlyData = charts?.monthlyCompletion || [];
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentTasks = data?.recentTasks || [];
  const recentActivities = data?.recentActivities || [];

  // Top metric cards matching TaskFlow layout (User reference image 4)
  const topMetrics = [
    {
      label: 'Task Completion Rate',
      value: kpis.completionRate || '0%',
      sub: `${kpis.completedTasks ?? 0} tasks finished`,
      icon: CheckCircle2,
      color: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Active Projects',
      value: kpis.activeProjects ?? 0,
      sub: `${kpis.totalProjects ?? 0} registered`,
      icon: FolderKanban,
      color: 'bg-indigo-500/10 text-[#6366F1]',
    },
    {
      label: 'Team Velocity',
      value: `${kpis.inProgressTasks ?? 0}`,
      sub: `${kpis.inReviewTasks ?? 0} in review`,
      icon: Zap,
      color: 'bg-sky-500/10 text-sky-600',
    },
    {
      label: 'Overdue Warnings',
      value: kpis.overdueTasks ?? 0,
      sub: kpis.overdueTasks > 0 ? 'Requires attention' : 'All on track',
      icon: AlertTriangle,
      color: kpis.overdueTasks > 0 ? 'bg-rose-500/10 text-rose-600' : 'bg-slate-100 text-slate-500',
    },
  ];

  const donutColors = ['#6366F1', '#38BDF8', '#F59E0B', '#10B981', '#F43F5E'];

  return (
    <div className="space-y-6">
      
      {/* ── Top Metric Cards Row (Clean white rounded cards with soft shadows like image 4) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-slate-400">{m.label}</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 tracking-tight">
                  {m.value}
                </div>
                <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">{m.sub}</span>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${m.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Visual Charts Row (Velocity Area Chart & Task Donut from image 4) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Monthly Velocity Area Chart (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Monthly Progress</h3>
              <p className="text-xs text-slate-400">Task completion and velocity trends from MongoDB</p>
            </div>
            <span className="text-xs font-bold text-[#6366F1] bg-indigo-50 px-3 py-1 rounded-full">
              Real-time
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#6366F1"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#velocityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Task Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Productivity Trends</h3>
            <p className="text-xs text-slate-400">Task distribution by workflow stage</p>
          </div>

          <div className="h-52 relative flex items-center justify-center my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{kpis.completionRate || '0%'}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold">Done</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: donutColors[idx % donutColors.length] }}
                />
                <span className="truncate font-medium">{s._id}:</span>
                <span className="font-extrabold text-slate-900">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── Bottom Split: Recent Tasks & Upcoming Deadlines ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recent Tasks Table (8 cols) */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Recent Tasks</h3>
              <p className="text-xs text-slate-400">Latest active assignments in {activeWorkspace?.name}</p>
            </div>
            <Link to="/tasks" className="text-xs font-bold text-[#6366F1] hover:underline">
              View all &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                  <th className="pb-3 px-2">Task</th>
                  <th className="pb-3 px-2">Project</th>
                  <th className="pb-3 px-2">Priority</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentTasks && recentTasks.length > 0 ? (
                  recentTasks.slice(0, 5).map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-2 font-bold text-slate-800 max-w-[200px] truncate">
                        {t.title}
                      </td>
                      <td className="py-3 px-2 text-slate-500 truncate max-w-[140px]">
                        {t.project?.name || 'Project'}
                      </td>
                      <td className="py-3 px-2 font-bold">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full ${
                            t.priority === 'Critical' || t.priority === 'High'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-xs text-slate-400 italic">
                      No tasks found in this workspace yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Upcoming Deadlines (4 cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">Deadlines</h3>
                <p className="text-xs text-slate-400">Due within next 7 days</p>
              </div>
              <Calendar className="w-5 h-5 text-slate-400" />
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-800 truncate">{t.title}</p>
                      <p className="text-[10px] text-slate-400 truncate">{t.project?.name}</p>
                    </div>
                    <span className="text-[10px] font-bold text-[#6366F1] bg-white px-2 py-1 rounded-xl shadow-2xs shrink-0">
                      {new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 italic">
                  No upcoming deadlines this week.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/kanban"
            className="w-full mt-4 py-2.5 bg-[#6366F1] hover:bg-indigo-600 text-white font-bold text-xs rounded-2xl text-center shadow-md shadow-indigo-500/25 transition-all block"
          >
            Open Kanban Board &rarr;
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
