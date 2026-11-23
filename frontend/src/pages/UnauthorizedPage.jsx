import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { user, getDashboardRoute } = useAuth();

  const handleReturn = () => {
    navigate(getDashboardRoute(user));
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-purple-100 shadow-xl text-center space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200 inline-block mb-2">
            403 · Access Denied
          </span>
          <h2 className="text-xl font-bold text-slate-900">Restricted Enterprise Zone</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Your current account credentials (<strong>{user?.norm_role || user?.role || 'Standard User'}</strong>) lack authorization to access this administrative dashboard.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-purple-100 text-left text-xs text-slate-600 space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Role-Based Boundary Enforcement:</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Super Administrator tools and tenant-wide settings require elevated system privilege clearance.
          </p>
        </div>

        <button
          onClick={handleReturn}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>Return to My Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
};
