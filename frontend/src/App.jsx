import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function AppContent() {
    const location = useLocation();

    const [appState, setAppState] = useState({
        location: { lat: 24.8607, lon: 67.0011 },
        risk: null,
        shelters: [],
        actions: [],
        metadata: {},
        loading: false,
        error: null,
        simulationMode: false,
        prevLevel: null
    });

    const fetchRiskData = async (lat, lon) => {
        setAppState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/risk-response?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('API connection failure');
            const data = await response.json();
            setAppState(prev => ({
                ...prev,
                risk: data.risk,
                shelters: data.shelters,
                actions: data.actions,
                metadata: data.metadata,
                priority: data.priority,
                primaryThreat: data.primary_threat,
                loading: false
            }));
        } catch (err) {
            setAppState(prev => ({
                ...prev,
                error: 'Critical Error: Unable to sync with risk intelligence backend.',
                loading: false
            }));
        }
    };

    const detectLocation = () => {
        if (!navigator.geolocation) {
            setAppState(prev => ({ ...prev, error: 'Geolocation not supported.' }));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                setAppState(prev => ({ ...prev, location: newLoc }));
                fetchRiskData(newLoc.lat, newLoc.lon);
            },
            () => setAppState(prev => ({ ...prev, error: 'Location access denied.' }))
        );
    };

    useEffect(() => {
        detectLocation();
        const monitor = setInterval(() => {
            setAppState(current => {
                if (current.location) fetchRiskData(current.location.lat, current.location.lon);
                return current;
            });
        }, 300000);
        return () => clearInterval(monitor);
    }, []);

    useEffect(() => {
        const newLevel = appState.risk?.level;
        if (appState.prevLevel && appState.prevLevel !== newLevel && newLevel === 'High') {
            console.log('URGENT: Risk Escalation Detected!');
        }
        setAppState(prev => ({ ...prev, prevLevel: newLevel }));
    }, [appState.risk?.level]);

    return (
        <>
            <Navbar />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage
                                    appState={appState}
                                    setAppState={setAppState}
                                    fetchRiskData={fetchRiskData}
                                />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AnimatePresence>
        </>
    );
}

function App() {
    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <AuthProvider>
                <Router>
                    <AppContent />
                </Router>
            </AuthProvider>
        </GoogleOAuthProvider>
    );
}

export default App;
