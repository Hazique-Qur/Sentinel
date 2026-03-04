import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Play, RefreshCw, Wind, Droplets, Thermometer, ShieldAlert, Activity } from 'lucide-react';

const SimulationSlider = ({ icon, label, value, unit, onChange }) => (
    <div className="space-y-4">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
                <span className="text-sm font-semibold text-slate-300">{label}</span>
            </div>
            <span className="font-mono text-sm font-bold text-white bg-white/5 px-2 py-1 rounded">
                {value}{unit}
            </span>
        </div>
        <input
            type="range"
            min="0" max="100"
            value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-500"
        />
    </div>
);

const DemoPage = () => {
    const [params, setParams] = useState({
        rainfall: 20,
        temp: 25,
        wind: 15
    });

    const [history, setHistory] = useState(new Array(20).fill(0));
    const [riskScore, setRiskScore] = useState(0);

    useEffect(() => {
        // Simple mock calculation for demo
        const base = (params.rainfall * 0.5) + (params.temp * 0.2) + (params.wind * 0.3);
        const newScore = Math.min(Math.round(base), 100);
        setRiskScore(newScore);

        setHistory(prev => [...prev.slice(1), newScore]);
    }, [params]);

    const riskLevel = riskScore > 75 ? 'High' : riskScore > 40 ? 'Medium' : 'Low';

    const handleStressTest = () => {
        setParams({
            rainfall: 98,
            temp: 42,
            wind: 95
        });
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pt-32 pb-20 px-6 overflow-hidden">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h2 className="text-4xl font-['Outfit'] font-black mb-4 flex items-center gap-4">
                        <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                            <Settings className="text-indigo-400" size={24} />
                        </div>
                        Sentinel Simulation Workspace
                    </h2>
                    <p className="text-slate-400 max-w-2xl">
                        Tweak environmental variables in real-time to observe how the Sentinel Autonomous Brain responds to extreme fail-states.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Controls */}
                    <section className="lg:col-span-4 space-y-6">
                        <div className="glass p-8 border-white/5 space-y-8">
                            <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-4">Parameter Control</h3>

                            <SimulationSlider
                                icon={<Droplets className="text-blue-400" size={18} />}
                                label="Rainfall Intensity"
                                value={params.rainfall}
                                unit="mm/h"
                                onChange={(val) => setParams(p => ({ ...p, rainfall: val }))}
                            />

                            <SimulationSlider
                                icon={<Thermometer className="text-orange-400" size={18} />}
                                label="Ambient Temp"
                                value={params.temp}
                                unit="°C"
                                onChange={(val) => setParams(p => ({ ...p, temp: val }))}
                            />

                            <SimulationSlider
                                icon={<Wind className="text-slate-400" size={18} />}
                                label="Wind Velocity"
                                value={params.wind}
                                unit="km/h"
                                onChange={(val) => setParams(p => ({ ...p, wind: val }))}
                            />
                        </div>

                        <div
                            onClick={handleStressTest}
                            className="bg-indigo-600 p-6 rounded-2xl shadow-2xl shadow-indigo-900/40 text-center cursor-pointer group hover:scale-[1.02] transition-all active:scale-95"
                        >
                            <h4 className="font-bold flex items-center justify-center gap-3">
                                <Play size={20} fill="white" />
                                Start Stress Test
                            </h4>
                        </div>
                    </section>

                    {/* Results / Visualizer */}
                    <section className="lg:col-span-8 flex flex-col gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="glass p-8 border-white/5 flex flex-col items-center justify-center text-center gap-6">
                                <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest self-start">Real-Time Risk Score</h3>
                                <motion.div
                                    key={riskScore}
                                    initial={{ scale: 0.8 }}
                                    animate={{ scale: 1 }}
                                    className={`text-8xl font-black font-['Outfit'] ${riskLevel === 'High' ? 'text-red-500' : riskLevel === 'Medium' ? 'text-yellow-500' : 'text-green-500'
                                        }`}
                                >
                                    {riskScore}
                                </motion.div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${riskLevel === 'High' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                                    riskLevel === 'Medium' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' :
                                        'bg-green-500/10 border-green-500/30 text-green-400'
                                    }`}>
                                    {riskLevel} Risk State
                                </div>
                            </div>

                            <div className="glass p-8 border-white/5 flex flex-col justify-between">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">Risk History Trend</h3>
                                    <Activity size={16} className="text-indigo-400" />
                                </div>
                                <div className="bar-graph-container">
                                    {history.map((val, i) => (
                                        <div
                                            key={i}
                                            className="bar-graph-item"
                                            style={{ height: `${val}%`, backgroundColor: val > 75 ? '#ef444450' : val > 40 ? '#eab30850' : '#22c55e50' }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="glass p-8 border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="relative z-10 flex gap-6 items-center">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                                    <ShieldAlert className={riskLevel === 'High' ? 'text-red-400 animate-pulse' : 'text-slate-400'} size={32} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold font-['Outfit'] mb-2">Automated Response Decision</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        {riskLevel === 'High' ? 'Brain suggests immediate evacuation protocol. All shelter routes have been optimized for high throughput.' :
                                            riskLevel === 'Medium' ? 'System in advisory mode. Continuous monitoring active. Ready to deploy secondary response agents.' :
                                                'All systems nominal. Normal data ingestion cycles active.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};


export default DemoPage;
