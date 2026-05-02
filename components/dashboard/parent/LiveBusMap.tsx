import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveBusMapProps {
    lat: number;
    lng: number;
    heading?: number | null;
    isLive: boolean;
    schoolLat?: number;
    schoolLng?: number;
    destLat?: number;
    destLng?: number;
    destinationName?: string;
    recentLocations?: Array<{ latitude: number; longitude: number }>;
}

// Component to recenter map when marker moves significantly
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        const center = map.getCenter();
        const dist = map.distance(center, L.latLng(lat, lng));
        if (dist > 50) {
            map.panTo([lat, lng], { animate: true });
        }
    }, [lat, lng, map]);
    return null;
}

export default function LiveBusMap({ 
    lat, lng, heading, isLive, 
    schoolLat, schoolLng, 
    destLat, destLng, destinationName,
    recentLocations = [] 
}: LiveBusMapProps) {
    const [displayedPos, setDisplayedPos] = useState<[number, number]>([lat, lng]);
    const [displayedHeading, setDisplayedHeading] = useState(heading || 0);
    const animationRef = useRef<number | null>(null);
    const lastPos = useRef({ lat, lng });
    const lastHeading = useRef(heading || 0);

    const busIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `
            <div class="relative w-12 h-12">
                <div class="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-25"></div>
                <div class="absolute inset-0 flex items-center justify-center">
                    <div style="transform: rotate(${displayedHeading}deg); width: 44px; height: 44px; background-image: url('/images/bus-marker.png'); background-size: cover; background-position: center; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3);"></div>
                </div>
            </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
    });

    const schoolIcon = L.divIcon({
        className: 'custom-school-marker',
        html: `<div style="width: 40px; height: 40px; background-color: #FFF; border: 3px solid #FF922B; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 24px;">🏫</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    const destIcon = L.divIcon({
        className: 'custom-dest-marker',
        html: `<div style="width: 40px; height: 40px; background-color: #FFF; border: 3px solid #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 24px;">📍</div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
    });

    useEffect(() => {
        const startLat = lastPos.current.lat;
        const startLng = lastPos.current.lng;
        const startHeading = lastHeading.current;
        const targetLat = lat;
        const targetLng = lng;
        const targetHeading = heading || 0;

        if (startLat === targetLat && startLng === targetLng && startHeading === targetHeading) return;

        const duration = 4800; // Slightly faster than polling to keep it smooth
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            const currentLat = startLat + (targetLat - startLat) * easeProgress;
            const currentLng = startLng + (targetLng - startLng) * easeProgress;
            const currentHeading = startHeading + (targetHeading - startHeading) * easeProgress;

            setDisplayedPos([currentLat, currentLng]);
            setDisplayedHeading(currentHeading);

            if (progress < 1) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                lastPos.current = { lat: targetLat, lng: targetLng };
                lastHeading.current = targetHeading;
            }
        };

        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [lat, lng, heading]);

    // Map history to leaflet polyline coordinates
    const polylinePath = recentLocations
        .map(loc => [Number(loc.latitude), Number(loc.longitude)] as [number, number])
        .reverse(); // Ensure chronological order if needed, but usually recent is first
    
    // Add current animated position to the path for seamless line
    if (polylinePath.length > 0) {
        polylinePath.push(displayedPos);
    }

    return (
        <div className="relative w-full h-full">
            <MapContainer 
                center={[lat, lng]} 
                zoom={15} 
                style={{ width: "100%", height: "100%", borderRadius: "1.5rem", zIndex: 10 }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                
                {/* Route Path Polyline */}
                <Polyline 
                    positions={polylinePath} 
                    pathOptions={{ 
                        color: '#FF922B', 
                        weight: 6, 
                        opacity: 0.6,
                        lineJoin: 'round',
                        lineCap: 'round',
                        dashArray: '1, 10' // Dot effect
                    }} 
                />
                
                {/* Main solid path line */}
                <Polyline 
                    positions={polylinePath} 
                    pathOptions={{ 
                        color: '#FF922B', 
                        weight: 3, 
                        opacity: 0.8,
                        lineJoin: 'round'
                    }} 
                />

                {isLive && (
                    <Marker position={displayedPos} icon={busIcon}>
                        <Popup className="bus-popup">
                            <div className="text-center font-bold text-orange-900">
                                Bus is moving!
                            </div>
                        </Popup>
                    </Marker>
                )}
                
                {schoolLat && schoolLng && (
                    <Marker position={[schoolLat, schoolLng]} icon={schoolIcon}>
                        <Popup><b>Starting Point</b><br/>Franchise Centre</Popup>
                    </Marker>
                )}

                {destLat && destLng && (
                    <Marker position={[destLat, destLng]} icon={destIcon}>
                        <Popup><b>Destination</b><br/>{destinationName || "Endpoint"}</Popup>
                    </Marker>
                )}

                <RecenterMap lat={displayedPos[0]} lng={displayedPos[1]} />
            </MapContainer>
            
            {/* Map Overlays */}
            <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border border-orange-100 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-orange-900 uppercase tracking-wider">Live Signal</span>
                </div>
            </div>
        </div>
    );
}
