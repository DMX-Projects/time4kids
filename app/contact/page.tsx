'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import AnimatedLetters from '@/components/animations/AnimatedLetters';
import TwinklingStars from '@/components/animations/TwinklingStars';
import Link from 'next/link';

import { Phone, MapPin, Send, Briefcase, Building2 } from 'lucide-react';
import { SocialBrandLink } from '@/components/ui/SocialBrandIcons';
import { SITE_CORPORATE_CONTACT } from '@/config/site-contact';
import { useFooterContent } from '@/components/layout/FooterContentProvider';
import { useForm } from 'react-hook-form';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';
import { trackLeadSubmission } from '@/lib/tracking';

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    city: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const footer = useFooterContent();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormData>({ mode: 'onTouched' });
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    const onSubmit = async (data: ContactFormData) => {
        setSubmitError(null);
        try {
            await addEnquiry({
                type: 'contact',
                name: data.name,
                email: data.email,
                phone: data.phone,
                city: data.city,
                message: `${data.subject.toUpperCase()}: ${data.message}`,
            });
            setIsSubmitted(true);
            reset();
            trackLeadSubmission({
                formType: "contact",
                location: window.location.href,
            });
            showToast("Your message has been sent successfully!");
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to send your message. Please try again.');
            showToast(err?.message || 'Message sending failed.', "error");
        }
    };

    const onInvalid = () => {
        showToast("Please fill all required fields correctly", "error");
    };

    return (
        <div className="min-h-screen">
            <section className="bg-gradient-to-br from-primary-50 to-secondary-50 section-gap relative overflow-x-hidden pt-24 md:pt-32">
                <AnimatedLetters />
                <TwinklingStars count={18} />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="font-luckiest text-5xl md:text-6xl mb-6 text-[#003366] tracking-wider leading-normal">
                            Get in <span className="text-[#E67E22]">Touch</span>
                        </h1>
                        <p className="text-xl text-gray-700 leading-relaxed">
                            We&apos;d love to hear from you. Reach out to us for any queries or information.
                        </p>
                    </div>
                </div>
            </section>

            <section className="section-gap bg-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-12 max-w-6xl mx-auto">
                        <div className="lg:col-span-1 space-y-6">
                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Building2 className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 space-y-3 text-sm">
                                        <h3 className="font-semibold text-primary-700 text-base">Corporate Office</h3>
                                        <p className="font-medium text-gray-900">{SITE_CORPORATE_CONTACT.companyName}</p>
                                        <address className="not-italic text-gray-600 leading-relaxed">
                                            {SITE_CORPORATE_CONTACT.addressLines.map((line) => (
                                                <span key={line} className="block">
                                                    {line}
                                                </span>
                                            ))}
                                        </address>
                                        <p className="text-gray-700">
                                            <span className="font-medium text-gray-900">Ph:</span>{' '}
                                            <a href={SITE_CORPORATE_CONTACT.phoneTel} className="text-primary-600 hover:underline">
                                                {SITE_CORPORATE_CONTACT.phone}
                                            </a>
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium text-gray-900">Fax:</span> {SITE_CORPORATE_CONTACT.fax}
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium text-gray-900">Email-id:</span>{' '}
                                            <a
                                                href={`mailto:${SITE_CORPORATE_CONTACT.email}`}
                                                className="text-primary-600 hover:underline break-all"
                                            >
                                                {SITE_CORPORATE_CONTACT.email}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Phone className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="min-w-0 space-y-2 text-sm">
                                        <h3 className="font-semibold text-primary-700 text-base">For Franchise enquiries contact</h3>
                                        <p className="text-gray-700">
                                            <span className="font-medium text-gray-900">Cell:</span>{' '}
                                            <a
                                                href={SITE_CORPORATE_CONTACT.franchiseCellTel}
                                                className="text-primary-600 hover:underline"
                                            >
                                                {SITE_CORPORATE_CONTACT.franchiseCell}
                                            </a>
                                        </p>
                                        <p className="text-gray-700">
                                            <span className="font-medium text-gray-900">Email-id:</span>{' '}
                                            <a
                                                href={`mailto:${SITE_CORPORATE_CONTACT.franchiseEmail}`}
                                                className="text-primary-600 hover:underline break-all"
                                            >
                                                {SITE_CORPORATE_CONTACT.franchiseEmail}
                                            </a>
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <MapPin className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-1">Head Office</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {SITE_CORPORATE_CONTACT.locationLabel}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            <Card>
                                <h3 className="font-semibold text-gray-900 mb-4">Connect With Us</h3>
                                <div className="mb-6 flex gap-4">
                                    <SocialBrandLink platform="facebook" href={footer.social.facebook} size="md" />
                                    <SocialBrandLink platform="instagram" href={footer.social.instagram} size="md" />
                                    <SocialBrandLink platform="youtube" href={footer.social.youtube} size="md" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-3">Scan to connect:</p>
                                    <div className="inline-block transform scale-75">
                                        <QRCode value={footer.qr_code_url} size={120} />
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-2">
                            <Card>
                                <h3 className="font-bubblegum text-2xl mb-6 text-gray-900 tracking-wide">Send Us a Message</h3>

                                {isSubmitted && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 font-medium">Thank you! We&apos;ll get back to you soon.</p>
                                    </div>
                                )}
                                {submitError && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                        {submitError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                {...register('name', { 
                                                    required: 'Name is required',
                                                    minLength: { value: 3, message: 'Name must be at least 3 characters' }
                                                })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="Your name"
                                            />
                                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Email <span className="text-red-500">*</span>
                                            </label>
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                Phone <span className="text-red-500">*</span>
                                            </label>
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
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                City <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                {...register('city', { required: 'City is required' })}
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g. Bengaluru"
                                            />
                                            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
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

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Message <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            {...register('message', { required: 'Message is required' })}
                                            rows={6}
                                            maxLength={250}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                            placeholder="Your message..."
                                        />
                                        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
                                    </div>

                                    <Button type="submit" size="lg" className="w-full">
                                        <Send className="w-5 h-5 mx-2" />
                                        Send Message
                                    </Button>
                                </form>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            <section id="careers" className="section-gap bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Briefcase className="w-16 h-16 mx-auto mb-6" />
                        <h2 className="font-bubblegum text-4xl mb-6 tracking-wide">Join Our Team</h2>
                        <p className="text-xl text-white/90 mb-8">
                            Be part of a passionate team dedicated to shaping young minds. Explore career opportunities at T.I.M.E. Kids.
                        </p>
                        <Link href="/careers">
                            <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-gray-100 border-0">
                                View Open Positions
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
