import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Target, BarChart3, RotateCw, CheckCircle2, AlertCircle } from 'lucide-react';

const ModelPerformance = ({ performance, onRefresh, onSubmitFeedback, latestPredictionId }) => {
    const [actualScore, setActualScore] = useState(50);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedbackSent, setFeedbackSent] = useState(false);

    const metrics = performance?.metrics || {
        mean_absolute_error: 0,
        confidence_calibration: 0.85,
        total_outcomes: 0
    };

    const weights = performance?.weights || {};

    const handleSubmit = async () => {
        if (!latestPredictionId) return;
        setIsSubmitting(true);
        try {
            await onSubmitFeedback(latestPredictionId, actualScore);
            setFeedbackSent(true);
            setTimeout(() => setFeedbackSent(false), 3000);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                        <Brain size={18} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Model Evolution Context</h3>
                </div>
                <button
                    onClick={onRefresh}
                    className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                    <RotateCw size={14} />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="glass p-4 border-white/5 bg-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Target size={12} />
                        <span className="text-[10px] font-bold uppercase">Forecast Precision</span>
                    </div>
                    <div className="text-2xl font-black text-white font-['Outfit']">
                        {Math.max(0, 100 - Math.round(metrics.mean_absolute_error))}%
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tighter">
                        Inverse MAE based on {metrics.total_outcomes} outcomes
                    </div>
                </div>

                <div className="glass p-4 border-white/5 bg-white/5 space-y-2">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <BarChart3 size={12} />
                        <span className="text-[10px] font-bold uppercase">Calibration Score</span>
                    </div>
                    <div className="text-2xl font-black text-blue-400 font-['Outfit']">
                        {(metrics.confidence_calibration * 100).toFixed(1)}%
                    </div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-tighter">
                        Statistical reliability index
                    </div>
                </div>
            </div>

            {/* Weight Distribution */}
            <div className="glass p-5 border-white/5 bg-slate-950/40 space-y-4">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Adaptive Weight Allocation</div>
                <div className="space-y-3">
                    {Object.entries(weights).map(([key, value]) => (
                        <div key={key}>
                            <div className="flex justify-between text-[10px] font-bold mb-1.5">
                                <span className="text-slate-400 uppercase tracking-tight">{key.replace('_', ' ')}</span>
                                <span className="text-blue-400">{(value * 100).toFixed(1)}%</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${value * 100}%` }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Feedback Loop Interaction */}
            <div className="glass p-5 border-indigo-500/20 bg-indigo-500/5 space-y-4">
                <div className="flex items-center gap-2 text-indigo-400">
                    <RotateCw size={14} className="animate-spin-slow" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Ground Truth Submission</span>
                </div>

                <p className="text-[10px] text-slate-400 leading-relaxed italic">
                    Log the actually observed disaster intensity to calibrate model weights for this location.
                </p>

                <div className="space-y-4 pt-2">
                    <input
                        type="range"
                        min="0" max="100"
                        value={actualScore}
                        onChange={(e) => setActualScore(parseInt(e.target.value))}
                        className="w-full accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold font-['Outfit']">{actualScore}% <span className="text-[10px] text-slate-500 uppercase">Observed</span></span>
                        <button
                            onClick={handleSubmit}
                            disabled={!latestPredictionId || isSubmitting || feedbackSent}
                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all flex items-center gap-2 ${feedbackSent ? 'bg-green-500 text-white' :
                                    !latestPredictionId ? 'bg-slate-700 text-slate-400 cursor-not-allowed' :
                                        'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-900/40 active:scale-95'
                                }`}
                        >
                            {feedbackSent ? <CheckCircle2 size={12} /> : null}
                            {feedbackSent ? 'Logged' : isSubmitting ? 'Syncing...' : 'Submit Ground Truth'}
                        </button>
                    </div>
                    {!latestPredictionId && (
                        <div className="flex items-center gap-2 text-amber-500 text-[9px] uppercase font-bold justify-center">
                            <AlertCircle size={10} />
                            No active prediction ID found for feedback
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ModelPerformance;
