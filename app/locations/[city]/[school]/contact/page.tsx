"use client";

import React from 'react';
import { centres } from '@/data/centres';
import { slugify } from '@/lib/utils';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import Card from '@/components/ui/Card';

export default function SchoolContactPage({ params }: { params: { city: string, school: string } }) {
    const city = decodeURIComponent(params.city);
    const schoolSlug = params.school;

    const school = centres.find(c =>
        c.city.toLowerCase().includes(city.toLowerCase()) &&
        slugify(c.name) === schoolSlug
    );

    if (!school) return <div>School not found</div>;

    return (
        <div className="container mx-auto px-4 py-16">
            <h2 className="text-4xl font-fredoka font-bold text-gray-900 mb-12 text-center">Contact Us</h2>

            <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-8">
                    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl">
                        <div className="flex items-start space-x-6">
                            <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-7 h-7 text-primary-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Address</p>
                                <p className="text-xl font-medium text-gray-900 leading-relaxed">
                                    {school.address}
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl">
                        <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Phone className="w-7 h-7 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Phone</p>
                                <a href={`tel:${school.phone}`} className="text-2xl font-bold text-gray-900 hover:text-green-600 transition-colors">
                                    {school.phone}
                                </a>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 border-0 shadow-lg hover:shadow-xl transition-shadow bg-white rounded-3xl">
                        <div className="flex items-center space-x-6">
                            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <Mail className="w-7 h-7 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                <a href={`mailto:${school.email || 'info@timekidspreschools.com'}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                    {school.email || 'info@timekidspreschools.com'}
                                </a>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="h-[500px] w-full bg-gray-100 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                    <iframe
                        className="w-full h-full"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(school.address + ' ' + school.city + ' TIME Kids Preschool')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                        allowFullScreen
                        loading="lazy"
                    />
                </div>
            </div>
        </div>
    );
}
