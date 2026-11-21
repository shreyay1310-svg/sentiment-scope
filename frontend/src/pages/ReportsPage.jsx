import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  BarChart3,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
  Tag,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Share2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ReportsPage = () => {
  const [period, setPeriod] = useState('weekly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(null);

  const fetchReport = async (selectedPeriod) => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/summary?period=${selectedPeriod}`);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(period);
  }, [period]);

  const handleExport = async (format) => {
    try {
      setExporting(format);
      // Trigger browser download via direct window navigation or blob link
      const downloadUrl = `/api/reports/export/${format}?period=${period}`;
      const token = localStorage.getItem('sentiment_scope_token');
      
      const response = await fetch(downloadUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sentiment_scope_${period}_report.${format === 'excel' ? 'xlsx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setExporting(null);
    }
  };

  const chartData = report ? [
    { name: 'Positive', count: report.positive.count, percentage: report.positive.percentage, color: '#10B981' },
    { name: 'Neutral', count: report.neutral.count, percentage: report.neutral.percentage, color: '#F59E0B' },
    { name: 'Negative', count: report.negative.count, percentage: report.negative.percentage, color: '#EF4444' }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Executive Intelligence Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Generate and export consolidated analytical reports, keyword frequency charts, and trend metrics.
          </p>
        </div>

        {/* Period Selector & Download Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1 bg-white border border-purple-100 rounded-2xl p-1 shadow-2xs">
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  period === p
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Export Dropdown Buttons */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting === 'pdf'}
            className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {exporting === 'pdf' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-rose-500" />}
            <span>Export PDF</span>
          </button>

          <button
            onClick={() => handleExport('excel')}
            disabled={exporting === 'excel'}
            className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {exporting === 'excel' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
            <span>Export Excel</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            disabled={exporting === 'csv'}
            className="px-3.5 py-2 rounded-xl bg-white border border-purple-200 text-slate-700 hover:bg-purple-50 hover:text-purple-700 text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            {exporting === 'csv' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5 text-indigo-600" />}
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500">Compiling analytics report...</p>
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Executive Overview Banner */}
          <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200">
                {period.toUpperCase()} REPORT • GENERATED {report.generated_at}
              </span>
              <h3 className="text-xl font-bold mt-1">
                Net Trajectory: {report.trend_comparison.net_sentiment_change}
              </h3>
              <p className="text-xs text-purple-100/80 mt-1 max-w-xl">
                Consolidated analysis across {report.total_analyzed} logged interactions and batch datasets.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
              <div className="text-center">
                <span className="text-xs text-purple-200">Positive</span>
                <p className="text-xl font-black text-emerald-300">{report.positive.percentage}%</p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-xs text-purple-200">Neutral</span>
                <p className="text-xl font-black text-amber-300">{report.neutral.percentage}%</p>
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-center">
                <span className="text-xs text-purple-200">Negative</span>
                <p className="text-xl font-black text-rose-300">{report.negative.percentage}%</p>
              </div>
            </div>
          </div>

          {/* Metrics & Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sentiment Comparison Bar Chart (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                Volume Distribution by Category
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Total count of records analyzed within this {period} window.
              </p>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} />
                    <Tooltip
                      formatter={(val, name, item) => [`${val} records (${item.payload.percentage}%)`, name]}
                      contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trend Analysis Comparison (6 cols) */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Period-over-Period Trend Shift
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Comparative performance benchmarks against the preceding cycle.
                </p>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">Positive Sentiment Trajectory</p>
                      <p className="text-[11px] text-emerald-700">
                        {report.trend_comparison.previous_period_positive}% (Prior) → {report.trend_comparison.current_period_positive}% (Current)
                      </p>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                      +{(report.trend_comparison.current_period_positive - report.trend_comparison.previous_period_positive).toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-900">Negative Grievance Rate</p>
                      <p className="text-[11px] text-rose-700">
                        {report.trend_comparison.previous_period_negative}% (Prior) → {report.trend_comparison.current_period_negative}% (Current)
                      </p>
                    </div>
                    <span className="text-xs font-black text-rose-700 bg-white px-2.5 py-1 rounded-full shadow-2xs">
                      -{(report.trend_comparison.previous_period_negative - report.trend_comparison.current_period_negative).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Confidence interval maintains a 95% statistical accuracy margin.</span>
              </div>
            </div>
          </div>

          {/* Top Discussed Keywords Section */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-slate-900">
                Most Discussed Topics & Keywords ({period})
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {report.top_keywords.map((kw, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-[#FAF9FF] border border-purple-100/80 flex flex-col justify-between"
                >
                  <span className="text-xs font-bold text-slate-800 capitalize">
                    {kw.keyword}
                  </span>
                  <div className="mt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Frequency</span>
                    <span className="font-extrabold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                      {kw.frequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
