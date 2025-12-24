"use client";

import React from 'react';
import { centres } from '@/data/centres';
import { slugify } from '@/lib/utils';
import Image from 'next/image';

export default function SchoolAboutPage({ params }: { params: { city: string, school: string } }) {
    const city = decodeURIComponent(params.city);
    const schoolSlug = params.school;

    const school = centres.find(c =>
        c.city.toLowerCase().includes(city.toLowerCase()) &&
        slugify(c.name) === schoolSlug
    );

    if (!school) return <div>School not found</div>;

    return (
        <div className="container mx-auto px-4 py-16">
            <h2 className="text-4xl font-fredoka font-bold text-gray-900 mb-8 text-center">About Our Centre</h2>

            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
                <div className="prose prose-lg text-gray-600 max-w-none">
                    <p className="font-medium text-xl text-gray-900 mb-6 leading-relaxed">
                        Welcome to T.I.M.E. Kids {school.name}. We are proud to be a part of the T.I.M.E. Kids family, bringing world-class early childhood education to your neighborhood.
                    </p>
                    <p className="mb-4">
                        Our centre at {school.address} is equipped with state-of-the-art facilities designed to provide a safe, secure, and stimulating environment for your child. Our curriculum is strictly aligned with the National Education Policy (NEP) 2020, ensuring your child gets the best start in their educational journey.
                    </p>
                    <p>
                        We believe that every child is unique and has their own pace of learning. Our trained facilitators are dedicated to nurturing each child's potential through a blend of play-way methods and Montessori principles.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose Us?</h3>
                    <ul className="grid md:grid-cols-2 gap-4 list-none pl-0">
                        {['Safe & Secure Campus', 'Hygenic Environment', 'Trained Faculty', 'Play Area', 'Auditorium', 'Transportation'].map((item) => (
                            <li key={item} className="flex items-center space-x-2 text-gray-700 bg-gray-50 p-3 rounded-lg">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
