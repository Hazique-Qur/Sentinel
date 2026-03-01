import React from 'react';
import { motion } from 'framer-motion';
import { Globe, Map, AlertTriangle, ShieldAlert } from 'lucide-react';

const RegionalOverview = ({ summary, loading }) => {
    if (loading && !summary) {
        return (
            <div className="glass p-6 h-full flex flex-col items-center justify-center space-y-4">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-slate-500 font-mono uppercase">Analyzing Region...</p>
            </div>
        );
    }

    if (!summary) return null;

    const { avgScore, maxScore, emergencyPercent, warningPercent, pointCount } = summary;

    const stats = [
        { label: 'Avg Risk', value: `${avgScore}%`, icon: <Globe size={14} />, color: 'text-blue-400' },
        { label: 'Max Risk', value: `${maxScore}%`, icon: <AlertTriangle size={14} />, color: maxScore > 75 ? 'text-red-400' : 'text-orange-400' },
        { label: 'Emergency', value: `${emergencyPercent}%`, icon: <ShieldAlert size={14} />, color: 'text-red-500' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-6 flex flex-col gap-5 border-white/5 h-full"
        >
            <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                    <Map size={16} className="text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold font-['Outfit'] uppercase tracking-widest">Regional Intelligence</h3>
                    <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wide">Grid: {pointCount} points analyzed</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl hover:bg-white/10 transition-colors">
                        <div className={`flex items-center gap-1.5 mb-1 ${s.color}`}>
                            {s.icon}
                            <span className="text-[9px] uppercase font-bold tracking-tighter">{s.label}</span>
                        </div>
                        <div className="text-lg font-bold font-mono tracking-tight">{s.value}</div>
                    </div>
                ))}
            </div>

            {/* Scale/Distribution */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alert Distribution</span>
                    <span className="text-[10px] font-mono text-slate-400">{warningPercent + emergencyPercent}% In Alert</span>
                </div>

                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex border border-white/5">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${emergencyPercent}%` }}
                        className="h-full bg-red-500"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${warningPercent}%` }}
                        className="h-full bg-orange-500"
                    />
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, 100 - emergencyPercent - warningPercent)}%` }}
                        className="h-full bg-green-500"
                    />
                </div>

                <div className="flex justify-between text-[8px] font-mono text-slate-600 uppercase">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" /> Emergency</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.5)]" /> Warning</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)]" /> Safe/Watch</span>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-2">
                <p className="text-[9px] text-slate-500 italic leading-relaxed">
                    Heatmap reflects spatial interpolation of current meteorological telemetry and historical terrain vulnerability.
                </p>
                <div className="flex items-center gap-2">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
                </div>
            </div>
        </motion.div>
    );
};

export default RegionalOverview;
