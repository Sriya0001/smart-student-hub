import { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

// ── Notification Bell (student-only) ─────────────────────────────────────────
function NotificationBell({ token }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [open, setOpen]                   = useState(false);
  const dropdownRef                       = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API}/students/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (_) { /* silent */ }
  }, [token]);

  // Initial load + poll every 30 s
  useEffect(() => {
    fetchNotifications();
    const id = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(id);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = async () => {
    setOpen(prev => !prev);
    if (!open && unreadCount > 0) {
      try {
        await axios.put(`${API}/students/notifications/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(0);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      } catch (_) { /* silent */ }
    }
  };

  const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins  = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days  = Math.floor(diff / 86_400_000);
    if (mins < 1)   return 'just now';
    if (mins < 60)  return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        id="notification-bell-btn"
        onClick={handleOpen}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 transition-all cursor-pointer"
        title="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <span className="font-black text-gray-800 text-sm">Notifications</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{notifications.length} total</span>
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <li className="px-5 py-10 text-center text-gray-300 text-sm italic">No notifications yet</li>
            ) : (
              notifications.map(n => (
                <li
                  key={n._id}
                  className={`px-5 py-4 flex gap-3 items-start transition-colors ${!n.read ? 'bg-blue-50/60' : 'hover:bg-gray-50'}`}
                >
                  {/* Status icon */}
                  <span className="mt-0.5 text-lg flex-shrink-0">
                    {n.type === 'approved' ? '✅' : '❌'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-800 truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-gray-300 font-medium mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-1.5 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" title="Unread" />
                  )}
                </li>
              ))
            )}
          </ul>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/60 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Showing last {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard Layout ──────────────────────────────────────────────────────────
export default function DashboardLayout({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token    = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const menuItems = {
    student: [
      { path: '/student/dashboard', label: 'My Portfolio' },
      { path: '/student/upload',    label: 'Upload Certificate' },
    ],
    faculty: [
      { path: '/faculty/dashboard', label: 'Dashboard' },
    ],
    admin: [
      { path: '/admin',            label: 'System Analytics' },
      { path: '/admin/management', label: 'User Management' },
    ]
  };

  const links = menuItems[role] || [];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md">
             <span className="text-white font-bold tracking-tighter">SH</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">Student Hub</h1>
            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{role}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-4 py-3 rounded-xl font-medium transition-colors cursor-pointer ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 capitalize">{role} Portal</h2>
          <div className="flex items-center gap-3">
            {/* Show notification bell only for students */}
            {role === 'student' && token && (
              <NotificationBell token={token} />
            )}
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-[2px] cursor-pointer">
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-gray-700 uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                  {role[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
