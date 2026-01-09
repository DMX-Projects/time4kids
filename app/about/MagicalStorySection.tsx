'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Home, GraduationCap } from 'lucide-react';
import WaveBackground from '../animations/WaveBackground';

const RedBiplane = () => (
    <svg viewBox="80 20 420 180" className="w-full h-full drop-shadow-2xl filter" style={{ overflow: 'visible' }}>
        <style>
            {`
                .propeller-spin {
                    transform-origin: 480px 85px;
                    animation: prop-spin 0.2s linear infinite;
                }
                @keyframes prop-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}
        </style>
        {/* Propeller - CSS Animated */}
        <g className="propeller-spin">
            <g transform="translate(480, 85)">
                <rect x="-5" y="-35" width="10" height="70" fill="#e5e5e5" rx="2" />
                <circle cx="0" cy="0" r="5" fill="#333" />
            </g>
        </g>

        {/* Plane Body */}
        <path d="M150,80 Q250,60 400,80 L480,90 L400,120 Q250,140 150,110 Z" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />

        {/* Wings */}
        <path d="M220,85 L380,85 L360,50 L240,50 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
        <path d="M220,95 L380,95 L390,120 L210,120 Z" fill="#b91c1c" />

        {/* Struts */}
        <line x1="250" y1="50" x2="250" y2="85" stroke="#333" strokeWidth="2" />
        <line x1="350" y1="50" x2="350" y2="85" stroke="#333" strokeWidth="2" />
        <line x1="250" y1="50" x2="350" y2="85" stroke="#333" strokeWidth="1" />
        <line x1="350" y1="50" x2="250" y2="85" stroke="#333" strokeWidth="1" />

        {/* Tail */}
        <path d="M150,80 L120,60 L100,60 L150,90" fill="#dc2626" stroke="#b91c1c" strokeWidth="2" />
        <path d="M150,110 L120,130 L160,115" fill="#dc2626" />

        {/* Cockpit / Pilot */}
        <path d="M300,80 Q320,60 340,80" fill="#333" opacity="0.5" />
        <circle cx="320" cy="75" r="8" fill="#333" />

        {/* Wheels */}
        <g transform="translate(300, 130)">
            <rect x="0" y="0" width="20" height="20" rx="10" fill="#111" />
            <rect x="50" y="0" width="20" height="20" rx="10" fill="#111" />
            <line x1="10" y1="0" x2="20" y2="-20" stroke="#333" strokeWidth="3" />
            <line x1="60" y1="0" x2="50" y2="-20" stroke="#333" strokeWidth="3" />
        </g>
    </svg>
);

const RopeHarness = ({ direction }: { direction: 'left' | 'right' }) => (
    <div className="w-12 h-24 flex items-center justify-center shrink-0 z-0 relative hidden md:flex"
        style={{
            marginTop: '10px',
            marginLeft: direction === 'right' ? '-5px' : '-5px',
            marginRight: direction === 'left' ? '-5px' : '-5px',
        }}>
        <svg viewBox="0 0 100 60" className="w-full h-full" style={{ overflow: 'visible' }}>
            {/* The Bridle/Harness */}
            {direction === 'right' ? (
                <>
                    {/* Connecting to Left (Banner) */}
                    <path d="M-10,15 L60,30 L-10,45" fill="none" stroke="#fff" strokeWidth="2" />
                    {/* Connecting to Right (Plane) - Extend line further right to ensure connection */}
                    <path d="M60,30 L120,30" fill="none" stroke="#fff" strokeWidth="2" />
                    {/* Dots for connection points */}
                    <circle cx="-10" cy="15" r="3" fill="#fff" />
                    <circle cx="-10" cy="45" r="3" fill="#fff" />
                </>
            ) : (
                <>
                    {/* Connecting to Right (Banner) */}
                    <path d="M110,15 L40,30 L110,45" fill="none" stroke="#fff" strokeWidth="2" />
                    {/* Connecting to Left (Plane) - Extend line further left */}
                    <path d="M40,30 L-20,30" fill="none" stroke="#fff" strokeWidth="2" />
                    {/* Dots for connection points */}
                    <circle cx="110" cy="15" r="3" fill="#fff" />
                    <circle cx="110" cy="45" r="3" fill="#fff" />
                </>
            )}
        </svg>
    </div>
);

const BannerCard = ({ children, direction }: { children: React.ReactNode; direction: 'left' | 'right' }) => {
    // direction='right': Plane is on Right. Banner on Left. Tail of banner is Left side.
    // Cut notch on Left side.
    const clipPath = direction === 'right'
        ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 30px 50%)'
        : 'polygon(0% 0%, 100% 0%, calc(100% - 30px) 50%, 100% 100%, 0% 100%)';

    const padding = direction === 'right'
        ? 'py-8 pr-8 pl-14' // More padding on Left for notch
        : 'py-8 pl-8 pr-14'; // More padding on Right for notch

    return (
        <div className="relative filter drop-shadow-xl flex-1 w-full scale-100 md:scale-95">
            <div
                className={`bg-white text-gray-800 min-h-[160px] flex items-center ${padding}`}
                style={{
                    clipPath: clipPath,
                }}
            >
                {children}
            </div>
        </div>
    );
};

interface InfoCardProps {
    icon: React.ReactNode;
    iconBg: string; // Tailwind bg class
    children: React.ReactNode;
    planePosition: 'left' | 'right';
    delay: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, iconBg, children, planePosition, delay }) => {
    const isPlaneRight = planePosition === 'right';

    return (
        <motion.div
            className={`relative w-full max-w-7xl mx-auto flex flex-col items-center justify-center -space-y-4 md:space-y-0 mb-20 ${isPlaneRight ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            animate={{
                y: [0, -10, 0],
            }}
            transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: delay
            }}
        >

            <motion.div
                className="w-full md:flex-1 relative z-10"
                initial={{ x: isPlaneRight ? -50 : 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay, type: 'spring', bounce: 0.2 }}
            >
                <BannerCard direction={isPlaneRight ? 'right' : 'left'}>
                    <div className="flex items-start gap-5">
                        <div className={`flex-shrink-0 w-14 h-14 ${iconBg} rounded-xl flex items-center justify-center shadow-md text-white`}>
                            {icon}
                        </div>
                        <div className="flex-1 font-quicksand text-base md:text-lg leading-relaxed font-medium">
                            {children}
                        </div>
                    </div>
                </BannerCard>
            </motion.div>

            {/* 2. The Rope - Adjusted positioning for tighter fit */}
            <motion.div
                className="z-0"
                initial={{ opacity: 0, width: 0 }}
                whileInView={{ opacity: 1, width: 'auto' }}
                transition={{ duration: 0.8, delay: delay + 0.2 }}
            >
                <RopeHarness direction={isPlaneRight ? 'right' : 'left'} />
            </motion.div>

            {/* 3. The Plane - Reduced margin to pull it closer to rope */}
            <motion.div
                className="w-48 md:w-64 flex-shrink-0 z-20 relative -ml-4 md:-ml-8" // Negative margin to overlap rope
                style={{
                    // Flip negative margin for left flying plane logic handled by flex-row-reverse? 
                    // No, if flex-row-reverse, the 'Left' margin becomes visually 'Right' margin in some contexts, but let's stick to explicit spacing.
                    // Actually, if we use flex-row-reverse, the elements are: [Plane] [Rope] [Banner]. 
                    // We need overlap between Plane and Rope.
                    marginLeft: isPlaneRight ? '-20px' : '0',
                    marginRight: isPlaneRight ? '0' : '-20px'
                }}
                initial={{ x: isPlaneRight ? 100 : -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{
                    default: { duration: 1, delay, type: "spring", bounce: 0.3 }
                }}
            >
                <div className={`transform ${isPlaneRight ? 'scale-x-100' : 'scale-x-[-1]'}`}>
                    <RedBiplane />
                </div>
            </motion.div>

        </motion.div>
    );
};

export default function MagicalStorySection() {
    return (
        <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#7DD3FC] to-[#93C5FD] py-20 min-h-screen flex flex-col items-center justify-center">
            {/* Thread Wave Animations */}
            {/* <WaveBackground position="bottom" color="#e1f6fb" opacity={1} className="z-10" /> */}

            {/* Decorative Clouds */}
            <div className="absolute top-32 left-10 opacity-60 animate-float pointer-events-none">
                <svg width="100" height="60" viewBox="0 0 100 60" fill="white">
                    <path d="M10 40 Q20 10 40 30 Q60 10 80 30 T90 40 Q100 60 80 60 H20 Q0 60 10 40" />
                </svg>
            </div>
            <div className="absolute top-40 right-20 opacity-40 animate-float pointer-events-none" style={{ animationDelay: '1s' }}>
                <svg width="120" height="70" viewBox="0 0 100 60" fill="white">
                    <path d="M10 40 Q20 10 40 30 Q60 10 80 30 T90 40 Q100 60 80 60 H20 Q0 60 10 40" />
                </svg>
            </div>

            <div className="container mx-auto px-4 z-10 relative mt-16 md:mt-0">
                {/* Section Header */}
                <motion.div
                    className="text-center mb-24"
                    initial={{ y: -50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="font-bubblegum text-5xl md:text-6xl text-white drop-shadow-lg mb-4 tracking-wide">
                        Our <span className="text-[#ef5f5f]">Magical</span> Story
                    </h2>
                    <p className="font-fredoka text-xl text-white/90">A journey of love, learning, and laughter!</p>
                </motion.div>

                {/* Info Cards with Planes */}
                <div className="space-y-12">
                    {/* Card 1 - Plane on RIGHT pulling Text on LEFT */}
                    <InfoCard
                        icon={<Building2 className="w-8 h-8 text-white" />}
                        iconBg="bg-gradient-to-br from-orange-400 to-orange-600"
                        planePosition="right"
                        delay={0.2}
                    >
                        <p>
                            <strong className="text-gray-900">T.I.M.E. Kids pre-schools</strong> is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with{' '}
                            <span className="text-orange-600 font-bold">250+ pre-schools</span> is now poised for major expansion across the country.
                        </p>
                    </InfoCard>

                    {/* Card 2 - Plane on LEFT pulling Text on RIGHT */}
                    <InfoCard
                        icon={<Home className="w-8 h-8 text-white" />}
                        iconBg="bg-gradient-to-br from-pink-400 to-pink-600"
                        planePosition="left"
                        delay={0.4}
                    >
                        <p>
                            The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the{' '}
                            <span className="text-blue-600 font-bold">warm, safe and caring learning environment</span> that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.
                        </p>
                    </InfoCard>

                    {/* Card 3 - Plane on RIGHT pulling Text on LEFT */}
                    <InfoCard
                        icon={<GraduationCap className="w-8 h-8 text-white" />}
                        iconBg="bg-gradient-to-br from-purple-400 to-purple-600"
                        planePosition="right"
                        delay={0.6}
                    >
                        <p>
                            T.I.M.E. Kids pre-schools are backed by our educational expertise of{' '}
                            <span className="text-orange-600 font-bold">over 30 years</span>, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development practices.
                        </p>
                    </InfoCard>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
            `}</style>
        </section>
    );
}