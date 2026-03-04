import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

const TIER_CONFIG = {
    1: { icon: <Info className="text-green-400" size={20} />, dotColor: 'bg-green-500', pillBg: 'bg-green-500/10 border-green-500/30 text-green-400' },
    2: { icon: <AlertTriangle className="text-yellow-400" size={20} />, dotColor: 'bg-yellow-500', pillBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    3: { icon: <AlertOctagon className="text-orange-400" size={20} />, dotColor: 'bg-orange-500', pillBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    4: { icon: <ShieldAlert className="text-red-400" size={20} />, dotColor: 'bg-red-500', pillBg: 'bg-red-500/10 border-red-500/30 text-red-400' },
};

const ActionItem = ({ action, dotColor, index }) => {
    const [expanded, setExpanded] = useState(false);

    // Simulated detailed context for higher trust factor
    const details = {
        "Monitor local weather updates": "Continuously track the meteorological feed for rapid changes in rainfall intensity or wind direction that could trigger a higher alert level.",
        "Prepare emergency kit": "Ensure your kit includes 72 hours of water, non-perishable food, flashlights, extra batteries, and basic medical supplies.",
        "Secure loose outdoor items": "High wind speeds detected. Relocate or tether equipment to prevent hazardous debris projection.",
        "Review evacuation routes": "Familiarize yourself with designated government primary and secondary routes. Avoid low-lying bridge infrastructure.",
        "Implement water-saving measures": "High temperature anomaly detected. Reduce non-essential water usage to preserve local reservoir levels.",
        "Stay hydrated": "Extreme heat warning. Maintain consistent intake of fluids and avoid prolonged solar exposure.",
        "Charge electronic devices": "Potential for localized power grid instability. Maintain full charge on communication devices and backup batteries."
    };

    const explanation = details[action] || "Standard protocol. Follow local government directives and maintain situational awareness.";

    return (
        <div
            onClick={() => setExpanded(!expanded)}
            className="group flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition-all cursor-pointer select-none"
        >
            <div className="flex gap-3 items-center">
                <div className={`w-2 h-2 rounded-full ${dotColor} shrink-0 group-hover:scale-125 transition-transform`}></div>
                <p className="text-sm text-slate-200 font-medium leading-relaxed flex-1">{action}</p>
                {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500 group-hover:text-slate-300" />}
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <p className="pt-2 text-xs text-slate-400 leading-relaxed pl-5 border-l border-white/10 ml-1">
                            {explanation}
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const ActionList = ({ actions, alertTier }) => {
    const level = alertTier?.level ?? 1;
    const config = TIER_CONFIG[level] || TIER_CONFIG[1];

    return (
        <div className="glass p-6 flex flex-col gap-5 border-white/10 shadow-2xl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {config.icon}
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Tactical Recommendations</h3>
                </div>
                {alertTier?.label && (
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${config.pillBg}`}>
                        Tier {level}
                    </span>
                )}
            </div>

            <div className="flex flex-col gap-3">
                {actions && actions.length > 0 ? (
                    actions.map((action, index) => (
                        <ActionItem key={index} action={action} dotColor={config.dotColor} index={index} />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 gap-3">
                        <div className="w-8 h-8 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-slate-500 italic text-xs">Synchronizing intelligence feed...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActionList;
