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
  Area,
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
  Inbox,
  Activity,
  PlusCircle,
  FileSpreadsheet,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { activeWorkspace, user } = useAuth();
  const [data, setData] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeBottomTab, setActiveBottomTab] = useState('tasks');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, projectsRes] = await Promise.allSettled([
        api.get('/dashboard/overview'),
        api.get('/projects'),
      ]);

      if (overviewRes.status === 'fulfilled' && overviewRes.value?.data) {
        setData(overviewRes.value.data);
      } else if (overviewRes.status === 'rejected') {
        throw new Error(overviewRes.reason?.message || 'Failed to load dashboard metrics');
      }

      if (projectsRes.status === 'fulfilled' && projectsRes.value?.data) {
        setProjectsList(projectsRes.value.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to aggregate workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchDashboardData();
    }
  }, [activeWorkspace]);

  if (loading) {
    return (
      <div className="min-h-[480px] flex items-center justify-center">
        <div className="w-7 h-7 rounded-full border-2 border-indigo-100 border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
        <p className="font-semibold text-sm">Error loading workspace dashboard</p>
        <p className="mt-1 font-normal">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-medium hover:bg-rose-700 cursor-pointer transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const upcomingDeadlines = data?.upcomingDeadlines || [];
  const recentTasks = data?.recentTasks || [];
  const recentActivities = data?.recentActivities || [];

  const isOwner = activeWorkspace?.memberRole === 'Owner';
  const isManager = activeWorkspace?.memberRole === 'Manager';
  const canManage = isOwner || isManager;

  const topMetrics = [
    {
      label: 'Task Completion Rate',
      value: kpis.completionRate || '0%',
      sub: `${kpis.completedTasks ?? 0} of ${kpis.totalTasks ?? 0} closed`,
      icon: CheckCircle2,
      iconBg: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
      badge: 'Sprint Delivery',
      badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
    {
      label: 'Active Projects',
      value: kpis.activeProjects ?? 0,
      sub: `${kpis.totalProjects ?? 0} registered total`,
      icon: FolderKanban,
      iconBg: 'bg-purple-50 text-purple-600 border border-purple-100',
      badge: 'Portfolio Health',
      badgeColor: 'text-purple-700 bg-purple-50 border-purple-200',
    },
    {
      label: 'Team Velocity',
      value: `${kpis.inProgressTasks ?? 0}`,
      sub: `${kpis.inReviewTasks ?? 0} tasks awaiting review`,
      icon: Zap,
      iconBg: 'bg-violet-50 text-violet-600 border border-violet-100',
      badge: 'Active Workload',
      badgeColor: 'text-violet-700 bg-violet-50 border-violet-200',
    },
    {
      label: 'Overdue Warnings',
      value: kpis.overdueTasks ?? 0,
      sub: kpis.overdueTasks > 0 ? 'Requires immediate action' : 'Zero overdue milestones',
      icon: AlertTriangle,
      iconBg: kpis.overdueTasks > 0 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100',
      badge: kpis.overdueTasks > 0 ? 'Action Needed' : 'On Schedule',
      badgeColor: kpis.overdueTasks > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-600 bg-slate-100 border-slate-200',
    },
  ];

  const rawMonthly = charts?.monthlyCompletion || [];
  const monthlyData = rawMonthly.map((m) => ({
    month: m.month || m.name || '',
    completed: m.completed ?? m.approved ?? 0,
    inReview: m.inReview ?? m.reviewed ?? 0,
  }));
  const totalMonthlyCompleted = monthlyData.reduce((acc, curr) => acc + curr.completed, 0);

  const stageDefinitions = [
    { name: 'To Do', color: '#94A3B8' },
    { name: 'In Progress', color: '#7C3AED' },
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
    <div className="space-y-7 animate-in fade-in duration-300">

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-purple-100/90">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Workspace Overview
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
              Live Workspace
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
            <span>Welcome, <strong className="text-slate-900 font-semibold">{user?.fullName || 'User'}</strong></span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
              <Shield className="w-3 h-3" />
              {activeWorkspace?.memberRole || 'Member'} Role
            </span>
            <span>•</span>
            <span className="text-slate-500 font-normal">{activeWorkspace?.name}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
          {canManage && (
            <Link
              to="/projects"
              className="px-3.5 py-2 bg-white hover:bg-purple-50/70 text-slate-700 hover:text-purple-800 font-semibold text-xs rounded-xl border border-purple-100 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
              Projects
            </Link>
          )}

          {canManage && (
            <Link
              to="/tasks"
              className="px-3.5 py-2 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-semibold text-xs rounded-xl shadow-xs shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.99]"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              New Task
            </Link>
          )}

          {canManage && (
            <Link
              to="/reports"
              className="px-3 py-2 bg-purple-50/70 hover:bg-purple-100/80 text-purple-800 font-semibold text-xs rounded-xl border border-purple-100 transition-colors flex items-center gap-1.5"
              title="Export CSV Reports"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-purple-600" />
              Export CSV
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {topMetrics.map((m, i) => {
          const Icon = m.icon;
          return (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex flex-col justify-between transition-all hover:border-purple-200 hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.iconBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-2xl font-bold text-slate-900 tracking-tight">
                  {m.value}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-slate-400 font-normal">{m.sub}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${m.badgeColor}`}>
                    {m.badge}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <div className="lg:col-span-8 p-4 sm:p-6 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Monthly Completion Velocity</h3>
              <p className="text-xs font-normal text-slate-400">Aggregated task completions and reviews per calendar month</p>
            </div>
            <span className="self-start sm:self-auto text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100 shrink-0">
              Annual Cadence
            </span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 15, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3E8FF" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E9D5FF',
                    boxShadow: '0 8px 20px rgba(91,33,182,0.08)',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}
                  formatter={(val) => [`${val} tasks`, 'Completed']}
                />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#velocityGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>

            {totalMonthlyCompleted === 0 && (
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50/90 border border-purple-100 text-[11px] text-purple-700 pointer-events-none whitespace-nowrap shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Ready to record completed tasks as work progresses</span>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Workflow Stage Breakdown</h3>
            <p className="text-xs font-normal text-slate-400">Task volume distributed by Kanban status</p>
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
                      fontWeight: 600,
                    }}
                    formatter={(val, name) => [`${val} tasks`, name]}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900">{kpis.completionRate || '0%'}</span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                {totalTasksCount > 0 ? 'Completed' : 'No Tasks'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
            {statusData.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate font-medium text-slate-600">{s.name}</span>
                </div>
                <span className="font-bold text-slate-900 ml-1.5 text-xs">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="p-6 rounded-2xl bg-white border border-purple-100/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active Projects Portfolio</h3>
            <p className="text-xs font-normal text-slate-400">Current active deliverables and automated progress calculation</p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors"
          >
            All Projects ({projectsList.length}) <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projectsList && projectsList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectsList.slice(0, 3).map((p) => {
              const progressVal = p.progress ?? 0;
              return (
                <div
                  key={p._id}
                  className="p-4 rounded-xl border border-purple-100/80 hover:border-purple-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 bg-purple-50/20"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{p.name}</h4>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                          p.priority === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : p.priority === 'High'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                        }`}
                      >
                        {p.priority}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed font-normal">
                      {p.description || 'No description provided.'}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold text-slate-900">{progressVal}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-purple-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] rounded-full transition-all duration-500"
                        style={{ width: `${progressVal}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                    <span className="truncate">
                      Manager: <strong className="text-slate-700">{p.manager?.fullName || 'Assigned'}</strong>
                    </span>
                    <span className="shrink-0 font-medium text-slate-600">
                      {p.endDate ? `Due ${new Date(p.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No projects in this workspace yet.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        <div className="lg:col-span-8 p-6 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-purple-100/70 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('tasks')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeBottomTab === 'tasks'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/80'
                      : 'text-slate-500 hover:text-purple-700'
                  }`}
                >
                  Recent Tasks ({recentTasks.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveBottomTab('activity')}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeBottomTab === 'activity'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/80'
                      : 'text-slate-500 hover:text-purple-700'
                  }`}
                >
                  Live Audit Activity ({recentActivities.length})
                </button>
              </div>

              <Link to="/tasks" className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {activeBottomTab === 'tasks' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="pb-3 px-2">Task Title</th>
                      <th className="pb-3 px-2">Project</th>
                      <th className="pb-3 px-2">Assignee</th>
                      <th className="pb-3 px-2">Priority</th>
                      <th className="pb-3 px-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentTasks && recentTasks.length > 0 ? (
                      recentTasks.slice(0, 5).map((t) => {
                        const assignee = Array.isArray(t.assignedTo) && t.assignedTo.length > 0
                          ? t.assignedTo[0]
                          : t.assignedTo;
                        return (
                          <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="py-3 px-2 font-semibold text-slate-900 max-w-[200px] truncate">
                              {t.title}
                            </td>
                            <td className="py-3 px-2 text-slate-500 truncate max-w-[140px] font-normal">
                              {t.project?.name || 'Project'}
                            </td>
                            <td className="py-3 px-2 text-slate-600 truncate max-w-[130px] font-normal">
                              {assignee?.fullName || 'Unassigned'}
                            </td>
                            <td className="py-3 px-2 font-normal">
                              <span
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                  t.priority === 'Critical' || t.priority === 'Urgent'
                                    ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                    : t.priority === 'High'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                                }`}
                              >
                                {t.priority}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                {t.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-10 text-center text-xs text-slate-400">
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
            )}

            {activeBottomTab === 'activity' && (
              <div className="space-y-3 py-1">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.slice(0, 5).map((a) => (
                    <div
                      key={a._id}
                      className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-start justify-between text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                          {a.actor?.fullName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{a.description}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            By {a.actor?.fullName || 'System'} • Action: <span className="font-semibold text-slate-600">{a.action}</span>
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {new Date(a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                    <Activity className="w-6 h-6 text-slate-300 mb-1.5" />
                    <span>No audit activity logs recorded yet.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-white border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Approaching Deadlines</h3>
                <p className="text-xs font-normal text-slate-400">Due within next 7 calendar days</p>
              </div>
              <Calendar className="w-4 h-4 text-purple-400" />
            </div>

            <div className="space-y-2.5">
              {upcomingDeadlines && upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.slice(0, 4).map((t) => (
                  <div
                    key={t._id}
                    className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                  >
                    <div className="truncate pr-2">
                      <p className="font-semibold text-slate-900 truncate">{t.title}</p>
                      <p className="text-[10px] font-normal text-slate-400 truncate">{t.project?.name || 'Project'}</p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 bg-white px-2 py-1 rounded-lg border border-purple-100 shadow-2xs shrink-0">
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
            className="w-full mt-4 py-2.5 bg-gradient-to-r from-[#5B21B6] via-[#6D28D9] to-[#7C3AED] hover:from-[#4C1D95] hover:to-[#6D28D9] text-white font-semibold text-xs rounded-xl text-center shadow-sm shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.99]"
          >
            <span>Open Kanban Workflow</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
