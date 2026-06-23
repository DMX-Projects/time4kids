"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MAP_TILE_LATIN_LABELS } from "@/lib/map-tiles";

const OFFICE_LAT = 17.4408609;
const OFFICE_LNG = 78.4904436;

const officePinIcon = L.icon({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

type FranchiseOfficeMapProps = {
    title: string;
    addressText: string;
    phone?: string;
    email?: string;
    googleMapsUrl: string;
    directionsLabel?: string;
};

export default function FranchiseOfficeMap({
    title,
    addressText,
    phone,
    email,
    googleMapsUrl,
    directionsLabel = "Open in Google Maps",
}: FranchiseOfficeMapProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return (
            <div className="flex h-[400px] w-full items-center justify-center rounded-3xl bg-slate-100 animate-pulse md:h-[500px]">
                <p className="text-slate-500">Loading map…</p>
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-200/80 md:h-[500px]">
            <MapContainer
                center={[OFFICE_LAT, OFFICE_LNG]}
                zoom={17}
                scrollWheelZoom={false}
                attributionControl={false}
                className="h-full w-full"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    url={MAP_TILE_LATIN_LABELS.url}
                    subdomains={MAP_TILE_LATIN_LABELS.subdomains}
                    maxZoom={20}
                />
                <Marker position={[OFFICE_LAT, OFFICE_LNG]} icon={officePinIcon}>
                    <Popup maxWidth={280} minWidth={220}>
                        <div className="space-y-2 p-1 text-sm text-slate-800">
                            <p className="text-base font-bold text-[#003366]">{title}</p>
                            <p className="leading-snug whitespace-pre-line">{addressText}</p>
                            {phone ? <p className="text-slate-600">Phone: {phone}</p> : null}
                            {email ? <p className="text-slate-600">Email: {email}</p> : null}
                            <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-flex items-center gap-1 font-semibold text-[#E67E22] hover:underline"
                            >
                                {directionsLabel}
                            </a>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
