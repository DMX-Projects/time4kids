'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import AnimatedLetters from '@/components/animations/AnimatedLetters';
import TwinklingStars from '@/components/animations/TwinklingStars';

import { Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, Briefcase } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>();
    const { addEnquiry } = useSchoolData();

    const onSubmit = (data: ContactFormData) => {
        const type: 'admission' | 'franchise' | 'contact' = data.subject === 'admission' ? 'admission' : data.subject === 'franchise' ? 'franchise' : 'contact';
        addEnquiry({
            type,
            name: data.name,
            email: data.email,
            phone: data.phone,
            message: `${data.subject.toUpperCase()}: ${data.message}`,
        });
        setIsSubmitted(true);
        reset();
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    return (
        <div className="min-h-screen">
            {/* Hero Section - Pencil/Creative Theme */}
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20 relative overflow-hidden">
                {/* Kid-Friendly Animations - Creative Communication */}
                <AnimatedLetters />
                <TwinklingStars count={18} />


                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-luckiest text-5xl md:text-6xl mb-6 text-[#003366] tracking-wider">
                            Get in <span className="text-[#E67E22]">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            We&apos;d love to hear from you. Reach out to us for any queries or information.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Information & Form */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Mail className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Email Us</h3>
                                        <a href="mailto:info@timekids.com" className="text-primary-600 hover:underline">
                                            info@timekids.com
                                        </a>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Call Us</h3>
                                        <a href="tel:+911234567890" className="text-primary-600 hover:underline">
                                            +91 123 456 7890
                                        </a>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start space-x-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Head Office</h3>
                                        <p className="text-gray-600 text-sm">
                                            Hyderabad, Telangana<br />
                                            India
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Social Media */}
                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
                                <div className="flex space-x-4 mb-6">
                                    <a
                                        href="https://www.facebook.com/pages/TIME-Kids/187099544682886"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <Facebook className="w-6 h-6 text-white" />
                                    </a>
                                    <a
                                        href="https://www.instagram.com/timekidspreschools"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <Instagram className="w-6 h-6 text-white" />
                                    </a>
                                    <a
                                        href="https://www.youtube.com/@t.i.m.e.kidspreschoolstkps9493"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center hover:scale-110 transition-transform"
                                    >
                                        <Youtube className="w-6 h-6 text-white" />
                                    </a>
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-3">Scan to connect:</p>
                                    <div className="inline-block transform scale-75">
                                        <QRCode value="https://www.timekidspreschools.in" size={120} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <Card>
                                <h3 className="font-bubblegum text-2xl mb-6 text-gray-900 tracking-wide">Send Us a Message</h3>

                                {isSubmitted && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-medium">Thank you! We&apos;ll get back to you soon.</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                                            <input
                                                {...register('name', { required: 'Name is required' })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Your name"
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                                            <input
                                                {...register('email', {
                                                    required: 'Email is required',
                                                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' }
                                                })}
                                                type="email"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="your@email.com"
                                            />
                                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                                            <input
                                                {...register('phone', {
                                                    required: 'Phone is required',
                                                    pattern: { value: /^[0-9]{10}$/, message: 'Enter valid 10-digit number' }
                                                })}
                                                type="tel"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="1234567890"
                                            />
                                            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject *</label>
                                            <select
                                                {...register('subject', { required: 'Subject is required' })}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="">Select subject</option>
                                                <option value="admission">Admission Enquiry</option>
                                                <option value="franchise">Franchise Enquiry</option>
                                                <option value="general">General Query</option>
                                                <option value="feedback">Feedback</option>
                                                <option value="careers">Careers</option>
                                            </select>
                                            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Message *</label>
                                        <textarea
                                            {...register('message', { required: 'Message is required' })}
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            placeholder="Tell us how we can help you..."
                                        />
                                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                                    </div>

                                    <Button type="submit" size="lg" className="w-full">
                                        <Send className="w-5 h-5" />
                                        Send Message
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Careers Section */}
            <section id="careers" className="py-20 bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="font-bubblegum text-4xl mb-6 tracking-wide">Join Our Team</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Be part of a passionate team dedicated to shaping young minds. Explore career opportunities at T.I.M.E. Kids.
                        </p>
                        <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-100 border-0">
                            View Open Positions
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
