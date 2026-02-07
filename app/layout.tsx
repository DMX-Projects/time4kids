import type { Metadata } from "next";
import { Inter, Poppins, Fredoka, Baloo_2, Comic_Neue, Chewy, Bubblegum_Sans, Luckiest_Guy, Quicksand, ABeeZee, Andika } from "next/font/google";
// Rebuild trigger
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/shared/Chatbot";
import ScrollProgress from "@/components/animations/ScrollProgress";
import SmoothScroll from "@/components/shared/SmoothScroll";
import BlobBackground from "@/components/animations/BlobBackground";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import DiceCursor from "@/components/ui/DiceCursor";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SchoolDataProvider } from "@/components/dashboard/shared/SchoolDataProvider";

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
    weight: ['400', '500', '600', '700', '800'],
    subsets: ["latin"],
    variable: '--font-baloo',
    display: 'swap',
});

const comicNeue = Comic_Neue({
    weight: ['400', '700'],
    subsets: ["latin"],
    variable: '--font-comic',
    display: 'swap',
});

const bubblegumSans = Bubblegum_Sans({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-bubblegum',
    display: 'swap',
});

const luckiestGuy = Luckiest_Guy({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-luckiest',
    display: 'swap',
});

const quicksand = Quicksand({
    subsets: ["latin"],
    variable: '--font-quicksand',
    display: 'swap',
});

const abeezee = ABeeZee({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-abeezee',
    display: 'swap',
});

const andika = Andika({
    weight: ['400', '700'],
    subsets: ["latin"],
    variable: '--font-andika',
    display: 'swap',
});

const chewy = Chewy({
    weight: ['400'],
    subsets: ["latin"],
    variable: '--font-chewy',
    display: 'swap',
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
        <html lang="en" className={`${inter.variable} ${poppins.variable} ${fredoka.variable} ${baloo2.variable} ${comicNeue.variable} ${chewy.variable} ${bubblegumSans.variable} ${luckiestGuy.variable} ${quicksand.variable} ${abeezee.variable} ${andika.variable}`}>
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" />
            </head>
            <body className="antialiased">
                <AuthProvider>
                    <ToastProvider>
                        <SchoolDataProvider>
                            <ConditionalChrome>
                                <SmoothScroll />
                                <BlobBackground />
                                <ScrollProgress />
                                <DiceCursor />
                                <Header />
                            </ConditionalChrome>

                            <main className="min-h-screen">
                                {children}
                            </main>

                            <ConditionalChrome>
                                <Footer />
                                <Chatbot />
                            </ConditionalChrome>
                        </SchoolDataProvider>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
