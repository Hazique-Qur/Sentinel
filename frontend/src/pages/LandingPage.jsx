import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Activity, Globe, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';

const FeatureCard = ({ icon, title, description, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: index * 0.2 }}
        className="glass p-10 border-white/5 hover:border-blue-500/30 transition-all group hover:-translate-y-4 shadow-2xl relative overflow-hidden"
    >
        <div className="absolute inset-0 shimmer-bg opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="bg-white/5 w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10 border border-white/10 shadow-lg">
            {icon}
        </div>
        <h3 className="text-2xl font-bold font-['Outfit'] mb-4 relative z-10 tracking-tight">{title}</h3>
        <p className="text-slate-400 text-sm leading-relaxed relative z-10 font-['Inter']">{description}</p>
    </motion.div>
);

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden flex flex-col items-center">

            {/* Animated Hero Background */}
            <div className="absolute inset-0 z-0 wave-bg border-b border-white/5 opacity-50">
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]"></div>

                {/* Floating Particles/Elements - Reduced blurs for performance */}
                <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] animate-pulse [animation-delay:2s]"></div>
            </div>

            <main className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center pt-48 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="mb-14 flex justify-center"
                    >
                        <Logo size={120} />
                    </motion.div>

                    <h1 className="sr-only">Sentinel</h1>

                    <p className="text-xl md:text-[1.75rem] text-slate-400 max-w-3xl mx-auto mb-14 leading-relaxed font-['Inter'] font-medium">
                        The world's first <span className="text-blue-400 font-black border-b-2 border-blue-400/30 pb-1">Autonomous Decision Support System</span> powered by real-time satellite intelligence.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link
                            to="/dashboard"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-2xl font-bold text-lg flex items-center gap-4 transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(37,99,235,0.4)] group active:scale-95 shadow-2xl"
                        >
                            Check My Area Risk
                            <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                        </Link>
                        <Link
                            to="/demo"
                            className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white px-10 py-5 rounded-2xl font-bold text-lg transition-all active:scale-95 backdrop-blur-md"
                        >
                            Explore Demo
                        </Link>
                    </div>
                </motion.div>

                {/* Features with Staggered Fade-in */}
                <div className="mt-56 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl px-4">
                    <FeatureCard
                        index={0}
                        icon={<Globe className="text-blue-400" size={32} />}
                        title="Satellite Intelligence"
                        description="Real-time NDVI analysis from Google Earth Engine for hyper-local environmental vulnerability assessment."
                    />
                    <FeatureCard
                        index={1}
                        icon={<ShieldCheck className="text-purple-400" size={32} />}
                        title="Autonomous Brain"
                        description="Advanced multi-agent risk scoring system that triggers humanitarian lockdowns during critical fail-states."
                    />
                    <FeatureCard
                        index={2}
                        icon={<Activity className="text-red-400" size={32} />}
                        title="Response Dispatch"
                        description="Instant geospatial routing to secure shelters and disaster-relief zones with pre-cleared logistics."
                    />
                </div>
            </main>

            <footer className="w-full max-w-7xl mx-auto border-t border-white/5 py-12 px-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-[10px] uppercase tracking-[0.4em] font-black">
                <div>Sentinel Decision Support // v1.2.0-PRO</div>
                <div className="mt-4 md:mt-0 flex gap-8">
                    <span>Precision</span>
                    <span>Reliability</span>
                    <span>Autonomy</span>
                </div>
            </footer>
        </div>
    );
};


export default LandingPage;
