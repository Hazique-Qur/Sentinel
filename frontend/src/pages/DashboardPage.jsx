import React, { useState, useEffect } from 'react';
import { ShieldAlert, MapPin, Wind, Thermometer, Droplets, Activity, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskCard from '../components/RiskCard';
import ActionList from '../components/ActionList';
import ShelterMap from '../components/ShelterMap';
import AlertBanner from '../components/AlertBanner';
import ConfidenceMeter from '../components/ConfidenceMeter';

const TelemetryCard = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
        </div>
        <p className="text-xl font-bold font-['Outfit']">{value}</p>
    </div>
);

const DashboardPage = ({ appState, setAppState, fetchRiskData }) => {
    const [simulatedScore, setSimulatedScore] = useState(0);
    const [riskHistory, setRiskHistory] = useState(new Array(15).fill(0));

    const riskLevel = appState.risk?.level || 'Low';

    useEffect(() => {
        if (appState.risk?.adjusted_score) {
            setRiskHistory(prev => [...prev.slice(1), appState.risk.adjusted_score]);
        }
    }, [appState.risk?.adjusted_score]);

    const handleLocationChange = (e) => {
        const coords = e.target.value.split(',').map(v => parseFloat(v));
        if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
            const newLoc = { lat: coords[0], lon: coords[1] };
            setAppState(prev => ({ ...prev, location: newLoc }));
            fetchRiskData(newLoc.lat, newLoc.lon);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen pt-24 pb-12 transition-all duration-1000 ease-in-out ${riskLevel === 'High' ? 'bg-red-950/20' : riskLevel === 'Medium' ? 'bg-yellow-950/20' : 'bg-slate-950'
                } ${riskLevel === 'High' ? 'alert-high' : riskLevel === 'Medium' ? 'alert-medium' : ''}`}
        >

            {/* Step 4: Drop Banner State */}
            <AnimatePresence>
                {riskLevel === 'High' && <AlertBanner message={appState.priority} />}
            </AnimatePresence>

            <header className="px-6 flex justify-between items-center max-w-7xl mx-auto relative z-10 mb-8">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 px-4 py-2 rounded-2xl">
                        <Activity className="text-blue-400" size={18} />
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Tactical Dashboard</span>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    {/* Simulation Controller */}
                    <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 rounded-xl">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase">Demo Mod</span>
                        <input
                            type="checkbox"
                            checked={appState.simulationMode}
                            onChange={(e) => setAppState(prev => ({ ...prev, simulationMode: e.target.checked }))}
                            className="w-4 h-4 cursor-pointer"
                        />
                    </div>

                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-xl border border-white/10 glass">
                        <MapPin size={18} className="text-blue-400" />
                        <input
                            type="text"
                            defaultValue={`${appState.location.lat}, ${appState.location.lon}`}
                            onBlur={handleLocationChange}
                            disabled={appState.risk?.adjusted_score > 85}
                            className="bg-transparent border-none outline-none text-sm w-40 font-mono disabled:opacity-50"
                            placeholder="Lat, Lon"
                        />
                    </div>
                    <button
                        onClick={() => fetchRiskData(appState.location.lat, appState.location.lon)}
                        disabled={appState.loading || appState.risk?.adjusted_score > 85}
                        className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={appState.loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {appState.simulationMode && (
                <div className="max-w-7xl mx-auto px-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-indigo-600/20 border border-indigo-500/50 p-4 rounded-2xl flex items-center justify-between gap-6"
                    >
                        <div className="flex items-center gap-3">
                            <Activity className="text-indigo-400" size={20} />
                            <span className="text-sm font-bold uppercase tracking-wider">Disaster Simulator</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={simulatedScore}
                            onChange={(e) => setSimulatedScore(parseInt(e.target.value))}
                            className="flex-1 accent-indigo-500 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
                        />
                        <span className="font-mono font-bold w-8">{simulatedScore}</span>
                        <button
                            onClick={() => {
                                const newLevel = simulatedScore > 75 ? 'High' : simulatedScore > 40 ? 'Medium' : 'Low';
                                setAppState(prev => ({
                                    ...prev,
                                    risk: {
                                        ...prev.risk,
                                        adjusted_score: simulatedScore,
                                        level: newLevel,
                                        score: simulatedScore - 10
                                    },
                                    priority: simulatedScore > 85 ? 'CRITICAL EVACUATION ORDERED' :
                                        simulatedScore > 75 ? 'HIGH ALERT - PREPARE FOR EVACUATION' :
                                            simulatedScore > 40 ? 'MONITORING - ADVISORY ACTIVE' : 'NORMAL OPERATIONS'
                                }));
                            }}
                            className="bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/40"
                        >
                            Inject Event
                        </button>
                    </motion.div>
                </div>
            )}

            <main className={`max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 transition-all duration-700 ${appState.risk?.adjusted_score > 85 ? 'scale-[0.98] pointer-events-none' : ''
                }`}>
                {/* Step 5: Emergency Lock Overlays */}
                {appState.risk?.adjusted_score > 85 && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-12 pointer-events-auto">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-red-600/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center max-w-lg border-2 border-white/20 animate-pulse"
                        >
                            <ShieldAlert size={64} className="mx-auto mb-6" />
                            <h2 className="text-3xl font-['Outfit'] font-bold mb-4 uppercase tracking-tighter">Emergency Protocol Locked</h2>
                            <p className="mb-6 opacity-90 leading-relaxed font-['Inter']">Risk levels exceed safe operational threshold. System has prioritized evacuation routes and shelter navigation. Internal navigation is disabled.</p>
                            <div className="flex gap-4 justify-center">
                                <button onClick={() => setAppState(prev => ({ ...prev, risk: { ...prev.risk, adjusted_score: 50, level: 'Medium' } }))} className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-2xl">Override System</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                <section className="lg:col-span-4 flex flex-col gap-6">
                    <motion.div
                        key={appState.risk?.adjusted_score}
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <RiskCard
                            score={appState.risk?.adjusted_score || 0}
                            level={riskLevel}
                            primaryThreat={appState.primaryThreat}
                            loading={appState.loading}
                        />
                    </motion.div>

                    <ConfidenceMeter value={appState.risk?.confidence || 0} />

                    <div className="glass p-6 group border-white/5">
                        <h3 className="text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-4 group-hover:text-blue-400 transition-colors font-bold">Telemetry Analysis</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <TelemetryCard
                                icon={<Thermometer className="text-orange-400" size={16} />}
                                label="Ambient Temp"
                                value={`${appState.risk?.score ? (appState.risk.score + 15) : 0}°C`}
                            />
                            <TelemetryCard
                                icon={<Droplets className="text-blue-400" size={16} />}
                                label="Humidity"
                                value={`${appState.metadata?.humidity || 65}%`}
                            />
                        </div>
                    </div>

                    <div className="glass p-6 border-white/5">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">Risk History</h3>
                            <div className="flex gap-1">
                                {riskHistory.slice(-5).map((v, i) => (
                                    <div key={i} className={`w-1 h-3 rounded-full ${v > 75 ? 'bg-red-500' : v > 40 ? 'bg-yellow-500' : 'bg-green-500'} opacity-${(i + 1) * 20}`} />
                                ))}
                            </div>
                        </div>
                        <div className="bar-graph-container !h-20">
                            {riskHistory.map((val, i) => (
                                <div
                                    key={i}
                                    className="bar-graph-item"
                                    style={{
                                        height: `${val}%`,
                                        backgroundColor: val > 75 ? '#ef444450' : val > 40 ? '#eab30850' : '#22c55e50',
                                        opacity: 0.3 + (i / riskHistory.length) * 0.7
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-8 flex flex-col gap-6">
                    <div className="glass overflow-hidden border-white/5 shadow-2xl">
                        <div className="p-4 flex justify-between items-center border-b border-white/5 bg-white/5">
                            <h3 className="text-md font-['Outfit'] font-semibold flex items-center gap-3">
                                <div className="p-1.5 bg-green-500/20 rounded-lg">
                                    <Activity size={18} className="text-green-500" />
                                </div>
                                Nearest Safe Harbors
                            </h3>
                            <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">LIVE // GEOSPATIAL ENGINE</span>
                        </div>
                        <ShelterMap
                            shelters={appState.shelters}
                            center={[appState.location.lat, appState.location.lon]}
                            risk={riskLevel}
                            score={appState.risk?.adjusted_score || 0}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ActionList actions={appState.actions} level={riskLevel} />
                        <div className="glass p-6 flex flex-col justify-center items-center text-center gap-6 group border-white/5">
                            <div className={`p-6 rounded-3xl transition-all duration-500 shadow-2xl ${riskLevel === 'High' ? 'bg-red-500/20 text-red-500 shadow-red-900/20' : 'bg-blue-500/10 text-blue-500 shadow-blue-900/20'
                                }`}>
                                <Activity className={riskLevel === 'High' ? 'animate-bounce' : ''} size={48} />
                            </div>
                            <div>
                                <h4 className="text-xl font-['Outfit'] font-bold mb-2 tracking-tight">{appState.priority || 'Normal Priority'}</h4>
                                <p className="text-slate-400 text-xs leading-relaxed px-4 font-['Inter']">
                                    Autonomous monitoring is active. All emergency protocols are currently {riskLevel === 'High' ? 'DEPLOYED' : 'STANDBY'}.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Error UX */}
            <AnimatePresence>
                {appState.error && (
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="fixed bottom-6 right-6 bg-slate-900 border border-red-500/50 p-6 rounded-2xl shadow-2xl flex items-center gap-4 z-[100] glass backdrop-blur-3xl"
                    >
                        <div className="bg-red-500/20 p-2 rounded-lg text-red-500">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-100">Sync Failure</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{appState.error}</p>
                        </div>
                        <button
                            onClick={() => fetchRiskData(appState.location.lat, appState.location.lon)}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors ml-4 active:scale-95"
                        >
                            Reconnect
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// No explicit 'Antigravity' text found in previous view, but ensuring generic names aren't missed.
export default DashboardPage;
