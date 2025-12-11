import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowRight, MapPin, Briefcase } from 'lucide-react';

const CTASection = () => {
    return (
        <section className="py-20 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white relative overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="font-display font-bold text-4xl md:text-5xl mb-4">
                        Ready to Get Started?
                    </h2>
                    <p className="text-xl text-white/90 max-w-2xl mx-auto">
                        Join the T.I.M.E. Kids family and give your child the best start in their educational journey.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Admission CTA */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <ArrowRight className="w-8 h-8" />
                        </div>
                        <h3 className="font-display font-bold text-2xl mb-3 text-center">Admission Enquiry</h3>
                        <p className="text-white/80 mb-6 text-center">Start your child's learning journey with us today.</p>
                        <Link href="/admission" className="block">
                            <Button variant="outline" className="w-full bg-white text-primary-600 hover:bg-gray-100 border-0">
                                Enquire Now
                            </Button>
                        </Link>
                    </div>

                    {/* Locate Centre CTA */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <MapPin className="w-8 h-8" />
                        </div>
                        <h3 className="font-display font-bold text-2xl mb-3 text-center">Find a Centre</h3>
                        <p className="text-white/80 mb-6 text-center">Locate the nearest T.I.M.E. Kids centre in your area.</p>
                        <Link href="/locate-centre" className="block">
                            <Button variant="outline" className="w-full bg-white text-primary-600 hover:bg-gray-100 border-0">
                                Locate Now
                            </Button>
                        </Link>
                    </div>

                    {/* Franchise CTA */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/20 transition-all hover:scale-105">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                            <Briefcase className="w-8 h-8" />
                        </div>
                        <h3 className="font-display font-bold text-2xl mb-3 text-center">Franchise Opportunity</h3>
                        <p className="text-white/80 mb-6 text-center">Partner with us and start your own preschool.</p>
                        <Link href="/franchise" className="block">
                            <Button variant="outline" className="w-full bg-white text-primary-600 hover:bg-gray-100 border-0">
                                Learn More
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
