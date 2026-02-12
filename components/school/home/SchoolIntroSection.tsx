'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface SchoolIntroSectionProps {
    schoolName: string;
}

const StarIcon = ({ className, fill = "currentColor" }: { className?: string, fill?: string }) => (
    <svg viewBox="0 0 24 24" fill={fill} className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="0" />
    </svg>
);

const SchoolIntroSection = ({ schoolName }: SchoolIntroSectionProps) => {
    return (
        <section className="relative bg-[#FFFBEB] py-24 md:py-32 overflow-hidden font-sans">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] text-black"
                style={{
                    backgroundImage: 'url("/images/bg2.gif")',
                    backgroundSize: '300px'
                }}
            />

            {/* Top Wavy Divider */}
            <div className="absolute top-0 left-0 right-0 w-full overflow-hidden leading-none rotate-180">
                <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[70px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF"></path>
                </svg>
            </div>

            <div className="container mx-auto max-w-6xl px-4 relative z-10 text-center">

                {/* Floating Stars - Left */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block">
                    <motion.div
                        animate={{ y: [-10, 10, -10] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col gap-6 items-center opacity-80"
                    >
                        <StarIcon className="w-12 h-12 text-yellow-400 rotate-12" fill="#FACC15" />
                        <StarIcon className="w-16 h-16 text-amber-400 -rotate-12" fill="#FBBF24" />
                        <StarIcon className="w-10 h-10 text-yellow-300 rotate-45" fill="#FDE047" />
                    </motion.div>
                </div>

                {/* Floating Stars - Right */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
                    <motion.div
                        animate={{ y: [10, -10, 10] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="flex flex-col gap-6 items-center opacity-80"
                    >
                        <StarIcon className="w-14 h-14 text-yellow-400 -rotate-12" fill="#FACC15" />
                        <StarIcon className="w-16 h-16 text-amber-400 rotate-12" fill="#FBBF24" />
                        <StarIcon className="w-12 h-12 text-yellow-300 -rotate-45" fill="#FDE047" />
                    </motion.div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="font-schoolbell text-[#ff5ca1] text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-sm leading-tight">
                            Welcome <br className="md:hidden" /> to T.I.M.E. Kids
                        </h1>

                        <h2 className="font-fredoka text-[#2D3142] text-2xl md:text-3xl lg:text-4xl font-bold mb-8">
                            {schoolName}
                        </h2>

                        <h3 className="font-outfit text-gray-800 text-lg md:text-xl font-bold mb-8 max-w-3xl mx-auto leading-relaxed">
                            A chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training.
                        </h3>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="space-y-6 text-gray-600 text-base md:text-lg leading-relaxed font-medium text-justify md:text-center"
                    >
                        <p>
                            T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training.
                            After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 350+ pre-schools is now poised for major
                            expansion across the country.
                        </p>
                        <p>
                            The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the
                            warm, safe and caring and learning environment that young children have at home. Our play schools offer wholesome,
                            fun-filled and memorable childhood education to our children.
                        </p>
                        <p>
                            T.I.M.E. Kids pre-schools are backed by our educational expertise of over 27 years, well trained care providers and a
                            balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child
                            development practices.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Bottom Wavy Divider */}
            <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none">
                <svg className="relative block w-[calc(100%+1.3px)] h-[50px] md:h-[70px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#FFFFFF" transform="rotate(180 600 60)"></path>
                    {/* Used a transform or different path for bottom if needed, but the same wave rotated acts as a bottom connector into white */}
                    <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="#FFFFFF"></path>
                </svg>
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Schoolbell&family=Fredoka:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');
                
                .font-schoolbell {
                    font-family: 'Schoolbell', cursive;
                }
                .font-fredoka {
                    font-family: 'Fredoka', sans-serif;
                }
                .font-outfit {
                    font-family: 'Outfit', sans-serif;
                }
            `}</style>
        </section>
    );
};

export default SchoolIntroSection;
