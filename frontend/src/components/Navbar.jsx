import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, LayoutDashboard, Info, Home, Zap } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="fixed top-0 left-0 right-0 z-[100] p-4">
            <div className="max-w-7xl mx-auto glass px-6 py-3 flex justify-between items-center border-white/5 shadow-2xl backdrop-blur-xl">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/40 group-hover:scale-110 transition-transform">
                        <ShieldAlert className="text-white" size={20} />
                    </div>
                    <div>
                        <h1 className="text-xl font-['Outfit'] font-bold tracking-tight">Sentinel</h1>
                        <p className="text-[8px] uppercase tracking-[0.3em] text-blue-500 font-bold">Decision Support</p>
                    </div>
                </Link>

                <div className="flex items-center gap-2 md:gap-6">
                    <NavLink to="/" active={isActive('/')} icon={<Home size={18} />} label="Home" />
                    <NavLink to="/dashboard" active={isActive('/dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
                    <NavLink to="/demo" active={isActive('/demo')} icon={<Zap size={18} />} label="Demo" />
                    <NavLink to="/about" active={isActive('/about')} icon={<Info size={18} />} label="About" />
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, active, icon, label }) => (
    <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${active
            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
            }`}
    >
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider hidden md:block">{label}</span>
    </Link>
);

export default Navbar;
