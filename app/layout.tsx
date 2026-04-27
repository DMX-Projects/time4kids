import type { Metadata } from "next";
import Script from "next/script";
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
import { GTM_ID } from "@/lib/tracking";

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
                {GTM_ID ? (
                    <>
                        <Script
                            id="gtm-init"
                            strategy="afterInteractive"
                            dangerouslySetInnerHTML={{
                                __html: `
                                    window.dataLayer = window.dataLayer || [];
                                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                                    })(window,document,'script','dataLayer','${GTM_ID}');
                                `,
                            }}
                        />
                    </>
                ) : null}
            </head>
            <body className="antialiased">
                {GTM_ID ? (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: "none", visibility: "hidden" }}
                        />
                    </noscript>
                ) : null}
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
