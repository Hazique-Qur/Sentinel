import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SystemStatusBadge = () => {
    const [status, setStatus] = useState('operational'); // operational, degraded, unavailable

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch('/api/system-status');
                const data = await res.json();
                if (data.status === 'operational') setStatus('operational');
                else setStatus('degraded');
            } catch (e) {
                setStatus('unavailable');
            }
        };
        checkStatus();
        const interval = setInterval(checkStatus, 60000); // Check every minute
        return () => clearInterval(interval);
    }, []);

    const getConfig = () => {
        switch (status) {
            case 'unavailable':
                return { color: 'bg-red-500', label: 'Feeds Unavailable', text: 'text-red-400' };
            case 'degraded':
                return { color: 'bg-amber-500', label: 'Degraded Service', text: 'text-amber-400' };
            default:
                return { color: 'bg-emerald-500', label: 'System Operational', text: 'text-emerald-400' };
        }
    };

    const config = getConfig();

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/5 bg-white/5 backdrop-blur-md">
            <div className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.color} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${config.color}`}></span>
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                {config.label}
            </span>
        </div>
    );
};

export default SystemStatusBadge;
