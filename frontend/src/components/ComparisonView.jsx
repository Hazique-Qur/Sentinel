import React from 'react';
import { motion } from 'framer-motion';
import { Scale, ArrowRight, TrendingUp, TrendingDown, Minus, Activity, Shield, MapPin } from 'lucide-react';

const ComparisonView = ({ locations, fleet }) => {
    // If no locations or only one, show a prompt
    if (locations.length < 2) {
        return (
            <div className="glass p-12 flex flex-col items-center justify-center text-center gap-6 border-white/5">
                <div className="p-6 bg-blue-500/10 rounded-full text-blue-400">
                    <Scale size={48} />
                </div>
                <div>
                    <h3 className="text-xl font-bold font-['Outfit'] mb-2">Comparison Engine</h3>
                    <p className="text-slate-400 max-w-md mx-auto">
                        Save at least two locations to your fleet to unlock side-by-side analytical comparisons and trend cross-referencing.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                    <Scale size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold font-['Outfit'] tracking-tight">Analytical Comparison</h2>
                    <p className="text-slate-500 text-xs font-['Inter'] uppercase tracking-widest">Fleet-wide cross-reference analysis</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations.map((loc) => {
                    const status = fleet[loc.id] || { riskScore: 0, alertTier: 1, alertLabel: 'Checking...', trend: 'Stable' };
                    const alertTier = {
                        1: { color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
                        2: { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
                        3: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
                        4: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' }
                    }[status.alertTier] || { color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/30' };

                    return (
                        <motion.div
                            key={loc.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass p-6 border-white/5 hover:border-white/10 transition-all group"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-lg font-bold font-['Outfit'] group-hover:text-blue-400 transition-colors uppercase tracking-tight">{loc.label}</h4>
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono mt-1">
                                        <MapPin size={10} />
                                        {loc.lat.toFixed(3)}, {loc.lon.toFixed(3)}
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${alertTier.bg} ${alertTier.color} border ${alertTier.border}`}>
                                    L{status.alertTier}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        <span>Risk Index</span>
                                        <span className={alertTier.color}>{status.riskScore}%</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${status.riskScore}%` }}
                                            className={`h-full ${status.riskScore > 75 ? 'bg-red-500' : status.riskScore > 50 ? 'bg-orange-500' : status.riskScore > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Trend</div>
                                        <div className="flex items-center gap-2">
                                            {status.trend === 'Rising' ? <TrendingUp size={14} className="text-red-400" /> :
                                                status.trend === 'Falling' ? <TrendingDown size={14} className="text-green-400" /> :
                                                    <Minus size={14} className="text-slate-400" />}
                                            <span className="text-xs font-bold">{status.trend}</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Threshold</div>
                                        <div className="flex items-center gap-2">
                                            <Shield size={14} className="text-blue-400" />
                                            <span className="text-xs font-bold">L{loc.custom_threshold || 3}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full animate-pulse ${status.riskScore > status.riskLevel * 25 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'bg-green-500'}`} />
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">Operational Status</span>
                                    </div>
                                    <ArrowRight size={14} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Aggregate Insight */}
            <div className="glass p-6 border-blue-500/20 bg-blue-500/5">
                <div className="flex items-center gap-3 mb-4">
                    <Activity size={20} className="text-blue-400" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400">Fleet Intelligence Insight</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                    Side-by-side analysis indicates that <span className="text-white font-bold">{
                        Object.entries(fleet).sort((a, b) => b[1].riskScore - a[1].riskScore)[0]?.[1]?.riskScore > 0 ?
                            locations.find(l => l.id === Object.entries(fleet).sort((a, b) => b[1].riskScore - a[1].riskScore)[0][0])?.label : 'Fleet'
                    }</span> currently requires the highest tactical priority with a risk index of <span className="text-red-400 font-bold">{
                        Math.max(...Object.values(fleet).map(f => f.riskScore), 0)
                    }%</span>.
                    Regional variance is currently <span className="text-white font-bold">{
                        Math.round(Math.max(...Object.values(fleet).map(f => f.riskScore), 0) - Math.min(...Object.values(fleet).map(f => f.riskScore), 0))
                    }%</span> across all monitored assets.
                </p>
            </div>
        </div>
    );
};

export default ComparisonView;
