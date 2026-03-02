import React, { useState, useEffect } from 'react';
import {
    Activity, Shield, MapPin, RefreshCw, AlertTriangle,
    Navigation, Thermometer, Droplets, ShieldAlert,
    LayoutGrid, Maximize2, Scale, Trash2, Plus, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RiskCard from '../components/RiskCard';
import RiskBreakdown from '../components/RiskBreakdown';
import RiskTrendPanel from '../components/RiskTrendPanel';
import ActionList from '../components/ActionList';
import RegionalOverview from '../components/RegionalOverview';
import ShelterMap from '../components/ShelterMap';
import AlertBanner from '../components/AlertBanner';
import RiskForecastGraph from '../components/RiskForecastGraph';
import EscalationWarning from '../components/EscalationWarning';
import ModelPerformance from '../components/ModelPerformance';
import FederatedCommand from '../components/FederatedCommand';
import Logo from '../components/Logo';
import { Brain, Globe } from 'lucide-react';

// Helper: synthesise an alertTier object from a numeric score (0–100)
// Updated for Phase 16: Federated Consensus Tracking
const scoreToAlertTier = (score) => {
    if (score >= 76) return { level: 4, label: 'Emergency', color: 'red', hex: '#ef4444', situation: 'Immediate action required', description: 'Immediate evacuation may be required. Activate all emergency protocols.', recommended_action_level: 'CRITICAL — Emergency Response Active' };
    if (score >= 56) return { level: 3, label: 'Warning', color: 'orange', hex: '#f97316', situation: 'High likelihood of impact', description: 'Significant risk detected. Prepare for immediate action and follow official directives.', recommended_action_level: 'High Preparedness Required' };
    if (score >= 31) return { level: 2, label: 'Watch', color: 'yellow', hex: '#eab308', situation: 'Be prepared', description: 'Conditions developing. Monitor updates closely and review emergency plans.', recommended_action_level: 'Moderate Vigilance — Review Plans' };
    return { level: 1, label: 'Advisory', color: 'green', hex: '#22c55e', situation: 'Monitor conditions', description: 'Low risk conditions. Stay aware of local developments.', recommended_action_level: 'Stay Informed' };
};

const BG_TINTS = {
    1: 'bg-slate-950',
    2: 'bg-yellow-950/10',
    3: 'bg-orange-950/20',
    4: 'bg-red-950/25',
};

const TelemetryCard = ({ icon, label, value }) => (
    <div className="flex flex-col gap-1 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-2">
            {icon}
            <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">{label}</span>
        </div>
        <p className="text-xl font-bold font-['Outfit']">{value}</p>
    </div>
);

const DashboardPage = ({
    appState,
    setAppState,
    fetchRiskData,
    saveLocation,
    deleteLocation,
    fetchFleetStatus,
    onRefreshPerformance,
    onSubmitFeedback,
    onSyncFederation
}) => {
    const [simulatedScore, setSimulatedScore] = useState(0);
    const [riskHistory, setRiskHistory] = useState(new Array(15).fill(0));

    const alertTier = appState.alertTier ?? scoreToAlertTier(appState.risk?.adjusted_score ?? 0);
    const tierLevel = alertTier?.level ?? 1;
    const riskLevel = appState.risk?.level || 'Low';
    const confidenceReason = appState.risk?.confidence_reason ?? '';

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

    const lowConfidence = appState.risk?.confidence != null && appState.risk.confidence < 0.6;
    const isLocked = appState.risk?.adjusted_score > 85;
    const bgTint = BG_TINTS[tierLevel] || BG_TINTS[1];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`min-h-screen pt-24 pb-12 transition-all duration-1000 ease-in-out ${bgTint} relative`}
        >
            {/* Low Confidence Warning */}
            <AnimatePresence>
                {lowConfidence && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 backdrop-blur-md px-5 py-2.5 rounded-2xl shadow-xl"
                    >
                        <AlertTriangle size={14} className="text-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Data Integrity Gap — AI Confidence Below 60% — Results May Be Approximate</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Alert Banner (Level 3 = orange bar, Level 4 = red emergency) */}
            <AnimatePresence>
                {tierLevel >= 3 && (
                    <AlertBanner alertTier={alertTier} message={appState.priority} />
                )}
            </AnimatePresence>

            <header className="px-6 flex justify-between items-center max-w-7xl mx-auto relative z-10 mb-8">
                <div className="flex items-center gap-3">
                    <Logo size={24} hideText />
                    <div className="flex items-center gap-2 bg-blue-600/10 border border-blue-500/30 px-3 py-1.5 rounded-xl">
                        <Activity className="text-blue-400" size={14} />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                            {appState.viewMode === 'fleet' ? 'Fleet Command' :
                                appState.viewMode === 'comparison' ? 'Comparison Engine' :
                                    appState.viewMode === 'federation' ? 'Federation Command' :
                                        'Tactical Dashboard'}
                        </span>
                    </div>
                </div>

                <div className="flex gap-4 items-center">
                    <LocationManager
                        currentLocation={appState.location}
                        onSave={saveLocation}
                        savedLocations={appState.savedLocations}
                        onDelete={deleteLocation}
                    />

                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl">
                        <button
                            onClick={() => setAppState(prev => ({ ...prev, viewMode: 'detail' }))}
                            className={`p-2 rounded-lg transition-all ${appState.viewMode === 'detail' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Detail View"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={() => setAppState(prev => ({ ...prev, viewMode: 'fleet' }))}
                            className={`p-2 rounded-lg transition-all ${appState.viewMode === 'fleet' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Fleet View"
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            onClick={() => setAppState(prev => ({ ...prev, viewMode: 'federation' }))}
                            className={`p-2 rounded-lg transition-all ${appState.viewMode === 'federation' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-white/5'}`}
                            title="Federated Execution Command"
                        >
                            <Globe size={16} />
                        </button>
                        <button
                            onClick={() => setAppState(prev => ({ ...prev, viewMode: 'comparison' }))}
                            className={`p-2 rounded-lg transition-all ${appState.viewMode === 'comparison' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                            title="Comparison View"
                        >
                            <Scale size={16} />
                        </button>
                    </div>
                    {/* Simulation Toggle */}
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
                            disabled={isLocked}
                            className="bg-transparent border-none outline-none text-sm w-40 font-mono disabled:opacity-50"
                            placeholder="Lat, Lon"
                        />
                    </div>
                    <button
                        onClick={() => fetchRiskData(appState.location.lat, appState.location.lon)}
                        disabled={appState.loading || isLocked}
                        className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw size={20} className={appState.loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </header>

            {/* Simulation Controller */}
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
                                const syntheticTier = scoreToAlertTier(simulatedScore);
                                const newLevel = simulatedScore > 75 ? 'High' : simulatedScore > 40 ? 'Medium' : 'Low';
                                const timestamp = new Date().toISOString();

                                // Synthetic regional data for simulation
                                const syntheticRegionRisk = Array.from({ length: 25 }, (_, i) => {
                                    const latOffset = (Math.random() - 0.5) * 0.15;
                                    const lonOffset = (Math.random() - 0.5) * 0.15;
                                    const localScore = Math.min(100, Math.max(0, simulatedScore + (Math.random() - 0.5) * 40));
                                    const localTier = scoreToAlertTier(localScore);
                                    return {
                                        lat: appState.location.lat + latOffset,
                                        lon: appState.location.lon + lonOffset,
                                        riskScore: Math.round(localScore),
                                        alertLevel: localTier.level,
                                        color: localTier.color
                                    };
                                });

                                // Trigger local notification if escalation
                                const prevScore = appState.risk?.adjusted_score || 0;
                                let newAlerts = [...appState.alerts];
                                let newCount = appState.unreadCount;

                                if (simulatedScore > prevScore && syntheticTier.level > (appState.alertTier?.level || 0)) {
                                    const newNotif = {
                                        id: `sim_${Date.now()}`,
                                        lat: appState.location.lat,
                                        lon: appState.location.lon,
                                        prev_level: appState.alertTier?.level || 0,
                                        new_level: syntheticTier.level,
                                        label: syntheticTier.label,
                                        timestamp: new Date().toISOString(),
                                        read: false,
                                        message: `SIMULATION: Alert escalated to Level ${syntheticTier.level}: ${syntheticTier.label}`
                                    };
                                    newAlerts = [newNotif, ...newAlerts];
                                    newCount += 1;
                                }

                                setAppState(prev => ({
                                    ...prev,
                                    alertTier: syntheticTier,
                                    alerts: newAlerts,
                                    unreadCount: newCount,
                                    risk: {
                                        ...prev.risk,
                                        adjusted_score: simulatedScore,
                                        level: newLevel,
                                        score: simulatedScore - 10,
                                        alert_tier: syntheticTier
                                    },
                                    riskHistory: [
                                        ...prev.riskHistory,
                                        {
                                            timestamp,
                                            riskScore: simulatedScore,
                                            alertLevel: syntheticTier.level,
                                            alertLabel: syntheticTier.label,
                                            color: syntheticTier.color
                                        }
                                    ].slice(-48),
                                    trend: {
                                        direction: simulatedScore > (prev.risk?.adjusted_score || 0) ? 'Rising' : 'Falling',
                                        pct: Math.abs(simulatedScore - (prev.risk?.adjusted_score || 0)),
                                        icon: simulatedScore > (prev.risk?.adjusted_score || 0) ? '⬆' : '⬇'
                                    },
                                    regionalData: {
                                        regionRisk: syntheticRegionRisk,
                                        summary: {
                                            avgScore: Math.round(simulatedScore * 0.9),
                                            maxScore: Math.round(simulatedScore * 1.1),
                                            emergencyPercent: simulatedScore > 75 ? 40 : 5,
                                            warningPercent: simulatedScore > 50 ? 30 : 10,
                                            pointCount: 25
                                        }
                                    },
                                    priority: simulatedScore > 85 ? 'CRITICAL EVACUATION ORDERED' :
                                        simulatedScore > 75 ? 'HIGH ALERT — PREPARE FOR EVACUATION' :
                                            simulatedScore > 55 ? 'WARNING — FOLLOW OFFICIAL DIRECTIVES' :
                                                simulatedScore > 30 ? 'WATCH — MONITOR SITUATION CLOSELY' : 'NORMAL OPERATIONS',
                                    viewMode: 'detail',
                                    viewLevel: 'advanced', // research mode enabled
                                    forecast: null,
                                    escalationProb: 0,
                                    performance: null,
                                    latestPredictionId: null
                                }));
                            }}
                            className="bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-900/40"
                        >
                            Inject Event
                        </button>
                    </motion.div>
                </div>
            )}

            <main className={`max-w-7xl mx-auto px-6 relative z-10 transition-all duration-700 ${isLocked && appState.viewMode === 'detail' ? 'scale-[0.98] pointer-events-none' : ''}`}>
                <AnimatePresence mode="wait">
                    {appState.viewMode === 'fleet' ? (
                        <motion.div
                            key="fleet-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-4"
                        >
                            <FleetOverview
                                fleet={appState.fleet}
                                activeLocationId={appState.savedLocations.find(l => l.lat.toFixed(2) === appState.location.lat.toFixed(2) && l.lon.toFixed(2) === appState.location.lon.toFixed(2))?.id}
                                onSelectLocation={(loc) => {
                                    setAppState(prev => ({ ...prev, location: { lat: loc.lat, lon: loc.lon }, viewMode: 'detail' }));
                                    fetchRiskData(loc.lat, loc.lon);
                                }}
                            />
                        </motion.div>
                    ) : appState.viewMode === 'comparison' ? (
                        <motion.div
                            key="comparison-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-4"
                        >
                            <ComparisonView
                                locations={appState.savedLocations}
                                fleet={appState.fleet}
                            />
                        </motion.div>
                    ) : appState.viewMode === 'federation' ? (
                        <motion.div
                            key="federation-view"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="py-4"
                        >
                            <FederatedCommand
                                federation={appState.federation}
                                onSync={onSyncFederation}
                                isSyncing={appState.isSyncing}
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail-view"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                            {/* Emergency Protocol Lock */}
                            {isLocked && (
                                <div className="absolute inset-0 z-50 flex items-center justify-center p-12 pointer-events-auto">
                                    <motion.div
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-red-600/90 backdrop-blur-xl p-8 rounded-3xl shadow-2xl text-center max-w-lg border-2 border-white/20 animate-pulse flex flex-col items-center"
                                    >
                                        <Logo size={64} hideText className="mb-6 text-white" />
                                        <h2 className="text-3xl font-['Outfit'] font-bold mb-4 uppercase tracking-tighter">Emergency Protocol Locked</h2>
                                        <p className="mb-6 opacity-90 leading-relaxed font-['Inter']">Risk levels exceed safe operational threshold. System has prioritized evacuation routes and shelter navigation. Internal navigation is disabled.</p>
                                        <div className="flex gap-4 justify-center">
                                            <button
                                                onClick={() => setAppState(prev => ({
                                                    ...prev,
                                                    risk: { ...prev.risk, adjusted_score: 50, level: 'Medium' },
                                                    alertTier: scoreToAlertTier(50)
                                                }))}
                                                className="bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-100 transition-colors shadow-2xl"
                                            >
                                                Override System
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}

                            {/* Left Column */}
                            <section className="lg:col-span-4 flex flex-col gap-6">
                                <motion.div
                                    key={appState.risk?.adjusted_score}
                                    initial={{ scale: 0.95 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <RiskCard
                                        score={appState.risk?.adjusted_score || 0}
                                        level={appState.risk?.level || 'Low'}
                                        confidence={appState.risk?.confidence || 0}
                                        confidenceReason={appState.risk?.confidenceReason}
                                        latestPredictionId={appState.latestPredictionId}
                                        primaryThreat={appState.primaryThreat}
                                        alertTier={appState.alertTier}
                                    />

                                    {/* Phase 14: Predictive Escalation Warning */}
                                    {appState.viewLevel === 'advanced' && (appState.escalationProb > 0.4 || (appState.risk?.cross_region_alerts && appState.risk.cross_region_alerts.length > 0)) && (
                                        <EscalationWarning
                                            probability={appState.escalationProb}
                                            currentRisk={appState.risk?.adjusted_score || 0}
                                            crossRegionAlerts={appState.risk?.cross_region_alerts || []}
                                        />
                                    )}

                                    <ConfidenceMeter value={appState.risk?.confidence || 0} reason={confidenceReason} />

                                    {/* Phase 15: Model Performance & Evolution Dashboard */}
                                    {appState.viewLevel === 'advanced' && (
                                        <ModelPerformance
                                            performance={appState.performance}
                                            latestPredictionId={appState.latestPredictionId}
                                            onRefresh={onRefreshPerformance}
                                            onSubmitFeedback={onSubmitFeedback}
                                        />
                                    )}
                                </motion.div>

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

                                {/* Risk History */}
                                <div className="glass p-6 border-white/5">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">Risk History</h3>
                                        <div className="flex gap-1">
                                            {riskHistory.slice(-5).map((v, i) => (
                                                <div key={i} className={`w-1 h-3 rounded-full ${v >= 76 ? 'bg-red-500' : v >= 56 ? 'bg-orange-500' : v >= 31 ? 'bg-yellow-500' : 'bg-green-500'} opacity-${(i + 1) * 20}`} />
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
                                                    backgroundColor: val >= 76 ? '#ef444450' : val >= 56 ? '#f9731650' : val >= 31 ? '#eab30850' : '#22c55e50',
                                                    opacity: 0.3 + (i / riskHistory.length) * 0.7
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Right Column */}
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
                                        regionRisk={appState.regionalData?.regionRisk}
                                    />
                                    {/* Phase 14: Predictive Horizon Visualization */}
                                    {appState.viewLevel === 'advanced' && appState.forecast && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 }}
                                        >
                                            <RiskForecastGraph
                                                forecast={appState.forecast}
                                                currentRisk={appState.risk?.adjusted_score || 0}
                                            />
                                        </motion.div>
                                    )}

                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                    <ActionList actions={appState.actions} alertTier={alertTier} />

                                    <RegionalOverview
                                        summary={appState.regionalData?.summary}
                                        loading={appState.regionalLoading}
                                    />

                                    <div className="glass p-6 flex flex-col justify-center items-center text-center gap-6 group border-white/5 order-last xl:order-none">
                                        <div className={`p-6 rounded-3xl transition-all duration-500 shadow-2xl ${tierLevel === 4 ? 'bg-red-500/20 text-red-500 shadow-red-900/20' :
                                            tierLevel === 3 ? 'bg-orange-500/20 text-orange-500 shadow-orange-900/20' :
                                                tierLevel === 2 ? 'bg-yellow-500/20 text-yellow-500 shadow-yellow-900/20' :
                                                    'bg-blue-500/10 text-blue-500 shadow-blue-900/20'
                                            }`}>
                                            <Activity className={tierLevel >= 3 ? 'animate-bounce' : ''} size={48} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-['Outfit'] font-bold mb-2 tracking-tight line-clamp-1">{appState.priority || 'Normal Priority'}</h4>
                                            <p className="text-slate-400 text-xs leading-relaxed px-4 font-['Inter']">
                                                Autonomous monitoring is active. All emergency protocols are currently {tierLevel >= 3 ? 'DEPLOYED' : 'STANDBY'}.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            {/* Error Toast */}
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

export default DashboardPage;
