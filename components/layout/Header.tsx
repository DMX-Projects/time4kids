import Image from 'next/image';
import GooeyNav from '@/components/ui/GooeyNav';
import Link from 'next/link';

const Header = () => {
    const navItems = [
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/about' },
        { label: 'Programs', href: '/programs' },
        { label: 'Admission', href: '/admission' },
        { label: 'Locate Centre', href: '/locate-centre' },
        { label: 'Franchise', href: '/franchise' },
        { label: 'Parent Login', href: '/login/parents' },
        { label: 'Franchise Login', href: '/login/franchise' },
        { label: 'Contact', href: '/contact' },
    ];

    return (
        <header className="sticky top-0 left-0 right-0 z-50 bg-orange-500 shadow-md transition-all duration-300">
            <div className="container mx-auto px-4 py-2 flex justify-between items-center">
                <Link href="/" className="flex-shrink-0">
                    <div className="relative w-32 h-12 md:w-40 md:h-16 bg-white p-1 rounded-lg">
                        <Image
                            src="/logo.jpg"
                            alt="T.I.M.E. Kids Logo"
                            fill
                            className="object-contain"
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

                {/* Mobile Menu Toggle could go here */}
            </div>
        </header>
    );
};

export default Header;
