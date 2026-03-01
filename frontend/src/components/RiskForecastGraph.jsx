import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Clock, Info, AlertCircle } from 'lucide-react';

const RiskForecastGraph = ({ forecast, currentRisk }) => {
    if (!forecast || forecast.length === 0) return null;

    // Chart dimensions
    const width = 400;
    const height = 160;
    const padding = 20;

    // Process points for SVG
    const points = useMemo(() => {
        // Include current point as starting point
        const allData = [{ hour: 0, risk: currentRisk }, ...forecast];

        return allData.map((d, i) => {
            const x = padding + (i * ((width - 2 * padding) / (allData.length - 1)));
            const y = height - padding - (d.risk * ((height - 2 * padding) / 100));
            return { x, y, risk: d.risk, hour: d.hour };
        });
    }, [forecast, currentRisk]);

    const linePath = useMemo(() => {
        if (points.length < 2) return "";
        return points.reduce((acc, p, i) =>
            i === 0 ? `M ${p.x},${p.y}` : `${acc} L ${p.x},${p.y}`, "");
    }, [points]);

    const areaPath = useMemo(() => {
        if (points.length < 2) return "";
        const last = points[points.length - 1];
        const first = points[0];
        return `${linePath} L ${last.x},${height - padding} L ${first.x},${height - padding} Z`;
    }, [points, linePath]);

    const uncertaintyBand = useMemo(() => {
        if (points.length < 2) return "";
        // Create a widening band to represent growing uncertainty in the future
        const upper = points.map((p, i) => {
            const spread = i * 4; // Spreads as time increases
            return `${p.x},${Math.max(padding, p.y - spread)}`;
        });
        const lower = [...points].reverse().map((p, i) => {
            const idx = points.length - 1 - i;
            const spread = idx * 4;
            return `${p.x},${Math.min(height - padding, p.y + spread)}`;
        });
        return `M ${upper.join(" L ")} L ${lower.join(" L ")} Z`;
    }, [points]);

    return (
        <div className="glass p-5 border-white/5 space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                        <TrendingUp size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Predictive Horizon (24h)</span>
                </div>
                <div className="group relative">
                    <Info size={12} className="text-slate-600 cursor-help" />
                    <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-900 border border-white/10 rounded-lg text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                        Kinematic projection based on environmental momentum and trend velocity.
                    </div>
                </div>
            </div>

            <div className="relative h-[160px] w-full">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Grid lines */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                    {/* Uncertainty Band */}
                    <path d={uncertaintyBand} fill="rgba(59, 130, 246, 0.05)" />

                    {/* Gradient for area */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area */}
                    <path d={areaPath} fill="url(#areaGradient)" />

                    {/* Line */}
                    <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        d={linePath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />

                    {/* Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <motion.circle
                                initial={{ r: 0 }}
                                animate={{ r: i === 0 ? 4 : 2 }}
                                cx={p.x}
                                cy={p.y}
                                fill={i === 0 ? "#3b82f6" : "rgba(255,255,255,0.4)"}
                                className={i === 0 ? "shadow-lg" : ""}
                            />
                            {i % 2 === 0 && (
                                <text
                                    x={p.x}
                                    y={height - 5}
                                    textAnchor="middle"
                                    className="text-[8px] fill-slate-500 font-mono"
                                >
                                    {p.hour === 0 ? 'Now' : `+${p.hour}h`}
                                </text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>

            <div className="grid grid-cols-4 gap-2">
                {forecast.map((f, i) => (
                    <div key={i} className="bg-white/5 p-2 rounded-lg border border-white/5 text-center">
                        <div className="text-[8px] uppercase font-bold text-slate-500 mb-1">{f.hour}H</div>
                        <div className={`text-xs font-bold ${f.risk > 75 ? 'text-red-400' : f.risk > 50 ? 'text-orange-400' : 'text-white'}`}>
                            {Math.round(f.risk)}%
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RiskForecastGraph;
