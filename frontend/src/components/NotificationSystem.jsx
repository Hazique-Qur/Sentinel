import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Info, AlertTriangle, ShieldAlert, Check } from 'lucide-react';

const NotificationSystem = ({ alerts = [], unreadCount = 0, onMarkRead, onClearAll }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const getAlertIcon = (level) => {
        if (level >= 4) return <ShieldAlert size={16} className="text-red-500" />;
        if (level === 3) return <AlertTriangle size={16} className="text-orange-500" />;
        return <Info size={16} className="text-yellow-500" />;
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all active:scale-95 group"
            >
                <Bell size={20} className={`text-slate-400 group-hover:text-blue-400 transition-colors ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center border-2 border-slate-950"
                    >
                        <span className="text-[8px] font-bold text-white">{unreadCount}</span>
                    </motion.div>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[450px]"
                    >
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <h3 className="text-xs font-bold font-['Outfit'] uppercase tracking-widest text-slate-300">Alert Center</h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={() => { onClearAll(); setIsOpen(false); }}
                                    className="text-[10px] text-blue-400 hover:text-blue-300 font-bold uppercase tracking-tighter transition-colors"
                                >
                                    Dismiss All
                                </button>
                            )}
                        </div>

                        <div className="overflow-y-auto custom-scrollbar">
                            {alerts.length === 0 ? (
                                <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                                    <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
                                        <Bell className="text-slate-700" size={20} />
                                    </div>
                                    <p className="text-xs text-slate-500 font-medium">No active alerts at this time.</p>
                                    <p className="text-[10px] text-slate-600 mt-1 uppercase tracking-tighter">Situational awareness is stable.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {alerts.map((alert) => (
                                        <div
                                            key={alert.id}
                                            className={`p-4 flex gap-4 hover:bg-white/5 transition-all relative group ${!alert.read ? 'bg-indigo-500/5' : ''}`}
                                        >
                                            <div className="mt-1">{getAlertIcon(alert.new_level)}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                                        {formatTime(alert.timestamp)}
                                                    </span>
                                                    {!alert.read && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onMarkRead(alert.id); }}
                                                            className="opacity-0 group-hover:opacity-100 p-1 bg-white/10 rounded-md hover:bg-blue-500/20 text-blue-400 transition-all"
                                                        >
                                                            <Check size={10} />
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-200 font-semibold leading-relaxed">
                                                    {alert.message}
                                                </p>
                                                <p className="text-[9px] text-slate-500 mt-2 font-mono uppercase tracking-widest">
                                                    COORD: {alert.lat.toFixed(2)}, {alert.lon.toFixed(2)}
                                                </p>
                                            </div>
                                            {!alert.read && (
                                                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 bg-white/5 border-t border-white/10 text-center">
                            <p className="text-[9px] text-slate-600 uppercase font-bold tracking-[0.2em]">Monitoring Active</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationSystem;
