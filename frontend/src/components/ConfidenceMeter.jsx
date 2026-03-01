import React from 'react';
import { AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const ConfidenceMeter = ({ value, reason }) => {
    const percentage = (value * 100).toFixed(0);
    const isLow = value < 0.6;
    const isHigh = value >= 0.85;

    const barColor = isLow
        ? 'bg-yellow-500'
        : isHigh
            ? 'bg-emerald-500'
            : 'bg-blue-500';

    return (
        <div className={`glass p-6 flex flex-col gap-3 transition-all duration-500 ${isLow ? 'border-yellow-500/30 bg-yellow-950/5' : ''} ${value < 0.4 ? 'opacity-70 grayscale-[0.3]' : ''}`}>
            <div className="flex justify-between items-center">
                <h3 className="text-slate-400 text-sm uppercase tracking-wider">AI Confidence</h3>
                <span className={`font-bold ${isLow ? 'text-yellow-500' : isHigh ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {percentage}%
                </span>
            </div>

            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden border border-white/10 relative">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full ${barColor}`}
                />
            </div>

            {/* Confidence reason */}
            {isLow ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 text-yellow-500/80 mt-1"
                >
                    <AlertCircle size={14} className="animate-pulse shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-yellow-500">
                        {value < 0.4 ? 'CRITICAL: Data Integrity Insufficient' : 'Low prediction confidence — Data Integrity Gap'}
                    </span>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start gap-2 mt-0.5"
                >
                    <Info size={12} className="text-slate-600 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                        {reason || 'Confidence score based on real-time data integrity from weather APIs and satellite feeds.'}
                    </p>
                </motion.div>
            )}
        </div>
    );
};

export default ConfidenceMeter;
