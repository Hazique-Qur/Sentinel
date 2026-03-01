import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

const TIER_CONFIG = {
    1: { icon: <Info className="text-green-400" size={20} />, dotColor: 'bg-green-500', pillBg: 'bg-green-500/10 border-green-500/30 text-green-400' },
    2: { icon: <AlertTriangle className="text-yellow-400" size={20} />, dotColor: 'bg-yellow-500', pillBg: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' },
    3: { icon: <AlertOctagon className="text-orange-400" size={20} />, dotColor: 'bg-orange-500', pillBg: 'bg-orange-500/10 border-orange-500/30 text-orange-400' },
    4: { icon: <ShieldAlert className="text-red-400" size={20} />, dotColor: 'bg-red-500', pillBg: 'bg-red-500/10 border-red-500/30 text-red-400' },
};

const ActionList = ({ actions, alertTier }) => {
    const level = alertTier?.level ?? 1;
    const config = TIER_CONFIG[level] || TIER_CONFIG[1];

    return (
        <div className="glass p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {config.icon}
                <h3 className="text-lg font-semibold font-['Outfit']">Safety Recommendations</h3>
            </div>

            {/* Recommended Action Level pill */}
            {alertTier?.recommended_action_level && (
                <div className={`inline-flex items-center self-start rounded-lg border px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${config.pillBg}`}>
                    {alertTier.recommended_action_level}
                </div>
            )}

            <div className="flex flex-col gap-3">
                {actions && actions.length > 0 ? (
                    actions.map((action, index) => (
                        <div key={index} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} mt-2 shrink-0`}></div>
                            <p className="text-sm text-slate-300 leading-relaxed">{action}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 italic text-sm">Waiting for risk data to generate actions...</p>
                )}
            </div>
        </div>
    );
};

export default ActionList;
