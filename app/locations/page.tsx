"use client";

import React from 'react';

import Link from 'next/link';
import { MapPin, ChevronRight, GraduationCap } from 'lucide-react';
import TwinklingStars from '@/components/animations/TwinklingStars';
import Card from '@/components/ui/Card';

export default function LocationsPage() {
    // Get unique cities
    const [locations, setLocations] = React.useState<
        { city: string; franchise_count: number }[]
    >([]);

    React.useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/franchises/public/locations/`
                );
                if (!res.ok) throw new Error('Failed to fetch locations');
                const data = await res.json();
                setLocations(data);
            } catch (err) {
                console.error(err);
                setLocations([]);
            }
        };

        fetchLocations();
    }, []);


    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-24 relative overflow-hidden">
                <TwinklingStars count={30} />
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-primary-300 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-secondary-300 rounded-full blur-3xl animate-pulse"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-bold tracking-wider uppercase mb-6 animate-bounce">
                        Explore Our Network
                    </span>
                    <h1 className="font-fredoka font-bold text-5xl md:text-7xl mb-6 text-gray-900 leading-tight">
                        Our <span className="text-secondary-500">Locations</span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium mb-10">
                        Select a city to find the best T.I.M.E. Kids preschool near you.
                    </p>
                </div>
            </section>

            {/* City Selection Grid */}
            <section className="py-20 -mt-10 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {locations.map(({ city, franchise_count }) => {


                            return (
                                <Link
                                    key={city}
                                    href={`/locations/${encodeURIComponent(city)}`}
                                    className="group"
                                >
                                    <Card className="p-8 h-full border-2 border-transparent hover:border-primary-200 hover:shadow-2xl transition-all duration-500 rounded-3xl bg-white overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                                            <MapPin className="w-24 h-24 text-primary-500" />
                                        </div>

                                        <div className="mb-6 w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-500 group-hover:rotate-6 transition-all duration-500">
                                            <MapPin className="w-7 h-7 text-primary-600 group-hover:text-white" />
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-2 font-fredoka group-hover:text-primary-600 transition-colors">
                                            {city}
                                        </h3>

                                        <div className="flex items-center text-gray-500 space-x-2 mb-6">
                                            <GraduationCap className="w-4 h-4" />
                                            <span className="text-sm font-medium">{franchise_count} Centres</span>
                                        </div>

                                        <div className="flex items-center text-primary-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                                            <span>View Schools</span>
                                            <ChevronRight className="w-5 h-5 ml-1" />
                                        </div>
                                    </Card>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Premium CTA Section */}
            <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-20">
                    <TwinklingStars count={50} />
                </div>
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-8 font-fredoka">Can't find your city?</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        We are rapidly expanding across India. Partner with us to bring T.I.M.E. Kids to your neighborhood.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link href="/franchise" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-primary-500/50">
                                Start a Franchise
                            </button>
                        </Link>
                        <Link href="/contact" className="w-full sm:w-auto">
                            <button className="w-full sm:w-auto px-10 py-4 bg-transparent border-2 border-white/30 hover:bg-white/10 text-white rounded-full font-bold text-lg transition-all">
                                Get in Touch
                            </button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
