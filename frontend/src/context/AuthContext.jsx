import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Restore session from localStorage
        try {
            const saved = localStorage.getItem('sentinel_user');
            if (saved) {
                setUser(JSON.parse(saved));
            }
        } catch {
            localStorage.removeItem('sentinel_user');
        }
    }, []);

    const login = (credential) => {
        try {
            const decoded = jwtDecode(credential);
            const profile = {
                name: decoded.name,
                email: decoded.email,
                picture: decoded.picture,
                sub: decoded.sub,
                plan: 'free', // default plan
            };
            setUser(profile);
            localStorage.setItem('sentinel_user', JSON.stringify(profile));
        } catch (err) {
            console.error('Auth decode failed:', err);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('sentinel_user');
    };

    const upgradePlan = (plan) => {
        setUser(prev => {
            const updated = { ...prev, plan };
            localStorage.setItem('sentinel_user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, upgradePlan }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
