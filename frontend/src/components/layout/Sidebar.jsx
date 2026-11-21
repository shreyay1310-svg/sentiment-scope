import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  UploadCloud,
  Radio,
  BarChart3,
  Clock,
  Settings,
  Sparkles,
  ArrowRight,
  Brain,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Analyze Text', path: '/analyze-text', icon: FileText },
  { name: 'Analyze Files', path: '/analyze-files', icon: UploadCloud },
  { name: 'Real-time Monitoring', path: '/monitoring', icon: Radio },
  { name: 'Reports', path: '/reports', icon: BarChart3 },
  { name: 'History', path: '/history', icon: Clock },
  { name: 'AI Insights', path: '/insights', icon: Brain },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = ({ mobileOpen, setMobileOpen, onOpenLearnMore }) => {
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
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
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-[#702FD3] to-[#8B48F6] text-white shadow-lg shadow-purple-900/40 translate-x-1 font-semibold'
                        : 'text-purple-200/75 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom AI Robot Feature Card */}
        <div className="mt-6">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#251A52] to-[#1A123E] border border-purple-500/20 p-4 shadow-xl">
            {/* Robot Graphic */}
            <div className="flex items-center justify-center -mt-2 mb-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 via-purple-500 to-indigo-600 p-0.5 shadow-md shadow-purple-500/20 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#1A123E] flex items-center justify-center relative">
                  <div className="w-10 h-7 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse"></span>
                  </div>
                  {/* Antennas */}
                  <div className="absolute -top-1.5 w-1 h-2 bg-indigo-400 rounded-full"></div>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-bold text-white text-center">
              AI Sentiment Engine
            </h4>
            <p className="text-[11px] text-purple-200/70 text-center mt-1 leading-relaxed">
              Understand opinions, emotions and trends from your data.
            </p>

            <button
              onClick={onOpenLearnMore}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md shadow-purple-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Learn More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
