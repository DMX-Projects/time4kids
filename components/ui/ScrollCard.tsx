import React from 'react';
import Image from 'next/image';
import { Phone, Mail } from 'lucide-react';

interface Centre {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    pincode?: string;
    phone: string;
    email?: string;
}

interface ScrollCardProps {
    centre: Centre;
}

const ScrollCard: React.FC<ScrollCardProps> = ({ centre }) => {
    return (
        <div className="relative w-full max-w-4xl mx-auto my-8 aspect-[16/10] md:aspect-[16/9] lg:aspect-[2/1] flex items-center justify-center p-8 md:p-12">
            {/* Background Scroll Image */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/latest-scroll-bg.jpg"
                    alt="Parchment Scroll"
                    fill
                    className="object-contain drop-shadow-2xl"
                    priority
                />
            </div>

            {/* Content Container - Positioned to fit within the uncurled part of the scroll */}
            <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 py-8 md:px-16 lg:px-24">

                {/* Left Side: Text Details */}
                <div className="flex-1 text-center md:text-left space-y-4 max-w-md">
                    <h3 className="font-display font-bold text-2xl md:text-3xl text-[#003366]">
                        {centre.name}
                    </h3>

                    <p className="text-gray-700 font-medium leading-relaxed text-sm md:text-base">
                        {centre.address}<br />
                        {centre.city} - {centre.pincode}
                    </p>

                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-center md:justify-start gap-2 text-[#003366]">
                            <Phone className="w-4 h-4" />
                            <span className="font-bold">Mobile:</span>
                            <a href={`tel:${centre.phone}`} className="hover:underline">{centre.phone}</a>
                        </div>

                        {centre.email && (
                            <div className="flex items-center justify-center md:justify-start gap-2 text-[#003366]">
                                <Mail className="w-4 h-4" />
                                <span className="font-bold">EmailID:</span>
                                <a href={`mailto:${centre.email}`} className="hover:underline text-sm break-all">{centre.email}</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Centre Photo */}
                <div className="hidden md:block w-1/3 aspect-square relative rounded-xl overflow-hidden border-4 border-white shadow-lg transform rotate-2">
                    <Image
                        src="/centre-photo.png"
                        alt={`${centre.name} Photo`}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>
        </div>
    );
};

export default ScrollCard;
