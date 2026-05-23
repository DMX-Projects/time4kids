"use client";

import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Phone } from "lucide-react";
import { renderToString } from "react-dom/server";
import {
    resolveCentreMapPositions,
    INDIA_MAP_CENTER,
    INDIA_MAP_DEFAULT_ZOOM,
    INDIA_MAP_MIN_ZOOM,
    INDIA_MAP_NE,
    INDIA_MAP_SW,
    isCoordInIndia,
    type CentreMapPin,
    type ResolvedCentrePosition,
} from "@/lib/centre-map-coords";

export type { CentreMapPin };

interface CentreMapProps {
    centres: CentreMapPin[];
}

const indiaBounds = L.latLngBounds(INDIA_MAP_SW, INDIA_MAP_NE);

const pinIcon = L.divIcon({
    html: renderToString(
        <div style={{ color: "#ea580c", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
            <MapPin size={32} fill="currentColor" />
        </div>,
    ),
    className: "centre-map-pin",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -28],
});

const cityPinIcon = L.divIcon({
    html: renderToString(
        <div style={{ color: "#2563eb", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.35))" }}>
            <MapPin size={28} fill="currentColor" stroke="#fff" strokeWidth={1} />
        </div>,
    ),
    className: "centre-map-pin-city",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -24],
});

function IndiaMapConstraints() {
    const map = useMap();
    useEffect(() => {
        map.setMaxBounds(indiaBounds);
        map.setMinZoom(INDIA_MAP_MIN_ZOOM);
        map.options.maxBoundsViscosity = 1;
    }, [map]);
    return null;
}

function FitBounds({ pins }: { pins: { lat: number; lng: number }[] }) {
    const map = useMap();
    useEffect(() => {
        const inIndia = pins.filter((p) => isCoordInIndia(p.lat, p.lng));
        const targetPins = inIndia.length > 0 ? inIndia : pins;

        if (targetPins.length === 0) {
            map.setView(INDIA_MAP_CENTER, INDIA_MAP_DEFAULT_ZOOM);
            return;
        }
        if (targetPins.length === 1) {
            map.setView([targetPins[0].lat, targetPins[0].lng], 12);
            return;
        }
        const bounds = L.latLngBounds(targetPins.map((p) => [p.lat, p.lng] as [number, number]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 12 });
    }, [map, pins]);
    return null;
}

export function CentreMap({ centres }: CentreMapProps) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    const pinned = useMemo(() => resolveCentreMapPositions(centres), [centres]);

    const exactCount = pinned.filter((p) => p.position.precision === "exact" || p.position.precision === "link").length;
    const cityCount = pinned.filter((p) => p.position.precision === "city").length;
    const skipped = centres.length - pinned.length;

    if (!mounted) {
        return (
            <div className="flex h-[500px] w-full items-center justify-center rounded-2xl bg-slate-100 animate-pulse">
                <p className="text-slate-500">Loading map…</p>
            </div>
        );
    }

    if (pinned.length === 0) {
        return (
            <div className="flex h-[500px] w-full flex-col items-center justify-center rounded-2xl border-4 border-dashed border-slate-200 bg-white px-6 text-center">
                <MapPin className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-semibold text-slate-700">No locations to show on the map</p>
                <p className="mt-2 max-w-md text-sm text-slate-500">
                    Centres need a city we recognise, or latitude/longitude set in the franchise profile.
                </p>
            </div>
        );
    }

    const mapPins = pinned.map((p) => ({ lat: p.position.lat, lng: p.position.lng }));

    return (
        <div className="space-y-3">
            {(cityCount > 0 || skipped > 0) && (
                <p className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-sm text-amber-900">
                    Showing <strong>{pinned.length}</strong> of <strong>{centres.length}</strong> centres on the map.
                    {exactCount > 0 ? (
                        <>
                            {" "}
                            <strong>{exactCount}</strong> exact pin{exactCount !== 1 ? "s" : ""}.
                        </>
                    ) : null}
                    {cityCount > 0 ? (
                        <>
                            {" "}
                            <strong>{cityCount}</strong> shown at approximate city location (blue pins).
                        </>
                    ) : null}
                    {skipped > 0 ? ` ${skipped} could not be placed.` : null}
                </p>
            )}

            <div className="centre-map-wrapper overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg">
                <MapContainer
                    center={INDIA_MAP_CENTER}
                    zoom={INDIA_MAP_DEFAULT_ZOOM}
                    minZoom={INDIA_MAP_MIN_ZOOM}
                    maxBounds={indiaBounds}
                    maxBoundsViscosity={1}
                    style={{ height: "500px", width: "100%" }}
                    scrollWheelZoom
                    attributionControl={false}
                >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <IndiaMapConstraints />
                    <FitBounds pins={mapPins} />
                    {pinned.map(({ centre, position }) => (
                        <CentreMarker key={centre.id} centre={centre} position={position} />
                    ))}
                </MapContainer>
            </div>
            <p className="text-right text-[10px] text-slate-400">
                <a
                    href="https://www.openstreetmap.org/copyright"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-slate-500"
                >
                    Map data © OpenStreetMap
                </a>
            </p>
        </div>
    );
}

function CentreMarker({
    centre,
    position,
}: {
    centre: CentreMapPin;
    position: ResolvedCentrePosition;
}) {
    const icon = position.precision === "city" ? cityPinIcon : pinIcon;
    return (
        <Marker position={[position.lat, position.lng]} icon={icon}>
            <Popup>
                <div className="max-w-[220px] p-1 text-sm">
                    <h3 className="mb-1 font-bold text-orange-600">{centre.name}</h3>
                    <p className="mb-2 whitespace-normal text-xs leading-snug text-slate-600">{centre.address}</p>
                    {position.precision === "city" && (
                        <p className="mb-2 text-[10px] font-medium text-blue-600">
                            Approximate location ({centre.city})
                        </p>
                    )}
                    {centre.phone?.trim() ? (
                        <a
                            href={`tel:${centre.phone.replace(/[^\d+]/g, "")}`}
                            className="flex items-center gap-1 font-medium text-slate-800 hover:text-orange-500"
                        >
                            <Phone className="h-3 w-3" /> {centre.phone}
                        </a>
                    ) : null}
                    {centre.googleMapLink ? (
                        <a
                            href={centre.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 font-medium text-blue-600 hover:underline"
                        >
                            <MapPin className="h-3 w-3" /> Get directions
                        </a>
                    ) : null}
                </div>
            </Popup>
        </Marker>
    );
}
