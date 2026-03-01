import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';

const EscalationWarning = ({ probability, timeframe = "24h", currentRisk }) => {
    // Only show if probability is significant (> 40%)
    if (probability < 0.4) return null;

    const isHigh = probability >= 0.7;
    const isCritical = probability >= 0.85 || currentRisk >= 70;

    const theme = {
        critical: {
            bg: 'bg-red-500/10',
            border: 'border-red-500/30',
            text: 'text-red-400',
            icon: <ShieldAlert className="text-red-500" size={18} />,
            accent: 'bg-red-500'
        },
        high: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/30',
            text: 'text-orange-400',
            icon: <AlertCircle className="text-orange-500" size={18} />,
            accent: 'bg-orange-500'
        },
        moderate: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            icon: <AlertCircle className="text-yellow-500" size={18} />,
            accent: 'bg-yellow-500'
        }
    }[isCritical ? 'critical' : isHigh ? 'high' : 'moderate'];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`glass p-4 ${theme.bg} ${theme.border} relative overflow-hidden group`}
        >
            {/* Animated background glow */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${theme.accent} opacity-[0.03] blur-3xl -mr-16 -mt-16 group-hover:opacity-10 transition-opacity`} />

            <div className="flex gap-4">
                <div className="mt-1">
                    {theme.icon}
                </div>
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className={`text-sm font-bold font-['Outfit'] uppercase tracking-tight ${theme.text}`}>
                                {isCritical ? 'Critical Escalation Predicted' : 'Escalation Alert'}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={10} className="text-slate-500" />
                                <span className="text-[10px] font-mono text-slate-500 uppercase">Within next {timeframe}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className={`text-lg font-black font-['Outfit'] ${theme.text}`}>
                                {Math.round(probability * 100)}%
                            </div>
                            <div className="text-[8px] uppercase font-bold text-slate-500 tracking-widest">PROBABILITY</div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${probability * 100}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full ${theme.accent} shadow-[0_0_8px_rgba(255,255,255,0.2)]`}
                            />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-['Inter']">
                            Predictive modeling indicates a {isCritical ? 'very high' : 'statistical'} likelihood of
                            <span className={`font-bold ${theme.text}`}> Level 4 Emergency</span> escalation.
                            Recommend early activation of local response protocols.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <ArrowUpRight size={12} className={theme.text} />
                        <span className={`text-[10px] font-bold uppercase tracking-tight ${theme.text}`}>
                            Trajectory: {isCritical ? 'ACCELERATING' : 'STEADY RISE'}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default EscalationWarning;
