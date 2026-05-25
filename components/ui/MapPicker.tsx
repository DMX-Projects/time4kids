"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MAP_TILE_ENGLISH } from "@/lib/map-tiles";
import { MapPin } from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix for default leaflet icons
const createCustomIcon = (color: string) => {
    return L.divIcon({
        html: renderToString(<div style={{ color }}><MapPin size={32} /></div>),
        className: "custom-map-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
    });
};

const pinIcon = createCustomIcon("#EF4444");

interface MapPickerProps {
    lat: number | null;
    lng: number | null;
    onChange: (lat: number, lng: number) => void;
    label?: string;
}

function LocationMarker({ position, setPosition, onChange }: any) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onChange(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={pinIcon} />
    );
}

export default function MapPicker({ lat, lng, onChange, label = "Click on the map to set location" }: MapPickerProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        lat && lng ? new L.LatLng(lat, lng) : null
    );

    // Update internal state if props change (e.g., clearing form)
    useEffect(() => {
        if (lat && lng) {
            setPosition(new L.LatLng(lat, lng));
        } else {
            setPosition(null);
        }
    }, [lat, lng]);

    // Ensure Leaflet only runs on client
    if (typeof window === "undefined") return null;

    return (
        <div className="space-y-1">
            <p className="text-xs font-bold text-orange-800 uppercase">{label}</p>
            <div className="h-[200px] w-full rounded-xl overflow-hidden border border-orange-200 shadow-sm relative z-0">
                <MapContainer
                    center={position || [17.3850, 78.4867]} // Default to Hyderabad
                    zoom={12}
                    style={{ height: "100%", width: "100%" }}
                >
                    <TileLayer
                        attribution={MAP_TILE_ENGLISH.attribution}
                        url={MAP_TILE_ENGLISH.url}
                    />
                    <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
                </MapContainer>
            </div>
            {position && (
                <p className="text-[10px] text-gray-500 font-mono">
                    Lat: {position.lat.toFixed(6)}, Lng: {position.lng.toFixed(6)}
                </p>
            )}
        </div>
    );
}
