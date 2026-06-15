/** Mirrors `common/home_page_defaults.py` ADMISSION_PAGE_DATA. */

import { parseEmbedInput } from "@/lib/franchise-embed-url";

export type AdmissionSkill = {
    title: string;
    desc: string;
    icon: string;
    color: string;
};

export type AdmissionFaq = {
    question: string;
    answer: string;
};

/** Canonical Kids–teacher ratio FAQ (overrides legacy CMS copy). */
export const KIDS_TEACHER_RATIO_FAQ: AdmissionFaq = {
    question: "What is the Kids-teacher ratio?",
    answer: "We maintain a low Kids-teacher ratio of 1:20 to ensure personalized attention for every child.",
};

export function isKidsTeacherRatioFaq(question: string): boolean {
    return /teacher\s*ratio/i.test(question) && /(student|kids)/i.test(question);
}

export function normalizeAdmissionFaq(faq: AdmissionFaq): AdmissionFaq {
    if (isKidsTeacherRatioFaq(faq.question)) {
        return KIDS_TEACHER_RATIO_FAQ;
    }
    if (/teacher\s*ratio/i.test(faq.question) && /1\s*:\s*10/.test(faq.answer)) {
        return KIDS_TEACHER_RATIO_FAQ;
    }
    return faq;
}

export function normalizeAdmissionFaqs(faqs: AdmissionFaq[]): AdmissionFaq[] {
    return faqs.map((f) => normalizeAdmissionFaq(f));
}

export type AdmissionFaqSection = {
    title_prefix: string;
    title_accent: string;
    subtitle: string;
    image: string;
};

export type AdmissionVideoCard = {
    title: string;
    author: string;
    location?: string;
    video_url: string;
    /** Multiple embeds in one card (e.g. Parents Testimonials carousel). */
    video_urls?: string[];
    thumbnail_url?: string;
};

export type AdmissionPageData = {
    /** Rainbow / welcome illustration beside the enquiry form on /admission (and home hero form). */
    form_welcome_image?: string;
    faq_section?: AdmissionFaqSection;
    why_preschool: string[];
    why_time_kids: string[];
    skills: AdmissionSkill[];
    faqs: AdmissionFaq[];
    happy_parents_videos?: AdmissionVideoCard[];
};

export const DEFAULT_ADMISSION_PAGE_DATA: AdmissionPageData = {
    form_welcome_image: "/student-welcome.png",
    faq_section: {
        title_prefix: "Got",
        title_accent: "Questions?",
        subtitle: "We have answers! Here is everything you need to know.",
        image: "/2.png",
    },
    why_preschool: [
        "Strong foundation for future",
        "Social & emotional growth",
        "Ready for big school!",
        "Brain development boost",
        "Confidence building",
    ],
    why_time_kids: [
        "17 Years of Happiness",
        "250+ Centers in India",
        "NEP 2020 Compliant",
        "Loving & Trained Teachers",
        "Safe, Colorful Spaces",
        "Fun Activity Learning",
    ],
    skills: [
        { title: "Cognitive", desc: "Problem solving", icon: "Brain", color: "bg-purple-500" },
        { title: "Emotional", desc: "Self-awareness", icon: "Heart", color: "bg-pink-500" },
        { title: "Social", desc: "Team work", icon: "Users", color: "bg-blue-500" },
        { title: "Creative", desc: "Art & Craft", icon: "Palette", color: "bg-orange-500" },
        { title: "Musical", desc: "Rhythm & Beat", icon: "Music", color: "bg-green-500" },
        { title: "Physical", desc: "Motor skills", icon: "Dumbbell", color: "bg-red-500" },
        { title: "Language", desc: "Reading skills", icon: "BookOpen", color: "bg-indigo-500" },
        { title: "Nature", desc: "Eco awareness", icon: "Globe", color: "bg-teal-500" },
    ],
    faqs: [
        {
            question: "What is the admission process?",
            answer: "Fill out the enquiry form, schedule a school tour, meet with our counselor, complete the registration form, and submit required documents. We will guide you through each step.",
        },
        {
            question: "What documents are required for admission?",
            answer: "Birth certificate of the child, recent passport-size photographs, address proof, and parent ID proof. Additional documents may be required based on the program.",
        },
        {
            question: "What is the fee structure?",
            answer: "Fee structure varies by location and program. Please contact your nearest T.I.M.E. Kids centre or fill the enquiry form for detailed fee information.",
        },
        {
            question: "Is there a trial class available?",
            answer: "Yes, we offer trial classes so your child can experience our learning environment. Contact your nearest centre to schedule a trial class.",
        },
        KIDS_TEACHER_RATIO_FAQ,
        {
            question: "Are meals provided?",
            answer: "Nutritious snacks and meals are provided for children enrolled in full-day programs and day care. We follow strict hygiene standards.",
        },
        {
            question: "What safety measures are in place?",
            answer: "We have CCTV surveillance, secure entry/exit points, trained staff, child-safe furniture and equipment, and regular safety drills.",
        },
        {
            question: "Can parents visit the school?",
            answer: "Yes, we encourage parents to schedule a visit. You can tour our facilities, meet our teachers, and understand our curriculum and approach.",
        },
    ],
    happy_parents_videos: [
        {
            title: "Annual Day Fun",
            author: "T.I.M.E. Kids",
            video_url:
                "https://iframe.mediadelivery.net/embed/117208/05fa5317-8993-4f3e-b24b-a9b7f61175ef?autoplay=true",
            thumbnail_url: "/feature-annual-day-celebrations.png",
        },
        {
            title: "School Activities",
            author: "T.I.M.E. Kids",
            video_url:
                "https://iframe.mediadelivery.net/embed/117208/76ca3eeb-db55-4472-8a3d-dd9bc1ac7f62?autoplay=true",
            thumbnail_url: "/feature-safe-infrastructure.png",
        },
        {
            title: "Happy Moments",
            author: "Parents Testimonials",
            video_url:
                "https://iframe.mediadelivery.net/embed/117208/61fb5949-de73-42f7-8c27-f4918ff9b9ff?autoplay=true",
            thumbnail_url: "/5.jpeg",
        },
    ],
};

function normalizeHappyParentVideoCard(v: Record<string, unknown>): AdmissionVideoCard {
    const title = String(v?.title || "").trim();
    let author = String(v?.author || "");
    let location = v?.location != null ? String(v.location) : undefined;

    if (title === "Annual Day Fun" || title === "School Activities") {
        author = "T.I.M.E. Kids";
        location = undefined;
    }
    const happyMomentsEmbed =
        "https://iframe.mediadelivery.net/embed/117208/61fb5949-de73-42f7-8c27-f4918ff9b9ff?autoplay=true";

    if (title === "Happy Moments") {
        if (/trichy/i.test(author) || author === "T.I.M.E. Kids Trichy") {
            author = "Parents Testimonials";
        }
        location = undefined;
        return {
            title,
            author,
            location,
            video_url: happyMomentsEmbed,
            thumbnail_url: v?.thumbnail_url != null ? String(v.thumbnail_url) : undefined,
        };
    }

    const video_url = parseEmbedInput(String(v?.video_url || ""));
    const extra = Array.isArray(v?.video_urls)
        ? (v.video_urls as unknown[]).map((u) => parseEmbedInput(String(u || ""))).filter(Boolean)
        : [];
    const video_urls = extra.filter((u) => u && u !== video_url);

    return {
        title,
        author,
        location,
        video_url,
        video_urls: video_urls.length ? video_urls : undefined,
        thumbnail_url: v?.thumbnail_url != null ? String(v.thumbnail_url) : undefined,
    };
}

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

export function mergeAdmissionPageData(raw: Partial<AdmissionPageData> | null | undefined): AdmissionPageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_ADMISSION_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_ADMISSION_PAGE_DATA, raw as Partial<AdmissionPageData>);
        merged.form_welcome_image = String(
            (merged as AdmissionPageData).form_welcome_image ||
                DEFAULT_ADMISSION_PAGE_DATA.form_welcome_image ||
                "/student-welcome.png",
        ).trim() || "/student-welcome.png";
        merged.faq_section = (merged as any).faq_section && typeof (merged as any).faq_section === "object" && !Array.isArray((merged as any).faq_section)
            ? {
                  title_prefix: String((merged as any).faq_section?.title_prefix || ""),
                  title_accent: String((merged as any).faq_section?.title_accent || ""),
                  subtitle: String((merged as any).faq_section?.subtitle || ""),
                  image: String((merged as any).faq_section?.image || ""),
              }
            : DEFAULT_ADMISSION_PAGE_DATA.faq_section;
        merged.why_preschool = Array.isArray(merged.why_preschool) ? merged.why_preschool.map((x: any) => String(x || "").trim()).filter(Boolean) : DEFAULT_ADMISSION_PAGE_DATA.why_preschool;
        merged.why_time_kids = Array.isArray(merged.why_time_kids) ? merged.why_time_kids.map((x: any) => String(x || "").trim()).filter(Boolean) : DEFAULT_ADMISSION_PAGE_DATA.why_time_kids;
        merged.skills = Array.isArray(merged.skills) ? merged.skills.map((s: any) => ({
            title: String(s?.title || ""),
            desc: String(s?.desc || ""),
            icon: String(s?.icon || ""),
            color: String(s?.color || ""),
        })) : DEFAULT_ADMISSION_PAGE_DATA.skills;
        merged.faqs = Array.isArray(merged.faqs)
            ? normalizeAdmissionFaqs(
                  merged.faqs.map((f: any) => ({
                      question: String(f?.question || ""),
                      answer: String(f?.answer || ""),
                  })),
              )
            : DEFAULT_ADMISSION_PAGE_DATA.faqs;
        merged.happy_parents_videos = Array.isArray((merged as any).happy_parents_videos)
            ? (merged as any).happy_parents_videos.map((v: any) => normalizeHappyParentVideoCard(v))
            : DEFAULT_ADMISSION_PAGE_DATA.happy_parents_videos;
        return merged;
    } catch {
        return DEFAULT_ADMISSION_PAGE_DATA;
    }
}

