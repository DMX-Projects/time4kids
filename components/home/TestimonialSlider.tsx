'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { apiUrl } from '@/lib/api-client';

export type TestimonialItem = {
    id: number;
    category?: 'parent' | 'franchisee';
    text: string;
    author: string;
    relation: string;
    location: string;
    rating: number;
};

/** Legacy homepage copy (Parent's Speak / Franchisee's Speak) — http://103.65.21.245:8080/index.php */
const FALLBACK_PARENT_TESTIMONIALS: TestimonialItem[] = [
    {
        id: 1,
        category: 'parent',
        text: "T.I.M.E. Kids is my son's second home. It is a completely safe environment. He is playing, learning and enjoying every minute he spends there. Nowadays he is showing a lot of interest in colouring and painting and is creating new pictures of his own. Thanks to the innovative teaching methods and caring teachers, Mugil has become a keen learner and is learning new things every day.",
        author: "Mother of Mugil",
        relation: "Parent",
        location: "Hyderabad",
        rating: 5,
    },
    {
        id: 2,
        category: 'parent',
        text: "A good school plays an important role in the development of a child. It's the light that helps us choose the right path in the various walks of life. I am glad that I found T.I.M.E. Kids for my daughter. In just three months there has been a lot of development in Nandika, especially with respect to her linguistic skills and social skills. I like the way kids are handled and education is imparted at T.I.M.E. Kids. Thanks to all the wonderful teachers for enabling such remarkable change in my child.",
        author: "Roma Majumdar",
        relation: "Mother of Nandika",
        location: "Hyderabad",
        rating: 5,
    },
    {
        id: 3,
        category: 'parent',
        text: "T.I.M.E. Kids pre-schools, is one of the most friendly places for toddlers. My kid wants to go to school on Sunday too! The learning is done in such a fun way....",
        author: "Deepa Bahukhandi",
        relation: "Mother of Diya",
        location: "Hyderabad",
        rating: 5,
    },
];

const FALLBACK_FRANCHISEE_TESTIMONIALS: TestimonialItem[] = [
    {
        id: 101,
        category: 'franchisee',
        text: "I have been a franchise of T.I.M.E. Kids for last 6 years. Apart from their amazing curriculum, innovation and values, the most motivating thing is the constant support from HO with clear goals. Their continuous support to the day to day running of preschool right from providing artworks for promotions and various celebrations, suggesting vendors for printing brochures, giving innovative marketing ideas are definitely an easy path to success. T.I.M.E. Kids make us feel we are all part of the same family. T.I.M.E. Kids family is constantly growing and being a part of this growth has been a great decision.",
        author: "Rachna",
        relation: "Franchisee",
        location: "T.I.M.E. Kids Domalguda — Hyderabad",
        rating: 5,
    },
    {
        id: 102,
        category: 'franchisee',
        text: "I always wanted to do something on my own and yet not compromise on quality time with my family. T.I.M.E. Kids franchise opportunity offered me one of the best business ventures. As a woman and also a mother, I possessed the inherent qualities and skills required to nurture little minds. Now, I have a safe, comfortable working environment and flexible working hours. A partnership with a credible preschool brand has definitely fulfilled my entrepreneurial aspirations!!",
        author: "Shibani",
        relation: "Woman entrepreneur",
        location: "T.I.M.E. Kids HSR Layout — Bengaluru",
        rating: 5,
    },
    {
        id: 103,
        category: 'franchisee',
        text: "Giving up an IT career to realize my big dream of becoming an entrepreneur was the best decision taken by me. The organizational support from T.I.M.E. Kids helped me tremendously in establishing my own business venture. The training given to the franchisee is exhaustive and their easy to understand manuals covering all aspects of operations are so helpful for a new entrant in this field. Academic training sessions are so helpful in understanding the study material and its implementation. Their experts are also available to help out for the smallest doubt that we may have. For me, definitely there has been no looking back!",
        author: "Akanksha",
        relation: "IT professional",
        location: "T.I.M.E. Kids Kundhanhalli — Bengaluru",
        rating: 5,
    },
];

const slideVariants = {
    enter: { opacity: 0, x: 34, scale: 0.98 },
    center: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -34, scale: 0.98 },
};

function initials(name: string) {
    const clean = name.trim();
    if (!clean) return 'T';
    return clean.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function TestimonialColumn({
    title,
    categoryLabel,
    items,
    emptyText,
    accent,
}: {
    title: string;
    categoryLabel: string;
    items: TestimonialItem[];
    emptyText: string;
    accent: 'orange' | 'sky';
}) {
    const [index, setIndex] = useState(0);
    const current = items[index];
    const accentClass = accent === 'orange' ? 'from-orange-400 to-amber-300' : 'from-sky-400 to-cyan-300';
    const dotClass = accent === 'orange' ? 'bg-amber-300' : 'bg-cyan-300';
    const badgeClass = accent === 'orange'
        ? 'border-amber-200/30 bg-amber-400/95 text-slate-950 shadow-amber-900/10'
        : 'border-cyan-200/30 bg-cyan-400/95 text-slate-950 shadow-cyan-900/10';

    useEffect(() => {
        setIndex(0);
    }, [items.length]);

    useEffect(() => {
        if (items.length <= 1) return;
        const timer = window.setInterval(() => {
            setIndex((currentIndex) => (currentIndex + 1) % items.length);
        }, 4500);
        return () => window.clearInterval(timer);
    }, [items.length]);

    const go = (direction: 1 | -1) => {
        if (items.length <= 1) return;
        setIndex((currentIndex) => (currentIndex + direction + items.length) % items.length);
    };

    return (
        <div className="relative">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                    <div className={`mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.18em] shadow-lg backdrop-blur-xl ${badgeClass}`}>
                        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
                        {categoryLabel}
                    </div>
                    <h3 className="font-display text-3xl font-black leading-tight text-white md:text-4xl">
                        {title}
                    </h3>
                </div>

                {items.length > 1 && (
                    <div className="hidden gap-2 sm:flex">
                        <button
                            type="button"
                            aria-label={`Previous ${title}`}
                            onClick={() => go(-1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-xl transition hover:bg-white/20"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            type="button"
                            aria-label={`Next ${title}`}
                            onClick={() => go(1)}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-white/12 text-white backdrop-blur-xl transition hover:bg-white/20"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}
            </div>

            <div className="relative min-h-[360px] overflow-hidden rounded-[30px] border border-white/80 bg-white p-4 shadow-[0_28px_90px_rgba(15,23,42,0.2)]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(255,255,255,0.24),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(251,211,103,0.2),transparent_26%)]" />
                {current ? (
                    <AnimatePresence mode="wait">
                        <motion.article
                            key={current.id}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                            className="relative flex min-h-[330px] flex-col justify-between rounded-[24px] border border-slate-100 bg-white p-6 text-slate-800 shadow-xl md:p-7"
                        >
                            <Quote className="absolute right-5 top-5 h-14 w-14 rotate-6 text-slate-900/6" />
                            <div>
                                <div className="mb-5 flex gap-1 text-amber-400">
                                    {[...Array(Math.min(5, Math.max(1, current.rating || 5)))].map((_, i) => (
                                        <Star key={i} size={17} fill="currentColor" strokeWidth={0} />
                                    ))}
                                </div>
                                <p className="relative text-base font-semibold leading-8 text-slate-700 md:text-lg">
                                    &ldquo;{current.text}&rdquo;
                                </p>
                            </div>

                            <div className="mt-8 flex items-center gap-4 border-t border-slate-200 pt-5">
                                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accentClass} font-display text-lg font-black text-white shadow-lg`}>
                                    {initials(current.author)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-display text-xl font-black leading-tight text-slate-950">
                                        {current.author || 'T.I.M.E. Kids Family'}
                                    </h4>
                                    <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                                        {current.relation || categoryLabel}
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    </AnimatePresence>
                ) : (
                    <div className="relative flex min-h-[330px] items-center justify-center rounded-[24px] border border-white/18 bg-white/20 px-6 text-center text-base font-semibold leading-7 text-white">
                        {emptyText}
                    </div>
                )}
            </div>

            {items.length > 1 && (
                <div className="mt-5 flex justify-center gap-2" role="tablist" aria-label={`${title} slides`}>
                    {items.map((item, itemIndex) => (
                        <button
                            key={item.id}
                            type="button"
                            role="tab"
                            aria-selected={itemIndex === index}
                            aria-label={`Show ${title} testimonial ${itemIndex + 1}`}
                            onClick={() => setIndex(itemIndex)}
                            className={`h-2 rounded-full transition-all duration-300 ${itemIndex === index ? `w-8 ${dotClass}` : 'w-2 bg-white/35 hover:bg-white/55'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TestimonialSlider() {
    const [testimonials, setTestimonials] = useState<TestimonialItem[] | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(apiUrl('/common/home-testimonials/'));
                if (!res.ok) throw new Error('bad status');
                const data = await res.json();
                const items = Array.isArray(data) ? data : data.results || [];
                const mapped: TestimonialItem[] = items
                    .map((r: { id: number; category?: 'parent' | 'franchisee'; text: string; author: string; relation?: string; location?: string; rating?: number }) => ({
                        id: r.id,
                        category: r.category === 'franchisee' ? 'franchisee' : 'parent',
                        text: r.text || '',
                        author: r.author || '',
                        relation: r.relation || '',
                        location: r.location || '',
                        rating: Math.min(5, Math.max(1, Number(r.rating) || 5)),
                    }))
                    .filter((r: TestimonialItem) => r.text.trim().length > 0);
                setTestimonials(mapped);
            } catch {
                setTestimonials([...FALLBACK_PARENT_TESTIMONIALS, ...FALLBACK_FRANCHISEE_TESTIMONIALS]);
            }
        };
        load();
    }, []);

    const parentTestimonials = useMemo(() => {
        if (testimonials === null) return [];
        const items = testimonials.filter((item) => (item.category || 'parent') === 'parent');
        return items.length > 0 ? items : [];
    }, [testimonials]);

    const franchiseeTestimonials = useMemo(() => {
        if (testimonials === null) return [];
        const fromApi = testimonials.filter((item) => item.category === 'franchisee');
        // Same idea as parent seed data: show franchisee quotes when CMS has none yet.
        return fromApi.length > 0 ? fromApi : FALLBACK_FRANCHISEE_TESTIMONIALS;
    }, [testimonials]);

    return (
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-[#6032a8] via-[#7c4dff] to-[#6032a8] py-24 font-sans">
            <div className="absolute inset-0 z-0 opacity-25 pointer-events-none">
                <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-purple-400 blur-[80px]" />
                <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-indigo-400 blur-[100px]" />
                <div className="absolute left-1/2 top-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-pink-400 blur-[120px]" />
            </div>

            <div className="absolute -top-[1px] left-0 z-20 w-full rotate-180 pointer-events-none">
                <svg className="h-[8vh] min-h-[60px] max-h-[100px] w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <path d="M-160 44 q 15 -10 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 v44 h-520 z" fill="#fff" />
                </svg>
            </div>

            <div className="container relative z-10 mx-auto px-4">
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <h2
                        className="font-display text-5xl font-black leading-tight tracking-[-0.02em] text-white drop-shadow-xl md:text-6xl"
                        style={{ fontFamily: "'Clash Display', 'Satoshi', 'Plus Jakarta Sans', var(--font-poppins), system-ui, sans-serif" }}
                    >
                        Testimonials
                    </h2>
                    <p className="mt-4 text-lg font-semibold leading-8 text-white md:text-xl">
                        Hear from families and partners who are part of the T.I.M.E. Kids journey.
                    </p>
                </div>

                {testimonials === null ? (
                    <div className="rounded-[30px] border border-white/20 bg-white/12 px-6 py-16 text-center text-lg font-semibold text-white backdrop-blur-xl">
                        Loading testimonials...
                    </div>
                ) : (
                    <div className="grid gap-8 lg:grid-cols-2 xl:gap-10">
                        <TestimonialColumn
                            title="Parent Testimonials"
                            categoryLabel="Parent"
                            items={parentTestimonials}
                            emptyText="Parent testimonials will appear here once added in Admin -> Testimonials."
                            accent="orange"
                        />
                        <TestimonialColumn
                            title="Franchisee Testimonials"
                            categoryLabel="Franchisee"
                            items={franchiseeTestimonials}
                            emptyText="Franchisee testimonials will appear here once added in Admin -> Testimonials."
                            accent="sky"
                        />
                    </div>
                )}
            </div>

            <div className="absolute -bottom-[1px] left-0 z-20 w-full pointer-events-none">
                <svg className="h-[8vh] min-h-[60px] max-h-[100px] w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none">
                    <path d="M-160 44 q 15 -10 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 v44 h-520 z" fill="#fff" />
                </svg>
            </div>
        </section>
    );
}
