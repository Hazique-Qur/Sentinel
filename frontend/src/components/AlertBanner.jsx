import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const AlertBanner = ({ message }) => {
    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="bg-red-600 text-white p-4 flex items-center justify-center gap-4 sticky top-0 z-50 shadow-2xl overflow-hidden"
        >
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
            >
                <AlertTriangle size={24} />
            </motion.div>
            <span className="font-['Outfit'] font-bold tracking-wider text-lg uppercase">{message || 'URGENT: HIGH DISASTER RISK DETECTED'}</span>
            <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse"></div>
        </motion.div>
    );
};

export default AlertBanner;
