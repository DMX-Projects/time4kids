'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { Building2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function FranchiseLoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', remember: false });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Franchise login:', formData);
        // Add authentication logic here
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">
                {/* Logo and Title */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-xl mx-auto mb-4">
                        TK
                    </div>
                    <h1 className="font-display font-bold text-3xl mb-2">Franchise Login</h1>
                    <p className="text-gray-600">Access your franchise portal</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Franchise ID or Email
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                                    placeholder="Enter your franchise ID"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
                                    placeholder="Enter your password"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.remember}
                                    onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                                    className="w-4 h-4 text-secondary-600 border-gray-300 rounded focus:ring-secondary-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-secondary-600 hover:underline">
                                Forgot password?
                            </a>
                        </div>

                        {/* Login Button */}
                        <Button type="submit" variant="secondary" size="lg" className="w-full">
                            Login to Portal
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Interested in franchise?{' '}
                            <Link href="/franchise" className="text-secondary-600 font-semibold hover:underline">
                                Learn More
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Need help? Contact us at{' '}
                        <a href="mailto:franchise@timekids.com" className="text-secondary-600 hover:underline">
                            franchise@timekids.com
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
