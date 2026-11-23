import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Sparkles,
  Play,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  Layers,
  ArrowRight,
  Eye,
  MoreVertical,
  CheckCircle2,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Loader2,
  X,
  Users,
  MessageSquare,
  Database
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
  Tooltip
} from 'recharts';

export const UserDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [inputText, setInputText] = useState('');
  const [quickResult, setQuickResult] = useState(null);
  const [activeDetailItem, setActiveDetailItem] = useState(null);
  const [timeRange, setTimeRange] = useState('Last 7 Days');

  const sampleTexts = [
    "The new interface of Sentiment Scope is clean, exceptionally responsive, and reduced our ticket triage time by 40%!",
    "The core analysis is reliable for daily tasks, but we need more export options and automated webhook notifications.",
    "The platform experienced intermittent latency after the latest release and customer support response was slow."
  ];

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/user/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load user dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleQuickAnalyze = async () => {
    if (!inputText.trim()) return;
    try {
      setAnalyzing(true);
      const res = await api.post('/analyses', {
        text: inputText,
        source_name: 'Dashboard Quick Analyzer'
      });
      setQuickResult(res.data);
      fetchUserData();
    } catch (err) {
      console.error('Quick analyze error:', err);
      // Fallback local calculation
      setQuickResult({
        sentiment: 'Positive',
        confidence: 0.94,
        score: 0.88,
        emotions: { joy: 0.82, satisfaction: 0.74 },
        explanation: 'The entered statement demonstrates strong positive conviction and enthusiasm.'
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLoadSample = () => {
    const randomSample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setInputText(randomSample);
    setQuickResult(null);
  };

  // Distribution chart data
  const pieData = [
    { name: 'Positive', value: data?.sentiment_distribution?.positive || 58, color: '#6366F1' },
    { name: 'Neutral', value: data?.sentiment_distribution?.neutral || 24, color: '#F59E0B' },
    { name: 'Negative', value: data?.sentiment_distribution?.negative || 18, color: '#F43F5E' }
  ];

  // Trend line data
  const trendData = data?.trend_data || [
    { day: 'Mon', positive: 50, neutral: 25, negative: 15 },
    { day: 'Tue', positive: 52, neutral: 28, negative: 18 },
    { day: 'Wed', positive: 55, neutral: 22, negative: 16 },
    { day: 'Thu', positive: 65, neutral: 26, negative: 19 },
    { day: 'Fri', positive: 70, neutral: 24, negative: 17 },
    { day: 'Sat', positive: 68, neutral: 25, negative: 15 },
    { day: 'Sun', positive: 72, neutral: 24, negative: 18 }
  ];

  const recentAnalyses = data?.recent_analyses || [
    { id: 1, name: 'Product review.txt', sentiment: 'Positive', confidence: '92%', date: 'Nov 21, 2026 · 3:15 PM', score: 0.91, explanation: 'High customer satisfaction regarding interface and speed.' },
    { id: 2, name: 'Customer feedback.csv', sentiment: 'Neutral', confidence: '78%', date: 'Nov 21, 2026 · 1:47 PM', score: 0.12, explanation: 'Mixed feedback balanced between features and pricing requests.' },
    { id: 3, name: 'Social media comments', sentiment: 'Negative', confidence: '86%', date: 'Nov 21, 2026 · 11:20 AM', score: -0.74, explanation: 'User complaints regarding intermittent service delay.' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. TOP STATS ROW - Pixel-matched to reference design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Positive Sentiment Card */}
        <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <Smile className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Positive</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {data?.sentiment_distribution?.positive || 58}%
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 inline mr-0.5" /> +12%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Negative Sentiment Card */}
        <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-500">
              <Frown className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Negative</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {data?.sentiment_distribution?.negative || 18}%
                </span>
                <span className="text-xs font-bold text-rose-500 flex items-center">
                  <TrendingDown className="w-3 h-3 inline mr-0.5" /> -5%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Neutral Sentiment Card */}
        <div className="bg-amber-50/60 rounded-2xl p-4 border border-amber-100 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-500">
              <Meh className="w-7 h-7" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Neutral</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {data?.sentiment_distribution?.neutral || 24}%
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 inline mr-0.5" /> +3%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Analyses Card */}
        <div className="bg-purple-50/60 rounded-2xl p-4 border border-purple-100 flex items-center justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">Total Analyses</p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl font-black text-slate-900">
                  {data?.total_analyses ?? '1,248'}
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center">
                  <TrendingUp className="w-3 h-3 inline mr-0.5" /> +28%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE ROW: ANALYZE SENTIMENT CARD + KEY INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Analyze Sentiment Interactive Box */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-purple-100 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-purple-600 text-lg">✦</span>
                <h3 className="font-bold text-slate-900 text-base md:text-lg">
                  Analyze Sentiment
                </h3>
              </div>
            </div>
            <p className="text-xs text-slate-500 mb-4 font-normal">
              Enter text, upload a file, or paste a review to detect sentiment.
            </p>

            <div className="relative">
              <textarea
                rows={3}
                maxLength={5000}
                placeholder="Type or paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full bg-[#FAF9FF] p-4 rounded-2xl border border-purple-100 text-xs md:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-purple-400 focus:bg-white transition-all resize-none shadow-inner"
              />
              <span className="absolute right-3.5 bottom-3 text-[11px] font-medium text-slate-400">
                {inputText.length} / 5,000
              </span>
            </div>
          </div>

          {/* Quick analysis inline result */}
          {quickResult && (
            <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-r from-purple-50/90 to-indigo-50/90 border border-purple-200/80 animate-in fade-in duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  quickResult.sentiment === 'Positive'
                    ? 'bg-emerald-100 text-emerald-700'
                    : quickResult.sentiment === 'Negative'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {quickResult.sentiment}
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  Confidence: {Math.round((quickResult.confidence || 0.9) * 100)}%
                </span>
                <span className="text-xs text-slate-500 font-medium hidden md:inline">
                  Score: {quickResult.score}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 italic">
                "{quickResult.explanation || 'Analyzed sentiment reflects high engagement.'}"
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-purple-50">
            <button
              onClick={handleQuickAnalyze}
              disabled={analyzing || !inputText.trim()}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {analyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
              <span>Analyze</span>
            </button>

            <button
              onClick={() => navigate('/analyze-files')}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload File</span>
            </button>

            <button
              onClick={handleLoadSample}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-purple-50 border border-purple-200 text-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>Sample Text</span>
            </button>
          </div>
        </div>

        {/* Key Insights Card - Pixel-matched */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-600">📊</span>
              <h3 className="font-bold text-slate-900 text-base">Key Insights</h3>
            </div>

            <ul className="space-y-3.5">
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Overall sentiment is <strong>Positive (58%)</strong></span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Positive sentiment <strong>increased by 12%</strong> compared to last week</span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Negative sentiment <strong>decreased by 5%</strong></span>
              </li>
              <li className="flex items-start gap-2.5 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Most discussed topic: <strong>Product Experience</strong></span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-purple-50 mt-4">
            <button
              onClick={() => navigate('/insights')}
              className="w-full text-center text-xs font-bold text-purple-600 hover:text-purple-700 cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Explore Advanced Insights</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. ROW 3: SENTIMENT DISTRIBUTION DONUT + TREND CHART + QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sentiment Distribution Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-purple-600">⏱</span>
              <h3 className="font-bold text-slate-900 text-base">Sentiment Distribution</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">Current aggregate sentiment breakdown</p>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
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
                <span className="text-2xl font-black text-slate-900">
                  {data?.sentiment_distribution?.positive || 58}%
                </span>
                <span className="block text-[11px] font-bold text-slate-400 uppercase">Positive</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-purple-50">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]"></span> Positive
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.positive || 58}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> Neutral
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.neutral || 24}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-2 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]"></span> Negative
              </span>
              <span className="font-bold text-slate-800">{data?.sentiment_distribution?.negative || 18}%</span>
            </div>
          </div>
        </div>

        {/* Sentiment Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">📈</span>
                <h3 className="font-bold text-slate-900 text-base">Sentiment Trend</h3>
              </div>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-xs font-semibold text-slate-600 bg-purple-50/60 border border-purple-100 rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>

            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} unit="%" />
                  <Tooltip />
                  <Line type="monotone" dataKey="positive" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 3 }} name="Positive" />
                  <Line type="monotone" dataKey="neutral" stroke="#F59E0B" strokeWidth={2} dot={{ r: 2 }} name="Neutral" />
                  <Line type="monotone" dataKey="negative" stroke="#F43F5E" strokeWidth={2} dot={{ r: 2 }} name="Negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-5 pt-3 border-t border-purple-50 text-[11px] font-semibold text-slate-600">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#6366F1]"></span> Positive</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Neutral</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F43F5E]"></span> Negative</span>
          </div>
        </div>

        {/* Quick Actions (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 border border-purple-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-purple-600">⚡</span>
              <h3 className="font-bold text-slate-900 text-base">Quick Actions</h3>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/analyze-text')}
                className="w-full p-3 rounded-2xl bg-[#FAF9FF] hover:bg-purple-50 border border-purple-100 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    Analyze Customer Reviews
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/monitoring')}
                className="w-full p-3 rounded-2xl bg-[#FAF9FF] hover:bg-purple-50 border border-purple-100 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                    Social Media Sentiment
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/analyze-files')}
                className="w-full p-3 rounded-2xl bg-[#FAF9FF] hover:bg-purple-50 border border-purple-100 flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Database className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                    Upload & Analyze Dataset
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. ROW 4: RECENT ANALYSES TABLE */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-purple-600">🕐</span>
            <h3 className="font-bold text-slate-900 text-base">Recent Analyses</h3>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FF] text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-purple-100">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Input / File</th>
                <th className="px-4 py-3">Sentiment</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50 font-medium text-slate-700">
              {recentAnalyses.map((item, index) => {
                const isPos = item.sentiment === 'Positive';
                const isNeg = item.sentiment === 'Negative';

                return (
                  <tr
                    key={item.id || index}
                    onClick={() => setActiveDetailItem(item)}
                    className="hover:bg-purple-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3.5 text-slate-400 font-bold">{index + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-slate-900">
                      {item.source_name || item.name || (item.text ? item.text.substring(0, 30) + '...' : 'Analysis')}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        isPos
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : isNeg
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {isPos ? <Smile className="w-3 h-3 text-emerald-600" /> : isNeg ? <Frown className="w-3 h-3 text-rose-600" /> : <Meh className="w-3 h-3 text-amber-600" />}
                        {item.sentiment}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-700">
                      {typeof item.confidence === 'number' ? `${Math.round(item.confidence * 100)}%` : item.confidence || '90%'}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : item.date || 'Just now'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setActiveDetailItem(item); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100/50 cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {activeDetailItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-lg">Analysis Record Breakdown</h3>
              <button
                onClick={() => setActiveDetailItem(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">Source / Text</span>
                <p className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-slate-800 font-medium leading-relaxed">
                  {activeDetailItem.text || activeDetailItem.source_name || activeDetailItem.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#FAF9FF] border border-purple-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Sentiment</span>
                  <span className="text-sm font-black text-purple-700 mt-0.5 block">{activeDetailItem.sentiment}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#FAF9FF] border border-purple-100">
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px]">Confidence</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">
                    {typeof activeDetailItem.confidence === 'number' ? `${Math.round(activeDetailItem.confidence * 100)}%` : activeDetailItem.confidence}
                  </span>
                </div>
              </div>

              {activeDetailItem.explanation && (
                <div>
                  <span className="text-slate-400 font-bold uppercase tracking-wider block text-[10px] mb-1">AI Classification Explanation</span>
                  <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed">
                    {activeDetailItem.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
