// src/layouts/DashboardLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logoImg from '../assets/logo/logo.png';
import LoadingScreen from '../components/common/LoadingScreen';
import {
  ChevronDown,
  Bell,
  Settings as SettingsIcon,
  LogOut,
  User,
  Plus,
  LayoutDashboard,
  FolderKanban,
  Kanban,
  CheckSquare,
  Users,
  BarChart3,
  Menu,
  X,
  Search,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Shield,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Kanban Board', path: '/kanban', icon: Kanban },
  { name: 'Task Review', path: '/tasks', icon: CheckSquare },
  { name: 'Team Members', path: '/team', icon: Users },
  { name: 'Reports & Export', path: '/reports', icon: BarChart3 },
];

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/projects': 'Projects Directory',
  '/kanban': 'Interactive Kanban',
  '/tasks': 'Task Review & Approvals',
  '/team': 'Workspace Members & Roles',
  '/reports': 'Analytics & Executive Reports',
  '/settings': 'Workspace Settings',
  '/notifications': 'Notification Center',
  '/workspaces': 'Workspaces Directory',
};

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, workspaces, activeWorkspace, switchWorkspace, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);
  const [workspaceError, setWorkspaceError] = useState('');

  // Page Transition Loading Screen
  const [isPageLoading, setIsPageLoading] = useState(false);
  const lastPathnameRef = useRef(location.pathname);

  useEffect(() => {
    if (lastPathnameRef.current !== location.pathname) {
      lastPathnameRef.current = location.pathname;
      setIsPageLoading(true);
      const timer = setTimeout(() => {
        setIsPageLoading(false);
      }, 550);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  const workspaceDropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (workspaceDropdownRef.current && !workspaceDropdownRef.current.contains(e.target)) {
        setWorkspaceDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/notifications/unread-count');
        if (res?.data) setUnreadCount(res.data.unreadCount || 0);
      } catch {
        // silent
      }
    };
    if (activeWorkspace) fetchUnreadCount();
  }, [activeWorkspace]);

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;
    try {
      setIsSubmittingWorkspace(true);
      setWorkspaceError('');
      const res = await api.post('/workspaces', {
        name: newWorkspaceName.trim(),
        description: newWorkspaceDesc.trim(),
      });
      if (res?.data) {
        setShowWorkspaceModal(false);
        setNewWorkspaceName('');
        setNewWorkspaceDesc('');
        switchWorkspace(res.data);
      }
    } catch (err) {
      setWorkspaceError(err.message || 'Failed to create workspace');
    } finally {
      setIsSubmittingWorkspace(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  const pageTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/projects/') ? 'Project Details' : 'WorkSphere');

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'Owner':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Manager':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // ── Sidebar Component (Linear & ClickUp inspired) ──
  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full bg-[#FAFAFC] w-64 shrink-0 border-r border-slate-200/80 select-none">
      
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-20 border-b border-slate-200/70 bg-white">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 group transition-opacity hover:opacity-95"
          onClick={onClose}
        >
          <img
            src={logoImg}
            alt="WorkSphere - Plan • Collaborate • Achieve"
            className="h-10 w-auto max-w-[170px] object-contain"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 py-3.5 border-b border-slate-200/60" ref={workspaceDropdownRef}>
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1 mb-1.5 flex items-center justify-between">
          <span>Active Workspace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        
        <button
          onClick={() => setWorkspaceDropdownOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs">
              {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-900 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                {activeWorkspace?.name || 'Workspace'}
              </p>
              <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${getRoleBadgeStyle(activeWorkspace?.memberRole)} mt-0.5`}>
                {activeWorkspace?.memberRole || 'Member'}
              </span>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              workspaceDropdownOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {workspaceDropdownOpen && (
          <div className="mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
            <div className="py-1 max-h-48 overflow-y-auto">
              {workspaces && workspaces.length > 0 ? (
                workspaces.map((ws) => {
                  const wsId = ws._id || ws.id;
                  const activeId = activeWorkspace?._id || activeWorkspace?.id;
                  const isCur = wsId === activeId;
                  return (
                    <button
                      key={wsId}
                      onClick={() => {
                        switchWorkspace(ws);
                        setWorkspaceDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors cursor-pointer ${
                        isCur
                          ? 'bg-indigo-50/90 text-indigo-700 font-semibold'
                          : 'text-slate-700 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-semibold text-slate-600">
                        {ws.name?.charAt(0)}
                      </span>
                      <span className="truncate">{ws.name}</span>
                      {isCur && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  );
                })
              ) : null}
            </div>
            {activeWorkspace?.memberRole === 'Owner' && (
              <div className="border-t border-slate-100 p-1 bg-slate-50/50">
                <button
                  onClick={() => {
                    setWorkspaceDropdownOpen(false);
                    setShowWorkspaceModal(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 font-semibold hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Workspace
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-3">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Platform Modules
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
                active
                  ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs border border-indigo-100'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <span>{item.name}</span>
              </div>
              {active && (
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
              )}
            </Link>
          );
        })}

        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-5 mb-2">
          System & Settings
        </div>
        
        <Link
          to="/notifications"
          onClick={onClose}
          className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
            isActive('/notifications')
              ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs border border-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Bell className={`w-4 h-4 shrink-0 ${isActive('/notifications') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
            <span>Notifications</span>
          </div>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-600 text-white">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/settings"
          onClick={onClose}
          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 group cursor-pointer ${
            isActive('/settings')
              ? 'bg-indigo-50/90 text-indigo-700 font-semibold shadow-2xs border border-indigo-100'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-medium'
          }`}
        >
          <SettingsIcon className={`w-4 h-4 shrink-0 ${isActive('/settings') ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Card at bottom of sidebar */}
      <div className="p-3 border-t border-slate-200/80 bg-white">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200/70 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-700 text-white font-semibold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate font-normal">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen sticky top-0 z-30">
        <Sidebar onClose={null} />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-16 px-6 lg:px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 cursor-pointer"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  {pageTitle}
                </h1>
                <span className="hidden sm:inline-block text-slate-300">•</span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
                  <span className="text-slate-400">Workspace:</span>
                  <strong className="text-slate-800 font-semibold">{activeWorkspace?.name || 'Default'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Search Pill */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200/70 text-xs text-slate-400 w-60 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, tasks, members..."
                className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs w-full font-normal"
              />
            </div>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate font-normal">{user?.email}</p>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded border ${getRoleBadgeStyle(activeWorkspace?.memberRole)} mt-1.5`}>
                      {activeWorkspace?.memberRole || 'Member'} Role
                    </span>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-3.5 h-3.5" /> Account Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-[1550px] w-full mx-auto">
          {isPageLoading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <LoadingScreen minDuration={550} show={true} />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>

      {/* Modal: Create Workspace */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in zoom-in-95 duration-150">
            <h2 className="text-base font-bold text-slate-900 mb-1">Create New Workspace</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Organize projects and teammates in isolated environments.
            </p>

            {workspaceError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{workspaceError}</span>
              </div>
            )}

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engineering, Marketing, Operations"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="Workspace purpose and team goals..."
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-normal"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWorkspace || !newWorkspaceName.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-xs shadow-indigo-500/20 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmittingWorkspace ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;
