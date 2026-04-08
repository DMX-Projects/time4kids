"use client";

import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { MapPin, Phone } from "lucide-react";

export interface MapCentre {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    googleMapLink?: string | null;
    googleMapIframe?: string | null;
    latitude?: number | null;
    longitude?: number | null;
}

interface CentreMapProps {
    centres: MapCentre[];
}

const containerStyle = {
    width: "100%",
    height: "500px",
    borderRadius: "1rem"
};

const defaultCenter = {
    lat: 20.5937,
    lng: 78.9629 // Center of India
};

export function CentreMap({ centres }: CentreMapProps) {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [activeMarker, setActiveMarker] = useState<number | null>(null);

    const onLoad = useCallback(function callback(mapInstance: google.maps.Map) {
        setMap(mapInstance);
        if (centres.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            let hasValidCoords = false;
            centres.forEach((centre) => {
                if (centre.latitude && centre.longitude) {
                    bounds.extend({ lat: centre.latitude, lng: centre.longitude });
                    hasValidCoords = true;
                }
            });
            if (hasValidCoords) {
                mapInstance.fitBounds(bounds);
            }
        }
    }, [centres]);

    const onUnmount = useCallback(function callback() {
        setMap(null);
    }, []);

    if (!isLoaded) return <div className="h-[500px] w-full bg-slate-100 rounded-2xl flex items-center justify-center animate-pulse"><p className="text-slate-500">Loading map...</p></div>;

    const mapCenter = centres.length > 0 && centres[0].latitude && centres[0].longitude
        ? { lat: centres[0].latitude, lng: centres[0].longitude }
        : defaultCenter;

    return (
        <div className="border-4 border-white shadow-lg rounded-2xl overflow-hidden bg-white">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={5}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                }}
            >
                {centres.map((centre) => {
                    if (!centre.latitude || !centre.longitude) return null;
                    return (
                        <Marker
                            key={centre.id}
                            position={{ lat: centre.latitude, lng: centre.longitude }}
                            onClick={() => setActiveMarker(centre.id)}
                            icon={{
                                url: "/images/map-marker-orange.svg", // Fallback to default if not exists
                            }}
                        >
                            {activeMarker === centre.id && (
                                <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                                    <div className="p-2 max-w-[200px] text-sm">
                                        <h3 className="font-bold text-orange-600 mb-1">{centre.name}</h3>
                                        <p className="text-slate-600 mb-2 truncate whitespace-normal leading-tight">{centre.address}</p>
                                        <a href={`tel:${centre.phone}`} className="flex items-center gap-1 text-slate-800 font-medium hover:text-orange-500 transition-colors">
                                            <Phone className="w-3 h-3" /> {centre.phone}
                                        </a>
                                        {centre.googleMapLink && (
                                            <a href={centre.googleMapLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 font-medium hover:underline mt-2">
                                                <MapPin className="w-3 h-3" /> Get Directions
                                            </a>
                                        )}
                                    </div>
                                </InfoWindow>
                            )}
                        </Marker>
                    );
                })}
            </GoogleMap>
        </div>
    );
}
