import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap } from 'lucide-react';

const TIER_BAR = {
    low: 'from-green-500/80 to-green-400/60',
    medium: 'from-yellow-500/80 to-yellow-400/60',
    high: 'from-orange-500/80 to-orange-400/60',
    critical: 'from-red-500/80 to-red-400/60',
};

const getBarGradient = (value) => {
    if (value >= 0.75) return TIER_BAR.critical;
    if (value >= 0.55) return TIER_BAR.high;
    if (value >= 0.30) return TIER_BAR.medium;
    return TIER_BAR.low;
};

const getValueColor = (value) => {
    if (value >= 0.75) return 'text-red-400';
    if (value >= 0.55) return 'text-orange-400';
    if (value >= 0.30) return 'text-yellow-400';
    return 'text-green-400';
};

/**
 * RiskBreakdown — Transparent risk driver panel.
 * Props:
 *   factors: array of { key, label, value (0-1), unit, source, icon }
 *   primaryDriver: string (name of top factor)
 *   alertTier: { level, label, color, hex }
 */
const RiskBreakdown = ({ factors, primaryDriver, alertTier }) => {
    if (!factors || factors.length === 0) return null;

    // Sort: highest first
    const sorted = [...factors].sort((a, b) => b.value - a.value);
    const topTwo = sorted.slice(0, 2).map(f => f.key);

    return (
        <div className="glass p-6 flex flex-col gap-5 border-white/5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg">
                        <TrendingUp size={16} className="text-blue-400" />
                    </div>
                    <h3 className="text-sm font-bold font-['Outfit'] uppercase tracking-widest">Risk Drivers</h3>
                </div>
                <span className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest">Explainability Engine</span>
            </div>

            {/* Primary Driver Callout */}
            {primaryDriver && (
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2.5"
                >
                    <Zap size={14} className="text-blue-400 shrink-0" />
                    <div>
                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">Primary Risk Driver</p>
                        <p className="text-sm font-semibold text-blue-300 font-['Outfit']">{primaryDriver}</p>
                    </div>
                </motion.div>
            )}

            {/* Factor Bars */}
            <div className="flex flex-col gap-3.5">
                {sorted.map((factor, index) => {
                    const isTop = topTwo.includes(factor.key);
                    const pct = Math.round(factor.value * 100);
                    const barGradient = getBarGradient(factor.value);
                    const valueColor = getValueColor(factor.value);

                    return (
                        <motion.div
                            key={factor.key}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.08 * index, duration: 0.4 }}
                            className={`flex flex-col gap-1.5 ${isTop ? 'opacity-100' : 'opacity-75'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base leading-none select-none">{factor.icon}</span>
                                    <span className={`text-xs font-semibold font-['Inter'] ${isTop ? 'text-slate-200' : 'text-slate-400'}`}>
                                        {factor.label}
                                    </span>
                                    {isTop && (
                                        <span className="text-[8px] font-bold uppercase tracking-widest bg-white/10 border border-white/10 text-slate-400 px-1.5 py-0.5 rounded-full">
                                            Key
                                        </span>
                                    )}
                                </div>
                                <span className={`text-sm font-mono font-bold tabular-nums ${valueColor}`}>
                                    {pct}%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.9, delay: 0.1 * index, ease: 'easeOut' }}
                                />
                            </div>

                            {/* Source label */}
                            <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wide">
                                Source: {factor.source} · {factor.unit}
                            </p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default RiskBreakdown;
