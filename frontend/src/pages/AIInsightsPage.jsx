import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Brain,
  TrendingUp,
  AlertOctagon,
  Sparkles,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AIInsightsPage = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInsights = async () => {
      try {
        const res = await api.get('/dashboard/summary');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadInsights();
  }, []);

  const stats = data?.stats || {
    positive: { percentage: '58%' },
    negative: { percentage: '18%' },
    neutral: { percentage: '24%' }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          AI Sentiment Intelligence & Insights
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Contextual narrative synthesis and pattern identification extracted directly from analyzed feedback corpora.
        </p>
      </div>

      {/* Top Highlight Narrative Card */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
            <Brain className="w-5 h-5 text-purple-300" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-200">
            Synthesized Executive Summary
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-black max-w-2xl leading-snug">
          Customer enthusiasm continues upward with a solid {stats.positive.percentage} approval trajectory.
        </h3>
        <p className="text-xs sm:text-sm text-purple-100/80 mt-2 max-w-3xl leading-relaxed">
          Syntactic analysis across recent customer touchpoints demonstrates significant satisfaction surrounding interface ergonomics and response velocity. Negative friction remains predominantly isolated to export format constraints.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            +12% Positive Velocity
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-200 border border-purple-400/30 text-xs font-bold">
            Dominant Emotion: Joy & Trust (72%)
          </span>
        </div>
      </div>

      {/* Structured Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Drivers Card */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <ThumbsUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Primary Satisfaction Drivers
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <p className="font-bold text-slate-800">1. Real-time Response Times</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Keywords like "instant", "fast", "intuitive", and "smooth" appear in 44% of positive appraisals. Users explicitly celebrate the zero-latency experience.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <p className="font-bold text-slate-800">2. Customer Success Responsiveness</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Support interactions generated an 88% positive confidence rating, with special mentions of onboarding clarity.
              </p>
            </div>
          </div>
        </div>

        {/* Negative Complaints & Risk Clustering */}
        <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <AlertOctagon className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Critical Friction Points & Complaints
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
              <p className="font-bold text-slate-800">1. Large Dataset Export Latency</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Users processing files over 15 MB noted progress stutters. Recommended action: implement background queueing for enterprise datasets.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100">
              <p className="font-bold text-slate-800">2. Plan Tier Ambiguity</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Neutral comments voiced questions regarding API rate limits between Starter and Pro plans. Recommended action: clarify plan limits in Settings.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Strategic Recommendations */}
      <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            AI Actionable Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-purple-600 uppercase">Immediate (0-7 Days)</span>
              <h4 className="font-bold text-slate-900 mt-1">Accelerate CSV Export Streams</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Deploy chunked stream responses to resolve timeout complaints for datasets above 10,000 rows.
              </p>
            </div>
            <button
              onClick={() => navigate('/analyze-files')}
              className="mt-3 text-purple-600 font-bold flex items-center gap-1 hover:text-purple-700"
            >
              <span>Test Batch Files</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase">Strategic (14-30 Days)</span>
              <h4 className="font-bold text-slate-900 mt-1">Automate Spike Alerts</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Enable threshold webhooks when negative sentiment in the live feed exceeds 25% over a 15-minute rolling window.
              </p>
            </div>
            <button
              onClick={() => navigate('/monitoring')}
              className="mt-3 text-indigo-600 font-bold flex items-center gap-1 hover:text-indigo-700"
            >
              <span>Configure Live Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FAF9FF] border border-purple-100 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase">Long-term</span>
              <h4 className="font-bold text-slate-900 mt-1">Brand Advocacy Program</h4>
              <p className="text-slate-600 mt-1 leading-relaxed">
                Convert the 58% satisfied users into G2 and Trustpilot review champions with automated post-analysis prompts.
              </p>
            </div>
            <button
              onClick={() => navigate('/reports')}
              className="mt-3 text-emerald-600 font-bold flex items-center gap-1 hover:text-emerald-700"
            >
              <span>Generate Executive Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
