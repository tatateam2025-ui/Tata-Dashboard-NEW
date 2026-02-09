import React from 'react';
import { Sparkles, X, Brain, Target, AlertTriangle, Zap } from 'lucide-react';

interface AIInsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isLoading: boolean;
}

export const AIInsightsModal: React.FC<AIInsightsModalProps> = ({ isOpen, onClose, content, isLoading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Sparkles size={20} className="text-blue-100" /></div>
            <div>
              <h2 className="text-xl font-bold">Navigant AI Insights</h2>
              <p className="text-blue-100/70 text-xs font-medium uppercase tracking-wider">Executive Analysis Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-50 border-t-blue-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center"><Brain className="text-blue-600" size={24} /></div>
              </div>
              <div className="text-center">
                <p className="text-slate-900 font-bold text-lg">Analyzing Data Patterns...</p>
                <p className="text-slate-400 text-sm mt-1">Gemini is synthesizing current performance metrics</p>
              </div>
            </div>
          ) : (
            <div className="prose prose-slate max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">{content}</div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-4">
                  <Target className="text-blue-600 shrink-0" size={20} />
                  <div><h4 className="text-xs font-black text-blue-900 uppercase">Focus Area</h4><p className="text-xs text-blue-700 mt-1">High-value enterprise leads show maximum growth potential.</p></div>
                </div>
                <div className="bg-amber-50 p-4 rounded-2xl flex items-start gap-4">
                  <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                  <div><h4 className="text-xs font-black text-amber-900 uppercase">Attention</h4><p className="text-xs text-amber-700 mt-1">Monitor manpower utilization as leads scale.</p></div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-t border-slate-100">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2"><Zap size={10} className="text-blue-500" /> Powered by Gemini 3 Flash</p>
          <button onClick={onClose} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all">Acknowledge</button>
        </div>
      </div>
    </div>
  );
};