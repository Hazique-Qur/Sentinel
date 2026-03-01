import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, TrendingUp, TrendingDown, Minus, Shield, Activity } from 'lucide-react';

const FleetOverview = ({ fleet = [], onSelectLocation, activeLocationId }) => {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold font-['Outfit'] uppercase tracking-widest text-slate-400">Fleet Surveillance</h3>
                <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
                    {fleet.length} Active Points
                </span>
            </div>

            {fleet.length === 0 ? (
                <div className="bg-white/5 border border-dashed border-white/10 rounded-2xl p-8 text-center">
                    <MapPin className="text-slate-700 mx-auto mb-3" size={24} />
                    <p className="text-xs text-slate-500 font-medium">No locations saved to fleet.</p>
                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">Save a location to begin multi-point monitoring.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fleet.map((item) => {
                        const isActive = activeLocationId === item.id;
                        const TrendIcon = item.trend === 'Rising' ? TrendingUp : item.trend === 'Falling' ? TrendingDown : Minus;
                        const trendColor = item.trend === 'Rising' ? 'text-red-400' : item.trend === 'Falling' ? 'text-green-400' : 'text-slate-500';

                        return (
                            <motion.button
                                key={item.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectLocation(item)}
                                className={`relative p-4 rounded-2xl border transition-all text-left overflow-hidden group
                                    ${isActive
                                        ? 'bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/20'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-lg ${isActive ? 'bg-blue-600' : 'bg-white/10'}`}>
                                            <MapPin size={12} className={isActive ? 'text-white' : 'text-slate-400'} />
                                        </div>
                                        <span className="text-[11px] font-bold text-slate-200 truncate max-w-[100px]">{item.label}</span>
                                    </div>
                                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border 
                                        ${item.alertLevel === 4 ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            item.alertLevel === 3 ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                item.alertLevel === 2 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                    'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                        {item.alertLabel}
                                    </div>
                                </div>

                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-2xl font-bold font-['Outfit'] tabular-nums tracking-tighter">
                                            {Math.round(item.currentRisk)}%
                                        </p>
                                        <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Risk Score</span>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className={`flex items-center gap-1 ${trendColor}`}>
                                            <TrendIcon size={12} />
                                            <span className="text-[10px] font-bold">{item.trend}</span>
                                        </div>
                                        <span className="text-[9px] text-slate-600 font-mono tracking-tighter">
                                            {item.lat.toFixed(2)}, {item.lon.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                    </div>
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default FleetOverview;
