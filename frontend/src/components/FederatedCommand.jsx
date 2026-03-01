import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Server, Activity, ArrowUpRight, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

const FederatedCommand = ({ federation, onSync, isSyncing }) => {
    const [selectedRegion, setSelectedRegion] = useState(null);

    const regions = federation?.regional_intelligence || [];
    const globalWeights = federation?.global_meta_model || {};

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                        <Globe size={18} />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Federated Intelligence Command</h3>
                </div>
                <button
                    onClick={onSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white rounded-xl text-[10px] font-bold uppercase transition-all shadow-lg shadow-blue-900/40"
                >
                    <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Meta-Model Sync'}
                </button>
            </div>

            {/* Region Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regions.map((region) => (
                    <motion.div
                        key={region.region_id}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedRegion(region)}
                        className={`glass p-4 border-white/5 cursor-pointer transition-all ${selectedRegion?.region_id === region.region_id ? 'ring-2 ring-blue-500/50 bg-blue-500/5' : 'bg-white/5'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-white tracking-widest">{region.region_id}</h4>
                                <p className="text-[9px] text-slate-500">Model Evolution Context</p>
                            </div>
                            <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter ${region.model_drift < 0.1 ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'
                                }`}>
                                Drift: {region.model_drift}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-4">
                            <div className="bg-black/20 p-2 rounded-lg">
                                <span className="text-[8px] text-slate-500 uppercase block mb-1">Reliability</span>
                                <span className="text-xs font-bold text-blue-400">{(region.metrics.confidence_calibration * 100).toFixed(1)}%</span>
                            </div>
                            <div className="bg-black/20 p-2 rounded-lg">
                                <span className="text-[8px] text-slate-500 uppercase block mb-1">Accuracy</span>
                                <span className="text-xs font-bold text-white">{Math.max(0, 100 - Math.round(region.metrics.mean_absolute_error))}%</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between text-[8px] font-bold text-slate-500">
                            <div className="flex items-center gap-1">
                                <Activity size={10} />
                                {region.data_points} SAMPLES
                            </div>
                            <div className="flex items-center gap-1 uppercase">
                                <Server size={10} />
                                Local Instance
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Global Consensus View */}
            <div className="glass p-5 border-blue-500/20 bg-blue-500/5 space-y-4">
                <div className="flex items-center gap-2 text-blue-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Global Meta-Model Baseline</span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                    {Object.entries(globalWeights).map(([key, value]) => (
                        <div key={key} className="text-center">
                            <div className="text-[9px] text-slate-500 uppercase mb-1 truncate">{key.split('_')[0]}</div>
                            <div className="text-xs font-black text-white">{(value * 100).toFixed(0)}%</div>
                            <div className="h-0.5 bg-white/5 mt-2 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500" style={{ width: `${value * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-2 flex items-start gap-2 border-t border-white/5">
                    <AlertCircle size={14} className="text-slate-500 shrink-0" />
                    <p className="text-[9px] text-slate-400 leading-relaxed italic">
                        Federated averaging preserves data sovereignty. Each regional model learns locally and shares only obfuscated parameter updates with the global meta-model.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default FederatedCommand;
