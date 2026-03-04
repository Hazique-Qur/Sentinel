import React from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const RiskFactors = ({ factors }) => {
    if (!factors || factors.length === 0) return null;

    return (
        <div className="glass p-6 flex flex-col gap-5 border-white/5 h-full">
            <div className="flex items-center justify-between">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Transparent Risk Scoring</h3>
                <div className="group relative">
                    <Info size={14} className="text-slate-500 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Weights calculated using multi-agent intelligence feed processing.
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {factors.map((factor, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-medium">
                            <span className="text-slate-300">{factor.label}</span>
                            <span className="text-slate-500 italic">{factor.source}</span>
                        </div>
                        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(factor.value / factor.max) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className={`absolute inset-y-0 left-0 rounded-full ${factor.value / factor.max > 0.7 ? 'bg-red-500' :
                                        factor.value / factor.max > 0.4 ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}
                            />
                        </div>
                        <div className="flex justify-between text-[9px] text-slate-500">
                            <span>Contribution Impact</span>
                            <span className="font-bold text-slate-400">+{factor.value} {factor.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-2 pt-4 border-t border-white/5">
                <p className="text-[9px] text-slate-500 leading-relaxed uppercase tracking-tighter">
                    Analytical confidence derived from synchronized satellite telemetry & meteorological forecast models.
                </p>
            </div>
        </div>
    );
};

export default RiskFactors;
