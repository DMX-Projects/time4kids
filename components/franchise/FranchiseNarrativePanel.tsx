'use client';

import type { FranchisePageData } from '@/config/franchise-page-defaults';

type Props = {
    data: FranchisePageData;
};

export default function FranchiseNarrativePanel({ data }: Props) {
    const hero = data.hero;
    const bs = data.benefits_section;
    const os = data.offerings_section;
    const gs = data.getting_started;
    const cl = data.closing;
    const qh = data.quick_highlights;
    const intro = Array.isArray(hero.intro_paragraphs) ? hero.intro_paragraphs : [];

    return (
        <div className="min-h-0 min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-inner md:p-8">
            <div className="max-w-none text-gray-600">
                <h2 className="mt-0 font-bubblegum text-2xl font-bold tracking-wide text-[#003366] md:text-3xl">
                    {hero.title_prefix} {hero.title_accent}
                </h2>
                <p className="mt-3 text-lg font-semibold text-gray-800">{hero.subtitle}</p>
                {intro.map((para, i) => (
                    <p key={i} className="mt-4 leading-relaxed">
                        {para}
                    </p>
                ))}

                {bs ? (
                    <>
                        <h3 className="mb-4 mt-10 border-b border-orange-200/60 pb-2 font-bubblegum text-xl font-bold tracking-wide text-[#003366] md:text-2xl">
                            {bs.heading_prefix} {bs.heading_accent}
                        </h3>
                        {bs.blurb ? <p className="mt-2 leading-relaxed">{bs.blurb}</p> : null}
                    </>
                ) : null}

                {data.benefits.map((b) => (
                    <section key={b.title} className="mt-6">
                        <h4 className="mb-2 font-bubblegum text-lg font-bold text-gray-900 md:text-xl">{b.title}</h4>
                        <p className="whitespace-pre-line text-base leading-relaxed text-gray-600">{b.description}</p>
                    </section>
                ))}

                {os ? (
                    <section className="mt-10">
                        <h3 className="mb-3 border-b border-orange-200/60 pb-2 font-bubblegum text-xl font-bold tracking-wide text-[#003366] md:text-2xl">
                            {os.heading_prefix} {os.heading_accent}
                        </h3>
                        {os.intro ? <p className="leading-relaxed">{os.intro}</p> : null}
                        {os.blurb ? <p className="mt-2 leading-relaxed">{os.blurb}</p> : null}
                        <ul className="mt-4 list-none space-y-3 pl-0">
                            {data.offerings.map((line) => (
                                <li key={line} className="flex gap-2 text-gray-700">
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
                                    <span className="leading-relaxed">{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {gs ? (
                    <section className="mt-10">
                        <h3 className="mb-2 border-b border-orange-200/60 pb-2 font-bubblegum text-xl font-bold tracking-wide text-[#003366] md:text-2xl">{gs.heading}</h3>
                        <p className="leading-relaxed">{gs.intro}</p>
                        <div className="mt-4 space-y-4">
                            {gs.items.map((item) => (
                                <div key={item.title} className="rounded-xl border border-white/80 bg-white/90 p-4 shadow-sm">
                                    <h4 className="font-bubblegum text-lg font-bold text-gray-900">{item.title}</h4>
                                    <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-gray-600">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null}

                {cl ? (
                    <section className="mt-10">
                        <h3 className="mb-3 font-bubblegum text-xl font-bold text-[#E67E22] md:text-2xl">{cl.heading}</h3>
                        {cl.paragraphs.map((p, i) => (
                            <p key={i} className="mt-3 leading-relaxed">
                                {p}
                            </p>
                        ))}
                    </section>
                ) : null}

                {qh?.items?.length ? (
                    <section className="mt-10">
                        <h3 className="mb-4 border-b border-orange-200/60 pb-2 font-bubblegum text-xl font-bold tracking-wide text-[#003366] md:text-2xl">{qh.heading}</h3>
                        <ul className="grid gap-2 sm:grid-cols-2">
                            {qh.items.map((line) => (
                                <li
                                    key={line}
                                    className="flex items-start gap-2 rounded-lg border border-slate-200/90 bg-white px-3 py-2 text-sm font-medium text-gray-800"
                                >
                                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}
            </div>
        </div>
    );
}
