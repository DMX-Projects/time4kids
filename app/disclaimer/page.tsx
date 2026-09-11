"use client";

import Link from "next/link";

export default function DisclaimerPage() {
    return (
        <main className="min-h-screen bg-[#FFFAF5] pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#003366] font-fredoka">
                                Disclaimer
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
                            <h2 className="text-lg font-extrabold text-slate-900">1) General information</h2>
                            <p>
                                The content on this website is provided for general information about T.I.M.E. Kids
                                preschools, programmes, admissions, and franchise opportunities. It is not a substitute
                                for official communication from a centre or the head office.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">2) Accuracy of content</h2>
                            <p>
                                We make reasonable efforts to keep information current, including programme details,
                                locations, and contact information. Content may change without notice, and we do not
                                warrant that all material on the site is complete, accurate, or up to date at all times.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">3) No warranties</h2>
                            <p>
                                The site is provided “as is” without warranties. To the fullest extent permitted by law,
                                we disclaim liability arising from use of the site, including any reliance on information
                                published here.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">4) Third-party links</h2>
                            <p>
                                Links to third-party websites are provided for convenience. We are not responsible for
                                third-party content, products, or policies.
                            </p>
                        </section>

                        <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3 text-sm">
                            <Link href="/privacy" className="font-semibold text-orange-700 hover:underline">
                                Privacy Policy
                            </Link>
                            <span className="text-slate-400">•</span>
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
