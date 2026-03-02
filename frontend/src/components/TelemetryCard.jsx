import React from 'react';
import { motion } from 'framer-motion';

const TelemetryCard = ({ icon, label, value }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col gap-3 transition-colors hover:bg-white/10 group"
        >
            <div className="flex items-center justify-between">
                <div className="p-2 bg-slate-900 rounded-lg group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
            </div>
            <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                    {label}
                </span>
                <span className="text-sm font-['Outfit'] font-bold text-slate-100">
                    {value}
                </span>
            </div>
        </motion.div>
    );
};

export default TelemetryCard;
