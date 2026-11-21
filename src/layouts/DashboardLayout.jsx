// src/layouts/DashboardLayout.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import logoImg from '../assets/logo/logo.png';
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
  Layers
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', path: '/projects', icon: FolderKanban },
  { name: 'Kanban Board', path: '/kanban', icon: Kanban },
  { name: 'Task Review', path: '/tasks', icon: CheckSquare },
  { name: 'Members', path: '/team', icon: Users },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
];

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects Directory',
  '/kanban': 'Tasks Board',
  '/tasks': 'Task Review',
  '/team': 'Team Members',
  '/reports': 'Analytics & Reports',
  '/settings': 'Settings',
  '/notifications': 'Notifications',
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
      alert(err.message || 'Failed to create workspace');
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

  // ── Sidebar Component (Clean, minimal, professional with official logo) ──
  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full bg-[#FAFAFC] w-64 shrink-0 border-r border-slate-200/70 select-none">
      
      {/* Official Brand Logo Header */}
      <div className="flex items-center justify-between px-5 h-20 border-b border-slate-100">
        <Link
          to="/dashboard"
          className="flex items-center group transition-opacity hover:opacity-95"
          onClick={onClose}
        >
          <img
            src={logoImg}
            alt="WorkSphere - Plan • Collaborate • Achieve"
            className="h-12 w-auto max-w-[185px] object-contain"
          />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 lg:hidden rounded-lg hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Switcher Pill */}
      <div className="px-4 py-4" ref={workspaceDropdownRef}>
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-2 mb-1.5">
          Workspace
        </div>
        <button
          onClick={() => setWorkspaceDropdownOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-50 to-indigo-50 text-indigo-600 font-semibold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
              {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-800 truncate leading-tight">
                {activeWorkspace?.name || 'My Workspace'}
              </p>
              <p className="text-[11px] text-slate-400 truncate font-normal">
                {activeWorkspace?.memberRole || 'Member'}
              </p>
            </div>
          </div>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200 ${
              workspaceDropdownOpen ? 'rotate-180 text-indigo-600' : ''
            }`}
          />
        </button>

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
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-xs transition-colors ${
                        isCur
                          ? 'bg-indigo-50/80 text-indigo-700 font-medium'
                          : 'text-slate-700 hover:bg-slate-50 font-normal'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-md bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600">
                        {ws.name?.charAt(0)}
                      </span>
                      <span className="truncate">{ws.name}</span>
                      {isCur && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    </button>
                  );
                })
              ) : null}
            </div>
            <div className="border-t border-slate-100 p-1 bg-slate-50/50">
              <button
                onClick={() => {
                  setWorkspaceDropdownOpen(false);
                  setShowWorkspaceModal(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-indigo-600 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Section */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-1">
        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
                active
                  ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-indigo-700 font-medium shadow-xs border-l-2 border-indigo-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-normal'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider px-3 pt-6 mb-2">
          General
        </div>
        <Link
          to="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs transition-all duration-150 ${
            isActive('/settings')
              ? 'bg-gradient-to-r from-blue-50/90 to-indigo-50/90 text-indigo-700 font-medium shadow-xs border-l-2 border-indigo-600'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-normal'
          }`}
        >
          <SettingsIcon className={`w-4 h-4 shrink-0 ${isActive('/settings') ? 'text-indigo-600' : 'text-slate-400'}`} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Card at bottom of sidebar */}
      <div className="p-3 border-t border-slate-100">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-medium text-xs flex items-center justify-center shrink-0 shadow-xs">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-slate-800 truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate font-normal">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F5F9] flex font-sans text-slate-800">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col h-screen sticky top-0 z-30">
        <Sidebar onClose={null} />
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative z-10 flex flex-col h-full shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* Top Navbar */}
        <header className="h-18 px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block font-normal">
                Workspace: <span className="font-medium text-slate-700">{activeWorkspace?.name || 'Default'}</span>
              </p>
            </div>
          </div>

          {/* Right Header Utilities */}
          <div className="flex items-center gap-3">
            
            {/* Search Pill */}
            <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/60 text-xs text-slate-400 w-56 focus-within:border-indigo-400 focus-within:bg-white transition-all">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search anything..."
                className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs w-full font-normal"
              />
            </div>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-medium text-xs flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-medium text-slate-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate font-normal">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-normal text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <User className="w-3.5 h-3.5" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-normal text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* Dynamic Page Outlet */}
        <main className="flex-1 p-5 sm:p-7 lg:p-8 max-w-[1500px] w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal: Create Workspace */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-semibold text-slate-900 mb-1">Create New Workspace</h2>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Organize projects and teammates in isolated environments.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                <label className="block text-xs font-medium text-slate-700 mb-1">
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
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWorkspace || !newWorkspaceName.trim()}
                  className="px-5 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
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
