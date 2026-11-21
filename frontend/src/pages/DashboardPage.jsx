import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Sparkles,
  Play,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  Layers,
  BarChart3,
  Zap,
  ArrowRight,
  Eye,
  MoreVertical,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  const sampleTexts = [
    "Sentiment Scope is extraordinarily fast and intuitive. Our analytics team boosted customer response times by 40%!",
    "The updated dashboard works reliably for daily tasks, but we need more customized export options.",
    "System latency doubled after the update and dataset uploads crashed twice. Customer support was slow to help."
  ];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/summary');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickAnalyze = async () => {
    if (!inputText.trim()) return;
    try {
      setAnalyzing(true);
      const res = await api.post('/sentiment/analyze-text', {
        text: inputText,
        source_name: 'Quick Dashboard Analyzer'
      });
      setQuickResult(res.data);
      // Refresh dashboard numbers & recent analyses
      fetchDashboardData();
    } catch (err) {
      console.error('Quick analyze error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setInputText(randomSample);
    setQuickResult(null);
  };

  const handleRowClick = async (analysisId) => {
    try {
      const res = await api.get(`/history/${analysisId}`);
      setActiveDetailItem(res.data);
    } catch {
      navigate('/history');
    }
  };

  const handleDeleteRecent = async (id, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/history/${id}`);
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading Sentiment Scope...</p>
      </div>
    );
  }

  const stats = data?.stats || {
    positive: { percentage: '58%', count: 724, change: '+12%', trend: 'up' },
    negative: { percentage: '18%', count: 224, change: '-5%', trend: 'down' },
    neutral: { percentage: '24%', count: 300, change: '+3%', trend: 'up' },
    total_trend: { count: '1,248', change: '+28%', trend: 'up' }
  };

  const distributionData = data?.distribution || [
    { name: 'Positive', value: 58, color: '#10B981' },
    { name: 'Neutral', value: 24, color: '#F59E0B' },
    { name: 'Negative', value: 18, color: '#EF4444' }
  ];

  const trendData = data?.trends || [];
  const keyInsights = data?.key_insights || [
    'Overall sentiment is Positive (58%)',
    'Positive sentiment increased by 12% compared to last week',
    'Negative sentiment decreased by 5%',
    'Most discussed topic: Product Experience'
  ];
  const recentAnalyses = data?.recent_analyses || [];

  return (
    <div className="space-y-6">
      {/* 1. TOP STATS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Positive Card */}
        <div className="bg-[#EBFBF3] rounded-2xl p-5 border border-emerald-100 flex items-center justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
              <Smile className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Positive</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.positive.percentage}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-white/70 px-2.5 py-1 rounded-full shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.positive.change}</span>
          </div>
        </div>

        {/* Negative Card */}
        <div className="bg-[#FEF0F0] rounded-2xl p-5 border border-rose-100 flex items-center justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 shrink-0">
              <Frown className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Negative</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.negative.percentage}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-rose-500 text-xs font-bold bg-white/70 px-2.5 py-1 rounded-full shadow-2xs">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{stats.negative.change}</span>
          </div>
        </div>

        {/* Neutral Card */}
        <div className="bg-[#FFF8E6] rounded-2xl p-5 border border-amber-100 flex items-center justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 shrink-0">
              <Meh className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Neutral</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {stats.neutral.percentage}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-white/70 px-2.5 py-1 rounded-full shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.neutral.change}</span>
          </div>
        </div>

        {/* Total Analyses Card */}
        <div className="bg-[#F2EFFF] rounded-2xl p-5 border border-purple-100 flex items-center justify-between shadow-xs transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-600">Total Analyses</p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {typeof stats.total_trend.count === 'number' ? stats.total_trend.count.toLocaleString() : stats.total_trend.count}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold bg-white/70 px-2.5 py-1 rounded-full shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{stats.total_trend.change}</span>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: ANALYZE SENTIMENT CARD + KEY INSIGHTS / QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Analyze Sentiment Left/Center Card (7 cols) */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Analyze Sentiment
                </h3>
                <p className="text-xs text-slate-500">
                  Enter text, upload a file, or paste a review to detect sentiment.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Textarea container */}
            <div className="md:col-span-8 flex flex-col justify-between">
              <div className="relative">
                <textarea
                  rows={4}
                  maxLength={5000}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  className="w-full bg-[#FAF9FF] border border-purple-100/90 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200/50 resize-none transition-all placeholder:text-slate-400"
                />
                <div className="text-right text-[11px] text-slate-400 font-medium mt-1">
                  {inputText.length.toLocaleString()} / 5,000
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5 mt-3">
                <button
                  onClick={handleQuickAnalyze}
                  disabled={analyzing || !inputText.trim()}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => navigate('/analyze-files')}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-purple-600" />
                  <span>Upload File</span>
                </button>

                <button
                  onClick={handleLoadSample}
                  className="px-4 py-2.5 rounded-full bg-white hover:bg-purple-50 text-slate-700 border border-purple-200 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-600" />
                  <span>Sample Text</span>
                </button>
              </div>
            </div>

            {/* Visual Graphic Representation (Matches screenshot illustration) */}
            <div className="md:col-span-4 hidden md:flex items-center justify-center p-2">
              <div className="w-full h-full min-h-[160px] rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-100 flex flex-col items-center justify-center relative p-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-purple-100 flex items-center justify-center text-purple-600 mb-2">
                  <svg className="w-8 h-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <path d="M8 11h2l1-3 2 6 1-3h2" />
                  </svg>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">😊</span>
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">😐</span>
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs">☹️</span>
                </div>
                <span className="text-[10px] text-purple-900/60 font-semibold mt-2">AI Neural Inference</span>
              </div>
            </div>
          </div>

          {/* Quick Result Drawer */}
          {quickResult && (
            <div className="mt-4 p-4 rounded-2xl bg-purple-50/80 border border-purple-100 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    quickResult.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                    quickResult.sentiment === 'Negative' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {quickResult.sentiment}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Confidence: {quickResult.confidence}%
                  </span>
                  <span className="text-xs text-slate-500">
                    Score: {quickResult.score}
                  </span>
                </div>
                <button
                  onClick={() => setQuickResult(null)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {quickResult.explanation}
              </p>
            </div>
          )}
        </div>

        {/* Right Cards Column (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* Key Insights Card */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-md bg-purple-100 text-purple-600">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Key Insights</h3>
            </div>
            <ul className="space-y-2.5">
              {keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="p-0.5 rounded-full bg-purple-100 text-purple-600 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium leading-tight">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs flex-1 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1 rounded-md bg-purple-100 text-purple-600">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Quick Actions</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/analyze-text')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 text-xs font-semibold text-slate-700 transition-all text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Analyze Customer Reviews
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/monitoring')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 text-xs font-semibold text-slate-700 transition-all text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Social Media Sentiment
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>

              <button
                onClick={() => navigate('/analyze-files')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 text-xs font-semibold text-slate-700 transition-all text-left cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Upload & Analyze Dataset
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW: SENTIMENT DISTRIBUTION DONUT + SENTIMENT TREND LINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sentiment Distribution Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Sentiment Distribution
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
            {/* Donut Chart with centered percentage */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-900">
                  {stats.positive.percentage}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  Positive
                </span>
              </div>
            </div>

            {/* Legend with percentages */}
            <div className="space-y-3 w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
                  <span className="text-xs font-semibold text-slate-700">Positive</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{stats.positive.percentage}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#F59E0B]"></span>
                  <span className="text-xs font-semibold text-slate-700">Neutral</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{stats.neutral.percentage}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#EF4444]"></span>
                  <span className="text-xs font-semibold text-slate-700">Negative</span>
                </div>
                <span className="text-xs font-bold text-slate-900">{stats.negative.percentage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sentiment Trend Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                Sentiment Trend
              </h3>
            </div>
            {/* Filter Dropdown */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-purple-50/50 border border-purple-100 rounded-lg px-2.5 py-1 focus:outline-hidden"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  formatter={(val) => [`${val}%`]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line
                  type="monotone"
                  dataKey="positive"
                  name="Positive"
                  stroke="#7C3AED"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#7C3AED' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="neutral"
                  name="Neutral"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
                <Line
                  type="monotone"
                  dataKey="negative"
                  name="Negative"
                  stroke="#EF4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#EF4444' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. RECENT ANALYSES TABLE (Matches exact screenshot layout) */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Analyses
            </h3>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Input / File</th>
                <th className="py-3 px-4">Sentiment</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentAnalyses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No analyses recorded yet. Start by typing above or uploading a file!
                  </td>
                </tr>
              ) : (
                recentAnalyses.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => handleRowClick(row.id)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-500">{row.idx}</td>
                    <td className="py-3 px-4 font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="truncate max-w-[220px]">{row.source_name}</span>
                    </td>
                    <td className="py-3 px-4">
                      {row.sentiment === 'Positive' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EBFBF3] text-emerald-700 border border-emerald-200">
                          <span>😊</span> Positive
                        </span>
                      ) : row.sentiment === 'Negative' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FEF0F0] text-rose-700 border border-rose-200">
                          <span>☹️</span> Negative
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFF8E6] text-amber-700 border border-amber-200">
                          <span>😐</span> Neutral
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-700">{row.confidence}</td>
                    <td className="py-3 px-4 text-slate-500 font-medium">{row.date_time}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleRowClick(row.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteRecent(row.id, e)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Record"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analysis Details Modal */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveDetailItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                activeDetailItem.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                activeDetailItem.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeDetailItem.sentiment} ({activeDetailItem.confidence}%)
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Score: {activeDetailItem.score}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              Source: {activeDetailItem.source_name}
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed mb-4">
              "{activeDetailItem.text}"
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">AI Explanation</h4>
                <p className="text-slate-600 leading-relaxed bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  {activeDetailItem.explanation}
                </p>
              </div>

              {activeDetailItem.emotions && Object.keys(activeDetailItem.emotions).length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Emotion Detection</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(activeDetailItem.emotions).map(([emo, pct]) => (
                      <span key={emo} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold">
                        {emo}: {pct}%
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeDetailItem.keywords && activeDetailItem.keywords.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Important Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeDetailItem.keywords.map((kw, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        kw.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        kw.type === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {kw.word} ({kw.weight})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveDetailItem(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20 hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
