/** Mirrors `common/home_page_defaults.py` PROGRAMS_PAGE_DATA. */

export type ProgramsPageProgram = {
    image: string;
    name: string;
    ageGroup: string;
    duration: string;
    description: string;
    features: string[];
};

export type ProgramsPageData = {
    hero: {
        badge: string;
        title_prefix: string;
        title_accent: string;
        subtitle: string;
        cta_label: string;
        cta_href: string;
    };
    programs: ProgramsPageProgram[];
};

export const DEFAULT_PROGRAMS_PAGE_DATA: ProgramsPageData = {
    hero: {
        badge: "Bright futures start here",
        title_prefix: "Our",
        title_accent: "Programs",
        subtitle: "Curiosity-led learning adventures for every stage of your child's magical early years.",
        cta_label: "Enroll Your Child",
        cta_href: "/admission",
    },
    programs: [
        {
            image: "/1.png",
            name: "Play Group",
            ageGroup: "2 - 3 years",
            duration: "2-3 hours",
            description:
                "A magical start to learning! We focus on sensory play, making friends, and discovering the colorful world around us.",
            features: ["Messy & Sensory Play", "Music & Dance", "Making Friends", "Fun with Colors"],
        },
        {
            image: "/2 (1).png",
            name: "Nursery",
            ageGroup: "3 - 4 years",
            duration: "3-4 hours",
            description:
                "Building bridges to big ideas! Hands-on activities that spark curiosity, language, and creativity in little minds.",
            features: ["Story Time Fun", "Arts & Crafts", "Counting Games", "Outdoor Exploration"],
        },
        {
            image: "/2.png",
            name: "Pre-Primary 1",
            ageGroup: "4 - 5 years",
            duration: "4 hours",
            description:
                "Ready, set, grow! We introduce phonics, writing, and numbers through exciting themes and interactive play.",
            features: ["Phonics & Reading", "Writing Fun", "Number Magic", "World Around Us"],
        },
        {
            image: "/16.png",
            name: "Pre-Primary 2",
            ageGroup: "5 - 6 years",
            duration: "4-5 hours",
            description:
                "Future school superstars! Advanced concepts in math, science, and language to prep for big school with confidence.",
            features: ["Little Scientists", "Math Whiz", "Creative Writing", "Public Speaking"],
        },
        {
            image: "/day care.png",
            name: "Day Care",
            ageGroup: "2 - 10 years",
            duration: "Full Day",
            description:
                "A home away from home! Safe, loving, and engaging care with nutritious meals and help with homework.",
            features: ["Homework Help", "Yummy Meals", "Nap Time", "Free Play"],
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

export function mergeProgramsPageData(raw: Partial<ProgramsPageData> | null | undefined): ProgramsPageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_PROGRAMS_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_PROGRAMS_PAGE_DATA, raw as Partial<ProgramsPageData>);
        if (!Array.isArray(merged.programs)) merged.programs = DEFAULT_PROGRAMS_PAGE_DATA.programs;
        merged.programs = merged.programs
            .filter((p) => p && typeof p === "object")
            .map((p) => ({
                image: String((p as any).image || ""),
                name: String((p as any).name || ""),
                ageGroup: String((p as any).ageGroup || ""),
                duration: String((p as any).duration || ""),
                description: String((p as any).description || ""),
                features: Array.isArray((p as any).features) ? (p as any).features.map((x: any) => String(x || "")).filter(Boolean) : [],
            }));
        return merged;
    } catch {
        return DEFAULT_PROGRAMS_PAGE_DATA;
    }
}

