"use client";

import Link from "next/link";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-[#FFFAF5] pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#003366] font-fredoka">
                                Privacy Policy
                            </h1>
                            <p className="text-sm text-slate-600 mt-2">
                                Last updated: {new Date().toLocaleDateString("en-GB")}
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="shrink-0 inline-flex items-center rounded-full bg-[#FF922B] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-105"
                        >
                            Back to site
                        </Link>
                    </div>

                    <div className="mt-8 space-y-6 text-slate-700 leading-relaxed">
                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">1) Information we collect</h2>
                            <p>
                                We may collect information you provide (such as name, email, phone number, and messages) when you submit enquiry or admission forms,
                                or when you create/login to a dashboard account.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">2) How we use information</h2>
                            <p>
                                We use your information to respond to enquiries, provide services, operate the website, and improve our offerings.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">3) Cookies & analytics</h2>
                            <p>
                                We may use cookies or similar technologies to understand usage and improve performance. You can control cookies through your browser settings.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">4) Sharing</h2>
                            <p>
                                We do not sell your personal information. We may share information with service providers only as needed to operate the website and services.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">5) Contact</h2>
                            <p>
                                If you have questions about this policy, please contact us via the website contact page.
                            </p>
                        </section>

                        <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3 text-sm">
                            <Link href="/terms" className="font-semibold text-orange-700 hover:underline">
                                Terms of Use
                            </Link>
                            <span className="text-slate-400">•</span>
                            <Link href="/contact" className="font-semibold text-orange-700 hover:underline">
                                Contact
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

