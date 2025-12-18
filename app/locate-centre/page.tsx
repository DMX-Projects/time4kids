'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { MapPin, Phone, Search } from 'lucide-react';

interface Centre {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    phone: string;
    lat?: number;
    lng?: number;
}

export default function LocateCentrePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCity, setSelectedCity] = useState('');

    // Sample centres data
    const centres: Centre[] = [
        {
            id: 1,
            name: 'T.I.M.E. Kids - Banjara Hills',
            address: 'Road No. 12, Banjara Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            phone: '+91 40 1234 5678',
        },
        {
            id: 2,
            name: 'T.I.M.E. Kids - Jubilee Hills',
            address: 'Road No. 45, Jubilee Hills',
            city: 'Hyderabad',
            state: 'Telangana',
            phone: '+91 40 2345 6789',
        },
        {
            id: 3,
            name: 'T.I.M.E. Kids - Koramangala',
            address: '5th Block, Koramangala',
            city: 'Bangalore',
            state: 'Karnataka',
            phone: '+91 80 3456 7890',
        },
        {
            id: 4,
            name: 'T.I.M.E. Kids - Indiranagar',
            address: '100 Feet Road, Indiranagar',
            city: 'Bangalore',
            state: 'Karnataka',
            phone: '+91 80 4567 8901',
        },
        {
            id: 5,
            name: 'T.I.M.E. Kids - Anna Nagar',
            address: '2nd Avenue, Anna Nagar',
            city: 'Chennai',
            state: 'Tamil Nadu',
            phone: '+91 44 5678 9012',
        },
        {
            id: 6,
            name: 'T.I.M.E. Kids - Velachery',
            address: 'Main Road, Velachery',
            city: 'Chennai',
            state: 'Tamil Nadu',
            phone: '+91 44 6789 0123',
        },
        {
            id: 7,
            name: 'T.I.M.E. Kids - Koregaon Park',
            address: 'North Main Road, Koregaon Park',
            city: 'Pune',
            state: 'Maharashtra',
            phone: '+91 20 7890 1234',
        },
        {
            id: 8,
            name: 'T.I.M.E. Kids - Satellite',
            address: 'Satellite Road',
            city: 'Ahmedabad',
            state: 'Gujarat',
            phone: '+91 79 8901 2345',
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
        <div className="min-h-screen">
            {/* Hero Section - Fence/Neighborhood Theme */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations */}

                <TwinklingStars count={20} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-luckiest text-5xl md:text-6xl mb-6 text-[#003366] tracking-wider">
                            Locate a <span className="text-[#E67E22]">T.I.M.E. Kids Centre</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            Find the nearest T.I.M.E. Kids preschool in your area
                        </p>
                    </div>
                </div>
            </section>

            {/* Search and Filters */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-4 gap-4 mb-8">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, city, or area..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* State Filter */}
                            <div>
                                <select
                                    value={selectedState}
                                    onChange={(e) => {
                                        setSelectedState(e.target.value);
                                        setSelectedCity('');
                                    }}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All States</option>
                                    {states.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>

                            {/* City Filter */}
                            <div>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="">All Cities</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Found <strong className="text-primary-600">{filteredCentres.length}</strong> centres
                        </p>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="py-8 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl p-12 text-center">
                            <MapPin className="w-16 h-16 mx-auto mb-4 text-primary-600" />
                            <h3 className="font-bubblegum text-2xl mb-2 text-gray-900 tracking-wide">Interactive Map</h3>
                            <p className="text-gray-600">
                                Google Maps integration will display all centres on an interactive map.
                                <br />
                                <span className="text-sm">(Requires Google Maps API key for production)</span>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Centres List */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-6">
                            {filteredCentres.map(centre => (
                                <Card key={centre.id} className="hover:shadow-xl transition-shadow">
                                    <div className="flex items-start space-x-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <MapPin className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bubblegum text-lg mb-2 text-gray-900 tracking-wide">{centre.name}</h3>
                                            <p className="text-gray-600 text-sm mb-1">{centre.address}</p>
                                            <p className="text-gray-600 text-sm mb-3">{centre.city}, {centre.state}</p>
                                            <div className="flex items-center space-x-2 text-primary-600">
                                                <Phone className="w-4 h-4" />
                                                <a href={`tel:${centre.phone}`} className="font-semibold hover:underline">
                                                    {centre.phone}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {filteredCentres.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No centres found matching your search criteria.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
