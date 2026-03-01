import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Siren } from 'lucide-react';

/**
 * AlertBanner — Graduated alert banner driven by alertTier.
 *  Level 3 (Warning): Orange sticky bar
 *  Level 4 (Emergency): Full red banner with pulse
 */
const AlertBanner = ({ alertTier, message }) => {
    const level = alertTier?.level ?? 0;

    if (level < 3) return null;

    const isEmergency = level >= 4;

    return (
        <motion.div
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`sticky top-0 z-50 w-full shadow-2xl overflow-hidden
                ${isEmergency
                    ? 'bg-red-600 text-white'
                    : 'bg-orange-500/90 backdrop-blur-md text-white border-b border-orange-400/50'
                }`}
        >
            {/* Animated background pulse for emergency */}
            {isEmergency && (
                <div className="absolute inset-0 bg-white/10 pointer-events-none animate-pulse" />
            )}

            <div className="relative flex items-center justify-center gap-4 px-6 py-3">
                <motion.div
                    animate={{ scale: [1, 1.25, 1] }}
                    transition={{ repeat: Infinity, duration: isEmergency ? 1 : 2 }}
                >
                    {isEmergency ? <Siren size={22} /> : <AlertTriangle size={20} />}
                </motion.div>

                <div className="flex flex-col items-center gap-0.5">
                    <span className="font-['Outfit'] font-bold tracking-widest text-sm uppercase">
                        {isEmergency
                            ? `🚨 LEVEL 4 EMERGENCY — ${message || 'IMMEDIATE ACTION REQUIRED'}`
                            : `⚠️ LEVEL 3 WARNING — ${message || alertTier?.description || 'HIGH RISK DETECTED'}`
                        }
                    </span>
                    {alertTier?.situation && (
                        <span className={`text-[10px] font-mono uppercase tracking-widest ${isEmergency ? 'text-white/70' : 'text-white/80'}`}>
                            {alertTier.recommended_action_level}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AlertBanner;
