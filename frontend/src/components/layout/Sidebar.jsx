import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ShieldAlert,
  Shield,
  FileText,
  UploadCloud,
  Radio,
  BarChart3,
  Clock,
  Settings,
  Sparkles,
  Brain,
  X
} from 'lucide-react';

export const Sidebar = ({ mobileOpen, setMobileOpen, onOpenLearnMore }) => {
  const { user, normRole, isSuperAdmin, isAdmin } = useAuth();

  // Dynamic navigation links based on user role
  const navItems = [
    ...(isSuperAdmin ? [
      { name: 'Super Admin', path: '/super-admin/dashboard', icon: ShieldAlert, badge: 'Full' },
    ] : []),
    ...(isAdmin && !isSuperAdmin ? [
      { name: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield, badge: 'Dept' },
    ] : []),
    { name: isSuperAdmin || isAdmin ? 'Analyst View' : 'Dashboard', path: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Analyze Text', path: '/analyze-text', icon: FileText },
    { name: 'Analyze Files', path: '/analyze-files', icon: UploadCloud },
    { name: 'Real-time Monitoring', path: '/monitoring', icon: Radio },
    { name: 'Reports', path: '/reports', icon: BarChart3 },
    { name: 'History', path: '/history', icon: Clock },
    { name: 'AI Insights', path: '/insights', icon: Brain },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#140E36] text-white flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-2xl border-r border-indigo-950/60`}
      >
        {/* Brand Header */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#4F46E5] flex items-center justify-center shadow-lg shadow-purple-500/30">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M4 12v1M8 8v9M12 4v16M16 9v7M20 11v3" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-lg tracking-tight text-white leading-tight">
                  Sentiment Scope
                </h1>
                <p className="text-[11px] text-purple-200/70 font-medium">
                  AI-Powered Sentiment Analysis
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#702FD3] to-[#8B48F6] text-white shadow-lg shadow-purple-900/40 translate-x-1 font-semibold'
                        : 'text-purple-200/75 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/20 text-white">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Robot Feature Card */}
        <div className="mt-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#251A52] to-[#1A123E] border border-purple-500/20 p-4 shadow-xl">
            {/* Robot Graphic */}
            <div className="flex items-center justify-center -mt-2 mb-2">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="w-14 h-12 bg-linear-to-b from-purple-200 to-indigo-100 rounded-2xl border-2 border-white/60 shadow-inner flex flex-col items-center justify-center relative">
                  <div className="w-2.5 h-1.5 bg-purple-400 rounded-full mb-1"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-900 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-purple-900 animate-pulse"></div>
                  </div>
                  <div className="w-4 h-1 bg-purple-800 rounded-full mt-1"></div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h4 className="text-xs font-bold text-white tracking-wide">
                AI Sentiment Engine
              </h4>
              <p className="text-[10px] text-purple-200/70 mt-1 mb-3 leading-tight">
                Understand opinions, emotions and trends from your data.
              </p>
              <button
                onClick={onOpenLearnMore}
                className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-md shadow-purple-900/40 transition-all cursor-pointer"
              >
                <span>Learn More</span>
                <span className="text-xs">→</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
