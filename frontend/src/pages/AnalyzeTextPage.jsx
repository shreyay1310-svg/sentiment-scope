import React, { useState } from 'react';
import api from '../services/api';
import {
  FileText,
  Play,
  RotateCcw,
  Sparkles,
  Smile,
  Frown,
  Meh,
  Tag,
  Brain,
  CheckCircle2,
  BarChart,
  Loader2,
  Copy,
  Check
} from 'lucide-react';

export const AnalyzeTextPage = () => {
  const [text, setText] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const sampleTexts = [
    {
      title: "Praise for Customer Support",
      text: "The support representative answered my question within 2 minutes and guided me with exceptional patience. One of the best SaaS onboarding experiences I've ever had!"
    },
    {
      title: "Mixed Neutral Feedback",
      text: "The software performs the basic indexing tasks as described in the documentation. However, setup documentation lacks clarity and pricing plans are fairly typical."
    },
    {
      title: "Grievance & App Crashes",
      text: "Worst experience with an analytics tool so far. The export failed 4 times, our scheduled reports didn't trigger, and support took 48 hours to reply with an unhelpful canned response."
    }
  ];

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim()) {
      setError('Please provide some text to analyze.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/sentiment/analyze-text', {
        text: text.trim(),
        source_name: sourceName.trim() || 'Manual Text Lab'
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze text. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setSourceName('');
    setResult(null);
    setError('');
  };

  const handleCopyExplanation = () => {
    if (result?.explanation) {
      navigator.clipboard.writeText(result.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Analyze Text Lab
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Run deep NLP sentiment analysis, detect subtle emotional nuances, and extract key polarity drivers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Panel (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Analysis Label / Source (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Executive Survey, Trustpilot Review #142"
                value={sourceName}
                onChange={(e) => setSourceName(e.target.value)}
                className="w-full bg-[#FAF9FF] border border-purple-100 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-purple-400 focus:bg-white"
              />
            </div>

            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Input Text
                </label>
                <span className="text-[11px] font-semibold text-slate-400">
                  {text.length.toLocaleString()} / 5,000 characters
                </span>
              </div>
              <textarea
                rows={7}
                maxLength={5000}
                placeholder="Enter customer feedback, reviews, tweet transcripts, or paste any paragraph..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-[#FAF9FF] border border-purple-100 rounded-2xl p-4 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-200/50 resize-none transition-all placeholder:text-slate-400"
              />
            </div>

            {error && (
              <div className="p-3 mb-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sample = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
                    setText(sample.text);
                    setSourceName(sample.title);
                  }}
                  className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Load Sample</span>
                </button>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading || !text.trim()}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Analyze Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Sample Text Templates */}
          <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Preset Sample Scenarios
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {sampleTexts.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setText(s.text);
                    setSourceName(s.title);
                  }}
                  className="p-3 text-left rounded-2xl border border-purple-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all group cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">
                    {s.title}
                  </p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                    {s.text}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Analysis Output (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {!result && !loading && (
            <div className="bg-white rounded-3xl p-10 border border-purple-100/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 mb-3">
                <Brain className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                Awaiting Analysis
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Enter text or pick a sample on the left, then click <strong>Analyze Text</strong> to view real-time confidence scores, emotion profiles, and keywords.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-3xl p-10 border border-purple-100/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
              <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
              <h4 className="text-sm font-bold text-slate-800">
                Deconstructing Sentiment & Emotions...
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Evaluating syntactic valence, emotional taxonomy, and polarity weights.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Primary Verdict Card */}
              <div className={`rounded-3xl p-6 border shadow-xs ${
                result.sentiment === 'Positive' ? 'bg-[#EBFBF3] border-emerald-200' :
                result.sentiment === 'Negative' ? 'bg-[#FEF0F0] border-rose-200' : 'bg-[#FFF8E6] border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      result.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' :
                      result.sentiment === 'Negative' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {result.sentiment === 'Positive' ? '😊' : result.sentiment === 'Negative' ? '☹️' : '😐'}
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Classification Verdict
                      </span>
                      <h3 className="text-xl font-black text-slate-900">
                        {result.sentiment} Sentiment
                      </h3>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">
                      {result.confidence}%
                    </span>
                    <p className="text-[10px] font-bold text-slate-500">
                      Confidence
                    </p>
                  </div>
                </div>

                {/* Score meters */}
                <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>Valence Score: <strong className="text-slate-900">{result.score}</strong></span>
                  <span>ID: <strong className="text-slate-900">{result.id}</strong></span>
                </div>
              </div>

              {/* Text Classification Breakdown Visualization */}
              <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Classification Spectrum Breakdown
                </h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Positive Valence</span>
                      <span className="text-emerald-600">{result.classification_details?.positive}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.classification_details?.positive}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Neutral Baseline</span>
                      <span className="text-amber-600">{result.classification_details?.neutral}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.classification_details?.neutral}%` }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-slate-700 mb-1">
                      <span>Negative Valence</span>
                      <span className="text-rose-600">{result.classification_details?.negative}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${result.classification_details?.negative}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emotion Detection Profile */}
              {result.emotions && Object.keys(result.emotions).length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Emotion Detection Profile
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(result.emotions).map(([emo, pct]) => (
                      <div key={emo} className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{emo}</span>
                        <span className="font-bold text-purple-700">{pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Important Keywords Tag Cloud */}
              {result.keywords && result.keywords.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Important Keywords & Weight
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((kw, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                          kw.type === 'positive'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : kw.type === 'negative'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        <span>{kw.word}</span>
                        <span className="text-[10px] opacity-70">({kw.polarity > 0 ? `+${kw.polarity}` : kw.polarity})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI-Generated Natural Explanation */}
              <div className="bg-white rounded-3xl p-5 border border-purple-100/80 shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI-Generated Explanation</span>
                  </h4>
                  <button
                    onClick={handleCopyExplanation}
                    className="p-1 rounded-md text-slate-400 hover:text-purple-600 hover:bg-purple-50 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed bg-[#FAF9FF] p-3.5 rounded-2xl border border-purple-100/70">
                  {result.explanation}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
