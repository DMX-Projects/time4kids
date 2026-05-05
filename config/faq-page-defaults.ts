/** Mirrors `common/home_page_defaults.py` FAQ_PAGE_DATA. */

export type FaqItem = {
    question: string;
    answer: string[];
};

export type FaqPageData = {
    banner_images: string[];
    faqs: FaqItem[];
};

export const DEFAULT_FAQ_PAGE_DATA: FaqPageData = {
    banner_images: ["/faq-banner-new-1.png", "/faq-banner-new-2.png"],
    faqs: [
        {
            question: "Why send your child to T.I.M.E. Kids?",
            answer: [
                "Your child learns to make friends and important social skills like caring and sharing.",
                "Our pre-schools provide a learning-through-play environment.",
                "We help children start learning important life skills early.",
                "Children feel comfortable among peers of the same age group.",
            ],
        },
        {
            question: "Do the children have an opportunity to be creative each day?",
            answer: ["Children get ample opportunities for artistic expression.", "Activities include painting, clay modelling, role play, etc."],
        },
        {
            question: "How does T.I.M.E. Kids pre-schools helps children acquire different skills?",
            answer: [
                "Our curriculum involves a blend of structural learning and free play.",
                "We focus on cognitive, physical, emotional, and social development through activities like puzzles, storytelling, group games, and interactive learning sessions.",
            ],
        },
        {
            question: "Isn't it too early for a child of one-and-a-half year to be attending play school?",
            answer: [
                "The first six years are critical for a child's brain development.",
                "Our program for this age group acts as a bridge between home and school, providing a secure and stimulating environment that encourages exploration and social interaction.",
            ],
        },
        {
            question: "Are basic maths, language and science concepts included in each day's program?",
            answer: ["Yes, we introduce fundamental concepts of numeracy, language, and environmental science through age-appropriate, play-based activities that make learning fun and engaging."],
        },
        {
            question: "What is the importance of experienced educationists?",
            answer: [
                "Experienced educationists ensure that the curriculum is developmentally appropriate, safe, and effective.",
                "They understand child psychology and can tailor learning experiences to meet the unique needs of every child.",
            ],
        },
        {
            question: "Are manners and etiquette also important as studies?",
            answer: [
                "Absolutely. We believe in holistic development.",
                "Along with academics, we emphasize value education, teaching children essential social manners, table etiquette, and respect for others.",
            ],
        },
        {
            question: "Are admissions to the programs open through out the year?",
            answer: ["Yes, admissions are generally open throughout the year, subject to the availability of seats in the respective program."],
        },
        {
            question: "What is the procedure for enrolment to T.I.M.E. Kids pre-schools?",
            answer: [
                "Parents can visit the nearest T.I.M.E. Kids centre to collect the admission kit.",
                "The process involves filling out an application form and interacting with the centre head. You can also enquire online through our website.",
            ],
        },
        {
            question: "Why should we enrol in T.I.M.E. Kids?",
            answer: [
                "T.I.M.E. Kids offers a proven curriculum, safe infrastructure, and trained facilitators.",
                "We focus on the all-round development of your child in a nurturing environment, backed by the trusted T.I.M.E. brand.",
            ],
        },
        {
            question: "Does T.I.M.E. Kids pre-schools offer transportation facilities?",
            answer: ["Most of our centres offer safe and reliable transportation facilities with female attendants.", "Please check with your specific centre for route availability."],
        },
    ],
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T> | null | undefined): T {
    if (!patch || typeof patch !== "object") return base;
    const out = { ...base } as T;
    for (const k of Object.keys(patch) as (keyof T)[]) {
        const pv = patch[k];
        const bv = base[k];
        if (pv !== undefined && typeof pv === "object" && pv !== null && !Array.isArray(pv) && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
            (out as Record<string, unknown>)[k as string] = deepMerge(bv as Record<string, unknown>, pv as Record<string, unknown>);
        } else if (pv !== undefined) {
            (out as Record<string, unknown>)[k as string] = pv as unknown;
        }
    }
    return out;
}

export function mergeFaqPageData(raw: Partial<FaqPageData> | null | undefined): FaqPageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_FAQ_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_FAQ_PAGE_DATA, raw as Partial<FaqPageData>);
        merged.banner_images = Array.isArray(merged.banner_images) ? merged.banner_images.map((x: any) => String(x || "").trim()).filter(Boolean) : DEFAULT_FAQ_PAGE_DATA.banner_images;
        merged.faqs = Array.isArray(merged.faqs)
            ? merged.faqs.map((f: any) => ({
                  question: String(f?.question || "").trim(),
                  answer: Array.isArray(f?.answer) ? f.answer.map((x: any) => String(x || "").trim()).filter(Boolean) : [],
              }))
            : DEFAULT_FAQ_PAGE_DATA.faqs;
        return merged;
    } catch {
        return DEFAULT_FAQ_PAGE_DATA;
    }
}

