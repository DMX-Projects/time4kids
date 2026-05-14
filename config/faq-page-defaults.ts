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
            question: "Why send your child to T.I.M.E. Kids ?",
            answer: [
                "Your child learns to make friends, learns the important social skills of caring, sharing etc.",
                "Our pre-schools' provide an environment of learning through play.",
                "Our pre-schools are the best place for your child to start learning the important skills in life.",
                "Your child will feel comfortable in the presence of other children of the same age group.",
            ],
        },
        {
            question: "Do the children have an opportunity to be creative each day?",
            answer: [
                "Your child gets ample opportunity for his/her artistic expression at T.I.M.E. Kids pre-schools.",
                "Children are involved in various activities throughout the day for e.g.: painting, claymodelling, role play, etc.",
            ],
        },
        {
            question: "How does T.I.M.E. Kids pre-schools helps children acquire different skills?",
            answer: [
                "At T.I.M.E. Kids pre-schools, we plan and provide child centered fun-filled activities according to the different levels of development, interest and need. They are planned and sequenced in ways to foster children's motor, cognitive, language and socio-emotional development. At our pre-schools there is a balance in the daily schedule of small and large activities, group as well as individual activities, indoor and outdoor activities, physical and mental activities. Children soon learn to accept and respond to instructions given by the teachers.",
            ],
        },
        {
            question: "Isn't it too early for a child of one-and-a-half year to be attending play school?",
            answer: [
                "Studies have proved that the first six years of an individual's life are critical since development/growth takes place at its most rapid during in this period. Our Play schools provides the necessary environment for the overall development of the child. Children get the opportunity to pick up good language, for self expression, experimentation and problem solving.",
            ],
        },
        {
            question: "Are basic maths, language and science concepts included in each day's program?",
            answer: [
                "To understand better the world around them, Children's need to know maths and science concepts. They imbibe these at Play schools through activities and play.",
            ],
        },
        {
            question: "What is the importance of experienced educationists?",
            answer: [
                "Experienced educationists are essential because they understand the needs of every age group and are highly competent in their area of work.Teachers act mainly as facilitators and help children learn and apply concepts, Also they have a hands-on approach to teaching abstract concepts, solving problems and counselling children.",
            ],
        },
        {
            question: "Are manners and etiquette also important as studies?",
            answer: [
                "Etiquette and manners are important in today's world. They are developed in children as part of the curriculum at Play Schools.",
            ],
        },
        {
            question: "Are admissions to the programs open through out the year?",
            answer: [
                "Admissions are open through out the year (space permitting) but we recommend that children be enrolled at the start of the academic session (June) or at the start of the 2nd term (October)",
            ],
        },
        {
            question: "What is the procedure for enrolment to T.I.M.E. Kids pre-schools?",
            answer: [
                "Parents are welcome at any pre-school centers. We have an online form which can be downloaded and filled in. We require a copy of proof of date of birth, marks transcript (if the child has attended any school) and 2 recent passport size photographs of the child.",
            ],
        },
        {
            question: "Why should we enrol in T.I.M.E. Kids ?",
            answer: [
                "We provide:",
                "1.Exceptional Infrastructure",
                "2.Dedicated Faculty",
                "3.Safe, Secure and Clean environment",
                "4.Activity based curriculum",
                "5.Creative Teaching Philosophy",
                "6.Parent Involvement",
            ],
        },
        {
            question: "Does T.I.M.E. Kids pre-schools offer transportation facilities?",
            answer: [
                "Transport facilities are center specific and details can be had from the centre head at the time of admission.",
            ],
        },
        {
            question: "I have a transferable job, Can I get my child transferred to another T.I.M.E. Kids pre-school?",
            answer: [
                "Your child can be transferred to any of our centers for a nominal transfer fee.",
            ],
        },
        {
            question: "Where can I find information on the fee structure?",
            answer: [
                "Tuition fee is specific to each center. The Center head at our play school will provide all the information at the time of enrolment.",
            ],
        },
        {
            question: "What are the programs that T.I.M.E. Kids pre-schools offers?",
            answer: [
                "Our programs include:",
                "1. Playgroup - 1.5-2.5 years",
                "2. Nursery - 2.5-3.5 years",
                "3. Pre Primary-1 - 3.5-4.5 years",
                "4. Pre Primary-2 - 4.5-5.5 years",
            ],
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

