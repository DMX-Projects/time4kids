'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { gsap } from 'gsap';
import { MapPin, Phone, Search, Navigation, Star, Sun, Facebook, Instagram, Youtube } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { slugify, cn, franchisePublicLocationLine } from '@/lib/utils';
import { apiUrl } from '@/lib/api-client';
import { fetchAllPublicFranchises } from '@/lib/public-franchises';
import { CentreMap } from '@/components/shared/CentreMap';

export const dynamic = 'force-dynamic';

// --- 1. Interactive Bubbles ---
const InteractiveBubbles = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const bubbles: HTMLDivElement[] = [];
        const bubbleCount = 15;
        const colors = ['bg-pink-300', 'bg-purple-300', 'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 'bg-orange-300'];

        for (let i = 0; i < bubbleCount; i++) {
            const bubble = document.createElement('div');
            const size = Math.random() * 30 + 10;
            const color = colors[Math.floor(Math.random() * colors.length)];

            bubble.className = `absolute rounded-full opacity-30 mix-blend-multiply filter blur-[1px] ${color} pointer-events-auto cursor-pointer transition-transform duration-300 hover:scale-110 shadow-sm border border-slate-100/30 backdrop-blur-[1px]`;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;
            bubble.style.left = `${Math.random() * 100}%`;
            bubble.style.top = `${Math.random() * 100}%`;
            container.appendChild(bubble);
            bubbles.push(bubble);
            gsap.to(bubble, { y: `-=${Math.random() * 200 + 50}`, x: `+=${Math.random() * 50 - 25}`, rotation: Math.random() * 360, duration: Math.random() * 10 + 10, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: Math.random() * 5 });
        }
        return () => { bubbles.forEach(b => b.remove()); };
    }, []);
    return <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none overflow-hidden" suppressHydrationWarning />;
};

// --- Types ---
interface State {
    code: string;
    name: string;
}

interface Centre {
    id: number;
    name: string;
    slug?: string;
    address: string;
    city: string;
    state: string;
    postal_code?: string;
    phone: string;
    googleMapLink?: string;
    socials?: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
    };
    color: string;
    borderColor: string;
    bgColor: string;
    shape: string;
    rotate: string;
}

function LocateCentreContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const cityFromUrl = searchParams.get('city');
    const stateFromUrl = searchParams.get('state');

    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

    // Initialize state from URL params to ensure first fetch is filtered
    const [selectedState, setSelectedState] = useState(stateFromUrl || '');
    const [selectedCity, setSelectedCity] = useState(cityFromUrl || '');

    const [states, setStates] = useState<State[]>([]);
    const [centres, setCentres] = useState<Centre[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Debounce search term (500ms delay)
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch states from backend
    useEffect(() => {
        const fetchStates = async () => {
            try {
                const response = await fetch(apiUrl('/franchises/state-choices/'));
                const data = await response.json();
                setStates(data);
            } catch (error) {
                console.error('Error fetching states:', error);
            }
        };
        fetchStates();
    }, []);

    // Fetch franchises with filters
    useEffect(() => {
        const fetchCentres = async () => {
            const STYLE_PRESETS = [
                { color: 'bg-pink-100 text-pink-600', bgColor: 'bg-pink-50/50', borderColor: 'border-pink-300', shape: 'rounded-[40%_60%_70%_30%_/_50%_60%_40%_50%]', rotate: '-rotate-1' },
                { color: 'bg-blue-100 text-blue-600', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-300', shape: 'rounded-[60%_40%_30%_70%_/_50%_40%_60%_50%]', rotate: 'rotate-1' },
                { color: 'bg-green-100 text-green-600', bgColor: 'bg-green-50/50', borderColor: 'border-green-300', shape: 'rounded-[30%_70%_70%_30%_/_40%_50%_50%_60%]', rotate: '-rotate-2' },
                { color: 'bg-yellow-100 text-yellow-700', bgColor: 'bg-yellow-50/50', borderColor: 'border-yellow-400', shape: 'rounded-[70%_30%_30%_70%_/_60%_40%_60%_40%]', rotate: 'rotate-2' },
                { color: 'bg-purple-100 text-purple-600', bgColor: 'bg-purple-50/50', borderColor: 'border-purple-300', shape: 'rounded-[40%_60%_60%_40%_/_40%_60%_40%_60%]', rotate: '-rotate-1' },
                { color: 'bg-orange-100 text-orange-600', bgColor: 'bg-orange-50/50', borderColor: 'border-orange-300', shape: 'rounded-[70%_30%_30%_70%_/_50%_50%_50%_50%]', rotate: 'rotate-1' },
                { color: 'bg-red-100 text-red-600', bgColor: 'bg-red-50/50', borderColor: 'border-red-300', shape: 'rounded-[50%_50%_70%_30%_/_40%_50%_60%_50%]', rotate: '-rotate-2' },
                { color: 'bg-teal-100 text-teal-600', bgColor: 'bg-teal-50/50', borderColor: 'border-teal-300', shape: 'rounded-[60%_40%_40%_60%_/_50%_40%_60%_50%]', rotate: 'rotate-2' },
            ];

            try {
                setIsLoading(true);
                setIsSearching(true);

                // Build query parameters — city alone is enough (state is for the dropdown only)
                const queryParams = new URLSearchParams();
                if (selectedCity) {
                    queryParams.set('city', selectedCity);
                } else if (selectedState) {
                    queryParams.set('state', selectedState);
                }

                // Only search if 3+ characters or empty (show all)
                if (debouncedSearchTerm) {
                    if (debouncedSearchTerm.length >= 3) {
                        queryParams.set('search', debouncedSearchTerm);
                    }
                }

                const url = queryParams.toString()
                    ? apiUrl(`/franchises/public/?${queryParams}`)
                    : apiUrl('/franchises/public/');

                const data = await fetchAllPublicFranchises(url);

                const mappedCentres = data.map((item: any, index: number) => {
                    const style = STYLE_PRESETS[index % STYLE_PRESETS.length];

                    // Temporary override for Banashankari
                    let address = item.address;
                    let city = item.city;
                    let state = item.state;
                    let postal_code = item.postal_code;

                    if (item.name.includes("Banashankari")) {
                        address = "#491, Shambavi, 10th Cross Road, Vaddarapalya, Banashankari 5th Stage, Bengaluru - 560 0061. Karnataka.";
                        // Prevent duplicates in formatAddress
                        // We leave city/state for the badge, but might need to trick formatAddress?
                        // formatAddress uses the centre object passed to it.
                        // We can just rely on intelligent duplicate checking or accept one specific duplicate.
                        // Providing the full address in 'address' is best.
                    }

                    return {
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        address: address,
                        city: city,
                        state: state,
                        postal_code: postal_code,
                        phone: item.contact_phone || item.phone,
                        googleMapLink: item.google_map_link,
                        latitude: item.latitude ? parseFloat(item.latitude) : null,
                        longitude: item.longitude ? parseFloat(item.longitude) : null,
                        socials: {
                            facebook: item.facebook_url,
                            instagram: item.instagram_url,
                            twitter: item.twitter_url,
                            linkedin: item.linkedin_url,
                            youtube: item.youtube_url,
                        },
                        ...style
                    };
                });

                setCentres(mappedCentres);
            } catch (error) {
                console.error('Error fetching centres:', error);
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        };

        fetchCentres();
    }, [selectedState, selectedCity, debouncedSearchTerm, searchTerm]);

    // Handle URL parameters  
    useEffect(() => {
        if (stateFromUrl) setSelectedState(stateFromUrl);
        if (cityFromUrl) setSelectedCity(cityFromUrl);
    }, [stateFromUrl, cityFromUrl]);

    const [availableLocations, setAvailableLocations] = useState<
        { city_name: string; state: string; state_display?: string; franchise_count?: number }[]
    >([]);

    // Fetch available locations for dropdowns
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await fetch(apiUrl('/franchises/public/locations/'));
                const data = await response.json();
                setAvailableLocations(data);
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    // Helper to format city names (Title Case)
    const toTitleCase = (str: string) => {
        return str.replace(/\w\S*/g, (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };

    const selectedStateName = states.find((s) => s.code === selectedState)?.name?.toLowerCase();

    // All cities in the selected state (no cap)
    const cities = Array.from(
        new Set(
            availableLocations
                .filter((loc) => {
                    if (!selectedState) return true;
                    const code = (loc.state || '').toLowerCase();
                    const display = (loc.state_display || '').toLowerCase();
                    const sel = selectedState.toLowerCase();
                    return (
                        code === sel ||
                        display === sel ||
                        (selectedStateName && (display === selectedStateName || code === selectedStateName))
                    );
                })
                .map((loc) => loc.city_name)
                .filter(Boolean),
        ),
    ).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    // Handle state change - reset city
    const handleStateChange = (newState: string) => {
        setSelectedState(newState);
        setSelectedCity(''); // Reset city when state changes
    };

    const displayedCentres = centres;

    // Helper to format full address
    const formatAddress = (centre: Centre) => {
        // If address already looks complete (has state/pin), return it as is
        if (centre.address.includes("Bengaluru") || centre.address.includes("Karnataka")) {
            return centre.address;
        }

        const parts = [centre.address];

        // Add City if not present
        if (centre.city && !centre.address?.toLowerCase().includes(centre.city.toLowerCase())) {
            parts.push(centre.city);
        }

        // Add State if not present
        if (centre.state && !centre.address?.toLowerCase().includes(centre.state.toLowerCase())) {
            parts.push(centre.state);
        }

        // Add Postal Code if not present
        if (centre.postal_code && !centre.address?.includes(centre.postal_code)) {
            parts.push(`${centre.postal_code}`); // Just pin code, sometimes displayed with hyphen
        }

        return parts.filter(Boolean).join(', ');
    };

    const centreAddressHasHtml = (text: string) => /<\/?[a-z][\s\S]*>/i.test(text);

    const sanitizeCentreAddressHtml = (text: string) =>
        text.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

    return (
        <div className="min-h-screen relative bg-slate-50 font-sans selection:bg-pink-200 overflow-x-hidden">
            <InteractiveBubbles />

            {/* Hero Section */}
            <section className="relative pt-24 pb-12 z-10 text-center md:pt-28">
                <div className="absolute top-10 right-10 animate-bounce-slow opacity-60 hidden md:block"><Star className="text-yellow-400 w-12 h-12 fill-current" /></div>
                <div className="absolute top-20 left-10 animate-pulse opacity-60 hidden md:block"><Sun className="text-orange-400 w-16 h-16" /></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-2 rounded-full shadow-sm mb-6 border border-slate-200 hover:scale-110 transition-transform cursor-pointer animate-float">
                        <Navigation className="w-5 h-5 text-green-500 animate-pulse" />
                        <span className="font-bold text-slate-600 tracking-wide uppercase text-sm">Find Your School</span>
                    </div>

                    <h1 className="font-display font-black text-4xl md:text-6xl mb-6 tracking-tight leading-tight">
                        <span className="text-slate-800">Locate a </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 drop-shadow-sm filter">
                            Centre
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
                        Find the nearest <span className="font-bold text-blue-500">T.I.M.E. Kids</span> preschool in your area and visit us today!
                    </p>
                </div>
            </section>

            {/* Search Filters Section */}
            <section className="relative z-20 pb-12">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto bg-white p-5 sm:p-8 md:p-10 rounded-[2rem] sm:rounded-[50px] border-4 border-slate-100 shadow-xl relative transition-all duration-300 md:hover:scale-[1.01]">
                        <div className="absolute -top-6 -left-6 w-16 h-16 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                        <div className="grid md:grid-cols-4 gap-6 relative z-10 items-center">
                            <div className="md:col-span-2 relative group">
                                <Search className={cn(
                                    "absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors",
                                    isSearching ? "text-blue-500 animate-pulse" : "text-slate-400 group-hover:text-blue-500"
                                )} />
                                <input
                                    type="text"
                                    placeholder="Search by name, city, or area..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm hover:shadow-md"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
                                        title="Clear search"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                                {searchTerm && searchTerm.length < 3 && (
                                    <div className="absolute left-0 -bottom-6 text-xs text-amber-600 font-medium">
                                        ⚠️ Type at least 3 characters to search
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => handleStateChange(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                >
                                    <option value="">All States</option>
                                    {states.map(state => <option key={state.code} value={state.code}>{state.name}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-purple-400 focus:bg-white transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                    disabled={!selectedState && cities.length === 0}
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => <option key={city} value={city}>{toTitleCase(city)}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div className="mt-8 text-center flex flex-col md:flex-row justify-center items-center gap-4">
                            <span className={cn(
                                "inline-block px-4 py-1 rounded-full text-sm font-bold border transition-all",
                                isSearching
                                    ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                                {isSearching ? '🔍 Searching...' : `Found ${centres.length} centre${centres.length !== 1 ? 's' : ''}`}
                            </span>
                            
                            <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200">
                                <button 
                                    onClick={() => setViewMode('list')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                                        viewMode === 'list' 
                                            ? "bg-white text-orange-600 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    List View
                                </button>
                                <button 
                                    onClick={() => setViewMode('map')}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-bold transition-all",
                                        viewMode === 'map' 
                                            ? "bg-white text-orange-600 shadow-sm" 
                                            : "text-slate-500 hover:text-slate-700"
                                    )}
                                >
                                    Map View
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Grid */}
            <section className="py-12 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20 min-h-[300px]">
                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-400"></div>
                            </div>
                        ) : displayedCentres.length > 0 ? (
                            viewMode === 'map' ? (
                                <CentreMap centres={displayedCentres as any} />
                            ) : (
                            <div className="mx-auto grid w-full max-w-6xl grid-cols-1 justify-items-center gap-8 sm:gap-8 md:grid-cols-2 md:justify-items-stretch md:gap-10 lg:gap-14">
                                {displayedCentres.map((centre) => {
                                    const displayName =
                                        franchisePublicLocationLine(centre.name, {
                                            city: centre.city,
                                            state: centre.state,
                                        }) || centre.name;
                                    const blobShape = centre.shape;
                                    const addressText = formatAddress(centre);
                                    const addressIsHtml = centreAddressHasHtml(addressText);

                                    return (
                                    <div
                                        key={centre.id}
                                        onClick={() => router.push(`/locations/${encodeURIComponent(centre.city)}/${centre.slug ?? slugify(centre.name)}`)}
                                        className={cn(
                                            'group relative w-full max-w-[min(100%,22rem)] cursor-pointer transition-all duration-300 sm:max-w-full',
                                            centre.rotate,
                                            'max-sm:rotate-0 hover:scale-[1.01] sm:hover:scale-[1.03] hover:z-20',
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                'absolute top-2 left-2 right-2 bottom-2 sm:top-3 sm:left-3 sm:right-0 sm:bottom-0',
                                                centre.color.split(' ')[0].replace('100', '200'),
                                                blobShape,
                                                'opacity-100 -z-10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:translate-y-0.5 sm:group-hover:translate-x-1 sm:group-hover:translate-y-1',
                                            )}
                                        />
                                        <div
                                            className={cn(
                                                'relative box-border w-full overflow-hidden',
                                                centre.bgColor,
                                                blobShape,
                                                'px-5 pt-7 pb-14 sm:px-8 sm:pt-8 sm:pb-12 md:p-10 lg:p-12',
                                                'min-h-[19rem] sm:min-h-[17.5rem] md:min-h-0',
                                                'border-[3px] shadow-sm sm:border-4',
                                                centre.borderColor,
                                                'flex flex-col justify-center',
                                            )}
                                        >
                                            <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-start sm:gap-5 sm:text-left md:gap-6">
                                                <div
                                                    className={cn(
                                                        'flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-500 group-hover:rotate-12 sm:h-14 sm:w-14 md:h-16 md:w-16',
                                                        'border-2',
                                                        centre.borderColor,
                                                    )}
                                                >
                                                    <MapPin className={cn('h-5 w-5 sm:h-7 sm:w-7 md:h-8 md:w-8', centre.color.split(' ')[1])} />
                                                </div>
                                                <div className="min-w-0 w-full flex-1">
                                                    <h3 className="font-display mb-2 break-words text-lg font-black leading-tight text-slate-800 transition-colors group-hover:text-pink-600 sm:text-2xl">
                                                        {displayName}
                                                    </h3>
                                                    {addressIsHtml ? (
                                                        <p
                                                            className="mb-3 break-words text-sm font-medium leading-relaxed text-slate-600 [overflow-wrap:anywhere] sm:text-base [&_sup]:align-super [&_sup]:text-[0.7em]"
                                                            dangerouslySetInnerHTML={{ __html: sanitizeCentreAddressHtml(addressText) }}
                                                        />
                                                    ) : (
                                                        <p className="mb-3 break-words text-sm font-medium leading-relaxed text-slate-600 [overflow-wrap:anywhere] sm:text-base">
                                                            {addressText}
                                                        </p>
                                                    )}
                                                    <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:mb-4 sm:justify-start">
                                                        <span className="rounded-full border border-white/50 bg-white/80 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-600 shadow-sm">
                                                            {centre.city}
                                                        </span>
                                                    </div>
                                                    <div className="flex w-full min-w-0 flex-col items-center gap-2 sm:items-start">
                                                        <div className="flex max-w-full flex-wrap justify-center gap-2 sm:justify-start">
                                                        {centre.phone?.trim() ? (
                                                        <a
                                                            href={`tel:${centre.phone.replace(/[^\d+]/g, '')}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-2 text-xs font-bold text-white shadow-md transition-all hover:bg-slate-700 hover:shadow-lg sm:px-4 sm:group-hover:scale-105"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            Call
                                                        </a>
                                                        ) : null}
                                                        {centre.googleMapLink && (
                                                            <a
                                                                href={centre.googleMapLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-600 shadow-sm transition-all hover:bg-blue-100 hover:shadow-md sm:px-4 sm:group-hover:scale-105"
                                                            >
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                Map
                                                            </a>
                                                        )}
                                                        {/* Socials */}
                                                        {centre.socials?.facebook && (
                                                            <a href={centre.socials.facebook} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition"><Facebook className="w-4 h-4" /></a>
                                                        )}
                                                        {centre.socials?.instagram && (
                                                            <a href={centre.socials.instagram} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 bg-pink-50 text-pink-600 rounded-full hover:bg-pink-100 transition"><Instagram className="w-4 h-4" /></a>
                                                        )}
                                                        {centre.socials?.youtube && (
                                                            <a href={centre.socials.youtube} target="_blank" onClick={(e) => e.stopPropagation()} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition"><Youtube className="w-4 h-4" /></a>
                                                        )}
                                                        </div>
                                                        {centre.phone?.trim() ? (
                                                            <a
                                                                href={`tel:${centre.phone.replace(/[^\d+]/g, '')}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="hidden max-w-full items-start gap-2 text-xs font-bold text-slate-700 transition-colors [overflow-wrap:anywhere] hover:text-pink-600 sm:inline-flex sm:text-sm"
                                                            >
                                                                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
                                                                <span className="min-w-0 break-all">{centre.phone}</span>
                                                            </a>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })}
                            </div>
                            )
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[30%_70%_70%_30%_/_30%_30%_70%_70%] border-4 border-slate-100 border-dashed max-w-2xl mx-auto">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                    <Search className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="font-display font-bold text-3xl text-slate-700 mb-2">Oops! No centres found.</h3>
                                <p className="text-slate-500 text-lg">Try searching for a different city or area.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section >
        </div >
    );
}

export default function LocateCentrePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-400"></div></div>}>
            <LocateCentreContent />
        </Suspense>
    );
}
