'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Header = () => {
    const pathname = usePathname();

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
        <header className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md transition-all duration-300">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                {/* Logo */}
                <Link href="/" className="flex-shrink-0">
                    <div className="relative w-32 h-12 md:w-40 md:h-14">
                        <Image
                            src="/logo.jpg"
                            alt="T.I.M.E. Kids Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>

                {/* Center Navigation */}
                <nav className="hidden lg:flex flex-1 justify-center">
                    <ul className="flex items-center gap-16 list-none m-0 p-0">
                        {navItems.map((item, index) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={index}>
                                    <Link
                                        href={item.href}
                                        className={`text-lg font-medium transition-colors duration-200 hover:text-[#FF6B6B] ${isActive ? 'text-[#FF6B6B]' : 'text-gray-700'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Mobile Menu Toggle could go here */}
            </div>

            {/* Wavy Border at the bottom with colorful gradient */}
            <div className="wavy-border h-6 w-full relative overflow-hidden">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1200 60" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: '#FFD93D', stopOpacity: 1 }} />
                            <stop offset="30%" style={{ stopColor: '#6BCF7F', stopOpacity: 1 }} />
                            <stop offset="60%" style={{ stopColor: '#4ECDC4', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#5DADE2', stopOpacity: 1 }} />
                        </linearGradient>
                    </defs>
                    <path
                        d="M0,30 Q150,10 300,30 T600,30 T900,30 T1200,30 L1200,60 L0,60 Z"
                        fill="url(#waveGradient)"
                    />
                </svg>
            </div>
        </header>
    );
};

export default Header;

