import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Activity } from 'lucide-react';

const PredictiveTimeline = ({ forecast = [], onScrub }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    if (!forecast || forecast.length === 0) return null;

    return (
        <div className="glass p-6 border-white/5 space-y-6 overflow-hidden">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 rounded-lg">
                        <Clock className="text-indigo-400" size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">24H Risk Projection</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Situational Forecasting</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <Activity size={12} className="text-emerald-400" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Real-Time Sync</span>
                </div>
            </div>

            {/* Timeline Scrubbing Area */}
            <div className="relative pt-10 pb-6">
                <div className="h-1.5 w-full bg-slate-800/50 rounded-full relative">
                    {/* Progress Fill */}
                    <div
                        className="absolute h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${(activeIndex / (forecast.length - 1)) * 100}%` }}
                    />

                    {/* Forecast Points */}
                    <div className="absolute inset-0 flex justify-between items-center -top-1">
                        {forecast.map((point, idx) => (
                            <div
                                key={idx}
                                onClick={() => {
                                    setActiveIndex(idx);
                                    onScrub(point);
                                }}
                                className={`cursor-pointer group flex flex-col items-center gap-2`}
                            >
                                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${idx <= activeIndex ? 'bg-indigo-500 border-indigo-400 scale-125' : 'bg-slate-700 border-slate-600'
                                    } group-hover:scale-150`} />

                                {idx % 4 === 0 && (
                                    <span className={`absolute -bottom-6 text-[10px] font-bold transition-colors ${idx === activeIndex ? 'text-white' : 'text-slate-600'
                                        }`}>
                                        {point.hour}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Active Data Preview */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Projected Risk</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-black font-['Outfit'] text-white">
                            {forecast[activeIndex].score}
                        </span>
                        <span className={`text-[10px] font-bold pb-1 ${forecast[activeIndex].tier >= 4 ? 'text-red-400' :
                                forecast[activeIndex].tier === 3 ? 'text-yellow-400' : 'text-emerald-400'
                            }`}>
                            LEVEL {forecast[activeIndex].tier}
                        </span>
                    </div>
                </div>

                <div className="p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex flex-col justify-center items-center text-center">
                    <div className="flex items-center gap-2 text-indigo-300 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Protocol</span>
                        <ChevronRight size={12} />
                    </div>
                    <span className="text-[11px] font-bold text-white">
                        {forecast[activeIndex].tier >= 4 ? 'Evacuation Ready' :
                            forecast[activeIndex].tier === 3 ? 'Standby Mode' : 'Nominal Ops'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PredictiveTimeline;
