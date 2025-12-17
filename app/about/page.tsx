'use client';

import React from 'react';
import { Building2, Target, Lightbulb, Award, School, Home, GraduationCap, Users, BookOpen, Heart, Sparkles } from 'lucide-react';

// Simple Card Component
const Card = ({ children, className = '' }) => (
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
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-16 md:h-24">
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
                <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
                <div className="absolute bottom-20 right-20 w-16 h-16 bg-pink-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
                <div className="absolute top-40 right-40 w-12 h-12 bg-blue-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '2s', animationDuration: '3.5s' }}></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block mb-4">
                            <span className="bg-gradient-to-r from-primary-500 to-secondary-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                                <Sparkles className="inline w-4 h-4 mr-2" />
                                Trusted by 250+ Schools Nationwide
                            </span>
                        </div>
                        <h1 className="font-display font-bold text-4xl md:text-6xl mb-4 animate-fade-in">
                            About <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">T.I.M.E. Kids</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
                            Where little dreamers become big achievers!
                        </p>
                        <p className="text-base text-gray-600">
                            A legacy of educational excellence spanning over 17 years in early childhood education
                        </p>
                    </div>
                </div>
            </section>

            {/* Wavy Divider */}
            <WavyDivider color="fill-white" />

            {/* About T.I.M.E. Kids */}
            <section className="py-8 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
                                Our <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Magical</span> Story
                            </h2>
                            <p className="text-gray-600 text-base">A journey of love, learning, and laughter!</p>
                        </div>

                        {/* Content Cards */}
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <School className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with <span className="font-bold text-primary-600">250+ pre-schools</span> is now poised for major expansion across the country.
                                </p>
                            </div>

                            <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                                <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <Home className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the <span className="font-semibold text-secondary-600">warm, safe and caring learning environment</span> that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.
                                </p>
                            </div>

                            <div className="flex items-start gap-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                    <GraduationCap className="w-8 h-8 text-white" />
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    T.I.M.E. Kids pre-schools are backed by our educational expertise of <span className="font-bold text-primary-600">over 30 years</span>, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development practices.
                                </p>
                            </div>
                        </div>

                        {/* Fun Stats with Icons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                    <School className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-primary-600 mb-1">250+</div>
                                <div className="text-xs text-gray-600 font-medium">Pre-schools</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-secondary-600 mb-1">30+</div>
                                <div className="text-xs text-gray-600 font-medium">Years Legacy</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                    <Heart className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-pink-600 mb-1">17+</div>
                                <div className="text-xs text-gray-600 font-medium">Years in ECE</div>
                            </div>
                            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105">
                                <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <div className="text-2xl font-bold text-purple-600 mb-1">1000s</div>
                                <div className="text-xs text-gray-600 font-medium">Happy Kids</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Zigzag Divider */}
            <ZigzagDivider color="fill-yellow-50" />

            {/* Vision & Philosophy */}
            <section className="py-8 bg-gradient-to-br from-yellow-50 via-pink-50 to-purple-50 relative overflow-hidden">
                <TwinklingStars count={15} />

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full opacity-20 blur-2xl"></div>
                <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-pink-300 to-purple-300 rounded-full opacity-20 blur-2xl"></div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center mb-8">
                        <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
                            What We <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">Believe In</span>
                        </h2>
                        <p className="text-gray-600 text-base">Our guiding stars in nurturing young minds</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto mb-8">
                        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white hover:scale-105 transition-transform relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <Target className="w-16 h-16" />
                                    <h3 className="font-display font-bold text-3xl">Our Vision</h3>
                                </div>
                                <p className="text-white/95 leading-relaxed text-lg">
                                    To be the most trusted and preferred preschool chain in India, providing world-class early childhood education that nurtures every child&apos;s potential and prepares them for a bright future.
                                </p>
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-secondary-500 to-secondary-600 text-white hover:scale-105 transition-transform relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-4">
                                    <Lightbulb className="w-16 h-16" />
                                    <h3 className="font-display font-bold text-3xl">Our Philosophy</h3>
                                </div>
                                <p className="text-white/95 leading-relaxed text-lg">
                                    We believe in holistic development through play-based learning, fostering creativity, curiosity, and confidence in every child. Our approach combines traditional values with modern educational practices.
                                </p>
                            </div>
                        </Card>
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
                        <h2 className="font-display font-bold text-3xl md:text-4xl mb-3">
                            Part of the <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">T.I.M.E. Group</span>
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
        </div>
    );
}