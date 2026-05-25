"use client";

import Link from "next/link";
import { Heart, Sun } from "lucide-react";
import AdmissionForm from "@/components/admission/AdmissionForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans site-page-below-header">
            <section className="relative bg-gradient-to-br from-orange-50 via-white to-blue-50 pt-8 pb-4 md:pt-10 md:pb-6">
                <div className="container mx-auto px-4 text-center">
                    <Link
                        href="/login/"
                        className="inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700 hover:underline mb-4"
                    >
                        ← Back to Sign in
                    </Link>
                    <p className="inline-flex items-center gap-2 bg-white px-5 py-2 rounded-full shadow-sm border border-slate-200 text-sm font-bold text-slate-600 uppercase tracking-wide">
                        New parent account
                    </p>
                </div>
            </section>

            <section className="relative bg-white pt-6 pb-16 md:pb-24 z-10">
                <div className="container mx-auto px-4 relative">
                    <div className="absolute top-8 -left-4 md:-left-8 w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center shadow-lg border-2 border-yellow-200 z-40 hidden md:flex pointer-events-none">
                        <Sun className="text-yellow-500 w-7 h-7" />
                    </div>
                    <div className="absolute top-24 -right-4 md:-right-8 w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center shadow-lg border-2 border-pink-200 z-40 hidden md:flex pointer-events-none">
                        <Heart className="text-pink-500 w-7 h-7 fill-current" />
                    </div>

                    <div className="max-w-5xl mx-auto bg-white p-6 md:p-12 relative">
                        <div className="absolute inset-0 bg-white rounded-[3rem] md:rounded-[65%_35%_70%_30%_/_30%_50%_50%_70%] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border-[6px] border-slate-50 ring-4 ring-slate-100 -z-10" />

                        <div className="text-center mb-8 md:mb-10 relative z-10">
                            <h1 className="font-display font-black text-3xl md:text-5xl text-slate-800 mb-3 drop-shadow-sm">
                                Admission Enquiry Form
                            </h1>
                            <p className="text-slate-500 font-bold text-lg">Let&apos;s get to know your little one!</p>
                            <p className="mt-4 text-sm md:text-base text-slate-600 font-medium max-w-2xl mx-auto leading-relaxed">
                                After you submit, we create your parent login and send a password setup link to your
                                personal email.
                            </p>
                        </div>

                        <div className="relative z-10">
                            <AdmissionForm variant="register" hideHeading />
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-10 relative z-10">
                        Already have an account?{" "}
                        <Link href="/login/" className="text-orange-600 font-semibold hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </section>
        </div>
    );
}
