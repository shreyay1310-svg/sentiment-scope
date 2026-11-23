import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  User,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ setMobileOpen, onSearch }) => {
  const { user, logout, quickLoginDefault } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  const notifications = [
    { id: 1, title: 'Analysis Completed', desc: 'Dataset customer_feedback.csv finished processing.', time: '12m ago', unread: true },
    { id: 2, title: 'Positive Sentiment Spike', desc: 'Positive feedback crossed 60% this week.', time: '1h ago', unread: true },
    { id: 3, title: 'Report Generated', desc: 'Weekly executive summary is ready for download.', time: '3h ago', unread: false }
  ];

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const displayName = user?.name || 'Shreya Yadav';
  const displayPlan = user?.plan || (user?.role === 'Super Admin' ? 'Pro Plan' : 'Standard');
  const avatarUrl = user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256';

  return (
    <header className="sticky top-0 z-30 bg-[#F8F7FF]/85 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-purple-100/70">
      {/* Left: Hamburger & Greetings */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl bg-white border border-purple-100 text-purple-900 shadow-xs hover:bg-purple-50"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#16123D]">
              Welcome, {displayName.split(' ')[0]}
            </h2>
            <span className="text-xl animate-bounce">👋</span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            Here's your sentiment overview and recent activity.
          </p>
        </div>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search analysis, reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 rounded-full text-xs md:text-sm border border-purple-100 focus:outline-hidden focus:border-purple-400 focus:ring-2 focus:ring-purple-200/50 shadow-xs placeholder:text-slate-400 text-slate-700 transition-all"
          />
        </form>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="w-10 h-10 rounded-full bg-white border border-purple-100 flex items-center justify-center text-slate-600 hover:text-purple-600 hover:border-purple-200 shadow-xs transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-white"></span>
          </button>

          {/* Notifications Dropdown */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-purple-100 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-100 mb-2">
                <span className="font-semibold text-xs text-slate-800">Notifications</span>
                <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {notifications.map((n) => (
                  <div key={n.id} className={`p-2.5 rounded-xl text-left text-xs transition-colors ${n.unread ? 'bg-purple-50/60' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{n.title}</span>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 bg-white pl-1.5 pr-3 py-1 rounded-full border border-purple-100 shadow-xs hover:border-purple-200 transition-all cursor-pointer"
          >
            <img
              src={avatarUrl}
              alt={displayName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-100"
            />
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {displayName}
              </p>
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-semibold text-purple-600">
                  {displayPlan}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-purple-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email || 'shreya@sentimentscope.com'}</p>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    <Shield className="w-2.5 h-2.5" />
                    {user?.role || 'Super Admin'}
                  </span>
                </div>
              </div>

              <div className="py-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    const norm = (user?.norm_role || user?.role || '').toUpperCase();
                    if (norm.includes('SUPER')) navigate('/super-admin/dashboard');
                    else if (norm.includes('ADMIN')) navigate('/admin/dashboard');
                    else navigate('/user/dashboard');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Open Role Dashboard</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Account & Profile</span>
                </button>
                <button
                  onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-purple-50 hover:text-purple-700 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Subscription Plan</span>
                </button>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => { setProfileOpen(false); logout(); navigate('/login'); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
