import React from 'react';
import { motion } from 'framer-motion';

const RiskCard = ({ score, level, primaryThreat, loading }) => {
    const getLevelColor = () => {
        if (level === 'High') return 'text-red-500';
        if (level === 'Medium') return 'text-yellow-500';
        return 'text-green-500';
    };

    const getBorderColor = () => {
        if (level === 'High') return 'border-red-500/30';
        if (level === 'Medium') return 'border-yellow-500/30';
        return 'border-green-500/30';
    };

    return (
        <div className={`glass p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden ${getBorderColor()}`}>
            {loading && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            <h2 className="text-slate-400 text-sm uppercase tracking-[0.2em]">Risk Score</h2>

            <div className="relative flex items-center justify-center">
                <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        className="text-white/5"
                    />
                    <motion.circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={553}
                        initial={{ strokeDashoffset: 553 }}
                        animate={{ strokeDashoffset: 553 - (553 * score) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={getLevelColor()}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-['Outfit'] font-bold">{score}</span>
                    <span className={`text-sm font-bold uppercase tracking-widest ${getLevelColor()}`}>{level}</span>
                </div>
            </div>

            <div className="mt-2">
                <p className="text-slate-400 text-xs mb-1">Primary Threat</p>
                <p className="text-lg font-semibold">{primaryThreat || 'None Detected'}</p>
            </div>
        </div>
    );
};

export default RiskCard;
