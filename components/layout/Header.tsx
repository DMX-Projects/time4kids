import Image from 'next/image';
import Link from 'next/link';
import GooeyNav from '@/components/ui/GooeyNav';

const Header = () => {
    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Programs', href: '/programs' },
        { label: 'Admission', href: '/admission' },
        { label: 'Locate Centre', href: '/locate-centre' },
        { label: 'Franchise', href: '/franchise' },
        { label: 'Login', href: '/login/' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header className="sticky top-0 left-0 right-0 z-50 transition-all duration-300">
            {/* 1. Main Header Content Section */}
            <div className="bg-orange-500">
                <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                    <Link href="/" className="flex-shrink-0">
                        <div className="relative w-32 h-12 md:w-44 md:h-16 bg-white p-2 rounded-xl shadow-sm">
                            <Image
                                src="/logo.jpg"
                                alt="T.I.M.E. Kids Logo"
                                fill
                                className="object-contain px-1"
                                priority
                            />
                        </div>
                    </Link>

                    <div className="hidden lg:block">
                        <GooeyNav
                            items={navItems}
                            particleCount={15}
                            particleDistances={[90, 10]}
                            particleR={100}
                            initialActiveIndex={0}
                            animationTime={600}
                            timeVariance={300}
                            colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                        />
                    </div>
                </div>
            </div>

            {/* 2. Scalloped Bottom Border Section */}
            <div className="relative w-full leading-[0] -mt-[1px]">
                <svg
                    className="w-full h-4 md:h-6 block"
                    viewBox="0 0 1200 24"
                    preserveAspectRatio="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* This path creates a solid orange shape with a curved bottom edge */}
                    <path
                        d="M0,0 V12 Q15,24 30,12 T60,12 T90,12 T120,12 T150,12 T180,12 T210,12 T240,12 T270,12 T300,12 T330,12 T360,12 T390,12 T420,12 T450,12 T480,12 T510,12 T540,12 T570,12 T600,12 T630,12 T660,12 T690,12 T720,12 T750,12 T780,12 T810,12 T840,12 T870,12 T900,12 T930,12 T960,12 T990,12 T1020,12 T1050,12 T1080,12 T1110,12 T1140,12 T1170,12 T1200,12 V0 Z"
                        fill="#f97316" /* Matches bg-orange-500 */
                    />
                </svg>
            </div>
        </header>
    );
};

export default Header;