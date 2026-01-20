'use client';

import React, { useState, useEffect } from 'react';
import { apiUrl } from '@/lib/api-client';

import Card from '@/components/ui/Card';
import TwinklingStars from '@/components/animations/TwinklingStars';
import { MapPin, Phone, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { slugify } from '@/lib/utils';

interface Centre {
    id: number;
    name: string;
    slug?: string;
    address: string;
    city: string;
    state: string;
    phone: string; // Changed from contact_phone to phone
}


export default function CityLocationsPage({ params }: { params: { city: string } }) {
    const city = decodeURIComponent(params.city);

    // Filter centres for the selected city
    const [centres, setCentres] = useState<Centre[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCentres = async () => {
            try {
                const res = await fetch(apiUrl('/franchises/public/'));
                if (!res.ok) throw new Error('Failed to fetch data');
                const data = await res.json();
                const rawData = Array.isArray(data) ? data : (data.results || []);

                // Map API fields and filter
                const mappedData: Centre[] = rawData.map((item: any) => ({
                    id: item.id,
                    name: item.name,
                    slug: item.slug, // Ensure slug is also mapped if available
                    address: item.address,
                    city: item.city,
                    state: item.state,
                    phone: item.contact_phone || item.phone || '', // Use 'phone' field
                }));

                const filtered = mappedData.filter(centre =>
                    centre.city.toLowerCase() === city.toLowerCase() ||
                    centre.city.toLowerCase().includes(city.toLowerCase()) ||
                    city.toLowerCase().includes(centre.city.toLowerCase())
                );

                setCentres(filtered);
            } catch (err) {
                console.error(err);
                setCentres([]); // Ensure centres is empty on error
            } finally {
                setLoading(false);
            }
        };
        fetchCentres();
    }, [city]);


    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section - Matching LocateCentre style */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                <TwinklingStars count={20} />

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="font-display font-bold text-5xl md:text-6xl mb-6 text-gray-900">
                        Preschools in <span className="gradient-text">{city}</span>
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto font-medium">
                        Discover our nurturing learning environments in your neighborhood.
                    </p>
                </div>
            </section>

            {/* Results Section */}
            <section className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {loading ? (
                            <div className="py-20 text-center text-gray-500">Loading centres...</div>
                        ) : centres.length > 0 ? (


                            <div className="grid md:grid-cols-2 gap-6">
                                {centres.map(centre => (

                                    <Link
                                        key={centre.id}
                                        href={`/locations/${params.city}/${centre.slug ?? slugify(centre.name)}`}

                                        className="block"
                                    >
                                        <Card className="hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 group h-full">
                                            <div className="flex items-start space-x-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                                                    <MapPin className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-display font-bold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{centre.name}</h3>
                                                    <p className="text-gray-600 text-sm mb-1">{centre.address}</p>
                                                    <p className="text-gray-600 text-sm mb-3 font-semibold">{centre.city}, {centre.state}</p>

                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2 text-primary-600">
                                                            <Phone className="w-4 h-4" />
                                                            <span className="font-semibold text-sm">
                                                                {centre.phone}

                                                            </span>
                                                        </div>
                                                        <div className="text-primary-500 font-bold text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            View Details <ChevronRight className="w-4 h-4 ml-1" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="bg-primary-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                    <MapPin className="w-10 h-10 text-primary-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2 font-fredoka">Looking for a school in {city}?</h3>
                                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                    We are currently establishing new centers in this area. Share your contact details to receive immediate updates as soon as we open.
                                </p>
                                <Link href="/contact">
                                    <Button variant="primary" size="lg">Enquire Now</Button>
                                </Link>
                            </div>
                        )}

                        <div className="mt-12 text-center">
                            <Link href="/">
                                <Button variant="outline" className="border-gray-300 text-gray-600 hover:bg-gray-50">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}