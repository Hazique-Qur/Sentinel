import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Zap, Shield, Globe, Users, Headphones, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const plans = [
    {
        id: 'free',
        name: 'Community',
        price: 0,
        period: 'forever',
        badge: null,
        color: 'border-white/10',
        glow: '',
        description: 'For individuals who want basic disaster awareness.',
        features: [
            'Live weather risk analysis',
            'Basic shelter map (5 locations)',
            '1 saved location',
            'Standard refresh (15 min)',
            'Community support',
        ],
        cta: 'Get Started Free',
        ctaStyle: 'bg-white/10 hover:bg-white/20 text-white',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 9,
        period: 'month',
        badge: 'Most Popular',
        color: 'border-blue-500/50',
        glow: 'shadow-2xl shadow-blue-900/30',
        description: 'For responders, families, and professionals who need real-time intelligence.',
        features: [
            'Everything in Community',
            'Unlimited shelter routing',
            '10 saved locations',
            'Real-time refresh (5 min)',
            'Confidence & NDVI metrics',
            'SMS/Email alert system',
            'Priority support',
        ],
        cta: 'Start Pro Trial',
        ctaStyle: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40',
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: null,
        period: 'custom',
        badge: null,
        color: 'border-purple-500/30',
        glow: '',
        description: 'For governments, NGOs, and emergency management agencies.',
        features: [
            'Everything in Pro',
            'Multi-region intelligence',
            'Custom AI model tuning',
            'GEE satellite data access',
            'API access & webhooks',
            'SLA-backed uptime 99.9%',
            'Dedicated account manager',
        ],
        cta: 'Contact Sales',
        ctaStyle: 'bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30',
    },
];

const FAQs = [
    { q: 'Can I cancel anytime?', a: 'Yes. Sentinel Pro is billed monthly with no long-term contract. Cancel any time from your account settings.' },
    { q: 'Is my location data private?', a: 'Absolutely. Your coordinates are used only for real-time analysis and are never stored or shared with third parties.' },
    { q: 'Do you offer NGO discounts?', a: 'Yes — qualified non-profit organizations receive 60% off Pro or custom Enterprise pricing. Email us to verify.' },
];

const PricingPage = () => {
    const { user, upgradePlan } = useAuth();
    const navigate = useNavigate();
    const [openFAQ, setOpenFAQ] = useState(null);

    const handleCTA = (plan) => {
        if (plan.id === 'enterprise') {
            window.open('mailto:sales@sentinel.ai?subject=Enterprise Inquiry', '_blank');
            return;
        }
        if (!user) {
            navigate('/login');
            return;
        }
        upgradePlan(plan.id);
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 pt-32 pb-24 px-6 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 mb-6">
                        <Zap size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">Transparent Pricing</span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] mb-6 tracking-tighter">
                        Intelligence for<br />
                        <span className="text-blue-400">Every Scale</span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-['Inter']">
                        From personal safety to national emergency management — Sentinel scales with your mission.
                    </p>
                </motion.div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.15 }}
                            className={`glass p-8 relative ${plan.color} ${plan.glow} flex flex-col ${plan.badge ? 'ring-1 ring-blue-500/30' : ''}`}
                        >
                            {plan.badge && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                                    {plan.badge}
                                </div>
                            )}

                            <div className="mb-6">
                                <h3 className="text-lg font-bold font-['Outfit'] uppercase tracking-wider mb-1">{plan.name}</h3>
                                <p className="text-slate-500 text-xs leading-relaxed mb-6">{plan.description}</p>
                                <div className="flex items-end gap-2">
                                    {plan.price !== null ? (
                                        <>
                                            <span className="text-5xl font-black font-['Outfit']">${plan.price}</span>
                                            <span className="text-slate-500 mb-2 text-sm">/ {plan.period}</span>
                                        </>
                                    ) : (
                                        <span className="text-4xl font-black font-['Outfit'] text-purple-300">Custom</span>
                                    )}
                                </div>
                            </div>

                            <ul className="space-y-3 flex-1 mb-8">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-start gap-3 text-sm text-slate-300">
                                        <Check size={15} className="text-green-400 mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <button
                                onClick={() => handleCTA(plan)}
                                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${plan.ctaStyle}`}
                            >
                                {user?.plan === plan.id ? '✓ Current Plan' : plan.cta}
                            </button>
                        </motion.div>
                    ))}
                </div>

                {/* Trust signals */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24"
                >
                    {[
                        { icon: <Shield size={24} className="text-green-400" />, title: 'SOC 2 Ready', sub: 'Security by design' },
                        { icon: <Globe size={24} className="text-blue-400" />, title: '99.9% Uptime', sub: 'SLA-backed reliability' },
                        { icon: <Users size={24} className="text-purple-400" />, title: '10K+ Users', sub: 'Trusted worldwide' },
                        { icon: <Headphones size={24} className="text-yellow-400" />, title: '24/7 Support', sub: 'Real humans, always' },
                    ].map((t, i) => (
                        <div key={i} className="glass p-6 border-white/5 text-center flex flex-col items-center gap-3">
                            <div className="p-3 bg-white/5 rounded-2xl">{t.icon}</div>
                            <h4 className="font-bold text-sm">{t.title}</h4>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest">{t.sub}</p>
                        </div>
                    ))}
                </motion.div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto"
                >
                    <h3 className="text-3xl font-black font-['Outfit'] text-center mb-10">Common Questions</h3>
                    <div className="space-y-3">
                        {FAQs.map((faq, i) => (
                            <div
                                key={i}
                                className="glass border-white/5 overflow-hidden cursor-pointer"
                                onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                            >
                                <div className="flex justify-between items-center px-6 py-4">
                                    <span className="font-semibold text-sm">{faq.q}</span>
                                    <span className="text-slate-400 text-xl">{openFAQ === i ? '−' : '+'}</span>
                                </div>
                                {openFAQ === i && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        className="px-6 pb-4 text-slate-400 text-sm leading-relaxed"
                                    >
                                        {faq.a}
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PricingPage;
