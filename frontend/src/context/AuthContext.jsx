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

    const login = async (credential) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential })
            });

            if (!response.ok) throw new Error('Backend authentication failed');

            const data = await response.json();
            const profile = data.user;

            setUser(profile);
            localStorage.setItem('sentinel_user', JSON.stringify(profile));
        } catch (err) {
            console.error('Auth verification failed:', err);
            // Fallback for demo if backend is offline/unreachable during testing
            // But we want it to work with the backend now.
            throw err;
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
