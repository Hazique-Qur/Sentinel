import React from 'react';
import { motion } from 'framer-motion';

const RiskCard = ({ score, level, primaryThreat, confidence, alertTier, loading }) => {
    const getLevelColor = () => {
        if (level === 'High') return 'text-red-500';
        if (level === 'Medium') return 'text-yellow-500';
        return 'text-green-500';
    };

    const getGlowColor = () => {
        if (level === 'High') return 'bg-red-500/20';
        if (level === 'Medium') return 'bg-yellow-500/20';
        return 'bg-green-500/20';
    };

    const getBorderColor = () => {
        if (level === 'High') return 'border-red-500/30';
        if (level === 'Medium') return 'border-yellow-500/30';
        return 'border-green-500/30';
    };

    return (
        <div className={`glass p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden ${getBorderColor()} transition-colors duration-700`}>
            {loading && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Pulse Aura */}
            <motion.div
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`absolute inset-0 z-0 ${getGlowColor()}`}
            />

            <h2 className="text-slate-400 text-sm uppercase tracking-[0.2em] relative z-10">Risk Analysis</h2>

            <div className="relative flex items-center justify-center z-10">
                {/* Visual Pulse Ring */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className={`absolute w-44 h-44 rounded-full border-2 ${level === 'High' ? 'border-red-500/30' : level === 'Medium' ? 'border-yellow-500/30' : 'border-green-500/30'}`}
                />

                <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="transparent"
                        strokeDasharray={553}
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getLevelColor()}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-5xl font-['Outfit'] font-bold">{Math.round(score)}</span>
                    <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${getLevelColor()}`}>
                        {alertTier?.label || level}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1 relative z-10 mt-2">
                <div className="flex items-center gap-2 justify-center">
                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Confidence</span>
                    <span className="text-blue-400 font-bold font-['Outfit']">{Math.round(confidence * 100)}%</span>
                </div>
                <div className="mt-1 h-1 w-24 bg-white/5 rounded-full overflow-hidden mx-auto">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${confidence * 100}%` }}
                        className="h-full bg-blue-500"
                    />
                </div>
            </div>

            <div className="mt-2 relative z-10 p-4 w-full bg-white/5 rounded-xl border border-white/5">
                <p className="text-slate-400 text-[9px] uppercase font-bold tracking-widest mb-1">Primary Threat Vector</p>
                <p className="text-lg font-semibold font-['Outfit']">{primaryThreat || 'Equilibrium Monitoring'}</p>
            </div>
        </div>
    );
};

export default RiskCard;
