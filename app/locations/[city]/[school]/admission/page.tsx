"use client";

import React from 'react';
import Button from '@/components/ui/Button';

export default function SchoolAdmissionPage() {
    return (
        <div className="container mx-auto px-4 py-16">
            <div className="max-w-2xl mx-auto text-center mb-12">
                <h2 className="text-4xl font-fredoka font-bold text-gray-900 mb-4">Admissions Open</h2>
                <p className="text-xl text-gray-600">Join the T.I.M.E. Kids family today!</p>
            </div>

            <div className="bg-white max-w-3xl mx-auto rounded-3xl shadow-xl border border-gray-100 p-8 md:p-12">
                <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Parent Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" placeholder="Enter your name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Phone Number</label>
                            <input type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" placeholder="Enter phone number" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Email Address</label>
                        <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" placeholder="Enter email address" />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Child's Name</label>
                            <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" placeholder="Enter child's name" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Child's Age</label>
                            <input type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all" placeholder="Age in years" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Message (Optional)</label>
                        <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all h-32" placeholder="Any specific requirements..."></textarea>
                    </div>

                    <Button className="w-full rounded-xl py-4 text-lg" size="lg">Submit Inquiry</Button>
                </form>
            </div>
        </div>
    );
}
