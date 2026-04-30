"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveBusMapProps {
    lat: number;
    lng: number;
    heading?: number | null;
    isLive: boolean;
}

// Component to recenter map when marker moves significantly
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    useEffect(() => {
        // Only pan if the point is somewhat far from center to avoid jitter
        const center = map.getCenter();
        const dist = map.distance(center, L.latLng(lat, lng));
        if (dist > 50) { // If more than 50 meters away, pan to it
            map.panTo([lat, lng], { animate: true });
        }
    }, [lat, lng, map]);
    return null;
}

export default function LiveBusMap({ lat, lng, heading, isLive }: LiveBusMapProps) {
    const [displayedPos, setDisplayedPos] = useState<[number, number]>([lat, lng]);
    const [displayedHeading, setDisplayedHeading] = useState(heading || 0);
    const animationRef = useRef<number | null>(null);
    const lastPos = useRef({ lat, lng });
    const lastHeading = useRef(heading || 0);

    // Custom icon with rotation using standard HTML and CSS
    const customIcon = L.divIcon({
        className: 'custom-bus-marker',
        html: `<div style="transform: rotate(${displayedHeading}deg); width: 40px; height: 40px; background-image: url('/images/bus-marker.png'); background-size: cover; background-position: center; border-radius: 50%; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>`,
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

        const duration = 4000;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentLat = startLat + (targetLat - startLat) * progress;
            const currentLng = startLng + (targetLng - startLng) * progress;
            const currentHeading = startHeading + (targetHeading - startHeading) * progress;

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

    return (
        <MapContainer 
            center={[lat, lng]} 
            zoom={16} 
            style={{ width: "100%", height: "100%", borderRadius: "1rem", zIndex: 10 }}
            zoomControl={true}
            attributionControl={false}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isLive && (
                <Marker position={displayedPos} icon={customIcon} />
            )}
            <RecenterMap lat={displayedPos[0]} lng={displayedPos[1]} />
        </MapContainer>
    );
}
