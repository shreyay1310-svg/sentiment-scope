import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Shield,
  Users,
  Layers,
  FileSpreadsheet,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [managedUsers, setManagedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit user modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editStatus, setEditStatus] = useState('active');
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/users');
      // Admin only manages standard users
      const stdUsers = (res.data.users || []).filter(
        (u) => (u.norm_role || u.role || '').toUpperCase() === 'USER' || (u.role || '').toLowerCase() === 'user'
      );
      setManagedUsers(stdUsers);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError('');
    setModalLoading(true);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        status: editStatus
      });
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to update user status.');
    } finally {
      setModalLoading(false);
    }
  };

  const filteredUsers = managedUsers.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.phone || '').toLowerCase().includes(q)
    );
  });

  const pieData = [
    { name: 'Positive', value: data?.sentiment_distribution?.positive || 58, color: '#10B981' },
    { name: 'Neutral', value: data?.sentiment_distribution?.neutral || 24, color: '#F59E0B' },
    { name: 'Negative', value: data?.sentiment_distribution?.negative || 18, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner: Admin Badge */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#181E3B] via-[#212952] to-[#141A33] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-blue-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Shield className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Team Operations & Department Oversight</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-blue-500/30 border border-blue-400/50 text-blue-200">
                Department Admin
              </span>
            </div>
            <p className="text-xs text-blue-200/80 mt-0.5">
              Supervising analyst operations, review pipelines, shared datasets, and team sentiment distributions.
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchDashboardData(); fetchUsers(); }}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Department Data</span>
        </button>
      </div>

      {/* Row 1: Department Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Managed Analysts</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.managed_users ?? managedUsers.length)}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> Standard Users Scope
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed Analyses</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.total_analyses ?? '1,248')}
            </h3>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3" /> Team Throughput
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Positive Sentiment</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {loading ? '...' : `${data?.sentiment_distribution?.positive || 58}%`}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              +12% vs last cycle
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Shared Datasets</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.datasets_count ?? 18)}
            </h3>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
              CSV, XLSX, & TXT Files
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Charts (Department Trend & Sentiment Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Analysis Volume & Sentiment Velocity</h3>
              <p className="text-xs text-slate-500">Weekly trend across department analysts</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Department Level
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.analysis_trend || [
                { day: 'Mon', analyses: 45, positive: 28 },
                { day: 'Tue', analyses: 58, positive: 36 },
                { day: 'Wed', analyses: 64, positive: 40 },
                { day: 'Thu', analyses: 72, positive: 45 },
                { day: 'Fri', analyses: 88, positive: 54 },
                { day: 'Sat', analyses: 40, positive: 25 },
                { day: 'Sun', analyses: 35, positive: 22 }
              ]}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="analyses" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4 }} name="Total Records" />
                <Line type="monotone" dataKey="positive" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Positive Matches" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Sentiment Donut</h3>
            <p className="text-xs text-slate-500 mb-4">Current distribution for assigned group</p>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900">
                  {data?.sentiment_distribution?.positive || 58}%
                </span>
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Positive</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Positive
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.positive || 58}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Neutral
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.neutral || 24}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.negative || 18}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Managed Department Analysts Table */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Department Analysts (Standard Users)</h3>
            <p className="text-xs text-slate-500">
              Review analysts in your scope. Elevated Super Admin accounts are protected and isolated.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search analysts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-purple-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-slate-600 border-b border-purple-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Analyst</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Assigned Role</th>
                <th className="px-4 py-3.5">Account Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-medium text-slate-700">
              {usersLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-600" />
                    Loading team accounts...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No matching department analysts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {(u.name || u.email || 'A')[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name || 'Unnamed Analyst'}</p>
                          <p className="text-[11px] text-slate-500 font-normal">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.phone || '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status !== 'inactive'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {u.status !== 'inactive' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          setEditStatus(u.status || 'active');
                          setModalError('');
                          setShowEditModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-blue-600 hover:bg-blue-50 font-bold text-xs flex items-center gap-1 ml-auto cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Manage Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: Department Quick Actions & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Department Operational Shortcuts</h3>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/analyze-files')}
              className="w-full p-3.5 rounded-2xl bg-[#FAF9FF] hover:bg-purple-50/70 border border-purple-100 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Batch File Analysis</h4>
                  <p className="text-[11px] text-slate-500">Ingest CSV, Excel or TXT customer feedback</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </button>

            <button
              onClick={() => navigate('/reports')}
              className="w-full p-3.5 rounded-2xl bg-[#FAF9FF] hover:bg-blue-50/70 border border-purple-100 flex items-center justify-between text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Generate Executive Report</h4>
                  <p className="text-[11px] text-slate-500">Export PDF summary and sentiment trends</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </button>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Recent Team Activities</h3>
          <p className="text-xs text-slate-500 mb-4">Live feed of analyses executed by department analysts</p>

          <div className="space-y-3">
            {(data?.recent_activities || [
              { id: 1, action: 'Batch Ingestion: review_dataset.csv', user: 'user@sentimentscope.com', timestamp: '10m ago' },
              { id: 2, action: 'Text Sentiment Analyzed', user: 'user@sentimentscope.com', timestamp: '24m ago' },
              { id: 3, action: 'Department Report Downloaded', user: 'admin@sentimentscope.com', timestamp: '2h ago' }
            ]).map((act, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9FF] border border-purple-50 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{act.action}</p>
                  <p className="text-[11px] text-slate-500">User: {act.user}</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: EDIT ANALYST STATUS */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Analyst Status</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedUser.name} ({selectedUser.email})</p>

            {modalError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 font-semibold focus:outline-hidden"
                >
                  <option value="active">Active (Access Allowed)</option>
                  <option value="inactive">Inactive (Access Suspended)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Status</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
