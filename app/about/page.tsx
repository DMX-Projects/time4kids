'use client';

import React from 'react';
import { Building2, Target, Lightbulb, Award, School, Home, GraduationCap, Users, BookOpen, Heart, Sparkles } from 'lucide-react';
import MagicalStorySection from './MagicalStorySection';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

// Simple Card Component
const Card = ({ children, className = '' }: CardProps) => (
    <div className={`p-6 rounded-2xl ${className}`}>
        {children}
    </div>
);

// Floating Bubbles Animation
const FloatingBubbles = ({ count = 20 }) => (
    <>
        <style jsx>{`
            @keyframes float {
                0%, 100% { transform: translateY(0) translateX(0); }
                25% { transform: translateY(-20px) translateX(10px); }
                50% { transform: translateY(-40px) translateX(-10px); }
                75% { transform: translateY(-20px) translateX(5px); }
            }
            @keyframes bubble-rise {
                0% { transform: translateY(100vh) scale(0); opacity: 0; }
                10% { opacity: 0.6; }
                90% { opacity: 0.6; }
                100% { transform: translateY(-100vh) scale(1); opacity: 0; }
            }
        `}</style>
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/40 backdrop-blur-sm border border-white/30"
                style={{
                    width: `${20 + Math.random() * 60}px`,
                    height: `${20 + Math.random() * 60}px`,
                    left: `${Math.random() * 100}%`,
                    animation: `bubble-rise ${10 + Math.random() * 20}s linear infinite`,
                    animationDelay: `${Math.random() * 10}s`
                }}
            />
        ))}
    </>
);

// Wavy Divider Component
const WavyDivider = ({ flip = false, color = 'fill-white' }) => (
    <div className={`w-full ${flip ? 'rotate-180' : ''}`} style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24 wave-anim">
            <path d="M0,0 C150,80 350,80 600,50 C850,20 1050,20 1200,50 L1200,120 L0,120 Z" className={color} />
        </svg>
    </div>
);

// Zigzag Divider Component
const ZigzagDivider = ({ color = 'fill-white' }) => (
    <div className="w-full" style={{ lineHeight: 0 }}>
        <svg viewBox="0 0 1200 60" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path d="M0,30 L100,0 L200,30 L300,0 L400,30 L500,0 L600,30 L700,0 L800,30 L900,0 L1000,30 L1100,0 L1200,30 L1200,60 L0,60 Z" className={color} />
        </svg>
    </div>
);

// Twinkling Stars Animation
const TwinklingStars = ({ count = 15 }) => (
    <>
        {[...Array(count)].map((_, i) => (
            <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-pulse"
                style={{
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                }}
            />
        ))}
    </>
);

export default function AboutPage() {
    const businesses = [
        {
            name: 'T.I.M.E.',
            description: 'National leader in entrance exam training',
            icon: Award,
        },
        {
            name: 'CLAT Training',
            description: 'Specialized coaching for law entrance exams',
            icon: Building2,
        },
        {
            name: 'School Level Programs',
            description: 'Academic support for school students',
            icon: Lightbulb,
        },
        {
            name: 'T.I.M.E. School',
            description: 'Complete K-12 education',
            icon: Target,
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Global Floating Bubbles */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <FloatingBubbles count={15} />
            </div>

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary-50 via-purple-50 to-secondary-50 py-12 relative overflow-hidden">
                <TwinklingStars count={20} />

                {/* Animated Floating Shapes */}
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30 animate-drift" style={{ animationDelay: '0s' }}></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-30 animate-drift-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-40 right-40 w-12 h-12 bg-blue-300 rounded-full opacity-30 animate-drift" style={{ animationDelay: '2s' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block mb-4 animate-on-scroll">
                            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                <Sparkles className="inline w-4 h-4 mr-2" />
                                Trusted by 250+ Schools Nationwide
                            </span>
                        </div>
                        <h1 className="font-luckiest text-5xl md:text-7xl mb-4 animate-on-scroll delay-100 tracking-wider text-[#003366]">
                            About <span className="text-[#E67E22]">T.I.M.E. Kids</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6 animate-on-scroll delay-200">
                            Where little dreamers become big achievers!
                        </p>
                        <p className="text-base text-gray-600 animate-on-scroll delay-300">
                            A legacy of educational excellence spanning over 17 years in early childhood education
                        </p>
                    </div>
                </div>
            </section>

            {/* Wavy Divider */}
            <WavyDivider color="fill-white" />

            {/* Our Magical Story with Aeroplanes */}
            <MagicalStorySection />

            {/* Fun Stats Section */}
            <section className="py-8 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-6xl mx-auto">
                        {/* Fun Stats with Oval Icons */}
                        <ul className="flex flex-wrap justify-center gap-8 md:gap-12">
                            {/* 250+ Pre-schools */}
                            <li className="text-center flex flex-col items-center">
                                <figure className="w-32 h-20 md:w-40 md:h-24 flex items-center justify-center mb-3 transition-all duration-400 hover:rotate-[20deg] hover:rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgb(236, 178, 72) 0%, rgb(221, 103, 5) 100%)',
                                        borderRadius: '67% 33% 39% 61% / 37% 57% 43% 63%',
                                        boxShadow: '0px 0px 32px -3px rgba(0, 0, 0, 0.44)'
                                    }}>
                                    <span className="flex items-center justify-center">
                                        <School className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                    </span>
                                </figure>
                                <div className="font-bold text-2xl md:text-3xl text-primary-600 mb-1">250+</div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">Pre-schools</div>
                            </li>

                            {/* 30+ Years Legacy */}
                            <li className="text-center flex flex-col items-center">
                                <figure className="w-32 h-20 md:w-40 md:h-24 flex items-center justify-center mb-3 transition-all duration-400 hover:rotate-[20deg] hover:rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgb(176, 205, 103) 0%, rgb(120, 159, 53) 100%)',
                                        borderRadius: '42% 58% 37% 63% / 63% 44% 56% 37%',
                                        boxShadow: '0px 0px 32px -3px rgba(0, 0, 0, 0.44)'
                                    }}>
                                    <span className="flex items-center justify-center">
                                        <Award className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                    </span>
                                </figure>
                                <div className="font-bold text-2xl md:text-3xl text-secondary-600 mb-1">30+</div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">Years Legacy</div>
                            </li>

                            {/* 17+ Years in ECE */}
                            <li className="text-center flex flex-col items-center">
                                <figure className="w-32 h-20 md:w-40 md:h-24 flex items-center justify-center mb-3 transition-all duration-400 hover:rotate-[20deg] hover:rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgb(211, 102, 85) 0%, rgb(188, 85, 69) 40%, rgb(189, 43, 19) 100%)',
                                        borderRadius: '69% 31% 53% 47% / 41% 69% 31% 59%',
                                        boxShadow: '0px 0px 32px -3px rgba(0, 0, 0, 0.44)'
                                    }}>
                                    <span className="flex items-center justify-center">
                                        <Heart className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                    </span>
                                </figure>
                                <div className="font-bold text-2xl md:text-3xl text-pink-600 mb-1">17+</div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">Years in ECE</div>
                            </li>

                            {/* 1000s Happy Kids */}
                            <li className="text-center flex flex-col items-center">
                                <figure className="w-32 h-20 md:w-40 md:h-24 flex items-center justify-center mb-3 transition-all duration-400 hover:rotate-[20deg] hover:rounded-2xl"
                                    style={{
                                        background: 'linear-gradient(135deg, rgb(236, 178, 72) 0%, rgb(221, 103, 5) 100%)',
                                        borderRadius: '67% 33% 39% 61% / 37% 57% 43% 63%',
                                        boxShadow: '0px 0px 32px -3px rgba(0, 0, 0, 0.44)'
                                    }}>
                                    <span className="flex items-center justify-center">
                                        <Users className="w-12 h-12 md:w-14 md:h-14 text-white" />
                                    </span>
                                </figure>
                                <div className="font-bold text-2xl md:text-3xl text-purple-600 mb-1">1000s</div>
                                <div className="text-sm md:text-base text-gray-600 font-medium">Happy Kids</div>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Zigzag Divider */}
            <ZigzagDivider color="fill-yellow-50" />

            {/* Vision & Philosophy */}
            <section className="py-8 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
                <TwinklingStars count={15} />

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 blur-2xl animate-drift"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-20 blur-2xl animate-drift-slow"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="font-bubblegum text-4xl md:text-5xl mb-3 text-[#003366] tracking-wide">
                            What We <span className="text-[#ef5f5f]">Believe In</span>
                        </h2>
                        <p className="text-gray-600 text-base">Our guiding stars in nurturing young minds</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto mb-16">
                        {/* Our Vision - Organic Shape 1 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-[#ef5f5f] rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] transform rotate-3 scale-105 opacity-20 group-hover:rotate-6 transition-transform duration-500"></div>
                            <div className="bg-gradient-to-br from-primary-500 to-primary-600 text-white relative rounded-[40%_60%_70%_30%_/_40%_50%_60%_50%] p-16 md:p-24 shadow-xl border-4 border-primary-300 hover:border-primary-200 transition-all duration-500 hover:-translate-y-2 h-full min-h-[500px] flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        <Target className="w-12 h-12 text-white animate-pulse-soft" />
                                    </div>
                                    <h3 className="font-display font-bold text-4xl mb-6">Our Vision</h3>
                                    <p className="text-white/95 leading-relaxed text-xl font-medium max-w-md mx-auto">
                                        To be the most trusted and preferred preschool chain in India, providing world-class early childhood education that nurtures every child&apos;s potential and prepares them for a bright future.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Our Philosophy - Organic Shape 2 */}
                        <div className="group relative">
                            <div className="absolute inset-0 bg-secondary-500 rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] transform -rotate-2 scale-105 opacity-20 group-hover:-rotate-6 transition-transform duration-500"></div>
                            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white relative rounded-[60%_40%_30%_70%_/_60%_30%_70%_40%] p-16 md:p-24 shadow-xl border-4 border-secondary-300 hover:border-secondary-200 transition-all duration-500 hover:-translate-y-2 h-full min-h-[500px] flex flex-col justify-center">
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-10 rounded-full -mr-10 -mt-10 pointer-events-none"></div>
                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6 backdrop-blur-sm shadow-inner group-hover:scale-110 transition-transform duration-300">
                                        <Lightbulb className="w-12 h-12 text-white animate-pulse-soft" />
                                    </div>
                                    <h3 className="font-display font-bold text-4xl mb-6">Our Philosophy</h3>
                                    <p className="text-white/95 leading-relaxed text-xl font-medium max-w-md mx-auto">
                                        We believe in holistic development through play-based learning, fostering creativity, curiosity, and confidence in every child. Our approach combines traditional values with modern educational practices.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Core Values */}
                    <div className="max-w-5xl mx-auto">
                        <h3 className="font-display font-bold text-3xl text-center mb-6">Our Core Values</h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-xl mb-2 text-gray-800">Care & Safety</h4>
                                <p className="text-gray-600">Every child is precious and deserves a nurturing environment</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-xl mb-2 text-gray-800">Creativity First</h4>
                                <p className="text-gray-600">Encouraging imagination and innovative thinking</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:scale-105 text-center">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <BookOpen className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-xl mb-2 text-gray-800">Holistic Growth</h4>
                                <p className="text-gray-600">Developing mind, body, and character together</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Wavy Divider */}
            <WavyDivider flip={true} color="fill-white" />

            {/* T.I.M.E. Group Businesses */}
            <section className="py-8 bg-white relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary-500 rounded-full blur-3xl"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-10">
                        <div className="inline-block mb-3">
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full text-sm font-semibold">
                                <Award className="inline w-4 h-4 mr-2" />
                                30+ Years of Excellence
                            </span>
                        </div>
                        <h2 className="font-bubblegum text-4xl md:text-5xl mb-3 text-[#003366] tracking-wide">
                            Part of the <span className="text-[#ef5f5f]">T.I.M.E. Group</span>
                        </h2>
                        <p className="text-base text-gray-600 max-w-2xl mx-auto">
                            Backed by three decades of educational excellence across multiple domains,
                            bringing trusted expertise to early childhood education
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {businesses.map((business, index) => (
                            <Card key={index} className="text-center group hover:scale-105 transition-transform bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 hover:border-primary-300">
                                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-lg">
                                    <business.icon className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="font-display font-bold text-xl mb-3 text-gray-900">{business.name}</h3>
                                <p className="text-gray-600">{business.description}</p>
                            </Card>
                        ))}
                    </div>

                    {/* Why Choose Us Section */}
                    <div className="mt-10 max-w-5xl mx-auto">
                        <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 md:p-10 shadow-xl">
                            <h3 className="font-display font-bold text-2xl text-center mb-6">
                                Why Parents <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Trust Us</span>
                            </h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Award className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Proven Track Record</h4>
                                        <p className="text-gray-600 text-sm">30+ years of educational excellence and expertise</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Trained Educators</h4>
                                        <p className="text-gray-600 text-sm">Well-qualified and caring teachers who love children</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Age-Appropriate Curriculum</h4>
                                        <p className="text-gray-600 text-sm">Based on child development best practices</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                        <Home className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">Home-Like Environment</h4>
                                        <p className="text-gray-600 text-sm">Safe, warm, and nurturing spaces for learning</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <style jsx>{`
                /* Fade In Up Animation for Content */
                .animate-on-scroll {
                    animation: fadeInUp 0.8s ease-out forwards;
                    opacity: 0;
                }
                
                /* Staggered delays children */
                .delay-100 { animation-delay: 0.1s; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-400 { animation-delay: 0.4s; }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Drifting Animation for Background Elements */
                .animate-drift {
                    animation: drift 10s ease-in-out infinite alternate;
                }
                
                .animate-drift-slow {
                    animation: drift 15s ease-in-out infinite alternate-reverse;
                }

                @keyframes drift {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(20px, 10px); }
                }

                /* Softer, Cleaner Cloud Shapes */
                .cloud-card-1 { border-radius: 30px; }
                .cloud-card-2 { border-radius: 30px; }
                .cloud-card-3 { border-radius: 30px; }
                .cloud-card-4 { border-radius: 30px; }
                
                .hover-float {
                    transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
                }
                .hover-float:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                }

                .wave-anim path {
                    animation: waveMove 20s linear infinite;
                }
                
                @keyframes waveMove {
                    0% { transform: translateX(0); }
                    50% { transform: translateX(-2%); }
                    100% { transform: translateX(0); }
                }

                /* More pronounced bounce for bubbles */
                @keyframes wobble {
                    0%, 100% { transform: rotate(0deg); }
                    25% { transform: rotate(-2deg); }
                    75% { transform: rotate(2deg); }
                }
            `}</style>
        </div >
    );
}