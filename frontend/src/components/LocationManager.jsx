import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Plus, X, Settings, MapPin, AlertCircle, Trash2 } from 'lucide-react';

const LocationManager = ({ currentLocation, onSave, savedLocations = [], onDelete }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [label, setLabel] = useState('');
    const [threshold, setThreshold] = useState(2); // Default: Watch
    const [isOpen, setIsOpen] = useState(false);

    const handleSave = () => {
        if (!label.trim()) return;
        onSave({
            lat: currentLocation.lat,
            lon: currentLocation.lon,
            label: label.trim(),
            threshold: parseInt(threshold)
        });
        setLabel('');
        setIsSaving(false);
    };

    const isAlreadySaved = savedLocations.some(
        loc => loc.lat.toFixed(2) === currentLocation.lat.toFixed(2) &&
            loc.lon.toFixed(2) === currentLocation.lon.toFixed(2)
    );

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl transition-all"
            >
                <Settings size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-200">Management</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-12 w-80 glass border-white/10 shadow-2xl rounded-2xl overflow-hidden z-[110]"
                    >
                        <div className="p-4 border-b border-white/5 flex justify-between items-center">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Location Profiles</h3>
                            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white">
                                <X size={14} />
                            </button>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Save Current Section */}
                            {!isAlreadySaved ? (
                                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3">
                                    <div className="flex items-center gap-2 text-blue-400">
                                        <Plus size={14} />
                                        <span className="text-xs font-bold uppercase tracking-tighter">Add to Fleet</span>
                                    </div>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g. Home, Office)"
                                            value={label}
                                            onChange={(e) => setLabel(e.target.value)}
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50"
                                        />
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-widest">Alert Threshold</span>
                                                <select
                                                    value={threshold}
                                                    onChange={(e) => setThreshold(e.target.value)}
                                                    className="bg-transparent text-[10px] font-bold text-slate-300 outline-none cursor-pointer"
                                                >
                                                    <option value={1} className="bg-slate-900">Level 1: Advisory</option>
                                                    <option value={2} className="bg-slate-900">Level 2: Watch</option>
                                                    <option value={3} className="bg-slate-900">Level 3: Warning</option>
                                                    <option value={4} className="bg-slate-900">Level 4: Emergency</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleSave}
                                                disabled={!label.trim()}
                                                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                                            >
                                                Save Spot
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl flex items-center gap-3">
                                    <Shield size={14} className="text-green-400" />
                                    <span className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Successfully Monitored</span>
                                </div>
                            )}

                            {/* Saved List */}
                            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest block mb-1">Your Fleet</span>
                                {savedLocations.length === 0 ? (
                                    <p className="text-[10px] text-slate-500 italic">No spots saved yet.</p>
                                ) : (
                                    savedLocations.map(loc => (
                                        <div key={loc.id} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors group">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <MapPin size={10} className="text-slate-500 shrink-0" />
                                                <span className="text-[11px] text-slate-300 font-medium truncate">{loc.label}</span>
                                            </div>
                                            <button
                                                onClick={() => onDelete(loc.id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 transition-all p-1"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="p-3 bg-white/5 border-t border-white/5 text-center">
                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-widest leading-none">Multi-User System Active</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LocationManager;
