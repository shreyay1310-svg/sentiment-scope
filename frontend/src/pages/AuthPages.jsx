import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Lock,
  Mail,
  User,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck
} from 'lucide-react';

export const AuthPages = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register' | 'forgot' | 'reset'
  const { login, register } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password strength helper
  const calculatePasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-500' };
      case 2:
        return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-500' };
      case 4:
        return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-500' };
      default:
        return { score: 10, label: 'Very Weak', color: 'bg-rose-400', text: 'text-rose-400' };
    }
  };

  const passwordStrength = calculatePasswordStrength(password);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      navigate(result.redirectRoute || '/user/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (!agreeTerms) {
      setError('You must accept the Terms and Conditions to register.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        terms: agreeTerms
      });
      navigate(result.redirectRoute || '/user/dashboard');
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
      setSuccessMessage(res.data.message || 'Password reset token generated successfully.');
      if (res.data.reset_token) {
        setResetToken(res.data.reset_token);
        setMode('reset');
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Error requesting password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        token: resetToken,
        new_password: newPassword
      });
      setSuccessMessage(res.data.message || 'Password updated successfully. Please sign in.');
      setMode('login');
      setPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const [quickLoadingRole, setQuickLoadingRole] = useState(null);

  // One-Click Quick Evaluation Logins
  const handleQuickLogin = async (userEmail, userPassword, roleKey) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setQuickLoadingRole(roleKey);
    setLoading(true);
    try {
      const result = await login(userEmail, userPassword);
      const targetRoute = result.redirectRoute || (
        roleKey === 'shreya' ? '/super-admin/dashboard' :
        roleKey === 'alex' ? '/admin/dashboard' : '/user/dashboard'
      );
      navigate(targetRoute);
    } catch (err) {
      console.error('Quick login error:', err);
      const message = err.response?.data?.detail || err.message || 'Quick login failed. Please check network connection.';
      setError(message);
    } finally {
      setLoading(false);
      setQuickLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4">
      <div className="max-w-[420px] w-full bg-white rounded-3xl p-8 border border-purple-100 shadow-xl relative overflow-hidden animate-in fade-in duration-200">
        {/* Brand Header - Pixel matched to design reference */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7C3AED] via-[#6366F1] to-[#4F46E5] flex items-center justify-center text-white mb-3 shadow-lg shadow-purple-500/30">
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M4 12v1M8 8v9M12 4v16M16 9v7M20 11v3" />
            </svg>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sentiment Scope
          </h2>
          <p className="text-xs text-purple-600 font-bold tracking-wide mt-1">
            AI-Powered Enterprise Sentiment Analytics
          </p>
        </div>

        {/* Error Alert Box - Pixel matched to screenshot */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-[#FFF1F2] border border-[#FECDD3] text-[#E11D48] text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E11D48]" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert Box */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. LOGIN MODE                                             */}
        {/* ========================================================= */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="user@sentimentscope.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white placeholder:text-slate-400 font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">Password</label>
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-10 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white placeholder:text-slate-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#6366F1] hover:from-[#6D28D9] hover:to-[#4F46E5] text-white text-xs md:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-[0.99]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
              <span>Sign In to Dashboard</span>
            </button>

            {/* ONE-CLICK QUICK EVALUATION LOGINS */}
            <div className="pt-4 border-t border-slate-100">
              <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-3">
                ONE-CLICK QUICK EVALUATION LOGINS
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('admin@sentimentscope.com', 'Password123!', 'shreya')}
                  className="p-2.5 rounded-xl bg-[#FAF5FF] hover:bg-purple-100/70 border border-purple-200 text-center transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 relative"
                >
                  {quickLoadingRole === 'shreya' ? (
                    <div className="py-1 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-purple-900">Shreya</p>
                      <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Super Admin</p>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('alex@sentimentscope.com', 'AdminPassword123!', 'alex')}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-center transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 relative"
                >
                  {quickLoadingRole === 'alex' ? (
                    <div className="py-1 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-800">Alex Vance</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Admin</p>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickLogin('demo@sentimentscope.com', 'UserPassword123!', 'demo')}
                  className="p-2.5 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-center transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 relative"
                >
                  {quickLoadingRole === 'demo' ? (
                    <div className="py-1 flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-bold text-slate-800">Demo User</p>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Standard</p>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Don't have an account? </span>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Register here
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* 2. REGISTER MODE                                          */}
        {/* ========================================================= */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="maya@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-10 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500 font-medium">Strength:</span>
                    <span className={`font-bold ${passwordStrength.text}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-10 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-2 pt-1">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded-sm border-purple-200 text-purple-600 focus:ring-purple-400 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-600 cursor-pointer leading-tight">
                I agree to the <span className="font-semibold text-purple-600">Terms of Service</span> and{' '}
                <span className="font-semibold text-purple-600">Privacy Policy</span>. Standard User role will be assigned.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>Create Account</span>
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                className="text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* 3. FORGOT PASSWORD MODE                                   */}
        {/* ========================================================= */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed text-center mb-2">
              Enter your registered email address and we'll dispatch a secure recovery token to reset your password.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="analyst@sentimentscope.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              <span>Request Recovery Instructions</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* ========================================================= */}
        {/* 4. RESET PASSWORD MODE                                    */}
        {/* ========================================================= */}
        {mode === 'reset' && (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-xs text-slate-600 leading-relaxed text-center mb-2">
              Enter your reset token and your new password below.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Reset Token</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Paste reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Confirm New Password</span>
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
