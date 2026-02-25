import React from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { ShieldAlert, Zap, Globe, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const handleSuccess = async (response) => {
        try {
            await login(response.credential);
            navigate(from, { replace: true });
        } catch (err) {
            // Error is handled in AuthContext or displayed in UI
            console.error('Login flow failed');
        }
    };

    const features = [
        { icon: <Zap size={18} className="text-yellow-400" />, text: 'Real-time risk intelligence' },
        { icon: <Globe size={18} className="text-blue-400" />, text: 'Geospatial shelter routing' },
        { icon: <Lock size={18} className="text-green-400" />, text: 'Secure, encrypted analysis' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center relative overflow-hidden">
            {/* Animated background blobs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <div className="inline-flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
                            <ShieldAlert size={32} className="text-blue-400" />
                        </div>
                        <span className="text-3xl font-black font-['Outfit'] tracking-tighter">Sentinel</span>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed font-['Inter']">
                        The autonomous early-warning system protecting communities with AI intelligence.
                    </p>
                </motion.div>

                {/* Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="glass p-8 border-white/10 shadow-2xl"
                >
                    <h2 className="text-2xl font-bold font-['Outfit'] mb-2 text-center">Welcome Back</h2>
                    <p className="text-slate-400 text-sm text-center mb-8 font-['Inter']">
                        Sign in to access your tactical dashboard
                    </p>

                    {/* Feature List */}
                    <div className="space-y-3 mb-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.1 }}
                                className="flex items-center gap-3 text-sm text-slate-300"
                            >
                                <div className="p-1.5 bg-white/5 rounded-lg">{f.icon}</div>
                                {f.text}
                            </motion.div>
                        ))}
                    </div>

                    {/* Google Login */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-full flex justify-center">
                            <GoogleLogin
                                onSuccess={handleSuccess}
                                onError={() => console.error('Google Login Failed')}
                                theme="filled_black"
                                shape="rectangular"
                                size="large"
                                text="signin_with"
                                width="320"
                            />
                        </div>

                        <p className="text-[10px] text-slate-600 text-center leading-relaxed">
                            By signing in, you agree to our Terms of Service and Privacy Policy.
                            Your data is encrypted and never shared.
                        </p>
                    </div>
                </motion.div>

                {/* Pricing Link */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-slate-500 text-sm mt-6"
                >
                    Need more features?{' '}
                    <a href="/pricing" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                        View Plans →
                    </a>
                </motion.p>
            </div>
        </div>
    );
};

export default LoginPage;
