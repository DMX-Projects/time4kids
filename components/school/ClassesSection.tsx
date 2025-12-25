'use client';

import React from 'react';
import { motion } from 'framer-motion';

const ClassesSection = () => {
    const programs = [
        {
            title: 'Play Group',
            subTitle: '18 months to 2.5 year',
            ageGroup: '1.5 yrs - 2.5 yrs',
            timings: '8:30am - 12:30pm (4 hrs per day)',
            days: 'Monday - Friday',
            description: 'Between 1yr to 3 yrs. of age, small children are curious and generally love to explore the world around them. They can assimilate information rapidly and express interest...',
            color: 'bg-[#ff9800]',
            btnColor: 'bg-[#ff9800] hover:bg-[#e68a00]'
        },
        {
            title: 'Nursery',
            subTitle: '2.5 to 3.5 year',
            ageGroup: '2.5 yrs - 3.5 yrs',
            timings: '8:30am - 12:30pm (4 hrs per day)',
            days: 'Monday - Friday',
            description: 'At Timekids, Nursery curriculum sets the pace for active learning through various fun filled activities. Children are introduced to varied learning materials, a large number of shapes and colours...',
            color: 'bg-[#8dc53e]',
            btnColor: 'bg-[#8dc53e] hover:bg-[#7aaf34]'
        },
        {
            title: 'Pre Primary I',
            subTitle: '3.5 to 4.5 year',
            ageGroup: '3.5 yrs - 4.5 yrs',
            timings: '8:30am - 1:00pm (4.5 hrs per day)',
            days: 'Monday - Friday',
            description: 'Coming to PP1, our children expand their knowledge from the realm of school to the neighbourhood and beyond. They are inquisitive, seeking answers, interacting with other children and also...',
            color: 'bg-[#e74c3c]',
            btnColor: 'bg-[#e74c3c] hover:bg-[#c0392b]'
        },
        {
            title: 'Pre Primary II',
            subTitle: '4.5 to 5.5 year',
            ageGroup: '4.5 yrs - 5.5 yrs',
            timings: '8:30am - 1:00pm (4.5 hrs per day)',
            days: 'Monday - Friday',
            description: 'The highly motivated children of PP2 at Timekids are so well equipped to face the challenges of formal schooling system. They are confident individuals, good at communicating thoughts...',
            color: 'bg-[#2980b9]',
            btnColor: 'bg-[#2980b9] hover:bg-[#2471a3]'
        }
    ];

    return (
        <section className="relative bg-[#004a8d] py-24 overflow-hidden">
            {/* Top Animated Waves */}
            <div className="absolute top-0 left-0 w-full overflow-hidden leading-none rotate-180 h-[80px]">
                <svg className="relative block w-[200%] h-full animate-[wave_20s_linear_infinite]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,-9.11,1200,0V0Z" fill="#FDF7F1" opacity="0.3"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.94,9.41,104.41,20.1,51.27,16.38,107.05,33.15,165.48,24.72,70-10.12,126-57.41,180.83-102.33C954.09,1.07,1013.84,2.5,1074.75,2.06c40.23-.29,79.8,1.4,119.25,15.75L1200,0Z" fill="#FDF7F1" opacity="0.5"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#FDF7F1"></path>
                </svg>
            </div>

            <div className="container mx-auto max-w-7xl px-4 relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold font-fredoka text-white text-center mb-16 underline decoration-white/30 underline-offset-8">
                    Classes
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {programs.map((program, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-[2rem] overflow-hidden shadow-2xl flex flex-col h-full border-t-8 border-white group"
                        >
                            {/* Card Header */}
                            <div className={`${program.color} p-6 text-center text-white space-y-1 relative`}>
                                <h3 className="text-2xl font-bold font-fredoka leading-tight">
                                    {program.title}
                                </h3>
                                <p className="text-xs font-medium opacity-90 italic">
                                    {program.subTitle}
                                </p>
                                {/* Decorative Wave inside card */}
                                <div className="absolute -bottom-1 left-0 w-full overflow-hidden leading-none">
                                    <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-8 translate-y-2">
                                        <path d="M0.00,49.98 C149.99,150.00 349.20,-49.98 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" fill="#ffffff"></path>
                                    </svg>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 pt-10 flex-1 flex flex-col space-y-4">
                                <div className="space-y-3">
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${program.color.replace('bg-', 'bg-opacity-100 bg-')}`}></span>
                                        Age Group: <span className="ml-auto text-gray-800">{program.ageGroup}</span>
                                    </div>
                                    <div className="flex items-start text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-100 pb-2">
                                        <span className={`w-2 h-2 rounded-full mr-2 mt-1 ${program.color.replace('bg-', 'bg-opacity-100 bg-')}`}></span>
                                        Timings: <span className="ml-auto text-right text-gray-800 lowercase">{program.timings}</span>
                                    </div>
                                    <div className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-400">
                                        <span className={`w-2 h-2 rounded-full mr-2 ${program.color.replace('bg-', 'bg-opacity-100 bg-')}`}></span>
                                        {program.days}
                                    </div>
                                </div>

                                <p className="text-gray-600 text-xs md:text-sm leading-relaxed flex-1 italic text-center">
                                    {program.description}
                                </p>

                                <button className={`${program.btnColor} text-white py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg transform active:scale-95 flex items-center justify-center gap-2`}>
                                    <span className="bg-yellow-400 rounded-full w-5 h-5 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path>
                                        </svg>
                                    </span>
                                    Read More...
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom Animated Waves */}
            <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none h-[80px]">
                <svg className="relative block w-[200%] h-full animate-[wave_25s_linear_infinite_reverse]" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5,73.84-4.36,147.54,16.88,218.2,35.26,69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113,-9.11,1200,0V0Z" fill="#FDF7F1" opacity="0.3"></path>
                    <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.94,9.41,104.41,20.1,51.27,16.38,107.05,33.15,165.48,24.72,70-10.12,126-57.41,180.83-102.33C954.09,1.07,1013.84,2.5,1074.75,2.06c40.23-.29,79.8,1.4,119.25,15.75L1200,0Z" fill="#FDF7F1" opacity="0.5"></path>
                    <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.41C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#FDF7F1"></path>
                </svg>
            </div>

            <style jsx>{`
                @keyframes wave {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </section>
    );
};

export default ClassesSection;
