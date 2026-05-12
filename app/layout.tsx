import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Dosis, Schoolbell } from "next/font/google";
// Rebuild trigger
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ScrollProgress from "@/components/animations/ScrollProgress";
import SmoothScroll from "@/components/shared/SmoothScroll";
import ConditionalChrome from "@/components/layout/ConditionalChrome";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { SchoolDataProvider } from "@/components/dashboard/shared/SchoolDataProvider";
import { GTM_ID } from "@/lib/tracking";

const fontDosis = Dosis({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "800"],
    variable: "--font-dosis",
    display: "swap",
});

const fontSchoolbell = Schoolbell({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-schoolbell",
    display: "swap",
});

const BlobBackground = dynamic(() => import("@/components/animations/BlobBackground"), {
    ssr: false,
    loading: () => null,
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

export const viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#FF922B",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${fontDosis.variable} ${fontSchoolbell.variable}`}>
            <head>
                {/* GTM Disabled to reduce cookie bloat and troubleshoot 400 errors */}
                {/* {GTM_ID ? (
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
                ) : null} */}
            </head>
            <body className="antialiased touch-pan-y">
                {/* {GTM_ID ? (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: "none", visibility: "hidden" }}
                        />
                    </noscript>
                ) : null} */}
                <AuthProvider>
                    <ToastProvider>
                        <SchoolDataProvider>
                            <ConditionalChrome>
                                <SmoothScroll />
                                <BlobBackground />
                                <ScrollProgress />
                                <Header />
                            </ConditionalChrome>

                            <main className="min-h-screen">
                                {children}
                            </main>

                            <ConditionalChrome>
                                <Footer />
                            </ConditionalChrome>
                        </SchoolDataProvider>
                    </ToastProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
