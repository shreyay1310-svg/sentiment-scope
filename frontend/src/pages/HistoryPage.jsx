import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Clock,
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertTriangle,
  Loader2,
  X,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const HistoryPage = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState(initialSearch);
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  // Modal States
  const [activeItem, setActiveItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/history', {
        params: {
          search: search.trim() || undefined,
          sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
          page,
          limit: 10
        }
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.total_pages || 1);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, sentimentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await api.delete(`/history/${deleteId}`);
      setDeleteId(null);
      fetchHistory();
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Analysis Records & History
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Review, filter, inspect and audit all historical single-text evaluations and batch dataset uploads.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-3xl p-4 border border-purple-100/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, source, or text snippet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FAF9FF] pl-10 pr-4 py-2 rounded-xl text-xs text-slate-800 border border-purple-100 focus:outline-hidden focus:border-purple-400 focus:bg-white"
          />
        </form>

        {/* Sentiment Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['all', 'positive', 'neutral', 'negative'].map((s) => (
            <button
              key={s}
              onClick={() => { setSentimentFilter(s); setPage(1); }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                sentimentFilter === s
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-purple-100/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-[#FAF9FF] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Analysis ID</th>
                <th className="py-3.5 px-4">Source / Context</th>
                <th className="py-3.5 px-4">Text Snippet</th>
                <th className="py-3.5 px-4">Sentiment</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                    <span className="text-slate-400 font-semibold">Retrieving audit records...</span>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No matching records found for this query.
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setActiveItem(row)}
                    className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700">
                      {row.id}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{row.source_name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                      {row.text}
                    </td>
                    <td className="py-3.5 px-4">
                      {row.sentiment === 'Positive' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBFBF3] text-emerald-700 border border-emerald-200">
                          😊 Positive
                        </span>
                      ) : row.sentiment === 'Negative' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF0F0] text-rose-700 border border-rose-200">
                          ☹️ Negative
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8E6] text-amber-700 border border-amber-200">
                          😐 Neutral
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {row.confidence}%
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">
                      {row.created_at ? row.created_at.slice(0, 16).replace('T', ' ') : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveItem(row)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-100 transition-colors"
                          title="View Full Analysis"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteId(row.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete Analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} total analyses)</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold rounded-lg border border-purple-100">
              {page}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                activeItem.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-800' :
                activeItem.sentiment === 'Negative' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {activeItem.sentiment} ({activeItem.confidence}%)
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {activeItem.id}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              Source: {activeItem.source_name}
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed mb-4">
              "{activeItem.text}"
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-800 mb-1">AI Explanation</h4>
                <p className="text-slate-600 leading-relaxed bg-[#FAF9FF] p-3 rounded-xl border border-purple-100">
                  {activeItem.explanation}
                </p>
              </div>

              {activeItem.emotions && Object.keys(activeItem.emotions).length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Emotion Breakdown</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(activeItem.emotions).map(([emo, pct]) => (
                      <div key={emo} className="p-2 rounded-xl bg-indigo-50/70 border border-indigo-100 flex justify-between">
                        <span className="font-semibold text-slate-700">{emo}</span>
                        <span className="font-bold text-indigo-700">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeItem.keywords && activeItem.keywords.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-2">Extracted Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeItem.keywords.map((kw, i) => (
                      <span key={i} className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                        kw.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        kw.type === 'negative' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {kw.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-xs shadow-md shadow-purple-500/20 hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Delete Analysis Record?
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Are you sure you want to delete <strong>{deleteId}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-md shadow-rose-600/20"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
