'use client';

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiUrl } from "@/lib/api-client";
import ApplicationModal from "@/components/careers/ApplicationModal";

type Career = {
    id: number;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    apply_email: string;
    is_active: boolean;
};

export default function CareersPage() {
    const [careers, setCareers] = useState<Career[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const fetchCareers = async () => {
            try {
                const res = await fetch(apiUrl("/careers/public/"), { cache: "no-store" });
                if (res.ok) {
                    const data = await res.json();
                    const list = Array.isArray(data) ? data : data.results || [];
                    setCareers(list);
                }
            } catch (err) {
                console.error("Failed to fetch careers", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCareers();
    }, []);

    const handleApplyClick = (career: Career) => {
        setSelectedCareer(career);
        setModalOpen(true);
    };

    const handleModalClose = () => {
        setModalOpen(false);
        setSelectedCareer(null);
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-r from-orange-500 to-amber-500 text-white py-20 overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                    </svg>
                </div>
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold font-display mb-4"
                    >
                        Join Our Team
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl max-w-2xl mx-auto opacity-90"
                    >
                        Build a rewarding career with T.I.M.E. Kids. Help shape the future of the next generation.
                    </motion.p>
                </div>
            </div>

            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-display">Current Openings</h2>
                        <div className="w-16 h-1 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-slate-500">Loading careers...</div>
                    ) : careers.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">No open positions at the moment.</div>
                    ) : (
                        <div className="grid gap-6">
                            {careers.map((job, index) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all hover:shadow-md hover:border-orange-200 group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-orange-600 transition-colors">
                                                    {job.title}
                                                </h3>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {job.type}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Briefcase size={16} />
                                                    <span>{job.department}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MapPin size={16} />
                                                    <span>{job.location}</span>
                                                </div>
                                            </div>

                                            <p className="mt-4 text-gray-600 text-sm leading-relaxed">
                                                {job.description}
                                            </p>
                                        </div>

                                        <div className="mt-4 md:mt-0 flex items-center">
                                            <button
                                                onClick={() => handleApplyClick(job)}
                                                className="w-full md:w-auto px-6 py-2.5 bg-orange-500 hover:bg-orange-600 hover:scale-105 active:scale-95 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                            >
                                                <span>Apply Now</span>
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center border border-blue-100 shadow-sm">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Don&apos;t see a suitable role?</h3>
                        <p className="text-gray-600 mb-6">
                            We are always on the lookout for talented individuals. Send your resume to us directly.
                        </p>
                        <a
                            href="mailto:careers@timekids.com?subject=General Application - [Your Name]"
                            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 hover:scale-105 active:scale-95 transition-all shadow-sm"
                        >
                            Email Your Resume
                        </a>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            {selectedCareer && (
                <ApplicationModal
                    isOpen={modalOpen}
                    onClose={handleModalClose}
                    career={selectedCareer}
                />
            )}
        </div>
    );
}

