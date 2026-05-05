"use client";

import Link from "next/link";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-[#FFFAF5] pt-28 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6 md:p-10">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-[#003366] font-fredoka">
                                Terms of Use
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
                            <h2 className="text-lg font-extrabold text-slate-900">1) Use of the site</h2>
                            <p>
                                By using this website, you agree not to misuse the services, attempt unauthorized access, or disrupt the site.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">2) Content</h2>
                            <p>
                                Website content is provided for general information. We may update content at any time without notice.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">3) Third‑party links</h2>
                            <p>
                                Links to third‑party websites are provided for convenience. We are not responsible for third‑party content or policies.
                            </p>
                        </section>

                        <section className="space-y-2">
                            <h2 className="text-lg font-extrabold text-slate-900">4) Disclaimer</h2>
                            <p>
                                The site is provided “as is” without warranties. To the fullest extent permitted by law, we disclaim liability arising from use of the site.
                            </p>
                        </section>

                        <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3 text-sm">
                            <Link href="/privacy" className="font-semibold text-orange-700 hover:underline">
                                Privacy Policy
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

