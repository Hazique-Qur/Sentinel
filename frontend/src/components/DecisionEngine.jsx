import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Truck, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';

const DecisionEngine = ({ tier = 1, threats = [] }) => {
    const getDecisions = () => {
        if (tier >= 4) {
            return [
                { id: 1, icon: <Shield size={16} />, label: "Evacuation Protocol", desc: "Mandatory displacement of high-risk sectors.", status: "Critical" },
                { id: 2, icon: <Truck size={16} />, label: "Resource Logistics", desc: "Deploying primary medical & dietary assets.", status: "Deploying" },
                { id: 3, icon: <Bell size={16} />, label: "Mass Broadcast", desc: "Emergency EAS signal across all regional bands.", status: "Active" }
            ];
        } else if (tier === 3) {
            return [
                { id: 1, icon: <Zap size={16} />, label: "Power Grid Hardening", desc: "Shutting down vulnerable sub-stations.", status: "Standby" },
                { id: 2, icon: <Shield size={16} />, label: "Local Shelter Open", desc: "Activating civic shelters for temporary use.", status: "Ready" }
            ];
        } else {
            return [
                { id: 1, icon: <CheckCircle2 size={16} />, label: "Passive Monitoring", desc: "Normal data ingestion cycle.", status: "Optimal" }
            ];
        }
    };

    return (
        <div className="glass p-6 border-white/5 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg">
                        <Zap className="text-red-400" size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Tactical Decision Engine</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-semibold">Autonomous Response Unit</p>
                    </div>
                </div>
                {tier >= 3 && (
                    <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="px-2 py-0.5 bg-red-500/20 border border-red-500/40 rounded text-[9px] font-bold text-red-400 uppercase"
                    >
                        Priority Alpha
                    </motion.div>
                )}
            </div>

            <div className="space-y-4">
                {getDecisions().map((decision, idx) => (
                    <motion.div
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        key={decision.id}
                        className="p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-default group"
                    >
                        <div className="flex gap-4">
                            <div className="mt-1 p-2 bg-slate-900 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                                {decision.icon}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">{decision.label}</h4>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${decision.status === 'Critical' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                            decision.status === 'Deploying' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                                                'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        }`}>
                                        {decision.status}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-relaxed">{decision.desc}</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {threats.length > 0 && threats[0] !== "Nominal Equilibrium" && (
                <div className="pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={12} className="text-yellow-500" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Vectors</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {threats.map((threat, i) => (
                            <span key={i} className="px-2 py-1 bg-white/5 rounded-md text-[9px] font-bold text-slate-300 border border-white/10 italic">
                                "{threat}"
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DecisionEngine;
