import React from 'react';
import { motion } from 'framer-motion';
import AlertTierBadge from './AlertTierBadge';

const TIER_RING = {
    1: 'text-green-500',
    2: 'text-yellow-500',
    3: 'text-orange-500',
    4: 'text-red-500',
};

const TIER_BORDER = {
    1: 'border-l-4 border-l-green-500/60',
    2: 'border-l-4 border-l-yellow-500/60',
    3: 'border-l-4 border-l-orange-500/70',
    4: 'border-l-4 border-l-red-500/80',
};

const RiskCard = ({ score, level, primaryThreat, loading, alertTier }) => {
    const tierLevel = alertTier?.level ?? 1;
    const ringColor = TIER_RING[tierLevel] || TIER_RING[1];
    const borderClass = TIER_BORDER[tierLevel] || TIER_BORDER[1];
    const shouldPulse = tierLevel >= 3;

    return (
        <motion.div
            animate={shouldPulse ? { boxShadow: ['0 0 0px transparent', `0 0 24px ${alertTier?.hex ?? '#f97316'}30`, '0 0 0px transparent'] } : {}}
            transition={shouldPulse ? { repeat: Infinity, duration: 2.5, ease: 'easeInOut' } : {}}
            className={`glass p-8 flex flex-col items-center text-center gap-4 relative overflow-hidden ${borderClass}`}
        >
            {loading && (
                <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {/* Alert Tier Badge */}
            <div className="w-full flex justify-center">
                <AlertTierBadge alertTier={alertTier} size="sm" />
            </div>

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
                        className={ringColor}
                    />
                </svg>
                <div className="absolute flex flex-col items-center">
                    <span className="text-6xl font-['Outfit'] font-bold">{score}</span>
                    <span className={`text-xs font-bold uppercase tracking-widest mt-1 ${ringColor}`}>
                        {alertTier?.situation || level}
                    </span>
                </div>
            </div>

            <div className="mt-1 w-full">
                <p className="text-slate-400 text-xs mb-1">Primary Threat</p>
                <p className="text-lg font-semibold">{primaryThreat || 'None Detected'}</p>
            </div>

            {alertTier?.description && (
                <p className={`text-[10px] text-center leading-relaxed px-2 opacity-70 ${ringColor}`}>
                    {alertTier.description}
                </p>
            )}
        </motion.div>
    );
};

export default RiskCard;
