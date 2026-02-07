'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface WelcomeSectionProps {
    schoolName: string;
}

const WelcomeSection = ({ schoolName }: WelcomeSectionProps) => {
    return (
        <section className="relative py-24 px-4 overflow-hidden bg-[#fdf9e9]">


            {/* Background Doodles Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
                style={{
                    backgroundImage: 'url("/images/bg2.gif")',
                    backgroundRepeat: 'repeat',
                    backgroundSize: '400px'
                }}
            />

            <div className="container mx-auto max-w-4xl relative z-10 text-center">
                {/* Decorative Elements - Left */}
                <div className="absolute -left-20 top-1/2 -translate-y-1/2 hidden xl:block">
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        {/* Stars Stack Left */}
                        <div className="flex flex-col gap-4 items-center">
                            <StarIcon className="w-8 h-8 text-yellow-400 rotate-12" />
                            <StarIcon className="w-12 h-12 text-orange-400 -rotate-12" />
                            <StarIcon className="w-10 h-10 text-yellow-500 rotate-45" />
                        </div>

                    </motion.div>
                </div>

                {/* Decorative Elements - Right */}
                <div className="absolute -right-20 top-1/2 -translate-y-1/2 hidden xl:block">
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="relative"
                    >
                        {/* Stars Stack Right */}
                        <div className="flex flex-col gap-4 items-center">
                            <StarIcon className="w-10 h-10 text-yellow-400 -rotate-12" />
                            <StarIcon className="w-12 h-12 text-orange-400 rotate-12" />
                            <StarIcon className="w-8 h-8 text-yellow-500 -rotate-45" />
                        </div>

                    </motion.div>
                </div>

                {/* Content */}
                <div className="space-y-8">
                    <h1 className="text-4xl md:text-5xl font-bold font-schoolbell text-[#fe5c61] drop-shadow-sm">
                        Welcome to T.I.M.E. Kids <br />
                        <span className="text-3xl md:text-4xl mt-2 block">{schoolName}</span>
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 font-dosis max-w-3xl mx-auto leading-tight">
                        A chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training.
                    </h2>

                    <div className="space-y-6 text-gray-700 text-lg md:text-xl font-medium leading-relaxed">
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
                        </p>
                    </div>
                </div>
            </div>



            <style jsx>{`
                .font-schoolbell {
                    font-family: 'Schoolbell', cursive;
                }
                .font-dosis {
                    font-family: 'Dosis', sans-serif;
                }
            `}</style>
        </section>
    );
};

// Helper component for Star
const StarIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
);

export default WelcomeSection;
