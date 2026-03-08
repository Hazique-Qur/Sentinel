import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Pulsing User Icon for High Risk
const pulsingUserIcon = new L.DivIcon({
    className: 'pulsing-marker',
    html: '<div class="pulse-ring"></div><div class="user-dot"></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// Custom shelter icon
const shelterIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// ─── Heatmap grid overlay ───
const HeatmapLayer = ({ regionRisk }) => {
    if (!regionRisk || regionRisk.length === 0) return null;

    return (
        <>
            {regionRisk.map((p, idx) => (
                <CircleMarker
                    key={idx}
                    center={[p.lat, p.lon]}
                    pathOptions={{
                        fillColor: p.color,
                        color: p.color,
                        weight: 0,
                        fillOpacity: 0.35
                    }}
                    radius={12}
                >
                    <Popup>
                        <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 font-['Outfit']">Sector Analysis</div>
                        <div className="text-sm font-bold flex items-center gap-2" style={{ color: p.color }}>
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                            Risk: {p.riskScore}%
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
};

function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 12);
    return null;
}

// Auto-focus on nearest shelter when risk is High
function FlyToNearestShelter({ shelters, risk }) {
    const map = useMap();
    React.useEffect(() => {
        if (risk === 'High' && Array.isArray(shelters) && shelters.length > 0) {
            const nearest = shelters[0];
            map.flyTo([nearest.lat, nearest.lon], 14, { duration: 2 });
        }
    }, [risk, shelters, map]);
    return null;
}

const ShelterMap = ({ shelters, center, risk, score, regionRisk }) => {
    const [activeLayer, setActiveLayer] = React.useState('dark');

    const getRiskColor = () => {
        if (risk === 'High') return '#ef4444';
        if (risk === 'Medium') return '#eab308';
        return '#22c55e';
    };

    const layers = [
        { id: 'dark', label: 'Tactical Dark', url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
        { id: 'satellite', label: 'NDVI Vegetation', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
        { id: 'thermal', label: 'Thermal Hotspots', url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png' }, // Voyager as placeholder for thermal
        { id: 'water', label: 'Water Index', url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png' }
    ];

    return (
        <div className="h-full w-full relative z-0">
            {/* Spectral Tactical HUD — Horizontal Bottom-Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 bg-slate-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 shadow-2xl">
                {layers.map(layer => (
                    <button
                        key={layer.id}
                        onClick={() => setActiveLayer(layer.id)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 border ${activeLayer === layer.id
                                ? 'bg-blue-600/40 border-blue-400/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]'
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
                            }`}
                    >
                        <div className={`w-1 h-1 rounded-full transition-all ${activeLayer === layer.id ? 'bg-blue-400 scale-150' : 'bg-slate-700'}`} />
                        {layer.label}
                    </button>
                ))}
            </div>

            <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} />
                <FlyToNearestShelter shelters={shelters} risk={risk} />
                <TileLayer
                    attribution='&copy; CARTO &copy; ESRI'
                    url={layers.find(l => l.id === activeLayer).url}
                />

                {/* Heatmap Layer */}
                <HeatmapLayer regionRisk={regionRisk} />

                {/* Risk Radius Circle */}
                {score > 0 && (
                    <Circle
                        center={center}
                        pathOptions={{
                            fillColor: getRiskColor(),
                            color: getRiskColor(),
                            weight: 1,
                            fillOpacity: 0.1
                        }}
                        radius={score * 80}
                    />
                )}

                {/* User Location with Pulsing Effect */}
                <Marker position={center} icon={risk === 'High' ? pulsingUserIcon : DefaultIcon}>
                    <Popup>
                        <div className="font-bold text-slate-900">Operation Center</div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Base Telemetry</div>
                    </Popup>
                </Marker>

                {/* Shelters */}
                {Array.isArray(shelters) && shelters.map((shelter, idx) => (
                    <Marker
                        key={idx}
                        position={[shelter.lat, shelter.lon]}
                        icon={shelterIcon}
                    >
                        <Popup>
                            <div className="text-slate-900 p-2 min-w-[150px]">
                                <div className="flex justify-between items-start border-b border-slate-100 pb-2 mb-2">
                                    <h4 className="font-bold text-sm">{shelter.name}</h4>
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">OPEN</span>
                                </div>
                                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Facility Type</p>
                                <p className="text-xs text-slate-700 mb-2">{shelter.type}</p>

                                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg">
                                    <span className="text-[10px] text-slate-500">Distance</span>
                                    <span className="text-xs font-bold text-blue-600">{shelter.distance_km} km</span>
                                </div>

                                {risk === 'High' && (
                                    <div className="mt-2 text-[10px] bg-red-50 text-red-600 p-2 rounded-lg font-bold border border-red-100 italic">
                                        ⚠ Emergency Route Active
                                    </div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};

export default ShelterMap;
