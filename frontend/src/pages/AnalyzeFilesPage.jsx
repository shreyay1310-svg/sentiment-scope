import React, { useState, useRef } from 'react';
import api from '../services/api';
import {
  UploadCloud,
  FileSpreadsheet,
  FileText,
  FileCheck2,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Filter,
  RefreshCw,
  Table
} from 'lucide-react';

export const AnalyzeFilesPage = () => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [filterSentiment, setFilterSentiment] = useState('ALL');

  const validTypes = [
    'text/csv',
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel'
  ];

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    const isSupported = name.endsWith('.csv') || name.endsWith('.txt') || name.endsWith('.pdf') || name.endsWith('.xlsx') || name.endsWith('.xls');
    
    if (!isSupported) {
      setError('Please upload a valid CSV, TXT, PDF, or XLSX file.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds 25 MB limit.');
      return;
    }
    setError('');
    setSelectedFile(file);
    setAnalysisResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleRunBatch = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(15);
    setError('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    if (selectedColumn) {
      formData.append('column_name', selectedColumn);
    }

    const interval = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 400);

    try {
      const res = await api.post('/sentiment/analyze-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      clearInterval(interval);
      setProgress(100);
      setAnalysisResult(res.data);
    } catch (err) {
      clearInterval(interval);
      setError(err.response?.data?.detail || 'Failed to process file batch analysis.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = () => {
    if (analysisResult?.download_url) {
      window.open(analysisResult.download_url, '_blank');
    }
  };

  const previewRows = analysisResult?.preview || [];
  const filteredRows = previewRows.filter((r) => {
    if (filterSentiment === 'ALL') return true;
    return r._sentiment_scope_sentiment?.toUpperCase() === filterSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Analyze Files & Datasets
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Upload bulk CSV, Excel, TXT, or PDF datasets for automated batch sentiment analysis and exported reports.
        </p>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-3xl p-8 border-2 border-dashed transition-all cursor-pointer text-center relative overflow-hidden ${
          dragActive
            ? 'border-purple-600 bg-purple-50/60 scale-[1.01]'
            : selectedFile
            ? 'border-purple-300 bg-purple-50/20'
            : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50/10'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.txt,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 mb-4 shadow-sm">
            <UploadCloud className="w-8 h-8" />
          </div>

          <h3 className="text-base font-bold text-slate-800">
            {selectedFile ? selectedFile.name : 'Drag & drop your dataset file here'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {selectedFile
              ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for batch analysis`
              : 'Supports CSV, XLSX, TXT, and PDF (up to 25 MB)'}
          </p>

          <button
            type="button"
            className="mt-4 px-4 py-2 rounded-full bg-white border border-purple-200 text-purple-700 text-xs font-semibold shadow-2xs hover:bg-purple-50 transition-colors"
          >
            {selectedFile ? 'Choose Different File' : 'Browse Files on Device'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Batch Configuration Bar (Visible when file is picked) */}
      {selectedFile && !analysisResult && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-500">Auto-detecting text column and classification schemas</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleRunBatch}
              disabled={uploading}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Dataset ({progress}%)...</span>
                </>
              ) : (
                <>
                  <FileCheck2 className="w-4 h-4" />
                  <span>Start Batch Analysis</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {uploading && (
        <div className="bg-white rounded-3xl p-6 border border-purple-100 shadow-xs space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Batch Analysis in Progress...</span>
            <span className="text-purple-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Total Rows Processed</span>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {analysisResult.row_count.toLocaleString()}
              </h3>
              <p className="text-[10px] text-purple-600 font-semibold mt-1">
                Target Column: "{analysisResult.target_column}"
              </p>
            </div>

            <div className="bg-[#EBFBF3] rounded-2xl p-4 border border-emerald-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">Positive Entries</span>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                {analysisResult.positive_count.toLocaleString()}
              </h3>
              <p className="text-[10px] font-bold text-emerald-600 mt-1">
                {Math.round((analysisResult.positive_count / Math.max(1, analysisResult.row_count)) * 100)}% of dataset
              </p>
            </div>

            <div className="bg-[#FFF8E6] rounded-2xl p-4 border border-amber-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">Neutral Entries</span>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                {analysisResult.neutral_count.toLocaleString()}
              </h3>
              <p className="text-[10px] font-bold text-amber-600 mt-1">
                {Math.round((analysisResult.neutral_count / Math.max(1, analysisResult.row_count)) * 100)}% of dataset
              </p>
            </div>

            <div className="bg-[#FEF0F0] rounded-2xl p-4 border border-rose-100 shadow-xs">
              <span className="text-xs font-semibold text-slate-600">Negative Entries</span>
              <h3 className="text-2xl font-black text-rose-700 mt-1">
                {analysisResult.negative_count.toLocaleString()}
              </h3>
              <p className="text-[10px] font-bold text-rose-600 mt-1">
                {Math.round((analysisResult.negative_count / Math.max(1, analysisResult.row_count)) * 100)}% of dataset
              </p>
            </div>
          </div>

          {/* Action Header & Filter */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Batch Classification Preview ({filteredRows.length} shown)
                </h3>
                <p className="text-xs text-slate-500">
                  Every row has been enriched with polarity sentiment, confidence metric, and compound valence score.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                  {['ALL', 'POSITIVE', 'NEUTRAL', 'NEGATIVE'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setFilterSentiment(st)}
                      className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors cursor-pointer ${
                        filterSentiment === st
                          ? 'bg-purple-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Download Analyzed Dataset */}
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Analyzed Dataset</span>
                </button>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Text Content</th>
                    <th className="py-3 px-4">Sentiment</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Valence Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-purple-50/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium text-slate-800 max-w-md">
                        {String(row[analysisResult.target_column] || '')}
                      </td>
                      <td className="py-3 px-4">
                        {row._sentiment_scope_sentiment === 'Positive' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBFBF3] text-emerald-700 border border-emerald-200">
                            😊 Positive
                          </span>
                        ) : row._sentiment_scope_sentiment === 'Negative' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FEF0F0] text-rose-700 border border-rose-200">
                            ☹️ Negative
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FFF8E6] text-amber-700 border border-amber-200">
                            😐 Neutral
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-700">
                        {row._sentiment_scope_confidence}%
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {row._sentiment_scope_score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
