/** Mirrors `common/home_page_defaults.py` ADMISSION_PAGE_DATA. */

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
    thumbnail_url?: string;
};

export type AdmissionPageData = {
    faq_section?: AdmissionFaqSection;
    why_preschool: string[];
    why_time_kids: string[];
    skills: AdmissionSkill[];
    faqs: AdmissionFaq[];
    happy_parents_videos?: AdmissionVideoCard[];
};

export const DEFAULT_ADMISSION_PAGE_DATA: AdmissionPageData = {
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
        {
            question: "What is the student-teacher ratio?",
            answer: "We maintain a low student-teacher ratio of 1:10 to ensure personalized attention for every child.",
        },
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
            author: "T.I.M.E. Kids Kilpauk",
            location: "Chennai",
            video_url: "/chaninai kilpauk-AnnualDay-Video-2018-19.mp4",
            thumbnail_url: "/feature-annual-day-celebrations.png",
        },
        {
            title: "School Activities",
            author: "T.I.M.E. Kids Chennai",
            location: "Chennai",
            video_url: "/chennai2.mp4",
            thumbnail_url: "/feature-safe-infrastructure.png",
        },
        {
            title: "Happy Moments",
            author: "T.I.M.E. Kids Trichy",
            location: "Trichy",
            video_url: "/trichy-rajacolony.mp4",
            thumbnail_url: "/5.jpeg",
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

export function mergeAdmissionPageData(raw: Partial<AdmissionPageData> | null | undefined): AdmissionPageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_ADMISSION_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_ADMISSION_PAGE_DATA, raw as Partial<AdmissionPageData>);
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
        merged.faqs = Array.isArray(merged.faqs) ? merged.faqs.map((f: any) => ({
            question: String(f?.question || ""),
            answer: String(f?.answer || ""),
        })) : DEFAULT_ADMISSION_PAGE_DATA.faqs;
        merged.happy_parents_videos = Array.isArray((merged as any).happy_parents_videos)
            ? (merged as any).happy_parents_videos.map((v: any) => ({
                  title: String(v?.title || ""),
                  author: String(v?.author || ""),
                  location: v?.location != null ? String(v.location) : undefined,
                  video_url: String(v?.video_url || ""),
                  thumbnail_url: v?.thumbnail_url != null ? String(v.thumbnail_url) : undefined,
              }))
            : DEFAULT_ADMISSION_PAGE_DATA.happy_parents_videos;
        return merged;
    } catch {
        return DEFAULT_ADMISSION_PAGE_DATA;
    }
}

