import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import AboutPage from './pages/AboutPage';
import DemoPage from './pages/DemoPage';
import LoginPage from './pages/LoginPage';
import PricingPage from './pages/PricingPage';
import GlobalMapPage from './pages/GlobalMapPage';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '211873885831-hglvk74j8vqplt5ptg9vsgb1grvg5hhm.apps.googleusercontent.com';

function AppContent() {
    const location = useLocation();

    const [appState, setAppState] = useState({
        location: { lat: 24.8607, lon: 67.0011 },
        risk: null,
        shelters: [],
        actions: [],
        riskHistory: [],
        trend: { direction: 'Stable', strength: 0, pct: 0, icon: '→' },
        regionalData: null,
        regionalLoading: false,
        metadata: {},
        loading: false,
        error: null,
        simulationMode: false,
        prevLevel: null,
        alerts: [],
        unreadCount: 0,
        savedLocations: [],
        fleet: [],
        viewMode: 'detail', // 'detail' or 'fleet'
        forecast: null,
        escalationProb: 0,
        performance: null,
        latestPredictionId: null,
        federation: null,
        isSyncing: false
    });

    const { user } = useAuth();

    const fetchSavedLocations = async () => {
        if (!user?.sub) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/user/locations?user_id=${user.sub}`);
            if (!response.ok) return;
            const data = await response.json();
            setAppState(prev => ({ ...prev, savedLocations: data.locations || [] }));
        } catch (err) {
            console.error('Saved locations fetch failed:', err);
        }
    };

    const fetchFleetStatus = async () => {
        if (!user?.sub) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/user/fleet-status?user_id=${user.sub}`);
            if (!response.ok) return;
            const data = await response.json();
            setAppState(prev => ({ ...prev, fleet: data.fleet || [] }));
        } catch (err) {
            console.error('Fleet status fetch failed:', err);
        }
    };

    const saveLocation = async (locData) => {
        if (!user?.sub) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/user/locations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...locData, user_id: user.sub })
            });
            if (response.ok) {
                fetchSavedLocations();
                fetchFleetStatus();
            }
        } catch (err) {
            console.error('Save location failed:', err);
        }
    };

    const deleteLocation = async (locId) => {
        if (!user?.sub) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/user/locations/${locId}?user_id=${user.sub}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchSavedLocations();
                fetchFleetStatus();
            }
        } catch (err) {
            console.error('Delete location failed:', err);
        }
    };

    const fetchAlerts = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/alerts`);
            if (!response.ok) return;
            const data = await response.json();
            setAppState(prev => ({
                ...prev,
                alerts: data.alerts || [],
                unreadCount: data.unread_count || 0
            }));
        } catch (err) {
            console.error('Alerts fetch failed:', err);
        }
    };

    const markAlertRead = async (alertId) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            await fetch(`${baseUrl}/api/alerts/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alert_id: alertId })
            });
            fetchAlerts(); // Refresh
        } catch (err) {
            console.error('Mark read failed:', err);
        }
    };

    const clearAllAlerts = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            await fetch(`${baseUrl}/api/alerts/read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clear_all: true })
            });
            fetchAlerts(); // Refresh
        } catch (err) {
            console.error('Clear all failed:', err);
        }
    };

    const fetchRegionalData = async (lat, lon) => {
        setAppState(prev => ({ ...prev, regionalLoading: true }));
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/risk-region?lat=${lat}&lon=${lon}&radius=10`);
            if (!response.ok) return;
            const data = await response.json();
            setAppState(prev => ({
                ...prev,
                regionalData: data,
                regionalLoading: false
            }));
        } catch (err) {
            console.error('Regional fetch failed:', err);
            setAppState(prev => ({ ...prev, regionalLoading: false }));
        }
    };

    const fetchHistoryData = async (lat, lon) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/risk-history?lat=${lat}&lon=${lon}`);
            if (!response.ok) return;
            const data = await response.json();
            setAppState(prev => ({
                ...prev,
                riskHistory: data.history || [],
                trend: {
                    direction: data.trend,
                    strength: data.trendStrength,
                    pct: data.trendPct,
                    icon: data.trendIcon
                }
            }));
        } catch (err) {
            console.error('History fetch failed:', err);
        }
    };

    const fetchForecastData = async (lat, lon) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/risk/forecast?lat=${lat}&lon=${lon}`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.status === 'success') {
                setAppState(prev => ({
                    ...prev,
                    forecast: data.forecast,
                    escalationProb: data.probabilityEmergencyWithin24h
                }));
            }
        } catch (err) {
            console.error('Forecast fetch failed:', err);
        }
    };

    const fetchPerformanceData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/model/performance`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.status === 'success') {
                setAppState(prev => ({ ...prev, performance: data.performance }));
            }
        } catch (err) {
            console.error('Performance fetch failed:', err);
        }
    };

    const submitFeedback = async (predictionId, actualScore) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/model/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prediction_id: predictionId, actual_score: actualScore })
            });
            if (response.ok) {
                fetchPerformanceData(); // Refresh metrics
            }
        } catch (err) {
            console.error('Feedback submission failed:', err);
        }
    };

    const fetchFederationData = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/federation/status`);
            if (!response.ok) return;
            const data = await response.json();
            if (data.status === 'success') {
                setAppState(prev => ({ ...prev, federation: data.federation }));
            }
        } catch (err) {
            console.error('Federation status fetch failed:', err);
        }
    };

    const triggerFederationSync = async () => {
        setAppState(prev => ({ ...prev, isSyncing: true }));
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/federation/sync`, { method: 'POST' });
            if (response.ok) {
                await fetchFederationData();
            }
        } catch (err) {
            console.error('Federation sync failed:', err);
        } finally {
            setAppState(prev => ({ ...prev, isSyncing: false }));
        }
    };

    const fetchRiskData = async (lat, lon) => {
        setAppState(prev => ({ ...prev, loading: true, error: null }));
        try {
            const baseUrl = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${baseUrl}/api/risk-response?lat=${lat}&lon=${lon}`);
            if (!response.ok) throw new Error('API connection failure');
            const data = await response.json();

            // Simultaneously fetch history, regional data, and Phase 14/15 research data
            fetchHistoryData(lat, lon);
            fetchRegionalData(lat, lon);
            fetchForecastData(lat, lon);
            fetchPerformanceData();
            fetchFederationData();

            setAppState(prev => ({
                ...prev,
                risk: data.risk,
                alertTier: data.risk?.alert_tier ?? null,
                shelters: data.shelters,
                actions: data.actions,
                riskFactors: data.risk_factors ?? [],
                primaryDriver: data.primary_driver ?? '',
                metadata: data.metadata,
                priority: data.priority,
                primaryThreat: data.primary_threat,
                latestPredictionId: data.prediction_id,
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
        fetchAlerts();

        const monitor = setInterval(() => {
            setAppState(current => {
                if (current.location) fetchRiskData(current.location.lat, current.location.lon);
                return current;
            });
        }, 300000);

        const alertPolling = setInterval(fetchAlerts, 60000); // Check notifications every 60s
        const fleetPolling = setInterval(() => {
            if (user?.sub) fetchFleetStatus();
        }, 120000); // Refresh fleet every 2 mins

        return () => {
            clearInterval(monitor);
            clearInterval(alertPolling);
            clearInterval(fleetPolling);
        };
    }, [user?.sub]);

    // Initial fetch for user data
    useEffect(() => {
        if (user?.sub) {
            fetchSavedLocations();
            fetchFleetStatus();
        }
    }, [user?.sub]);

    useEffect(() => {
        const newLevel = appState.risk?.level;
        if (appState.prevLevel && appState.prevLevel !== newLevel && newLevel === 'High') {
            console.log('URGENT: Risk Escalation Detected!');
        }
        setAppState(prev => ({ ...prev, prevLevel: newLevel }));
    }, [appState.risk?.level]);

    return (
        <>
            <Navbar
                alerts={appState.alerts}
                unreadCount={appState.unreadCount}
                onMarkRead={markAlertRead}
                onClearAll={clearAllAlerts}
            />
            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/demo" element={<DemoPage />} />
                    <Route
                        path="/global"
                        element={
                            <ProtectedRoute>
                                <GlobalMapPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <DashboardPage
                                    appState={appState}
                                    setAppState={setAppState}
                                    fetchRiskData={fetchRiskData}
                                    saveLocation={saveLocation}
                                    deleteLocation={deleteLocation}
                                    fetchFleetStatus={fetchFleetStatus}
                                    onRefreshPerformance={fetchPerformanceData}
                                    onSubmitFeedback={submitFeedback}
                                    onSyncFederation={triggerFederationSync}
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
