import React from 'react';
import { motion } from 'framer-motion';

const TIER_CONFIG = {
    1: { emoji: '🟢', textColor: 'text-green-400', borderColor: 'border-green-500/40', bgColor: 'bg-green-500/10', glowColor: 'shadow-green-900/30' },
    2: { emoji: '🟡', textColor: 'text-yellow-400', borderColor: 'border-yellow-500/40', bgColor: 'bg-yellow-500/10', glowColor: 'shadow-yellow-900/30' },
    3: { emoji: '🟠', textColor: 'text-orange-400', borderColor: 'border-orange-500/40', bgColor: 'bg-orange-500/10', glowColor: 'shadow-orange-900/30' },
    4: { emoji: '🔴', textColor: 'text-red-400', borderColor: 'border-red-500/50', bgColor: 'bg-red-500/10', glowColor: 'shadow-red-900/40' },
};

/**
 * AlertTierBadge — Displays "🚨 ALERT LEVEL 3 — WARNING" with tier-appropriate styling.
 * Props:
 *   alertTier: { level: 1-4, label: string, color: string, situation: string }
 *   size: 'sm' | 'md' | 'lg' (default: 'md')
 *   pulse: boolean (default: true for level 3+)
 */
const AlertTierBadge = ({ alertTier, size = 'md', pulse }) => {
    if (!alertTier) return null;

    const level = alertTier.level ?? 1;
    const config = TIER_CONFIG[level] || TIER_CONFIG[1];
    const shouldPulse = pulse !== undefined ? pulse : level >= 3;

    const sizeClasses = {
        sm: 'px-3 py-1 text-[10px] gap-1.5',
        md: 'px-4 py-2 text-xs gap-2',
        lg: 'px-5 py-3 text-sm gap-2.5',
    }[size];

    return (
        <motion.div
            animate={shouldPulse ? { opacity: [1, 0.75, 1] } : {}}
            transition={shouldPulse ? { repeat: Infinity, duration: 2, ease: 'easeInOut' } : {}}
            className={`inline-flex items-center rounded-xl border font-bold uppercase tracking-widest font-['Outfit'] shadow-lg
                ${sizeClasses} ${config.textColor} ${config.borderColor} ${config.bgColor} ${config.glowColor}`}
        >
            <span>{config.emoji}</span>
            <span>Alert Level {level}</span>
            <span className="opacity-50">—</span>
            <span>{alertTier.label}</span>
        </motion.div>
    );
};

export default AlertTierBadge;
