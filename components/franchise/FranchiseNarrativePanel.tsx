'use client';

import type { FranchisePageData } from '@/config/franchise-page-defaults';

type Props = {
    data: FranchisePageData;
};

const shell = 'rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 shadow-sm md:p-6';
const body = 'font-sans text-[0.9375rem] leading-relaxed text-slate-700 antialiased';
const h2 = 'font-sans text-xl font-bold tracking-tight text-slate-900 md:text-2xl';
const h3 = 'font-sans text-base font-semibold tracking-tight text-slate-900 md:text-lg';
const divider = 'border-b border-slate-200 pb-2';

/** Full-width highlights band (two columns). Used below the franchise split on `/franchise`. */
export function FranchiseQuickHighlightsSection({ data }: Props) {
    const qh = data.quick_highlights;
    if (!qh?.items?.length) return null;

    return (
        <div className="font-sans antialiased">
            <h2 className="text-center font-sans text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">{qh.heading}</h2>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-600 md:text-base">
                At a glance — what franchise partners gain with T.I.M.E. Kids.
            </p>
            <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4">
                {qh.items.map((line) => (
                    <li
                        key={line}
                        className="flex items-start gap-3 rounded-2xl border border-slate-200/90 bg-white px-4 py-3.5 text-sm font-medium text-slate-800 shadow-sm md:px-5 md:py-4 md:text-[0.9375rem]"
                    >
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" aria-hidden />
                        <span className="leading-snug">{line}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/** Intro + requirements — sits under the enquiry form (left column). */
export function FranchiseNarrativeLeftAside({ data }: Props) {
    const hero = data.hero;
    const gs = data.getting_started;
    const intro = Array.isArray(hero.intro_paragraphs) ? hero.intro_paragraphs : [];

    return (
        <div className={`${shell} space-y-8`}>
            <div className={body}>
                <p className={`${h3} ${divider} mb-3 text-primary-700`}>Why partner with us</p>
                {intro.map((para, i) => (
                    <p key={i} className={i > 0 ? 'mt-3' : ''}>
                        {para}
                    </p>
                ))}
            </div>

            {gs ? (
                <div className={body}>
                    <h3 className={`${h3} ${divider} mb-3`}>{gs.heading}</h3>
                    <p className="text-slate-600">{gs.intro}</p>
                    <div className="mt-4 space-y-3">
                        {gs.items.map((item) => (
                            <div key={item.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <h4 className="font-sans text-sm font-semibold text-slate-900">{item.title}</h4>
                                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

/** Main story: title, advantage pillars, support list, closing — right column, editorial sans typography. */
export function FranchiseNarrativeMain({ data }: Props) {
    const hero = data.hero;
    const bs = data.benefits_section;
    const os = data.offerings_section;
    const cl = data.closing;

    return (
        <div className={`${shell} min-h-0 min-w-0`}>
            <div className={`${body} max-w-none`}>
                <h2 className={`${h2} text-balance`}>
                    {hero.title_prefix} {hero.title_accent}
                </h2>
                <p className="mt-3 text-base font-medium text-slate-800 md:text-lg">{hero.subtitle}</p>

                {bs ? (
                    <>
                        <h3 className={`${h3} mb-3 mt-10 ${divider}`}>
                            {bs.heading_prefix} {bs.heading_accent}
                        </h3>
                        {bs.blurb ? <p className="text-slate-600">{bs.blurb}</p> : null}
                    </>
                ) : null}

                {data.benefits.map((b) => (
                    <section key={b.title} className="mt-6">
                        <h4 className="font-sans text-[0.95rem] font-semibold text-slate-900 md:text-base">{b.title}</h4>
                        <p className="mt-1.5 whitespace-pre-line text-slate-600">{b.description}</p>
                    </section>
                ))}

                {os ? (
                    <section className="mt-10">
                        <h3 className={`${h3} mb-3 ${divider}`}>
                            {os.heading_prefix} {os.heading_accent}
                        </h3>
                        {os.intro ? <p className="text-slate-600">{os.intro}</p> : null}
                        {os.blurb ? <p className="mt-2 text-slate-600">{os.blurb}</p> : null}
                        <ul className="mt-4 list-none space-y-2.5 pl-0">
                            {data.offerings.map((line) => (
                                <li key={line} className="flex gap-2.5 text-slate-700">
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-500" aria-hidden />
                                    <span>{line}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                ) : null}

                {cl ? (
                    <section className="mt-10 rounded-xl border border-orange-100 bg-orange-50/60 p-5 md:p-6">
                        <h3 className="font-sans text-lg font-semibold text-orange-800 md:text-xl">{cl.heading}</h3>
                        {cl.paragraphs.map((p, i) => (
                            <p key={i} className="mt-3 text-slate-700">
                                {p}
                            </p>
                        ))}
                    </section>
                ) : null}
            </div>
        </div>
    );
}

/** Full single-column narrative (legacy / previews). */
export default function FranchiseNarrativePanel({ data }: Props) {
    return (
        <div className="space-y-8">
            <FranchiseNarrativeLeftAside data={data} />
            <FranchiseNarrativeMain data={data} />
            <FranchiseQuickHighlightsSection data={data} />
        </div>
    );
}
