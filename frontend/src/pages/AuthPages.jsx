import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles,
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound
} from 'lucide-react';

export const AuthPages = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setSuccessMessage(res.data.message);
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
        setMode('reset');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error sending password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        new_password: newPassword
      });
      setSuccessMessage(res.data.message);
      setMode('login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins for instant evaluation
  const handleQuickLogin = (userEmail, userPassword) => {
    setEmail(userEmail);
    setPassword(userPassword);
    login(userEmail, userPassword).then(() => navigate('/')).catch(console.error);
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-purple-100 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-500/30">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12v1M8 8v9M12 4v16M16 9v7M20 11v3" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Sentiment Scope
          </h2>
          <p className="text-xs text-purple-600 font-semibold mt-0.5">
            AI-Powered Enterprise Sentiment Analytics
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1. LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="analyst@sentimentscope.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); }}
                  className="text-[11px] font-semibold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Sign In to Dashboard</span>
            </button>

            {/* Quick Demo Logins Card */}
            <div className="pt-3 border-t border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">
                One-Click Quick Evaluation Logins
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('shreya@sentimentscope.com', 'Password123!')}
                  className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-center transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold">Shreya</p>
                  <p className="text-[9px] text-purple-600 font-semibold">Super Admin</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin@sentimentscope.com', 'AdminPassword123!')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold">Alex Vance</p>
                  <p className="text-[9px] text-slate-500 font-semibold">Admin</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('user@sentimentscope.com', 'UserPassword123!')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-center transition-colors cursor-pointer"
                >
                  <p className="text-[11px] font-bold">Demo User</p>
                  <p className="text-[9px] text-slate-500 font-semibold">Standard</p>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* 2. REGISTER MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="maya@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-[#FAF9FF] px-3.5 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white font-medium"
              >
                <option value="User">User (Standard Analyst)</option>
                <option value="Admin">Admin (Team Supervisor)</option>
                <option value="Super Admin">Super Admin (Enterprise Access)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Create Account</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Already registered? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* 3. FORGOT PASSWORD MODE */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed text-center mb-2">
              Enter your registered email address and we'll dispatch a secure recovery token to reset your password.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="analyst@sentimentscope.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Request Recovery Instructions</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* 4. RESET PASSWORD MODE */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed text-center mb-2">
              Recovery verification established. Enter your new password below.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Confirm New Password</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
