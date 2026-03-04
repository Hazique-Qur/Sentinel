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
    const getRiskColor = () => {
        if (risk === 'High') return '#ef4444';
        if (risk === 'Medium') return '#eab308';
        return '#22c55e';
    };

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer center={center} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <ChangeView center={center} />
                <FlyToNearestShelter shelters={shelters} risk={risk} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
