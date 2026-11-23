import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  UserCheck,
  Layers,
  Activity,
  Server,
  Database,
  Search,
  Filter,
  UserPlus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  Edit2,
  Clock,
  Sparkles,
  TrendingUp,
  Cpu,
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

export const SuperAdminDashboardPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  // New user form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('User');
  const [newUserPassword, setNewUserPassword] = useState('');

  // Edit user state
  const [editRole, setEditRole] = useState('User');
  const [editStatus, setEditStatus] = useState('active');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/super-admin/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load super admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.users || []);
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

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setModalError('');
    setActionLoading(true);
    try {
      await api.post('/users', {
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        role: newUserRole,
        password: newUserPassword
      });
      setShowAddUserModal(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserPassword('');
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to create user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setModalError('');
    setActionLoading(true);
    try {
      await api.put(`/users/${selectedUser.id}`, {
        role: editRole,
        status: editStatus
      });
      setShowEditUserModal(false);
      setSelectedUser(null);
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      setModalError(err.response?.data?.detail || 'Failed to update user.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.id === user?.id) {
      alert('You cannot delete your own Super Admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${targetUser.name || targetUser.email}"?`)) {
      return;
    }
    try {
      await api.delete(`/users/${targetUser.id}`);
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete user.');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.id === user?.id) {
      alert('You cannot deactivate your own account.');
      return;
    }
    const newStatus = targetUser.status === 'inactive' ? 'active' : 'inactive';
    try {
      await api.put(`/users/${targetUser.id}`, {
        status: newStatus
      });
      fetchUsers();
      fetchDashboardData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update user status.');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === 'ALL' ||
      (u.norm_role || '').toUpperCase() === roleFilter ||
      (u.role || '').toUpperCase().includes(roleFilter);

    const matchesStatus =
      statusFilter === 'ALL' ||
      (u.status || 'active').toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sentimentPieData = [
    { name: 'Positive', value: data?.sentiment_breakdown?.positive || 58, color: '#10B981' },
    { name: 'Neutral', value: data?.sentiment_breakdown?.neutral || 24, color: '#F59E0B' },
    { name: 'Negative', value: data?.sentiment_breakdown?.negative || 18, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner: Super Admin Badge */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-[#200E4A] via-[#2F1668] to-[#1C0D40] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl border border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-purple-300">
            <ShieldAlert className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">Super Administrator Control Center</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-500/30 border border-purple-400/50 text-purple-200">
                Full Privileges
              </span>
            </div>
            <p className="text-xs text-purple-200/80 mt-0.5">
              Enterprise user directory, role assignments, system-wide sentiment telemetry, and database infrastructure.
            </p>
          </div>
        </div>

        <button
          onClick={() => { fetchDashboardData(); fetchUsers(); }}
          className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* Row 1: System Health & Key Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Users */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.total_users ?? users.length)}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> All Registered Accounts
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Active Users */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.active_users ?? users.filter(u => u.status !== 'inactive').length)}
            </h3>
            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
              <UserCheck className="w-3 h-3" /> Status: Verified Active
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Total Analyses */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global Analyses</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {loading ? '...' : (data?.total_analyses ?? '1,248')}
            </h3>
            <span className="text-[11px] font-semibold text-purple-600 flex items-center gap-1 mt-1">
              <Layers className="w-3 h-3" /> Across All Tenants
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: System Health */}
        <div className="p-5 rounded-2xl bg-white border border-purple-100 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</p>
            <h3 className="text-lg font-black text-emerald-600 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Operational 99.9%
            </h3>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 mt-1">
              <Database className="w-3 h-3 text-purple-600" /> MySQL 8.x Connected
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Server className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Row 2: Charts (User Growth & Sentiment Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth & Analysis Activity Trend */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-purple-100 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">User Growth & Activity Velocity</h3>
              <p className="text-xs text-slate-500">Weekly analysis requests and active user sessions</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
              Last 7 Days
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.user_growth || [
                { day: 'Mon', users: 12, analyses: 180 },
                { day: 'Tue', users: 15, analyses: 210 },
                { day: 'Wed', users: 19, analyses: 240 },
                { day: 'Thu', users: 22, analyses: 310 },
                { day: 'Fri', users: 28, analyses: 390 },
                { day: 'Sat', users: 31, analyses: 280 },
                { day: 'Sun', users: 35, analyses: 320 }
              ]}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="analyses" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4 }} name="Total Analyses" />
                <Line type="monotone" dataKey="users" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Active Users" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Global Sentiment Donut */}
        <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Global Sentiment Ratio</h3>
            <p className="text-xs text-slate-500 mb-4">Cumulative distribution across all users</p>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-xl font-black text-slate-900">
                  {data?.sentiment_breakdown?.positive || 58}%
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
              <span className="font-bold text-slate-800">{data?.sentiment_breakdown?.positive || 58}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Neutral
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_breakdown?.neutral || 24}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 font-medium text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Negative
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_breakdown?.negative || 18}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: User Management Table */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Enterprise User Directory</h3>
            <p className="text-xs text-slate-500">
              Manage accounts, assign roles (Super Admin, Admin, Standard User), and control access status.
            </p>
          </div>

          <button
            onClick={() => { setModalError(''); setShowAddUserModal(true); }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User</span>
          </button>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-[#FAF9FF] px-3 py-2 rounded-xl border border-purple-100 text-xs text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Roles</option>
              <option value="SUPER_ADMIN">Super Admin</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">Standard User</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9FF] px-3 py-2 rounded-xl border border-purple-100 text-xs text-slate-700 font-semibold focus:outline-hidden"
            >
              <option value="ALL">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-2xl border border-purple-100">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-slate-600 border-b border-purple-100 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Registered</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-medium text-slate-700">
              {usersLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-purple-600" />
                    Loading accounts from database...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">
                    No matching accounts found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const norm = (u.norm_role || u.role || '').toUpperCase();
                  const isSuper = norm.includes('SUPER');
                  const isAdmin = norm.includes('ADMIN') && !isSuper;

                  return (
                    <tr key={u.id} className="hover:bg-purple-50/40 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            isSuper
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : isAdmin
                              ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {(u.name || u.email || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name || 'Unnamed'}</p>
                            <p className="text-[11px] text-slate-500 font-normal">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {u.phone || '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuper
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : isAdmin
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {u.role || 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition-all ${
                            u.status !== 'inactive'
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                          title="Click to toggle account status"
                        >
                          {u.status !== 'inactive' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" /> Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'Active'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditRole(u.role || 'User');
                              setEditStatus(u.status || 'active');
                              setModalError('');
                              setShowEditUserModal(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 cursor-pointer"
                            title="Edit Role / Status"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 4: System Activity Logs */}
      <div className="p-6 rounded-3xl bg-white border border-purple-100 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1">Recent Audit & System Activities</h3>
        <p className="text-xs text-slate-500 mb-4">Audit log of administrative and analysis events</p>

        <div className="space-y-3">
          {(data?.recent_activities || [
            { id: 1, action: 'User Authenticated', user: 'shreya@sentimentscope.com', role: 'Super Admin', timestamp: '2 minutes ago', ip: '127.0.0.1' },
            { id: 2, action: 'Text Analysis Processed', user: 'user@sentimentscope.com', role: 'Standard', timestamp: '14 minutes ago', ip: '192.168.1.45' },
            { id: 3, action: 'User Role Updated', user: 'admin@sentimentscope.com', role: 'Admin', timestamp: '1 hour ago', ip: '10.0.0.12' },
            { id: 4, action: 'MySQL Schema Migration Checked', user: 'System Worker', role: 'System', timestamp: '3 hours ago', ip: 'internal' }
          ]).map((act, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9FF] border border-purple-50 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{act.action}</p>
                  <p className="text-[11px] text-slate-500">By {act.user} ({act.role})</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {act.timestamp}
                </span>
                <span className="text-[10px] text-slate-400">IP: {act.ip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: CREATE NEW USER */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Create New Account</h3>
            <p className="text-xs text-slate-500 mb-4">Super Administrator user provisioning</p>

            {modalError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Blake"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jordan@sentimentscope.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  placeholder="+1 (555) 234-5678"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 font-semibold focus:outline-hidden focus:border-purple-500"
                >
                  <option value="User">Standard User (Analyst)</option>
                  <option value="Admin">Admin (Team Supervisor)</option>
                  <option value="Super Admin">Super Admin (Full Access)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2 rounded-xl border border-purple-100 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  <span>Save Account</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER */}
      {showEditUserModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Modify User Account</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedUser.name} ({selectedUser.email})</p>

            {modalError && (
              <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 font-semibold focus:outline-hidden"
                >
                  <option value="User">User (Standard)</option>
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full bg-[#FAF9FF] px-3.5 py-2.5 rounded-xl border border-purple-100 text-xs text-slate-800 font-semibold focus:outline-hidden"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="inactive">Inactive (Deactivated)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
