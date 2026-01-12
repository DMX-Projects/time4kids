'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MapPin, Phone, Search, Navigation, Star, Sun, Facebook, Instagram, Youtube } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { slugify, cn } from '@/lib/utils';
import { apiUrl } from '@/lib/api-client';

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

export default function LocateCentrePage() {
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
    const [allCentres, setAllCentres] = useState<Centre[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);

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

                // Build query parameters
                const queryParams = new URLSearchParams();
                if (selectedState) queryParams.set('state', selectedState);
                if (selectedCity) queryParams.set('city', selectedCity);

                // Only search if 3+ characters or empty (show all)
                if (debouncedSearchTerm) {
                    if (debouncedSearchTerm.length >= 3) {
                        queryParams.set('search', debouncedSearchTerm);
                    }
                }

                const url = queryParams.toString()
                    ? apiUrl(`/franchises/public/?${queryParams}`)
                    : apiUrl('/franchises/public/');

                const response = await fetch(url);
                if (!response.ok) throw new Error('Failed to fetch');

                const json = await response.json();
                const data = Array.isArray(json) ? json : json.results || [];

                const mappedCentres = data.map((item: any, index: number) => {
                    const style = STYLE_PRESETS[index % STYLE_PRESETS.length];
                    return {
                        id: item.id,
                        name: item.name,
                        slug: item.slug,
                        address: item.address,
                        city: item.city,
                        state: item.state,
                        phone: item.contact_phone || item.phone,
                        googleMapLink: item.google_map_link,
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
                if (!searchTerm && !selectedState && !selectedCity) {
                    setAllCentres(mappedCentres);
                }
            } catch (error) {
                console.error('Error fetching centres:', error);
            } finally {
                setIsLoading(false);
                setIsSearching(false);
            }
        };

        fetchCentres();
    }, [selectedState, selectedCity, debouncedSearchTerm]);

    // Handle URL parameters  
    useEffect(() => {
        if (stateFromUrl) setSelectedState(stateFromUrl);
        if (cityFromUrl) setSelectedCity(cityFromUrl);
    }, [stateFromUrl, cityFromUrl]);

    const [availableLocations, setAvailableLocations] = useState<{ city_name: string, state: string }[]>([]);

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

    // Get unique cities from available locations, filtered by state
    const cities = Array.from(new Set(
        availableLocations
            .filter(loc => !selectedState || loc.state === selectedState)
            .map(loc => loc.city_name)
    )).sort();

    // Handle state change - reset city
    const handleStateChange = (newState: string) => {
        setSelectedState(newState);
        setSelectedCity(''); // Reset city when state changes
    };

    return (
        <div className="min-h-screen relative bg-slate-50 font-sans selection:bg-pink-200 overflow-x-hidden">
            <InteractiveBubbles />

            {/* Hero Section */}
            <section className="relative pt-16 pb-12 z-10 text-center">
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
                    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[50px] border-4 border-slate-100 shadow-xl relative transition-all duration-300 hover:scale-[1.01]">
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
                        <div className="mt-8 text-center">
                            <span className={cn(
                                "inline-block px-4 py-1 rounded-full text-sm font-bold border transition-all",
                                isSearching
                                    ? "bg-blue-50 text-blue-600 border-blue-200 animate-pulse"
                                    : "bg-slate-50 text-slate-500 border-slate-200"
                            )}>
                                {isSearching ? '🔍 Searching...' : `Found ${centres.length} centre${centres.length !== 1 ? 's' : ''}`}
                            </span>
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
                        ) : centres.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
                                {centres.map((centre) => (
                                    <div
                                        key={centre.id}
                                        onClick={() => router.push(`/locations/${encodeURIComponent(centre.city)}/${centre.slug ?? slugify(centre.name)}`)}
                                        className={`group relative transition-all duration-300 transform ${centre.rotate} hover:scale-[1.03] hover:z-20 cursor-pointer`}
                                    >
                                        <div className={`absolute top-3 left-3 right-0 bottom-0 ${centre.color.split(' ')[0].replace('100', '200')} ${centre.shape} opacity-100 -z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1`}></div>
                                        <div className={`relative ${centre.bgColor} ${centre.shape} p-10 md:p-14 shadow-sm border-[4px] ${centre.borderColor} h-full flex flex-col justify-center min-h-[260px]`}>
                                            <div className="flex items-start gap-6">
                                                <div className={`w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm group-hover:rotate-12 transition-transform duration-500 border-2 ${centre.borderColor}`}>
                                                    <MapPin className={`w-8 h-8 ${centre.color.split(' ')[1]}`} />
                                                </div>
                                                <div className="flex-1 min-w-0 pt-1">
                                                    <h3 className="font-display font-black text-2xl mb-2 text-slate-800 group-hover:text-pink-600 transition-colors break-words leading-tight">
                                                        {centre.name}
                                                    </h3>
                                                    <p className="text-slate-600 font-medium text-base mb-3 leading-relaxed break-words">
                                                        {centre.address}
                                                    </p>
                                                    <div className="flex items-center gap-2 mb-5 flex-wrap">
                                                        <span className="bg-white/80 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide border border-white/50 shadow-sm">
                                                            {centre.city}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        <a
                                                            href={`tel:${centre.phone}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="inline-flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap group-hover:scale-105"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            call
                                                        </a>
                                                        {centre.googleMapLink && (
                                                            <a
                                                                href={centre.googleMapLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-full text-xs font-bold hover:bg-blue-100 transition-all shadow-sm hover:shadow-md whitespace-nowrap group-hover:scale-105"
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
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
