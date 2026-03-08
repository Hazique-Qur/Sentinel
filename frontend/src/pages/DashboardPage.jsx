import React, { useState, useEffect } from 'react';
import { MapPin, Activity, RefreshCw, AlertTriangle, ShieldCheck, Database, Globe, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskCard from '../components/RiskCard';
import ActionList from '../components/ActionList';
import ShelterMap from '../components/ShelterMap';
import AlertBanner from '../components/AlertBanner';
import AlertTierBadge from '../components/AlertTierBadge';
import RiskFactors from '../components/RiskFactors';
import Logo from '../components/Logo';
import PredictiveTimeline from '../components/PredictiveTimeline';
import DecisionEngine from '../components/DecisionEngine';

const DashboardPage = ({ appState, setAppState, fetchRiskData }) => {
    const [forecast, setForecast] = useState([]);
    const [scrubbedRisk, setScrubbedRisk] = useState(null);

    const riskLevel = scrubbedRisk?.level || appState.risk?.level || 'Low';
    const alertTier = scrubbedRisk?.alert_tier || appState.risk?.alert_tier;
    const riskFactors = appState.risk?.risk_factors;
    const dataSources = appState.risk?.data_sources || ["Satellite Data Engine", "Meteorological Feed", "Historical DB"];

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const url = `${import.meta.env.VITE_API_URL || ''}/api/predictive-forecast?lat=${appState.location.lat}&lon=${appState.location.lon}`;
                const res = await fetch(url);
                const data = await res.json();
                if (data.status === 'success') {
                    setForecast(data.forecast);
                }
            } catch (err) {
                console.error("Forecast fetch failed:", err);
            }
        };
        if (appState.location.lat) fetchForecast();
    }, [appState.location]);

    const handleScrub = (point) => {
        setScrubbedRisk({
            level: point.tier >= 4 ? 'High' : point.tier === 3 ? 'Medium' : 'Low',
            alert_tier: { level: point.tier, label: point.tier >= 4 ? 'Emergency' : point.tier === 3 ? 'Warning' : 'Advisory', color: point.tier >= 4 ? 'red' : point.tier === 3 ? 'amber' : 'emerald' },
            adjusted_score: point.score
        });
    };

    const loading = !appState.risk;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen pt-24 pb-12 transition-all duration-1000 ease-in-out ${riskLevel === 'High' ? 'bg-red-950/10' :
                riskLevel === 'Medium' ? 'bg-amber-950/10' : 'bg-slate-950'
                } relative overflow-hidden`}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] ${riskLevel === 'High' ? 'bg-red-600/20' : 'bg-emerald-600/20'} blur-[120px] rounded-full`} />
            </div>

            <AnimatePresence>
                {riskLevel === 'High' && <AlertBanner message={appState.priority} />}
            </AnimatePresence>

            <main className="px-6 max-w-[1600px] mx-auto relative z-10">
                {/* Header / Top Info */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/5 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <Logo size={24} hideText />
                            <div className="h-4 w-[1px] bg-white/10 mx-1" />
                            <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-lg">
                                <Activity className="text-blue-400" size={12} />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Tactical Intelligence v2.1</span>
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold font-['Outfit'] text-white">Regional Risk Dashboard</h1>
                        <p className="text-slate-400 text-sm max-w-xl">
                            Real-time synchronization with global meteorological clusters and Google Earth Engine telemetry.
                        </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                        <div className="flex items-center gap-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                            {dataSources.map((source, i) => (
                                <div key={i} className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                    {source}
                                </div>
                            ))}
                        </div>
                        <div className="flex items-center gap-4">
                            <AlertTierBadge tier={alertTier} />
                            <button
                                onClick={() => fetchRiskData(appState.location.lat, appState.location.lon)}
                                className="group flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all active:scale-95"
                            >
                                <RefreshCw size={14} className="text-slate-400 group-hover:text-white group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-xs font-bold text-slate-300">Sync Data</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid — Rebalanced for high-density situational awareness */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

                    {/* Left Column: Tactical Metrics & Decision Protocols (xl:col-span-3) */}
                    <div className="xl:col-span-3 space-y-6">
                        <RiskCard
                            score={scrubbedRisk?.adjusted_score || appState.risk?.adjusted_score || 0}
                            level={riskLevel}
                            primaryThreat={appState.primary_threat}
                            confidence={appState.risk?.confidence || 0.8}
                            alertTier={alertTier}
                            loading={loading}
                        />

                        <DecisionEngine
                            tier={alertTier?.level || 1}
                            threats={appState.risk?.threat_vectors || [appState.primary_threat]}
                        />

                        <RiskFactors factors={riskFactors} />

                        {/* Data Integrity / Warning */}
                        {appState.risk?.confidence < 0.6 && (
                            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex gap-3">
                                <AlertTriangle className="text-amber-500 shrink-0" size={18} />
                                <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium uppercase tracking-tight">
                                    Signal degradation detected. Confidence below federal thresholds.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Visual Intelligence & Timeline (xl:col-span-9) */}
                    <div className="xl:col-span-9 space-y-6">
                        <div className="glass p-2 border-white/5 h-[660px] relative overflow-hidden">
                            <div className="absolute top-4 left-4 z-[100] flex gap-2">
                                <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                                    <Globe size={11} className="text-blue-400" />
                                    <span className="text-[9px] font-semibold text-white uppercase tracking-wider">Geospatial Overlay</span>
                                </div>
                                <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 flex items-center gap-2">
                                    <MapPin size={11} className="text-red-400" />
                                    <span className="text-[9px] font-semibold text-white uppercase tracking-wider">{appState.location.lat.toFixed(4)}, {appState.location.lon.toFixed(4)}</span>
                                </div>
                            </div>
                            <ShelterMap
                                center={[appState.location.lat, appState.location.lon]}
                                shelters={appState.shelters || []}
                                riskLevels={riskLevel} // Fix prop name inconsistency if needed, but keeping current for safety
                                risk={riskLevel}
                                score={scrubbedRisk?.adjusted_score || appState.risk?.adjusted_score || 0}
                            />
                        </div>

                        <PredictiveTimeline
                            forecast={forecast}
                            onScrub={handleScrub}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Actions moved into Intelligence flow for better balance */}
                            <ActionList
                                actions={appState.actions}
                                riskLevel={riskLevel}
                            />

                            <div className="glass p-6 border-white/5">
                                <div className="flex items-center gap-3 mb-4">
                                    <ShieldCheck className="text-emerald-400" size={18} />
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">System Integrity</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 uppercase tracking-widest font-black">Neural Sync</span>
                                        <span className="text-emerald-400 font-bold">OPTIMAL</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-slate-500 uppercase tracking-widest font-black">Edge Processing</span>
                                        <span className="text-emerald-400 font-bold">ACTIVE</span>
                                    </div>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '100%' }}
                                            className="bg-emerald-500 h-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </motion.div>
    );
};

export default DashboardPage;
