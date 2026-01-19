import React, { useEffect, useState } from 'react';
import { SERVER_URL } from '@/lib/api-client';

// Type definitions
export type LandmarkType =
    | 'backwaters'
    | 'fort_generic'
    | 'temple_bengal'
    | 'vidhana_soudha'
    | 'carpet'
    | 'marine_drive'
    | 'bandel_church'
    | 'howrah_bridge'
    | 'charminar'
    | 'arch_dam'
    | 'fort_water'
    | 'temple_gopuram'
    | 'lake_generic'
    | 'beach_generic'
    | 'bara_imambara'
    | 'hill_park'
    | 'gateway_of_india'
    | 'rockfort'
    | 'golghar'
    | 'shaniwar_wada'
    | 'waterfall'
    | 'temple_kalinga'
    | 'temple_kerala'
    | 'temple_padmanabhaswamy'
    | 'cactus_garden'
    | 'beach_rk'
    | 'temple_hill'
    | 'fort_moat';

export interface CityData {
    id?: number;
    name: string;
    landmark: string;
    type: LandmarkType;
}

// Custom hook to fetch city landmarks from API
export const useCityLandmarks = () => {
    const [cityLandmarks, setCityLandmarks] = useState<CityData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${SERVER_URL}/api/franchises/public/locations/`);

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Handle both paginated (DRF default) and non-paginated responses
                const results = Array.isArray(data) ? data : (data.results || []);

                // Transform API data to match CityData interface
                const transformedData: CityData[] = results.map((item: any) => ({
                    id: item.id,
                    name: item.city_name,
                    landmark: item.landmark_name,
                    type: item.landmark_type as LandmarkType
                }));

                setCityLandmarks(transformedData);
                setError(null);
            } catch (err) {
                console.error('Error fetching franchise locations:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch locations');
                setCityLandmarks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchLocations();
    }, []);

    return { cityLandmarks, loading, error };
};

export const LandmarkIcon = ({ type, className = "w-6 h-6" }: { type: LandmarkType, className?: string }) => {
    // Reference Style: High Detail Line Art, Monochrome (Black), Transparent Fills.
    const strokeProps = { strokeWidth: "1.5", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    const strokeColor = "#000000"; // Pure Black

    switch (type) {
        case 'backwaters':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M4 52 C12 50, 20 50, 28 52 S 44 54, 52 52 S 60 50, 64 52" {...strokeProps} />
                    <path d="M2 58 C10 56, 18 56, 26 58 S 42 60, 50 58 S 58 56, 62 58" {...strokeProps} />
                    <path d="M8 46 C12 50, 52 50, 56 46 L60 36 L4 36 L8 46 Z" {...strokeProps} />
                    <path d="M12 36 L16 22 C18 18, 46 18, 48 22 L52 36" {...strokeProps} />
                    <line x1="16" y1="46" x2="50" y2="46" opacity="0.5" />
                    <line x1="20" y1="41" x2="48" y2="41" opacity="0.5" />
                    <path d="M14 26 L14 36 M22 22 L22 36 M32 22 L32 36 M42 22 L42 36" strokeWidth="1" />
                    <path d="M14 28 L48 28 M16 32 L50 32" strokeWidth="0.5" opacity="0.7" />
                    <path d="M54 36 L56 12 M56 12 L50 18 M56 12 L62 18 M56 12 L52 8 M56 12 L60 8" {...strokeProps} />
                </svg>
            );
        case 'fort_generic':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M4 56 L60 56" strokeWidth="2" />
                    <path d="M10 56 L12 24 L52 24 L54 56" {...strokeProps} />
                    <path d="M12 24 L12 18 L20 18 L20 24" {...strokeProps} />
                    <path d="M26 24 L26 18 L34 18 L34 24" {...strokeProps} />
                    <path d="M40 24 L40 18 L52 18 L52 24" {...strokeProps} />
                    <path d="M24 56 L24 38 C24 32, 40 32, 40 38 L40 56" {...strokeProps} />
                    <path d="M26 56 L26 40 C26 36, 38 36, 38 40 L38 56" strokeWidth="1" />
                    <line x1="12" y1="48" x2="24" y2="48" strokeWidth="0.5" />
                    <line x1="40" y1="48" x2="52" y2="48" strokeWidth="0.5" />
                    <line x1="16" y1="40" x2="24" y2="40" strokeWidth="0.5" />
                    <line x1="40" y1="40" x2="48" y2="40" strokeWidth="0.5" />
                    <path d="M16 18 L16 10 L22 12 L16 14" strokeWidth="1" />
                    <path d="M46 18 L46 10 L52 12 L46 14" strokeWidth="1" />
                </svg>
            );
        case 'temple_bengal':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M10 56 L54 56 L52 40 L12 40 Z" {...strokeProps} />
                    <path d="M16 40 L48 40 L46 26 L18 26 Z" {...strokeProps} />
                    <path d="M22 26 L42 26 L40 16 L24 16 Z" {...strokeProps} />
                    <path d="M24 16 L26 6 L28 16" {...strokeProps} />
                    <path d="M30 16 L32 6 L34 16" {...strokeProps} />
                    <path d="M36 16 L38 6 L40 16" {...strokeProps} />
                    <path d="M26 56 L26 46 C26 44, 38 44, 38 46 L38 56" {...strokeProps} />
                    <path d="M20 56 L20 48 M44 56 L44 48" strokeWidth="1" />
                    <path d="M28 40 L28 32 M36 40 L36 32" strokeWidth="1" />
                    <line x1="12" y1="43" x2="52" y2="43" strokeWidth="0.5" />
                    <line x1="18" y1="29" x2="46" y2="29" strokeWidth="0.5" />
                </svg>
            );
        case 'vidhana_soudha':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="2" y="52" width="60" height="4" strokeWidth="1" />
                    <rect x="6" y="28" width="52" height="24" {...strokeProps} />
                    <rect x="24" y="28" width="16" height="24" {...strokeProps} />
                    <line x1="28" y1="28" x2="28" y2="52" strokeWidth="1" />
                    <line x1="32" y1="28" x2="32" y2="52" strokeWidth="1" />
                    <line x1="36" y1="28" x2="36" y2="52" strokeWidth="1" />
                    <path d="M24 28 L24 22 L28 16 L32 12 L36 16 L40 22 L40 28" {...strokeProps} />
                    <line x1="32" y1="12" x2="32" y2="8" strokeWidth="1.5" />
                    <path d="M8 28 L8 24 L12 20 L16 24 L16 28" strokeWidth="1" />
                    <path d="M48 28 L48 24 L52 20 L56 24 L56 28" strokeWidth="1" />
                    <rect x="10" y="32" width="4" height="6" strokeWidth="0.5" />
                    <rect x="18" y="32" width="4" height="6" strokeWidth="0.5" />
                    <rect x="42" y="32" width="4" height="6" strokeWidth="0.5" />
                    <rect x="50" y="32" width="4" height="6" strokeWidth="0.5" />
                </svg>
            );
        case 'carpet':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="14" y="6" width="36" height="52" {...strokeProps} />
                    <rect x="18" y="10" width="28" height="44" strokeWidth="0.5" />
                    <path d="M32 10 L32 54" strokeWidth="0.5" strokeDasharray="2 2" />
                    <path d="M18 32 L46 32" strokeWidth="0.5" strokeDasharray="2 2" />
                    <circle cx="32" cy="32" r="6" strokeWidth="1" />
                    <path d="M18 10 L24 16 M46 10 L40 16 M18 54 L24 48 M46 54 L40 48" strokeWidth="0.5" />
                    <path d="M14 6 L14 2 M18 6 L18 2 M22 6 L22 2 M26 6 L26 2 M30 6 L30 2 M34 6 L34 2 M38 6 L38 2 M42 6 L42 2 M46 6 L46 2 M50 6 L50 2" strokeWidth="1" />
                    <path d="M14 58 L14 62 M18 58 L18 62 M22 58 L22 62 M26 58 L26 62 M30 58 L30 62 M34 58 L34 62 M38 58 L38 62 M42 58 L42 62 M46 58 L46 62 M50 58 L50 62" strokeWidth="1" />
                </svg>
            );
        case 'temple_kalinga':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M18 56 L22 20 L32 8 L42 20 L46 56 Z" {...strokeProps} />
                    <line x1="20" y1="30" x2="44" y2="30" strokeWidth="0.5" />
                    <line x1="19" y1="40" x2="45" y2="40" strokeWidth="0.5" />
                    <line x1="18" y1="50" x2="46" y2="50" strokeWidth="0.5" />
                    <path d="M46 56 L46 36 L56 28 L56 56 Z" {...strokeProps} />
                    <line x1="46" y1="42" x2="56" y2="36" strokeWidth="0.5" />
                    <line x1="46" y1="48" x2="56" y2="42" strokeWidth="0.5" />
                    <circle cx="32" cy="8" r="2" strokeWidth="1" />
                    <path d="M32 6 L32 2" strokeWidth="1" />
                    <path d="M32 2 L38 4 L32 6" strokeWidth="1" />
                </svg>
            );
        case 'marine_drive':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M2 50 C16 40, 40 40, 62 50" strokeWidth="2" />
                    <path d="M2 56 C16 46, 40 46, 62 56" strokeWidth="2" />
                    <line x1="10" y1="45" x2="10" y2="20" strokeWidth="1" />
                    <path d="M10 20 L14 16" strokeWidth="1" />
                    <circle cx="14" cy="16" r="1.5" />
                    <line x1="32" y1="42" x2="32" y2="18" strokeWidth="1" />
                    <path d="M32 18 L36 14" strokeWidth="1" />
                    <circle cx="36" cy="14" r="1.5" />
                    <line x1="54" y1="45" x2="54" y2="20" strokeWidth="1" />
                    <path d="M54 20 L58 16" strokeWidth="1" />
                    <circle cx="58" cy="16" r="1.5" />
                    <rect x="20" y="38" width="6" height="8" strokeWidth="0.5" />
                    <rect x="38" y="36" width="8" height="10" strokeWidth="0.5" />
                </svg>
            );
        case 'bandel_church':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="24" y="32" width="16" height="24" {...strokeProps} />
                    <rect x="26" y="16" width="12" height="16" {...strokeProps} />
                    <path d="M26 16 L32 6 L38 16" {...strokeProps} />
                    <line x1="32" y1="6" x2="32" y2="2" strokeWidth="1.5" />
                    <line x1="29" y1="4" x2="35" y2="4" strokeWidth="1.5" />
                    <rect x="14" y="44" width="10" height="12" {...strokeProps} />
                    <rect x="40" y="44" width="10" height="12" {...strokeProps} />
                    <circle cx="32" cy="24" r="3" strokeWidth="1" />
                    <path d="M28 56 L28 48 C28 46, 36 46, 36 48 L36 56" strokeWidth="1" />
                </svg>
            );
        case 'howrah_bridge':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <line x1="2" y1="56" x2="62" y2="56" strokeWidth="2" />
                    <path d="M12 56 L16 16 L22 16 L18 56" {...strokeProps} />
                    <path d="M52 56 L48 16 L42 16 L46 56" {...strokeProps} />
                    <path d="M16 16 L32 26 L48 16" fill="none" strokeWidth="1.5" />
                    <path d="M16 26 L48 26" strokeWidth="1" />
                    <line x1="22" y1="16" x2="22" y2="56" strokeWidth="0.5" />
                    <line x1="42" y1="16" x2="42" y2="56" strokeWidth="0.5" />
                    <line x1="28" y1="24" x2="28" y2="56" strokeWidth="0.5" />
                    <line x1="36" y1="24" x2="36" y2="56" strokeWidth="0.5" />
                    <path d="M16 16 L22 26 M22 16 L16 26" strokeWidth="0.5" />
                    <path d="M48 16 L42 26 M42 16 L48 26" strokeWidth="0.5" />
                </svg>
            );
        case 'charminar':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="16" y="24" width="32" height="32" {...strokeProps} />
                    <rect x="12" y="8" width="4" height="48" {...strokeProps} />
                    <path d="M10 8 L18 8 L14 2 Z" strokeWidth="1" />
                    <rect x="48" y="8" width="4" height="48" {...strokeProps} />
                    <path d="M46 8 L54 8 L50 2 Z" strokeWidth="1" />
                    <path d="M24 56 L24 40 C24 35, 40 35, 40 40 L40 56" {...strokeProps} />
                    <line x1="12" y1="20" x2="16" y2="20" strokeWidth="1" />
                    <line x1="48" y1="20" x2="52" y2="20" strokeWidth="1" />
                    <rect x="22" y="14" width="20" height="10" strokeWidth="1" />
                    <path d="M22 14 L32 8 L42 14" strokeWidth="1" />
                </svg>
            );
        case 'arch_dam':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M12 12 L16 56" strokeWidth="2" />
                    <path d="M52 12 L48 56" strokeWidth="2" />
                    <path d="M16 56 Q 32 60 48 56" strokeWidth="2" />
                    <path d="M12 12 Q 32 20 52 12" strokeWidth="1.5" />
                    <path d="M14 26 Q 32 34 50 26" strokeWidth="0.5" />
                    <path d="M15 40 Q 32 48 49 40" strokeWidth="0.5" />
                    <path d="M20 58 L20 62 M32 58 L32 64 M44 58 L44 62" strokeWidth="1" />
                </svg>
            );
        case 'fort_water': // Lakhota Fort
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M10 44 C10 52, 54 52, 54 44" {...strokeProps} />
                    <rect x="18" y="24" width="28" height="20" {...strokeProps} />
                    <path d="M18 24 L24 16 L40 16 L46 24" {...strokeProps} />
                    <rect x="28" y="12" width="8" height="4" strokeWidth="1" />
                    <rect x="22" y="30" width="4" height="6" strokeWidth="0.5" />
                    <rect x="38" y="30" width="4" height="6" strokeWidth="0.5" />
                    <path d="M4 52 C12 50, 24 50, 32 52 S 52 54, 60 52" strokeWidth="1" />
                    <path d="M8 58 C18 56, 30 56, 42 58" strokeWidth="1" />
                </svg>
            );
        case 'temple_gopuram':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M16 56 L24 12 L40 12 L48 56 Z" {...strokeProps} />
                    <line x1="18" y1="46" x2="46" y2="46" strokeWidth="1" />
                    <line x1="20" y1="36" x2="44" y2="36" strokeWidth="1" />
                    <line x1="22" y1="26" x2="42" y2="26" strokeWidth="1" />
                    <line x1="23" y1="18" x2="41" y2="18" strokeWidth="1" />
                    <path d="M26 12 L26 8 L38 8 L38 12" strokeWidth="1" />
                    <circle cx="32" cy="6" r="2" strokeWidth="1" />
                    <rect x="28" y="48" width="8" height="8" strokeWidth="1" />
                </svg>
            );
        case 'lake_generic':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M40 32 L52 16 L64 32" {...strokeProps} />
                    <path d="M16 32 L24 20 L32 32" {...strokeProps} />
                    <circle cx="32" cy="12" r="5" strokeWidth="1.5" />
                    <path d="M4 40 Q 20 36 36 40 T 60 40" strokeWidth="1" />
                    <path d="M8 48 Q 24 44 40 48 T 64 48" strokeWidth="1" />
                </svg>
            );
        case 'beach_generic':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M34 50 L36 16 L44 16 L46 50" {...strokeProps} />
                    <rect x="34" y="10" width="12" height="6" {...strokeProps} />
                    <path d="M36 10 L40 2 L44 10" strokeWidth="1" />
                    <line x1="30" y1="6" x2="18" y2="6" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="50" y1="6" x2="62" y2="6" strokeWidth="1" strokeDasharray="2 2" />
                    <path d="M2 56 Q 16 52 30 56 T 58 56" strokeWidth="1" />
                    <path d="M0 60 L64 60" strokeWidth="1" />
                </svg>
            );
        case 'bara_imambara':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="4" y="32" width="56" height="24" {...strokeProps} />
                    <path d="M26 56 L26 40 C26 36, 38 36, 38 40 L38 56" {...strokeProps} />
                    <path d="M10 56 L10 44 C10 42, 16 42, 16 44 L16 56" strokeWidth="1" />
                    <path d="M48 56 L48 44 C48 42, 54 42, 54 44 L54 56" strokeWidth="1" />
                    <line x1="4" y1="36" x2="60" y2="36" strokeWidth="0.5" />
                    <path d="M26 32 C26 24, 38 24, 38 32" strokeWidth="1.5" />
                    <path d="M12 32 C12 28, 18 28, 18 32" strokeWidth="1" />
                    <path d="M46 32 C46 28, 52 28, 52 32" strokeWidth="1" />
                </svg>
            );
        case 'hill_park':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M2 56 L24 24 L46 56" {...strokeProps} />
                    <path d="M30 56 L46 32 L62 56" {...strokeProps} />
                    <path d="M24 56 Q 30 48 26 42" strokeWidth="1" strokeDasharray="1 1" />
                    <path d="M14 46 L14 42 L18 46 M14 42 L14 38" strokeWidth="1" />
                </svg>
            );
        case 'gateway_of_india':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="8" y="24" width="48" height="32" {...strokeProps} />
                    <path d="M22 56 L22 36 C22 30, 42 30, 42 36 L42 56" {...strokeProps} />
                    <rect x="8" y="16" width="48" height="8" {...strokeProps} />
                    <rect x="6" y="12" width="4" height="4" strokeWidth="1" />
                    <rect x="54" y="12" width="4" height="4" strokeWidth="1" />
                    <rect x="18" y="12" width="4" height="4" strokeWidth="1" />
                    <rect x="42" y="12" width="4" height="4" strokeWidth="1" />
                    <line x1="6" y1="12" x2="6" y2="8" strokeWidth="1" />
                    <line x1="58" y1="12" x2="58" y2="8" strokeWidth="1" />
                </svg>
            );
        case 'rockfort':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M8 56 C20 40, 20 20, 32 16 C44 20, 44 40, 56 56" {...strokeProps} />
                    <rect x="28" y="10" width="8" height="6" strokeWidth="1" />
                    <path d="M28 10 L32 4 L36 10" strokeWidth="1" />
                    <path d="M36 56 Q 40 40 36 20" strokeWidth="0.5" strokeDasharray="1 2" />
                </svg>
            );
        case 'golghar':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M12 56 C12 24, 52 24, 52 56" {...strokeProps} />
                    <rect x="30" y="22" width="4" height="4" strokeWidth="1" />
                    <path d="M12 56 C14 45, 20 38, 32 34" strokeWidth="1" strokeDasharray="1 1" />
                    <path d="M52 56 C50 45, 44 38, 32 34" strokeWidth="1" strokeDasharray="1 1" />
                </svg>
            );
        case 'shaniwar_wada':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="6" y="28" width="52" height="28" {...strokeProps} />
                    <path d="M24 56 L24 40 C24 36, 40 36, 40 40 L40 56" {...strokeProps} />
                    <line x1="24" y1="42" x2="24" y2="50" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="40" y1="42" x2="40" y2="50" strokeWidth="1" strokeDasharray="2 2" />
                    <rect x="2" y="20" width="8" height="36" {...strokeProps} />
                    <rect x="54" y="20" width="8" height="36" {...strokeProps} />
                    <path d="M2 20 L6 16 L10 20" strokeWidth="1" />
                    <path d="M54 20 L58 16 L62 20" strokeWidth="1" />
                </svg>
            );
        case 'waterfall':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M8 20 L20 20 L24 28 L56 24 L60 20" strokeWidth="1.5" />
                    <path d="M20 20 L20 56" strokeWidth="1.5" />
                    <path d="M56 24 L56 56" strokeWidth="1.5" />
                    <path d="M28 28 L28 54" strokeWidth="1" />
                    <path d="M34 26 L34 54" strokeWidth="1" />
                    <path d="M40 26 L40 54" strokeWidth="1" />
                    <path d="M48 24 L48 54" strokeWidth="1" />
                    <path d="M24 56 Q 38 60 52 56" strokeWidth="1" />
                </svg>
            );
        case 'temple_kerala':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M12 40 L32 28 L52 40" {...strokeProps} />
                    <path d="M20 26 L32 18 L44 26" {...strokeProps} />
                    <rect x="16" y="40" width="32" height="16" {...strokeProps} />
                    <rect x="28" y="46" width="8" height="10" strokeWidth="1" />
                </svg>
            );
        case 'temple_padmanabhaswamy':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="6" y="42" width="52" height="14" {...strokeProps} />
                    <path d="M10 42 L14 14 L50 14 L54 42 Z" {...strokeProps} />
                    <path d="M18 14 L22 6 L42 6 L46 14 Z" {...strokeProps} />
                    <line x1="32" y1="6" x2="32" y2="42" strokeWidth="0.5" />
                    <line x1="24" y1="14" x2="24" y2="42" strokeWidth="0.5" />
                    <line x1="40" y1="14" x2="40" y2="42" strokeWidth="0.5" />
                    <rect x="28" y="24" width="8" height="6" strokeWidth="0.5" />
                </svg>
            );
        case 'cactus_garden': // Cactus
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M32 56 L32 24 C32 18, 38 18, 38 24" strokeWidth="2" strokeLinecap="round" />
                    <path d="M32 40 L26 40 C22 40, 22 32, 26 32" strokeWidth="2" strokeLinecap="round" />
                    <path d="M32 30 L40 30 C44 30, 44 38, 40 38" strokeWidth="2" strokeLinecap="round" />
                    <path d="M16 56 L48 56 L46 62 L18 62 Z" {...strokeProps} />
                    <line x1="32" y1="28" x2="34" y2="28" strokeWidth="0.5" />
                    <line x1="32" y1="36" x2="30" y2="36" strokeWidth="0.5" />
                </svg>
            );
        case 'beach_rk':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M8 38 C4 38, 4 46, 12 46 L52 46 C58 46, 58 38, 52 38 Z" {...strokeProps} />
                    <rect x="26" y="28" width="10" height="10" {...strokeProps} />
                    <line x1="31" y1="28" x2="31" y2="22" strokeWidth="2" />
                    <rect x="28" y="20" width="6" height="2" strokeWidth="1" />
                    <path d="M4 52 Q 16 48 28 52 T 52 52" strokeWidth="1" />
                </svg>
            );
        case 'temple_hill':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <path d="M6 56 Q 32 32 58 56" {...strokeProps} />
                    <rect x="28" y="22" width="8" height="6" strokeWidth="1" />
                    <path d="M28 22 L32 16 L36 22" strokeWidth="1" />
                    <path d="M32 56 L32 28" strokeWidth="0.5" strokeDasharray="1 2" />
                </svg>
            );
        case 'fort_moat':
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <rect x="14" y="24" width="36" height="20" {...strokeProps} />
                    <path d="M14 24 L14 18 L20 18 L20 24" strokeWidth="1" />
                    <path d="M26 24 L26 18 L32 18 L32 24" strokeWidth="1" />
                    <path d="M38 24 L38 18 L44 18 L44 24" strokeWidth="1" />
                    <path d="M4 50 C14 48, 50 48, 60 50" strokeWidth="1" />
                    <path d="M8 56 C18 54, 46 54, 56 56" strokeWidth="1" />
                </svg>
            );
        default:
            return (
                <svg viewBox="0 0 64 64" fill="none" stroke={strokeColor} className={className}>
                    <circle cx="32" cy="32" r="20" strokeWidth="1.5" />
                    <path d="M32 12 L32 52 M12 32 L52 32" strokeWidth="1.5" />
                </svg>
            );
    }
};