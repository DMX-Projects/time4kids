'use client';

import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { MapPin, Phone, Search, Navigation, Star, Sun } from 'lucide-react';

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
interface Centre {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    color: string;
    borderColor: string;
    bgColor: string; // New: Subtle background tint
    shape: string;
    rotate: string;
}

export default function LocateCentrePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // ENHANCED DATA: Added background tints and better border colors
    const centres: Centre[] = [
        { 
            id: 1, 
            name: 'T.I.M.E. Kids - Banjara Hills', 
            address: 'Road No. 12, Banjara Hills', 
            city: 'Hyderabad', 
            state: 'Telangana', 
            phone: '+91 40 1234 5678', 
            color: 'bg-pink-100 text-pink-600', 
            bgColor: 'bg-pink-50/50',
            borderColor: 'border-pink-300',
            shape: 'rounded-[40%_60%_70%_30%_/_50%_60%_40%_50%]', 
            rotate: '-rotate-1' 
        },
        { 
            id: 2, 
            name: 'T.I.M.E. Kids - Jubilee Hills', 
            address: 'Road No. 45, Jubilee Hills', 
            city: 'Hyderabad', 
            state: 'Telangana', 
            phone: '+91 40 2345 6789', 
            color: 'bg-blue-100 text-blue-600', 
            bgColor: 'bg-blue-50/50',
            borderColor: 'border-blue-300',
            shape: 'rounded-[60%_40%_30%_70%_/_50%_40%_60%_50%]', 
            rotate: 'rotate-1' 
        },
        { 
            id: 3, 
            name: 'T.I.M.E. Kids - Koramangala', 
            address: '5th Block, Koramangala', 
            city: 'Bangalore', 
            state: 'Karnataka', 
            phone: '+91 80 3456 7890', 
            color: 'bg-green-100 text-green-600', 
            bgColor: 'bg-green-50/50',
            borderColor: 'border-green-300',
            shape: 'rounded-[30%_70%_70%_30%_/_40%_50%_50%_60%]', 
            rotate: '-rotate-2' 
        },
        { 
            id: 4, 
            name: 'T.I.M.E. Kids - Indiranagar', 
            address: '100 Feet Road, Indiranagar', 
            city: 'Bangalore', 
            state: 'Karnataka', 
            phone: '+91 80 4567 8901', 
            color: 'bg-yellow-100 text-yellow-700', 
            bgColor: 'bg-yellow-50/50',
            borderColor: 'border-yellow-400',
            shape: 'rounded-[70%_30%_30%_70%_/_60%_40%_60%_40%]', 
            rotate: 'rotate-2' 
        },
        { 
            id: 5, 
            name: 'T.I.M.E. Kids - Anna Nagar', 
            address: '2nd Avenue, Anna Nagar', 
            city: 'Chennai', 
            state: 'Tamil Nadu', 
            phone: '+91 44 5678 9012', 
            color: 'bg-purple-100 text-purple-600', 
            bgColor: 'bg-purple-50/50',
            borderColor: 'border-purple-300',
            shape: 'rounded-[40%_60%_60%_40%_/_40%_60%_40%_60%]', 
            rotate: '-rotate-1' 
        },
        { 
            id: 6, 
            name: 'T.I.M.E. Kids - Velachery', 
            address: 'Main Road, Velachery', 
            city: 'Chennai', 
            state: 'Tamil Nadu', 
            phone: '+91 44 6789 0123', 
            color: 'bg-orange-100 text-orange-600', 
            bgColor: 'bg-orange-50/50',
            borderColor: 'border-orange-300',
            shape: 'rounded-[70%_30%_30%_70%_/_50%_50%_50%_50%]', 
            rotate: 'rotate-1' 
        },
        { 
            id: 7, 
            name: 'T.I.M.E. Kids - Koregaon Park', 
            address: 'North Main Road, Koregaon Park', 
            city: 'Pune', 
            state: 'Maharashtra', 
            phone: '+91 20 7890 1234', 
            color: 'bg-red-100 text-red-600', 
            bgColor: 'bg-red-50/50',
            borderColor: 'border-red-300',
            shape: 'rounded-[50%_50%_70%_30%_/_40%_50%_60%_50%]', 
            rotate: '-rotate-2' 
        },
        { 
            id: 8, 
            name: 'T.I.M.E. Kids - Satellite', 
            address: 'Satellite Road', 
            city: 'Ahmedabad', 
            state: 'Gujarat', 
            phone: '+91 79 8901 2345', 
            color: 'bg-teal-100 text-teal-600', 
            bgColor: 'bg-teal-50/50',
            borderColor: 'border-teal-300',
            shape: 'rounded-[60%_40%_40%_60%_/_50%_40%_60%_50%]', 
            rotate: 'rotate-2' 
        },
    ];

    const states = Array.from(new Set(centres.map(c => c.state))).sort();
    const cities = selectedState
        ? Array.from(new Set(centres.filter(c => c.state === selectedState).map(c => c.city))).sort()
        : Array.from(new Set(centres.map(c => c.city))).sort();

    const filteredCentres = centres.filter(centre => {
        const matchesSearch = searchTerm === '' ||
            centre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            centre.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            centre.address.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesState = selectedState === '' || centre.state === selectedState;
        const matchesCity = selectedCity === '' || centre.city === selectedCity;
        return matchesSearch && matchesState && matchesCity;
    });

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
                    {/* Irregular shape container for filters too */}
                    <div className="max-w-5xl mx-auto bg-white p-10 rounded-[50px] border-4 border-slate-100 shadow-xl relative transition-all duration-300 hover:scale-[1.01]">
                        <div className="absolute -top-6 -left-6 w-16 h-16 bg-yellow-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                        <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

                        <div className="grid md:grid-cols-4 gap-6 relative z-10 items-center">
                            <div className="md:col-span-2 relative group">
                                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name, city, or area..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm hover:shadow-md"
                                />
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedState}
                                    onChange={(e) => { setSelectedState(e.target.value); setSelectedCity(''); }}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                >
                                    <option value="">All States</option>
                                    {states.map(state => <option key={state} value={state}>{state}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                            <div className="relative">
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-200 rounded-full text-slate-700 focus:outline-none focus:border-purple-400 focus:bg-white transition-all shadow-sm hover:shadow-md appearance-none cursor-pointer"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                                <div className="absolute right-5 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
                            </div>
                        </div>
                        <div className="mt-8 text-center">
                            <span className="inline-block bg-slate-50 text-slate-500 px-4 py-1 rounded-full text-sm font-bold border border-slate-200">
                                Found {filteredCentres.length} centres
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Results Grid - ENHANCED BLOB CARDS */}
            <section className="py-12 relative z-10">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {filteredCentres.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-10 lg:gap-14">
                                {filteredCentres.map((centre) => (
                                    <div key={centre.id} className={`group relative transition-all duration-300 transform ${centre.rotate} hover:scale-[1.03] hover:z-20`}>
                                        
                                        {/* Colored Shadow Blob (behind) - Now slightly stronger */}
                                        <div className={`absolute top-3 left-3 right-0 bottom-0 ${centre.color.split(' ')[0].replace('100', '200')} ${centre.shape} opacity-100 -z-10 transition-transform duration-300 group-hover:translate-x-1 group-hover:translate-y-1`}></div>

                                        {/* Main Card - Fun Shape with Background Tint & Thicker Border */}
                                        <div className={`relative ${centre.bgColor} ${centre.shape} p-10 md:p-14 shadow-sm border-[4px] ${centre.borderColor} h-full flex flex-col justify-center min-h-[260px]`}>
                                            <div className="flex items-start gap-6">
                                                {/* Icon Bubble */}
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
                                                        <span className="text-slate-400 text-xs">•</span>
                                                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                                                            {centre.state}
                                                        </span>
                                                    </div>
                                                    
                                                    <a href={`tel:${centre.phone}`} className="inline-flex items-center gap-2 bg-slate-800 text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-slate-700 transition-all shadow-md hover:shadow-lg whitespace-nowrap group-hover:scale-105">
                                                        <Phone className="w-4 h-4" />
                                                        {centre.phone}
                                                    </a>
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
            </section>
        </div>
    );
}
