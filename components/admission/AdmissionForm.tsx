'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import QRCode from '@/components/ui/QRCode';
import { useForm } from 'react-hook-form';
import { CheckCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolData } from '@/components/dashboard/shared/SchoolDataProvider';
import { useToast } from '@/components/ui/Toast';

interface AdmissionFormData {
    parentName: string;
    email: string;
    phone: string;
    childName: string;
    childAge: string;
    program: string;
    city: string;
    message?: string;
}

interface AdmissionFormProps {
    franchiseSlug?: string;
    defaultCity?: string;
}

const AdmissionForm = ({ franchiseSlug, defaultCity }: AdmissionFormProps) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors }, reset } = useForm<AdmissionFormData>({
        defaultValues: {
            city: defaultCity || ''
        }
    });
    const { addEnquiry } = useSchoolData();
    const { showToast } = useToast();

    const onSubmit = async (data: AdmissionFormData) => {
        setSubmitError(null);
        try {
            await addEnquiry({
                type: 'admission',
                name: data.parentName,
                email: data.email,
                phone: data.phone,
                city: data.city,
                childAge: data.childAge,
                message: `Child: ${data.childName}, Age: ${data.childAge}, Program: ${data.program}, City: ${data.city}${data.message ? ' | Note: ' + data.message : ''}`,
                // @ts-ignore
                franchiseSlug: franchiseSlug
            });
            setIsSubmitted(true);
            reset();
            showToast("Admission enquiry submitted successfully!");
            setTimeout(() => setIsSubmitted(false), 5000);
        } catch (err: any) {
            setSubmitError(err?.message || 'Unable to submit your enquiry. Please try again.');
            showToast(err?.message || 'Unable to submit your enquiry. Please try again.', "error");
        }
    };

    const formUrl = typeof window !== 'undefined' ? window.location.href : 'https://timekids.com/admission';

    return (
        <div className="relative">
            <div className="grid lg:grid-cols-12 gap-6 relative">

                {/* Main Form Area */}
                <div className="lg:col-span-8 p-4 md:p-6">
                    {/* Header Pill */}
                    <div className="mb-12">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="inline-block bg-[#FFD95A] px-12 py-5 rounded-[2rem] shadow-[0_8px_0_#F9A825] border-4 border-white"
                        >
                            <h3 className="font-fredoka font-bold text-3xl md:text-4xl text-[#2D2D52]">
                                Admission Enquiry
                            </h3>
                        </motion.div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                            {/* Form Fields */}
                            {[
                                { name: 'parentName', label: 'Parent/Guardian Name', placeholder: 'Enter your name' },
                                { name: 'email', label: 'Email Address', placeholder: 'your@email.com' },
                                { name: 'phone', label: 'Phone Number', placeholder: '1234567890' },
                                { name: 'childName', label: "Child's Name", placeholder: "Enter child's name" }
                            ].map((field) => (
                                <div key={field.name} className="space-y-2">
                                    <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                        {field.label} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        {...register(field.name as any, { required: true })}
                                        className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-[#FFD95A] outline-none transition-all placeholder:text-gray-400 font-medium text-[#2D2D52]"
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))}

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                    Child's Age <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('childAge', { required: true })}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none"
                                >
                                    <option value="">Select age</option>
                                    <option value="2">2+ Years</option>
                                    <option value="3">3+ Years</option>
                                    <option value="4">4+ Years</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                    Program of Interest <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('program', { required: true })}
                                    className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl appearance-none font-medium text-[#2D2D52] focus:ring-4 focus:ring-yellow-100 outline-none"
                                >
                                    <option value="">Select program</option>
                                    <option value="playgroup">Playgroup</option>
                                    <option value="nursery">Nursery</option>
                                    <option value="pp1">PP1</option>
                                    <option value="pp2">PP2</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-lg font-fredoka font-semibold text-[#2D2D52] pl-1">
                                Additional Message (Optional)
                            </label>
                            <textarea
                                {...register('message')}
                                rows={3}
                                className="w-full px-6 py-4 bg-[#FFFCF5] border-2 border-[#FFEBB7] rounded-2xl focus:ring-4 focus:ring-yellow-100 focus:border-[#FFD95A] outline-none transition-all resize-none font-medium text-[#2D2D52] placeholder:text-gray-400"
                                placeholder="Any specific questions or requirements..."
                            />
                        </div>

                        <div className="flex justify-center md:justify-start pt-6">
                            <motion.button
                                whileHover={{ scale: 1.05, y: -4 }}
                                whileTap={{ scale: 0.95 }}
                                type="submit"
                                className="bg-[#FF7A2F] text-white px-16 py-5 rounded-2xl font-fredoka font-bold text-2xl shadow-[0_8px_0_#D35400] border-2 border-white transition-all"
                            >
                                Submit Enquiry
                            </motion.button>
                        </div>
                    </form>
                </div>

                {/* Sidebar Enquiry Section */}
                <div className="lg:col-span-4 relative">
                    <div className="bg-[#FFFCF5] rounded-[2rem] border-2 border-[#FFEBB7] p-8 text-center shadow-[inset_0_4px_10px_rgba(0,0,0,0.02)] h-full flex flex-col items-center justify-center relative">
                        <h4 className="font-fredoka font-bold text-3xl text-[#2D2D52] mb-3">Quick Enquiry</h4>
                        <p className="text-gray-500 font-medium mb-10">Scan to fill the form on your mobile</p>

                        <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-[#FFEBB7] mb-10 transform rotate-2">
                            <QRCode value={formUrl} size={160} />
                        </div>

                        <div className="space-y-2 relative z-10">
                            <p className="text-gray-500 font-bold">Or call us at</p>
                            <p className="text-[#FF7A2F] font-fredoka font-black text-3xl tracking-wide">
                                +91 123 456 7890
                            </p>
                        </div>

                        {/* Robot Illustration */}
                        <motion.div
                            animate={{
                                y: [10, -10, 10],
                                rotate: [0, 5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                            className="mt-6 z-20 w-52 h-52 transition-all"
                        >
                            <Image
                                src="/robot.png"
                                alt="Robot"
                                width={500}
                                height={500}
                                className="w-full h-auto drop-shadow-xl"
                            />
                        </motion.div>

                        {/* Sparkles Background (keep current or replace) */}
                        <div className="absolute -right-8 -bottom-8 opacity-20 pointer-events-none">
                            <Sparkles size={200} className="text-blue-400/30" />
                        </div>
                    </div>

                </div>
            </div>

            {/* Success Message Pop */}
            <AnimatePresence>
                {isSubmitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white border-4 border-green-400 rounded-full px-10 py-5 shadow-2xl z-[100] flex items-center gap-4"
                    >
                        <CheckCircle className="text-green-500 w-8 h-8" />
                        <span className="font-fredoka font-bold text-xl text-[#2D2D52]">Thank you! We'll contact you soon. ✨</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdmissionForm;
