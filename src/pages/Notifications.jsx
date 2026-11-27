import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  CheckSquare,
  AlertCircle,
  FolderKanban,
  UserCheck,
  Check,
  Loader2,
  Trash2,
  MailOpen
} from 'lucide-react';

const Notifications = () => {
  const { activeWorkspace } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      if (res?.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeWorkspace) {
      fetchNotifications();
    }
  }, [activeWorkspace]);

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await api.patch(`/notifications/${id}/unread`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: false } : n))
      );
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark unread:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      window.dispatchEvent(new Event('notifications-updated'));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TaskAssigned':
        return <CheckSquare className="w-4 h-4 text-purple-600" />;
      case 'TaskStatusChanged':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'TaskDeadlineChanged':
      case 'TaskOverdue':
        return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'ProjectAdded':
        return <FolderKanban className="w-4 h-4 text-indigo-600" />;
      case 'WorkspaceInvitation':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-purple-100/90">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" /> Notifications & Reminders
          </h1>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Real-time activity alerts, task updates, and deadline reminders for this workspace.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markingAll}
              className="px-3.5 py-2 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {markingAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Mark all as read
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-xs shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-[#5B21B6] to-[#7C3AED] text-white shadow-xs shadow-purple-500/20'
              : 'bg-white text-slate-600 hover:bg-purple-50 border border-purple-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xs border border-purple-100/90 overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
            <p className="text-xs font-medium text-slate-500">Loading notifications...</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="divide-y divide-purple-50">
            {filtered.map((item) => (
              <div
                key={item._id}
                className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                  item.isRead ? 'bg-white hover:bg-slate-50/50' : 'bg-purple-50/45 hover:bg-purple-50/70'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-900">{item.title}</span>
                      {!item.isRead && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 border border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                          Unread
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-normal">{item.message}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-normal">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.createdAt).toLocaleString()}
                      </span>
                      {item.link && (
                        <Link
                          to={item.link}
                          className="font-medium text-purple-600 hover:text-purple-800 hover:underline"
                        >
                          View context &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {!item.isRead ? (
                  <button
                    onClick={() => handleMarkAsRead(item._id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-purple-700 bg-white border border-purple-200 hover:bg-purple-50 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    title="Mark as read"
                  >
                    <Check className="w-3.5 h-3.5" /> Read
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsUnread(item._id)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-slate-500 hover:text-purple-700 bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 transition-colors shrink-0 cursor-pointer flex items-center gap-1"
                    title="Mark as unread"
                  >
                    <MailOpen className="w-3.5 h-3.5" /> Unread
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No notifications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto font-normal">
              {filter === 'unread'
                ? 'You have caught up with all your updates!'
                : 'When tasks are assigned, updated, or approaching deadlines, notifications will appear here.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
