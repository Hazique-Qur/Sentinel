import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, ShieldOff } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertTierBadge = ({ tier }) => {
    if (!tier) return null;

    const { level, label, color, description } = tier;

    const getIcon = () => {
        switch (level) {
            case 4: return <ShieldOff size={14} className="text-red-400" />;
            case 3: return <ShieldAlert size={14} className="text-orange-400" />;
            case 2: return <Shield size={14} className="text-yellow-400" />;
            default: return <ShieldCheck size={14} className="text-green-400" />;
        }
    };

    const getStyles = () => {
        switch (level) {
            case 4: return "bg-red-500/10 border-red-500/30 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.1)]";
            case 3: return "bg-orange-500/10 border-orange-500/30 text-orange-400";
            case 2: return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
            default: return "bg-green-500/10 border-green-500/30 text-green-400";
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getStyles()} backdrop-blur-sm self-start`}
        >
            {getIcon()}
            <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Level {level} — {label}</span>
            </div>
        </motion.div>
    );
};

export default AlertTierBadge;
