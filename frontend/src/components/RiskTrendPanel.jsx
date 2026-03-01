import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

// ─── Colour helpers ────────────────────────────────────────────────
const scoreToTierColor = (score) => {
    if (score >= 76) return '#ef4444';  // red
    if (score >= 56) return '#f97316';  // orange
    if (score >= 31) return '#eab308';  // yellow
    return '#22c55e';                   // green
};

const TREND_CONFIG = {
    Rising: {
        icon: <TrendingUp size={16} />,
        textColor: 'text-red-400',
        bgColor: 'bg-red-500/10 border-red-500/20',
        label: 'Risk Increasing',
    },
    Falling: {
        icon: <TrendingDown size={16} />,
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/10 border-green-500/20',
        label: 'Risk Decreasing',
    },
    Stable: {
        icon: <Minus size={16} />,
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/10 border-blue-500/20',
        label: 'Conditions Stable',
    },
};

// ─── Pure SVG mini-line chart ──────────────────────────────────────
const LineChart = ({ snapshots, alertTier }) => {
    const W = 640, H = 100, PAD = 12;

    if (!snapshots || snapshots.length < 2) {
        return (
            <div className="flex items-center justify-center h-24 text-slate-600 text-xs italic">
                Collecting data — chart available after 2+ readings
            </div>
        );
    }

    const scores = snapshots.map(s => s.riskScore);
    const minV = Math.max(0, Math.min(...scores) - 5);
    const maxV = Math.min(100, Math.max(...scores) + 5);
    const range = maxV - minV || 1;

    const pts = scores.map((v, i) => {
        const x = PAD + (i / (scores.length - 1)) * (W - PAD * 2);
        const y = H - PAD - ((v - minV) / range) * (H - PAD * 2);
        return [x, y];
    });

    const polyline = pts.map(p => p.join(',')).join(' ');

    // Area fill: same points + bottom-right + bottom-left
    const areaPoints = [
        ...pts,
        [pts[pts.length - 1][0], H - PAD],
        [pts[0][0], H - PAD]
    ].map(p => p.join(',')).join(' ');

    // Current point (last)
    const [cx, cy] = pts[pts.length - 1];
    const currentColor = scoreToTierColor(scores[scores.length - 1]);

    // Horizontal guide lines
    const guides = [25, 50, 75].map(pct => {
        const gy = H - PAD - ((pct - minV) / range) * (H - PAD * 2);
        return gy > PAD && gy < H - PAD ? { pct, y: gy } : null;
    }).filter(Boolean);

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24" preserveAspectRatio="none">
                <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={currentColor} stopOpacity="0.25" />
                        <stop offset="100%" stopColor={currentColor} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* Guide lines */}
                {guides.map(g => (
                    <line key={g.pct} x1={PAD} y1={g.y} x2={W - PAD} y2={g.y}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
                ))}

                {/* Area fill */}
                <motion.polygon
                    points={areaPoints}
                    fill="url(#areaGrad)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                />

                {/* Line */}
                <motion.polyline
                    points={polyline}
                    fill="none"
                    stroke={currentColor}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    style={{ pathLength: 1 }}
                />

                {/* Data dots (sparse — every nth) */}
                {pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 8)) === 0).map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="3"
                        fill={scoreToTierColor(scores[i * Math.max(1, Math.floor(pts.length / 8))])}
                        fillOpacity="0.8" />
                ))}

                {/* Current point — pulsing */}
                <motion.circle
                    cx={cx} cy={cy} r="5"
                    fill={currentColor}
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="2"
                    animate={{ r: [5, 7, 5] }}
                    transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
                />
            </svg>
        </div>
    );
};

// ─── Time label formatter ──────────────────────────────────────────
const fmtTime = (iso) => {
    try {
        const d = new Date(iso);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
};

// ─── Main Panel ────────────────────────────────────────────────────
/**
 * RiskTrendPanel — Historical risk line chart + trend indicator.
 * Props:
 *   snapshots   — array from _location_history (chronological, oldest first)
 *   trend       — "Rising" | "Falling" | "Stable"
 *   trendPct    — numeric % change
 *   alertTier   — { level, label, color, hex }
 *   loading     — bool
 */
const RiskTrendPanel = ({ snapshots = [], trend = 'Stable', trendPct = 0, alertTier, loading }) => {
    const cfg = TREND_CONFIG[trend] || TREND_CONFIG.Stable;
    const isUrgent = trend === 'Rising' && (alertTier?.level ?? 1) >= 3;
    const isFalling = trend === 'Falling';

    const oldest = snapshots[0]?.timestamp;
    const newest = snapshots[snapshots.length - 1]?.timestamp;
    const spanLabel = snapshots.length > 1
        ? `${snapshots.length} readings · ${fmtTime(oldest)} → ${fmtTime(newest)}`
        : 'Awaiting data';

    return (
        <motion.div
            animate={isUrgent
                ? { boxShadow: ['0 0 0px transparent', '0 0 30px rgba(249,115,22,0.25)', '0 0 0px transparent'] }
                : isFalling
                    ? { boxShadow: ['0 0 0px transparent', '0 0 20px rgba(34,197,94,0.10)', '0 0 0px transparent'] }
                    : {}}
            transition={isUrgent || isFalling ? { repeat: Infinity, duration: 3 } : {}}
            className="glass p-6 flex flex-col gap-4 border-white/5"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                        <Activity size={16} className="text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold font-['Outfit'] uppercase tracking-widest">Risk Trend</h3>
                        <p className="text-[9px] text-slate-600 font-mono uppercase tracking-wide">{spanLabel}</p>
                    </div>
                </div>

                {/* Trend badge */}
                <motion.div
                    animate={isUrgent ? { scale: [1, 1.05, 1] } : {}}
                    transition={isUrgent ? { repeat: Infinity, duration: 1.8 } : {}}
                    className={`flex items-center gap-2 border rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-widest ${cfg.textColor} ${cfg.bgColor}`}
                >
                    {cfg.icon}
                    <span>{cfg.label}</span>
                    {trendPct > 0 && (
                        <span className="font-mono opacity-70">
                            {trend === 'Falling' ? '-' : '+'}{trendPct.toFixed(1)}%
                        </span>
                    )}
                </motion.div>
            </div>

            {/* Chart */}
            {loading ? (
                <div className="h-24 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <LineChart snapshots={snapshots} alertTier={alertTier} />
            )}

            {/* Score axis labels */}
            {snapshots.length >= 2 && (
                <div className="flex justify-between text-[9px] text-slate-600 font-mono -mt-2">
                    <span>{fmtTime(oldest)}</span>
                    <span className="text-center text-slate-700">Risk Score (0 – 100)</span>
                    <span>{fmtTime(newest)}</span>
                </div>
            )}

            {/* Alert level transition history (last 5) */}
            {snapshots.length >= 3 && (
                <div className="flex gap-1.5 flex-wrap mt-1">
                    {snapshots.slice(-8).map((s, i) => {
                        const col = s.color === 'red' ? 'bg-red-500' : s.color === 'orange' ? 'bg-orange-500' : s.color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500';
                        return (
                            <div key={i} title={`${s.alertLabel} — Score ${s.riskScore}`}
                                className={`h-2 rounded-full transition-all ${col}`}
                                style={{ width: `${Math.max(8, (s.riskScore / 100) * 40)}px`, opacity: 0.4 + (i / 8) * 0.6 }}
                            />
                        );
                    })}
                    <span className="text-[9px] text-slate-600 font-mono ml-1 self-center">Alert level history</span>
                </div>
            )}
        </motion.div>
    );
};

export default RiskTrendPanel;
