import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Sparkles, Brain, Cpu, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        onOpenLearnMore={() => setLearnMoreOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all">
        <Navbar setMobileOpen={setMobileOpen} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Learn More Modal */}
      {learnMoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-purple-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setLearnMoreOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-purple-500/30">
              <Brain className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Sentiment Scope AI Engine
            </h3>
            <p className="text-xs text-purple-600 font-semibold mt-0.5">
              Dual-Model Architecture • VADER + NLP Neural Heuristics
            </p>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Sentiment Scope utilizes a synchronized dual-layer sentiment scoring architecture. It merges the rule-based lexical precision of <strong>VADER</strong> (Valence Aware Dictionary and sEntiment Reasoner) with advanced syntactic pattern classification.
              </p>
              
              <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100 space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Grammar & Punctuation Sensitivity (!!!, ???, ALL-CAPS)</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Subclause Negation & Contrastive Conjunction Handling</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>6-Dimensional Emotional Taxonomy & Keyword Salience</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setLearnMoreOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold shadow-md shadow-purple-500/20 hover:scale-[1.02] transition-transform"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
