import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Chatbot from "@/components/shared/Chatbot";

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
        <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
            <body className="antialiased">
                <Header />
                <main className="min-h-screen">
                    {children}
                </main>
                <Footer />
                <Chatbot />
            </body>
        </html>
    );
}
