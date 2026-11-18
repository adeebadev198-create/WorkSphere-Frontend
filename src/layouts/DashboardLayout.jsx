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
  Sparkles,
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

  // ── Sidebar Component (Light Neo-SaaS style matching user's uploaded images) ──
  const Sidebar = ({ onClose }) => (
    <div className="flex flex-col h-full bg-[#FAFAFC] w-64 shrink-0 border-r border-slate-200/70 select-none">
      
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between px-6 h-18 border-b border-slate-100">
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group"
          onClick={onClose}
        >
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] p-1.5 shadow-md shadow-indigo-500/20 flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
            <img src={logoImg} alt="WorkSphere" className="h-6 w-auto object-contain brightness-0 invert" />
          </div>
          <span className="text-slate-900 font-extrabold text-base tracking-tight">
            WorkSphere<span className="text-[#6366F1]">.</span>
          </span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 md:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Workspace Switcher Pill */}
      <div className="px-4 py-4" ref={workspaceDropdownRef}>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
          Workspace
        </div>
        <button
          onClick={() => setWorkspaceDropdownOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all text-left group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-xl bg-indigo-50 text-[#6366F1] font-extrabold text-[10px] flex items-center justify-center shrink-0 border border-indigo-100">
              {activeWorkspace?.name?.charAt(0)?.toUpperCase() || 'W'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {activeWorkspace?.name || 'My Workspace'}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-medium">
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
          <div className="mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
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
                          ? 'bg-indigo-50/70 text-[#6366F1] font-bold'
                          : 'text-slate-700 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                        {ws.name?.charAt(0)}
                      </span>
                      <span className="truncate">{ws.name}</span>
                      {isCur && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6366F1]" />}
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
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#6366F1] font-bold hover:bg-indigo-50 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Workspace
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Section */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto pt-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
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
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
                active
                  ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 pt-6 mb-2">
          General
        </div>
        <Link
          to="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150 ${
            isActive('/settings')
              ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-500/25'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <SettingsIcon className={`w-4 h-4 shrink-0 ${isActive('/settings') ? 'text-white' : 'text-slate-400'}`} />
          <span>Settings</span>
        </Link>
      </nav>

      {/* User Card at bottom of sidebar */}
      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#6366F1] to-purple-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-xl hover:bg-rose-50 transition-colors"
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
        
        {/* Top Floating App Navbar (Matching Organix / TaskFlow header) */}
        <header className="h-18 px-6 lg:px-8 bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-20 flex items-center justify-between">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                {pageTitle}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Workspace: <span className="font-semibold text-slate-700">{activeWorkspace?.name || 'Default'}</span>
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
                className="bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-xs w-full"
              />
            </div>

            {/* Notifications Bell */}
            <Link
              to="/notifications"
              className="relative p-2.5 rounded-full bg-slate-100/80 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#6366F1] ring-2 ring-white animate-pulse" />
              )}
            </Link>

            {/* User Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#6366F1] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                  {userInitial}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.fullName || 'User'}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#6366F1]"
                  >
                    <User className="w-3.5 h-3.5" /> My Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
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

      {/* Workspace Creation Modal */}
      {showWorkspaceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-base font-extrabold text-slate-900 mb-1">Create Workspace</h2>
            <p className="text-xs text-slate-400 mb-5">
              Isolate teams, initiatives, and role permissions.
            </p>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Workspace Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Creative Hub"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  rows="3"
                  placeholder="What is this workspace responsible for?"
                  value={newWorkspaceDesc}
                  onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-2xl border border-slate-200 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-indigo-500/10 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowWorkspaceModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWorkspace}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#6366F1] hover:bg-indigo-600 rounded-xl shadow-md shadow-indigo-500/25 transition-all disabled:opacity-50"
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
