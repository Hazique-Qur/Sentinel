import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Info, Home, Zap, Tag, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationSystem from './NotificationSystem';

const Navbar = ({ alerts, unreadCount, onMarkRead, onClearAll }) => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const navLinks = [
        { to: '/', label: 'Home', icon: <Home size={16} /> },
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
        { to: '/demo', label: 'Simulate', icon: <Zap size={16} /> },
        { to: '/pricing', label: 'Pricing', icon: <Tag size={16} /> },
        { to: '/about', label: 'About', icon: <Info size={16} /> },
    ];

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <motion.nav
            initial={{ y: -80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 py-4 bg-slate-950/90 backdrop-blur-md border-b border-white/5"
        >
            {/* Logo */}
            <Link to="/" className="flex items-center group">
                <Logo size={32} />
            </Link>

            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => {
                    const isActive = location.pathname === link.to;
                    return (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.icon}
                            {link.label}
                        </Link>
                    );
                })}
            </div>

            {/* Auth Area */}
            <div className="flex items-center gap-3">
                <NotificationSystem
                    alerts={alerts}
                    unreadCount={unreadCount}
                    onMarkRead={onMarkRead}
                    onClearAll={onClearAll}
                />

                {user ? (
                    <div className="relative" ref={dropdownRef}>
                        <button
                            onClick={() => setDropdownOpen(prev => !prev)}
                            className="flex items-center gap-2.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition-all"
                        >
                            <div className="w-7 h-7 rounded-full border border-white/20 bg-blue-500/20 flex items-center justify-center overflow-hidden">
                                {user.picture ? (
                                    <img
                                        src={user.picture}
                                        alt={user.name}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                    />
                                ) : null}
                                <div className="hidden items-center justify-center w-full h-full text-[10px] font-bold text-blue-400">
                                    {user.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                </div>
                            </div>
                            <span className="text-sm font-semibold text-slate-200 hidden sm:block max-w-[100px] truncate">
                                {user.name?.split(' ')[0]}
                            </span>
                            {user.plan === 'pro' && (
                                <span className="text-[8px] font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">
                                    PRO
                                </span>
                            )}
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {dropdownOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 mt-2 w-56 glass border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50"
                                >
                                    {/* Profile header */}
                                    <div className="px-4 py-4 border-b border-white/5">
                                        <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                                        <span className={`inline-block mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border
                                            ${user.plan === 'pro' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20' :
                                                user.plan === 'enterprise' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' :
                                                    'text-slate-400 bg-white/5 border-white/10'}`}>
                                            {user.plan || 'free'} plan
                                        </span>
                                    </div>

                                    {/* Menu items */}
                                    <div className="p-2">
                                        <Link
                                            to="/pricing"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/5 transition-colors"
                                        >
                                            <Tag size={15} className="text-blue-400" />
                                            Upgrade Plan
                                        </Link>
                                        <button
                                            onClick={() => { logout(); setDropdownOpen(false); }}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                                        >
                                            <LogOut size={15} />
                                            Sign Out
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-lg shadow-blue-900/30"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </motion.nav>
    );
};

export default Navbar;
