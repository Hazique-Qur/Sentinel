import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, MapPin, Activity, Shield, Layers, Filter, Maximize2, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const GlobalMapPage = () => {
    const [hotspots, setHotspots] = useState([]);
    const [layers, setLayers] = useState([]);
    const [activeLayer, setActiveLayer] = useState('natural');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/global-risk-map`);
                const data = await res.json();
                if (data.status === 'success') {
                    setHotspots(data.hotspots);
                    setLayers(data.spectralLayers);
                }
            } catch (err) {
                console.error("Global intelligence fetch failed:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getRiskColor = (tier) => {
        if (tier >= 4) return '#ef4444'; // Red
        if (tier === 3) return '#f97316'; // Orange
        if (tier === 2) return '#eab308'; // Yellow
        return '#22c55e'; // Green
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-slate-950 pt-24 overflow-hidden relative"
        >
            {/* HUD / Overlays */}
            <div className="absolute top-28 left-8 z-[1000] space-y-4 max-w-sm pointer-events-none">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="glass p-6 border-white/5 pointer-events-auto"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Globe className="text-blue-400" size={18} />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Planetary Command</h2>
                            <p className="text-[10px] text-slate-500 uppercase font-black">Sentinel Global Network</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {hotspots.slice(0, 5).map((hs, i) => (
                            <div key={hs.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${hs.alertLevel >= 4 ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} />
                                    <span className="text-[11px] font-bold text-slate-300">{hs.name}</span>
                                </div>
                                <span className={`text-[10px] font-black ${hs.alertLevel >= 3 ? 'text-red-400' : 'text-slate-500'}`}>
                                    {hs.currentRisk}%
                                </span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Layer Toggle */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="glass p-4 border-white/5 pointer-events-auto"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Layers size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Spectral Layers</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <button
                            onClick={() => setActiveLayer('natural')}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${activeLayer === 'natural' ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                                }`}
                        >
                            Natural Terrain
                        </button>
                        {layers.map(layer => (
                            <button
                                key={layer.id}
                                onClick={() => setActiveLayer(layer.id)}
                                className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${activeLayer === layer.id ? 'bg-indigo-500/20 border-indigo-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'
                                    }`}
                            >
                                {layer.id === 'ndvi' ? 'Vegetation Index' : layer.id === 'thermal' ? 'Thermal Anomaly' : 'Water Index'}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Global Map Container */}
            <div className="h-[calc(100vh-96px)] w-full grayscale-[0.5] contrast-[1.2] brightness-[0.8]">
                <MapContainer
                    center={[20, 0]}
                    zoom={3}
                    className="h-full w-full bg-slate-900"
                    zoomControl={false}
                >
                    <TileLayer
                        url={activeLayer === 'natural'
                            ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            : "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        }
                    />

                    {hotspots.map((hs) => (
                        <CircleMarker
                            key={hs.id}
                            center={[hs.lat, hs.lon]}
                            radius={hs.currentRisk / 5 + 5}
                            pathOptions={{
                                color: getRiskColor(hs.alertLevel),
                                fillColor: getRiskColor(hs.alertLevel),
                                fillOpacity: 0.4,
                                weight: 2
                            }}
                        >
                            <Popup className="tactical-popup">
                                <div className="p-2 min-w-[150px]">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-[10px] font-black text-white uppercase">{hs.name}</span>
                                        <span className={`text-[9px] font-bold px-1 rounded ${hs.alertLevel >= 4 ? 'bg-red-500' : 'bg-blue-500'}`}>
                                            LVL {hs.alertLevel}
                                        </span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-[9px]">
                                            <span className="text-slate-400 uppercase">Aggregated Risk</span>
                                            <span className="text-white font-bold">{hs.currentRisk}%</span>
                                        </div>
                                        <div className="flex justify-between text-[9px]">
                                            <span className="text-slate-400 uppercase">Primary Vector</span>
                                            <span className="text-indigo-400 font-bold italic">{hs.threat_vector}</span>
                                        </div>
                                    </div>
                                </div>
                            </Popup>
                        </CircleMarker>
                    ))}
                </MapContainer>
            </div>

            {/* Critical Alert Bar (Global) */}
            <AnimatePresence>
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-2xl px-6"
                >
                    <div className="glass p-4 border-red-500/20 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center border border-red-500/40">
                                <Activity className="text-red-500 animate-pulse" size={20} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Planetary Alert Stream</h3>
                                <p className="text-[10px] text-slate-500 font-medium">Monitoring 42 active regional clusters...</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold text-slate-400">
                                SATELLITES ACTIVE: 14
                            </div>
                            <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-bold text-slate-400 uppercase">
                                SYNC: 0.4s
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

export default GlobalMapPage;
