// src/pages/Reports.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Users, 
  Loader2,
  Calendar,
  Layers
} from 'lucide-react';

const Reports = () => {
  const { activeWorkspace } = useAuth();
  const canExport = activeWorkspace?.memberRole === 'Owner' || activeWorkspace?.memberRole === 'Manager';

  const [projectReports, setProjectReports] = useState([]);
  const [teamReports, setTeamReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeReportTab, setActiveReportTab] = useState('projects');
  const [exporting, setExporting] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [projRes, teamRes] = await Promise.all([
        api.get('/reports/projects'),
        api.get('/reports/team-performance'),
      ]);

      if (projRes?.data) setProjectReports(projRes.data);
      if (teamRes?.data) setTeamReports(teamRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchReports();
    }
  }, [activeWorkspace]);

  // Handle actual CSV file download (FR-15.4 / Scenario 08)
  const handleExportCSV = async (type = 'tasks') => {
    try {
      setExporting(true);
      const token = localStorage.getItem('worksphere_token');
      const wsId = activeWorkspace?._id || activeWorkspace?.id;
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

      const response = await fetch(
        `${apiBase}/reports/export?type=${type}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-workspace-id': wsId,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate CSV export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `WorkSphere_${type}_Report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      alert(err.message || 'Export error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" /> Workspace Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Real-time project velocity, employee workload, and CSV data export
          </p>
        </div>

        {canExport && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV('tasks')}
              disabled={exporting}
              className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Tasks (CSV)
            </button>
            <button
              onClick={() => handleExportCSV('projects')}
              disabled={exporting}
              className="px-3.5 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-medium rounded-xl border border-indigo-200 transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Projects (CSV)
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveReportTab('projects')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeReportTab === 'projects'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Project Summary Report
        </button>
        <button
          onClick={() => setActiveReportTab('team')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeReportTab === 'team'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-indigo-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Employee Workload & Performance
        </button>
      </div>

      {/* Report Table View */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
            <p className="text-xs text-slate-500 font-medium">Generating report statistics...</p>
          </div>
        ) : activeReportTab === 'projects' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-6">Project Name</th>
                  <th className="py-3 px-6">Manager</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Total Deliverables</th>
                  <th className="py-3 px-6">Completed</th>
                  <th className="py-3 px-6">Overdue</th>
                  <th className="py-3 px-6">Completion Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projectReports && projectReports.length > 0 ? (
                  projectReports.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-6 text-slate-600 font-normal">{p.manager}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-normal text-slate-700">{p.totalTasks}</td>
                      <td className="py-3.5 px-6 text-emerald-600 font-medium">{p.completedTasks}</td>
                      <td className="py-3.5 px-6">
                        {p.overdueTasks > 0 ? (
                          <span className="text-rose-600 font-medium">{p.overdueTasks} Overdue</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-indigo-600">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                              style={{ width: p.progress }}
                            ></div>
                          </div>
                          <span>{p.progress}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-slate-400 font-normal">
                      No project records available for reporting.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-medium uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-6">Team Member</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Assigned Tasks</th>
                  <th className="py-3 px-6">In Progress</th>
                  <th className="py-3 px-6">Completed</th>
                  <th className="py-3 px-6">Overdue</th>
                  <th className="py-3 px-6">Success Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teamReports && teamReports.length > 0 ? (
                  teamReports.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900">{m.name}</td>
                      <td className="py-3.5 px-6 text-slate-500 font-normal">{m.email}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {m.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-normal text-slate-800">{m.totalAssigned}</td>
                      <td className="py-3.5 px-6 text-blue-600 font-medium">{m.inProgress}</td>
                      <td className="py-3.5 px-6 text-emerald-600 font-medium">{m.completed}</td>
                      <td className="py-3.5 px-6">
                        {m.overdue > 0 ? (
                          <span className="text-rose-600 font-medium">{m.overdue}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-medium text-indigo-600">{m.completionRate}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-slate-400 font-normal">
                      No team workload records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Reports;
