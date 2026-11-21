import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Radio,
  Activity,
  Play,
  Pause,
  Send,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Smile,
  Frown,
  Meh,
  Wifi,
  WifiOff,
  Sparkles,
  RefreshCw,
  Clock
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from 'recharts';

export const RealTimeMonitoringPage = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [injectText, setInjectText] = useState('');
  const [injecting, setInjecting] = useState(false);
  const [filterSentiment, setFilterSentiment] = useState('ALL');
  const [isPaused, setIsPaused] = useState(false);
  const socketRef = useRef(null);
  const feedEndRef = useRef(null);

  // Fetch initial feed from API
  const fetchFeed = async () => {
    try {
      const res = await api.get('/monitoring/feed?limit=30');
      setFeedItems(res.data.feed || []);
    } catch (err) {
      console.error('Failed to load feed:', err);
    }
  };

  useEffect(() => {
    fetchFeed();

    // Setup WebSocket
    let wsUrl;
    if (import.meta.env.VITE_WS_URL) {
      wsUrl = `${import.meta.env.VITE_WS_URL.replace(/\/$/, '')}/ws/live`;
    } else if (import.meta.env.VITE_API_URL) {
      const cleanUrl = import.meta.env.VITE_API_URL.replace(/^http/, 'ws').replace(/\/$/, '');
      wsUrl = `${cleanUrl}/ws/live`;
    } else {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsUrl = `${protocol}//${window.location.host}/ws/live`;
    }
    
    let ws;
    try {
      ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'NEW_FEED_ITEM') {
            if (!isPaused) {
              setFeedItems((prev) => [payload.data, ...prev.slice(0, 49)]);
            }
          } else if (payload.type === 'STATUS_UPDATE') {
            setDemoMode(payload.demo_mode);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    } catch (e) {
      console.error('WebSocket connection attempt failed:', e);
    }

    return () => {
      if (ws) ws.close();
    };
  }, [isPaused]);

  const toggleDemoMode = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const nextMode = !demoMode;
      socketRef.current.send(JSON.stringify({
        action: nextMode ? 'START_DEMO' : 'STOP_DEMO'
      }));
      setDemoMode(nextMode);
    } else {
      setDemoMode(!demoMode);
    }
  };

  const handleInject = async (e) => {
    e.preventDefault();
    if (!injectText.trim()) return;
    setInjecting(true);
    try {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          action: 'INJECT',
          text: injectText.trim(),
          source: 'Live Client Stream'
        }));
      } else {
        await api.post('/monitoring/inject', {
          text: injectText.trim(),
          source: 'Live Client REST Stream'
        });
        fetchFeed();
      }
      setInjectText('');
    } catch (err) {
      console.error('Injection failed:', err);
    } finally {
      setInjecting(false);
    }
  };

  // Calculations
  const totalInFeed = feedItems.length;
  const posCount = feedItems.filter((i) => i.sentiment === 'Positive').length;
  const negCount = feedItems.filter((i) => i.sentiment === 'Negative').length;
  const neuCount = feedItems.filter((i) => i.sentiment === 'Neutral').length;

  const denom = Math.max(1, totalInFeed);
  const posPct = Math.round((posCount / denom) * 100);
  const negPct = Math.round((negCount / denom) * 100);
  const neuPct = Math.round((neuCount / denom) * 100);

  const distributionData = [
    { name: 'Positive', value: posPct, color: '#10B981' },
    { name: 'Neutral', value: neuPct, color: '#F59E0B' },
    { name: 'Negative', value: negPct, color: '#EF4444' }
  ];

  const filteredFeed = feedItems.filter((item) => {
    if (filterSentiment === 'ALL') return true;
    return item.sentiment?.toUpperCase() === filterSentiment;
  });

  return (
    <div className="space-y-6">
      {/* Header with Connection & Demo Mode Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Real-Time Sentiment Monitoring
            </h2>
            <span className="flex h-3 w-3 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Stream incoming customer reactions, support transcripts, and brand mentions via WebSocket.
          </p>
        </div>

        {/* Live / Demo Mode Distinction Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-purple-100 shadow-2xs text-xs">
            {isConnected ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <Wifi className="w-3.5 h-3.5" />
                WebSocket Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <WifiOff className="w-3.5 h-3.5" />
                REST Polling Active
              </span>
            )}
          </div>

          <button
            onClick={toggleDemoMode}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              demoMode
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-white border border-purple-200 text-slate-700 hover:bg-purple-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{demoMode ? 'Demo Simulator: ON' : 'Live Data Source'}</span>
          </button>
        </div>
      </div>

      {/* Distinction Alert for Clear Auditability */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
        demoMode
          ? 'bg-purple-50/70 border-purple-200 text-purple-900'
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
      }`}>
        <div className="flex items-center gap-2">
          {demoMode ? <Sparkles className="w-4 h-4 text-purple-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <div>
            <strong>Mode: {demoMode ? 'Synthetic Demonstration Stream' : 'Connected Live Stream'}</strong>
            <p className="text-[11px] opacity-80">
              {demoMode
                ? 'Currently broadcasting simulated sample user feedback for verification and UI demonstrations.'
                : 'Listening exclusively for live ingested production events or API webhooks.'}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Live Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#EBFBF3] rounded-2xl p-4 border border-emerald-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Live Positive Ratio</span>
            <h3 className="text-2xl font-black text-emerald-700 mt-0.5">{posPct}%</h3>
            <span className="text-[10px] text-emerald-600 font-bold">{posCount} events</span>
          </div>
          <Smile className="w-9 h-9 text-emerald-500 opacity-80" />
        </div>

        <div className="bg-[#FFF8E6] rounded-2xl p-4 border border-amber-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Live Neutral Ratio</span>
            <h3 className="text-2xl font-black text-amber-700 mt-0.5">{neuPct}%</h3>
            <span className="text-[10px] text-amber-600 font-bold">{neuCount} events</span>
          </div>
          <Meh className="w-9 h-9 text-amber-500 opacity-80" />
        </div>

        <div className="bg-[#FEF0F0] rounded-2xl p-4 border border-rose-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-600">Live Negative Ratio</span>
            <h3 className="text-2xl font-black text-rose-700 mt-0.5">{negPct}%</h3>
            <span className="text-[10px] text-rose-600 font-bold">{negCount} events</span>
          </div>
          <Frown className="w-9 h-9 text-rose-500 opacity-80" />
        </div>
      </div>

      {/* Main Grid: Stream Feed (7 cols) + Ingestion & Distribution (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stream Feed */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-600 animate-pulse" />
              <h3 className="text-base font-bold text-slate-900">
                Incoming Stream Feed
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {/* Pause/Resume Stream button */}
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  isPaused
                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? 'Resume' : 'Pause'}</span>
              </button>

              {/* Filter */}
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-hidden"
              >
                <option value="ALL">All Sentiments</option>
                <option value="POSITIVE">Positive Only</option>
                <option value="NEUTRAL">Neutral Only</option>
                <option value="NEGATIVE">Negative Only</option>
              </select>
            </div>
          </div>

          {/* Feed List Container */}
          <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredFeed.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                No events received yet. Inject a sample text on the right!
              </div>
            ) : (
              filteredFeed.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-3.5 rounded-2xl border border-purple-100/70 bg-[#FAF9FF] hover:bg-white hover:border-purple-300 transition-all shadow-2xs animate-in slide-in-from-top-1 duration-200"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.sentiment === 'Positive' ? 'bg-[#EBFBF3] text-emerald-700' :
                      item.sentiment === 'Negative' ? 'bg-[#FEF0F0] text-rose-700' : 'bg-[#FFF8E6] text-amber-700'
                    }`}>
                      {item.sentiment === 'Positive' ? '😊 Positive' : item.sentiment === 'Negative' ? '☹️ Negative' : '😐 Neutral'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3" />
                      <span>{item.created_at ? item.created_at.slice(11, 19) : 'Just now'}</span>
                      <span className="opacity-60">• {item.source || 'Live Stream'}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed">
                    "{item.text}"
                  </p>
                </div>
              ))
            )}
            <div ref={feedEndRef} />
          </div>
        </div>

        {/* Right Column: Live Ingestion + Live Donut (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Inject Test Event Card */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Inject Live Stream Event
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Transmit custom live text to the WebSocket stream and watch it process in real-time.
            </p>

            <form onSubmit={handleInject} className="space-y-3">
              <textarea
                rows={3}
                placeholder="e.g. Just deployed Sentiment Scope across 4 server clusters with 0 downtime!"
                value={injectText}
                onChange={(e) => setInjectText(e.target.value)}
                className="w-full bg-[#FAF9FF] border border-purple-100 rounded-2xl p-3 text-xs text-slate-800 focus:outline-hidden focus:border-purple-500 focus:bg-white resize-none"
              />

              <button
                type="submit"
                disabled={injecting || !injectText.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transmit to Live Stream</span>
              </button>
            </form>
          </div>

          {/* Live Sentiment Distribution Donut */}
          <div className="bg-white rounded-3xl p-6 border border-purple-100/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2">
              Live Stream Distribution
            </h3>
            <div className="h-44 w-full flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={68}
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
                <span className="text-xl font-black text-slate-900">{totalInFeed}</span>
                <span className="text-[10px] font-bold text-slate-400">Total Live</span>
              </div>
            </div>

            <div className="flex justify-around text-center text-xs pt-2 border-t border-slate-100">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Positive</p>
                <p className="font-bold text-emerald-600">{posPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Neutral</p>
                <p className="font-bold text-amber-600">{neuPct}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold">Negative</p>
                <p className="font-bold text-rose-600">{negPct}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
