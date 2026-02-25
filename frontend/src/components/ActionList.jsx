import React from 'react';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const ActionList = ({ actions, level }) => {
    const getIcon = () => {
        if (level === 'High') return <AlertTriangle className="text-red-500" />;
        if (level === 'Medium') return <Info className="text-yellow-500" />;
        return <CheckCircle2 className="text-green-500" />;
    };

    return (
        <div className="glass p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
                {getIcon()}
                <h3 className="text-lg font-semibold font-['Outfit']">Safety Recommendations</h3>
            </div>

            <div className="flex flex-col gap-3">
                {actions.length > 0 ? (
                    actions.map((action, index) => (
                        <div key={index} className="flex gap-3 items-start bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                            <p className="text-sm text-slate-300">{action}</p>
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
