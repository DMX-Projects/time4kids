import { Phone, Mail, MapPin } from 'lucide-react';
import SchoolContactForm from './SchoolContactForm';

export default function ContactSection({ school, franchiseSlug }: { school: any, franchiseSlug?: string }) {
    if (!school) return null;

    return (
        <section id="contact" className="pt-8 pb-16 md:pt-12 md:pb-20 bg-gradient-to-b from-[#fdfbf7] to-white relative overflow-hidden scroll-mt-24">
            {/* Decorative Blobs */}
            <div className="absolute top-20 right-0 w-64 h-64 bg-green-200/30 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-20 left-0 w-80 h-80 bg-orange-200/30 rounded-full blur-3xl -z-10"></div>

            <div className="container mx-auto px-4">
                <div className="text-center mb-8">
                    <span className="inline-block py-2 px-6 rounded-full bg-green-100 text-green-700 font-bold text-sm uppercase tracking-widest mb-4 border border-green-200">
                        Get in Touch
                    </span>
                    <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gray-900 drop-shadow-sm">Contact Us</h2>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto items-start">
                    <div className="space-y-8">
                        {/* Address Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-orange-100/50 flex items-start gap-6 hover:shadow-[0_8px_30px_rgb(249,115,22,0.15)] transition-all duration-500 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-orange-200 group-hover:scale-110 transition-transform duration-500">
                                <MapPin size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-orange-500 mb-2 uppercase tracking-widest">Visit Us</h4>
                                <p className="text-gray-800 leading-snug text-lg font-bold font-fredoka">{school.address}</p>
                            </div>
                        </div>

                        {/* Phone Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-green-100/50 flex items-start gap-6 hover:shadow-[0_8px_30px_rgb(34,197,94,0.15)] transition-all duration-500 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform duration-500">
                                <Phone size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-green-500 mb-2 uppercase tracking-widest">Call Us</h4>
                                <a href={`tel:${school.phone}`} className="text-gray-800 hover:text-green-600 text-xl font-bold transition-colors block tracking-tight font-fredoka">{school.phone}</a>
                            </div>
                        </div>

                        {/* Email Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-100/50 flex items-start gap-6 hover:shadow-[0_8px_30px_rgb(59,130,246,0.15)] transition-all duration-500 group">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform duration-500">
                                <Mail size={24} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-blue-500 mb-2 uppercase tracking-widest">Email Us</h4>
                                <a href={`mailto:${school.email}`} className="text-gray-800 hover:text-blue-600 text-lg font-bold transition-colors block break-all font-fredoka">{school.email || 'info@timekidspreschools.com'}</a>
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <SchoolContactForm franchiseSlug={franchiseSlug} city={school.city} />
                    </div>
                </div>
            </div>
        </section>
    );
}
