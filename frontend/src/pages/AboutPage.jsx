import Logo from '../components/Logo';

const PipelineBar = ({ label, progress, color, delay = '0s' }) => (
    <div className="space-y-1.5">
        <div className="flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
            <span className="text-[10px] font-mono text-slate-600">{progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeOut", delay: parseFloat(delay) }}
                className={`h-full ${color}`}
            >
                <div className="w-full h-full shimmer-bg opacity-30"></div>
            </motion.div>
        </div>
    </div>
);

const SourceItem = ({ icon, title, desc }) => (
    <div className="group flex gap-6 p-6 rounded-3xl hover:bg-white/5 transition-all border border-transparent hover:border-white/5">
        <div className="bg-white/5 p-4 rounded-2xl group-hover:scale-110 transition-transform h-fit">
            {icon}
        </div>
        <div>
            <h4 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{title}</h4>
            <p className="text-sm text-slate-500 leading-relaxed font-['Inter']">{desc}</p>
        </div>
    </div>
);

const TechBadge = ({ icon, label, sub }) => (
    <div className="glass p-6 border-white/5 text-center flex flex-col items-center group hover:border-blue-500/30 transition-all hover:-translate-y-2">
        <div className="text-slate-400 mb-4 group-hover:text-blue-400 transition-colors group-hover:scale-110">
            {icon}
        </div>
        <h5 className="font-bold text-sm mb-1">{label}</h5>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest">{sub}</p>
    </div>
);

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pt-32 pb-20 px-6">
            <main className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="mb-32 text-center"
                >
                    <div className="mb-12 flex justify-center">
                        <Logo size={80} />
                    </div>
                    <h2 className="text-5xl md:text-7xl font-['Outfit'] font-black mb-8 tracking-tighter">Engineered for Reliability</h2>
                    <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-['Inter'] font-medium">
                        Sentinel is not just a dashboard—it's a <span className="text-white font-bold">Multi-Agent Decision Support System</span> designed to minimize human error during natural disaster fail-states.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-24 mb-32">
                    <motion.section
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-blue-600/20 p-4 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-500/10">
                                <Database className="text-blue-400" size={28} />
                            </div>
                            <h3 className="text-3xl font-['Outfit'] font-bold">Data Sources</h3>
                        </div>
                        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
                            Our architecture pulls from diverse high-fidelity feeds to ensure zero single-point-of-failure in our intelligence pipeline.
                        </p>

                        <div className="space-y-6">
                            <SourceItem
                                icon={<Zap size={18} className="text-yellow-400" />}
                                title="OpenWeatherMap One Call"
                                desc="Live atmospheric telemetry (Temp, Wind, Hum) synced every 5 mins."
                            />
                            <SourceItem
                                icon={<Globe size={18} className="text-green-400" />}
                                title="Satellite NDVI"
                                desc="Vegetation and soil moisture analysis via Google Earth Engine API."
                            />
                            <SourceItem
                                icon={<Server size={18} className="text-blue-400" />}
                                title="Humanitarian Registry"
                                desc="Geospatial registry for shelter status, capacity, and current stocks."
                            />
                        </div>
                    </motion.section>

                    <motion.section
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="bg-purple-600/20 p-4 rounded-3xl border border-purple-500/30 shadow-2xl shadow-purple-500/10">
                                <ShieldCheck className="text-purple-400" size={28} />
                            </div>
                            <h3 className="text-3xl font-['Outfit'] font-bold">AI Risk Engine</h3>
                        </div>
                        <p className="text-slate-400 mb-10 leading-relaxed text-lg">
                            The "Brain" core analyzes incoming telemetry against a proprietary vulnerability matrix to generate real-time risk adjusting.
                        </p>

                        <div className="glass p-8 border-white/5 bg-gradient-to-br from-white/5 to-transparent relative overflow-hidden group">
                            <div className="absolute inset-0 bg-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="flex justify-between items-center mb-6 relative z-10">
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Pipeline Pulse</span>
                                <span className="text-[10px] font-mono text-purple-400 font-bold px-2 py-0.5 bg-purple-500/10 rounded border border-purple-500/20">AGENT_OK</span>
                            </div>
                            <div className="space-y-4 relative z-10">
                                <PipelineBar label="Ingestion" progress={92} color="bg-blue-500" />
                                <PipelineBar label="Inference" progress={78} color="bg-purple-500" delay="0.2s" />
                                <PipelineBar label="Dispatch" progress={64} color="bg-red-500" delay="0.4s" />
                            </div>
                        </div>
                    </motion.section>
                </div>

                <motion.section
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="pt-20 border-t border-white/5"
                >
                    <div className="text-center mb-16">
                        <h3 className="text-3xl font-['Outfit'] font-bold mb-4">Core Technology Stack</h3>
                        <p className="text-slate-500 text-sm">A multi-lingual architecture built for speed and geospatial accuracy.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        <TechBadge icon={<Terminal size={20} />} label="Python" sub="Backend Core" />
                        <TechBadge icon={<Server size={20} />} label="FastAPI" sub="Intelligence API" />
                        <TechBadge icon={<Code size={20} />} label="React/Vite" sub="UI Framework" />
                        <TechBadge icon={<Globe size={20} />} label="Leaflet" sub="Geospatial" />
                        <TechBadge icon={<Layers size={20} />} label="Tailwind" sub="Design System" />
                        <TechBadge icon={<Activity size={20} />} label="Framer" sub="Motion Engine" />
                    </div>
                </motion.section>
            </main>
        </div>
    );
};


export default AboutPage;
