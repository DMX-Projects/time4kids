import type { Metadata } from "next";
import { Inter, Poppins, Fredoka, Baloo_2, Bubblegum_Sans, Luckiest_Guy, Quicksand } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/shared/Chatbot";
import SmoothScroll from "@/components/shared/SmoothScroll";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SchoolDataProvider } from "@/components/dashboard/shared/SchoolDataProvider";
import PageTransitionLoader from "@/components/layout/PageTransitionLoader";
import PageReadyMarker from "@/components/layout/PageReadyMarker";
import dynamic from "next/dynamic";

// Lazy load heavy animations
const LazyBlobBackground = dynamic(() => import("@/components/animations/BlobBackground"), { 
    ssr: false,
    loading: () => null 
});

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
    display: 'swap',
});

const poppins = Poppins({
    weight: ['400', '500', '600', '700', '800'],
    subsets: ["latin"],
    variable: '--font-poppins',
    display: 'swap',
});

// Kid-friendly fonts
const fredoka = Fredoka({
    weight: ['400', '500', '600', '700'],
    subsets: ["latin"],
    variable: '--font-fredoka',
    display: 'swap',
});

const baloo2 = Baloo_2({
    weight: ['400', '500', '600', '700'],
    subsets: ["latin"],
    variable: '--font-baloo',
    display: 'swap',
    preload: true,
});

const bubblegumSans = Bubblegum_Sans({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-bubblegum',
    display: 'swap',
    preload: true,
});

const luckiestGuy = Luckiest_Guy({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-luckiest',
    display: 'swap',
    preload: false, // Less critical, can load later
});

const quicksand = Quicksand({
    subsets: ["latin"],
    variable: '--font-quicksand',
    display: 'swap',
    preload: true,
});

export const metadata: Metadata = {
    title: "T.I.M.E. Kids - The Preschool That Cares | 17 Years of Legacy",
    description: "T.I.M.E. Kids preschools offer wholesome, fun-filled and memorable childhood education. With 250+ preschools across India, we provide quality early education with NEP 2020 updated curriculum.",
    keywords: "preschool, play school, nursery, kindergarten, daycare, early education, T.I.M.E. Kids, Hyderabad, Bangalore, Chennai, Pune, Ahmedabad",
    authors: [{ name: "T.I.M.E. Kids" }],
    openGraph: {
        title: "T.I.M.E. Kids - The Preschool That Cares",
        description: "17 Years of Legacy in Early Education. 250+ preschools across India.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${inter.variable} ${poppins.variable} ${fredoka.variable} ${baloo2.variable} ${bubblegumSans.variable} ${luckiestGuy.variable} ${quicksand.variable}`}>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            </head>
            <body className="antialiased">
                <AuthProvider>
                    <SchoolDataProvider>
                        <PageTransitionLoader />
                        <ConditionalChrome>
                            <SmoothScroll />
                            <Header />
                        </ConditionalChrome>
                        
                        {/* Lazy load heavy animations */}
                        <LazyBlobBackground />

                        <main className="min-h-screen" data-page-ready="false">
                            <PageReadyMarker />
                            {children}
                        </main>

                        <ConditionalChrome>
                            <Footer />
                            <Chatbot />
                        </ConditionalChrome>
                    </SchoolDataProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
