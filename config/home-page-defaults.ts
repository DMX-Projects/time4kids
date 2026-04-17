/** Mirrors `common/home_page_defaults.py` — used when API is down or keys are missing. */

export type KeyNavItem = {
    icon: string;
    alt: string;
    href: string;
    label: string;
    nav_class: string;
    external?: boolean;
};

export type HomePageData = {
    key_navigation: KeyNavItem[];
    intro: {
        title: string;
        subtitle: string;
        paragraphs: string[];
    };
    why_choose_us: {
        heading_prefix: string;
        heading_accent: string;
        features: Array<{
            image: string;
            title: string;
            desc: string;
            color: string;
            accent: string;
        }>;
    };
    programs_preview: {
        programs: Array<{
            image: string;
            programName: string;
            ageGroup: string;
            description: string;
            color: string;
            yOffset: string;
            imageStyle?: { objectPosition?: string };
        }>;
    };
    methodology: {
        title: string;
        items: Array<{
            icon: string;
            label: string;
            class: string;
            href: string;
        }>;
    };
};

export const DEFAULT_HOME_PAGE_DATA: HomePageData = {
    key_navigation: [
        { icon: "/icon-tour.png", alt: "Virtual Tour", href: "/media", label: "Virtual\nTour", nav_class: "nav-link1" },
        { icon: "/icon-gallery.png", alt: "Photo / Video Gallery", href: "/media", label: "Photo / Video Gallery", nav_class: "nav-link2" },
        { icon: "/icon-nearstcenter.png", alt: "Find your Nearest Centre", href: "/locate-centre", label: "Find your Nearest  Centre", nav_class: "nav-link3" },
        { icon: "/icon-franchise.png", alt: "Become a Franchise", href: "/franchise", label: "Become a Franchise", nav_class: "nav-link1" },
        {
            icon: "/icon-brochure.png",
            alt: "Download Brochure",
            href: "https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf",
            label: "Download Brochure",
            nav_class: "nav-link2",
            external: true,
        },
        { icon: "/icon-television.png", alt: "TV Commercial", href: "/tv-commercial", label: "TV\nCommercial", nav_class: "nav-link3" },
    ],
    intro: {
        title: "Welcome to T.I.M.E. Kids",
        subtitle:
            "A chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training.",
        paragraphs: [
            "T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 350+ pre-schools is now poised for major expansion across the country.",
            "The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the warm, safe and caring and learning environment that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.",
            "We are backed by our educational expertise of over 27 years, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development.",
        ],
    },
    why_choose_us: {
        heading_prefix: "Why Choose ",
        heading_accent: "T.I.M.E. Kids?",
        features: [
            { image: "/infra.jpg", title: "Safe Infrastructure", desc: "Secure premises for complete peace of mind.", color: "#FEE2E2", accent: "#EF4444" },
            { image: "/11.png", title: "Trained Teachers", desc: "Experienced educators nurturing your child.", color: "#E0F2FE", accent: "#0EA5E9" },
            { image: "/4.png", title: "NEP 2020 Curriculum", desc: "Modern curriculum for holistic growth.", color: "#FFEDD5", accent: "#F97316" },
            { image: "/17.png", title: "17 Years Legacy", desc: "Educational expertise since 2005.", color: "#DCFCE7", accent: "#22C55E" },
            { image: "/18.png", title: "Caring Environment", desc: "A second home for your little one.", color: "#FDF2F8", accent: "#EC4899" },
            { image: "/12.png", title: "Fun Learning", desc: "Hands-on activities and play.", color: "#F5F3FF", accent: "#8B5CF6" },
        ],
    },
    programs_preview: {
        programs: [
            {
                image: "/day care.png",
                programName: "Play Group",
                ageGroup: "2 - 3 years",
                description: "Introduction to social interaction and basic motor skills.",
                color: "#ef5f5f",
                yOffset: "-20px",
            },
            {
                image: "/images/nursery_girl.png",
                programName: "Nursery",
                ageGroup: "3 - 4 years",
                description: "Building foundation for language, numbers, and expression.",
                color: "#fbd267",
                yOffset: "40px",
                imageStyle: { objectPosition: "center 20%" },
            },
            {
                image: "/1.png",
                programName: "PP-1",
                ageGroup: "4 - 5 years",
                description:
                    "Expanding from school to the world around — curious, interactive, and building strong foundations.",
                color: "#e74c3c",
                yOffset: "-30px",
            },
            {
                image: "/11.png",
                programName: "PP-2",
                ageGroup: "5 - 6 years",
                description:
                    "Confident learners ready for formal schooling — communication, independence, and core skills.",
                color: "#2980b9",
                yOffset: "20px",
            },
            {
                image: "/images/landing-banner.jpg",
                programName: "Day Care",
                ageGroup: "2 - 10 years",
                description: "Extended care with engaging activities throughout the day.",
                color: "#ff9f43",
                yOffset: "30px",
            },
        ],
    },
    methodology: {
        title: "Value based methodology",
        items: [
            { icon: "/methodology-icon1.png", label: "Modular Furniture", class: "nav-item1", href: "/programs" },
            { icon: "/methodology-icon2.png", label: "Play-Learn methods", class: "nav-item2", href: "/programs" },
            { icon: "/methodology-icon3.png", label: "After School fun", class: "nav-item3", href: "/admission" },
            { icon: "/methodology-icon4.png", label: "Prioritizing Hygiene", class: "nav-item4", href: "/programs" },
            { icon: "/methodology-icon5.png", label: "Teaching Aids", class: "nav-item5", href: "/programs" },
            { icon: "/methodology-icon6.png", label: "Health Check-up", class: "nav-item6", href: "/programs" },
        ],
    },
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

/** True when CMS still stores PP-1 and PP-2 as one program (any common variant). */
function isLegacyCombinedPpProgramName(programName: string): boolean {
    const t = programName.trim();
    if (!t) return false;
    const oneLine = t.replace(/\s+/g, " ").toLowerCase();
    if (oneLine === "pp-1 & pp-2" || oneLine === "pp1 & pp2") return true;
    if (/pp[-\u2013]?\s*1\s*([&+]|\band\b)\s*pp[-\u2013]?\s*2/i.test(oneLine)) return true;
    const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 2 && /^pp[-\u2013]?1$/i.test(lines[0]) && /^pp[-\u2013]?2$/i.test(lines[1])) return true;
    return false;
}

/**
 * DB/API often still has one row "PP-1 & PP-2". The API replaces the whole `programs` array on merge,
 * so defaults never fix it — split that entry into PP-1 + PP-2 here.
 */
export function normalizeProgramsPreviewPrograms(
    programs: HomePageData["programs_preview"]["programs"],
): HomePageData["programs_preview"]["programs"] {
    const defaults = DEFAULT_HOME_PAGE_DATA.programs_preview.programs;
    const pp1 = defaults.find((p) => p.programName === "PP-1");
    const pp2 = defaults.find((p) => p.programName === "PP-2");
    if (!pp1 || !pp2) return programs;

    const out: HomePageData["programs_preview"]["programs"] = [];
    for (const p of programs) {
        if (isLegacyCombinedPpProgramName(p.programName)) {
            out.push({ ...pp1 }, { ...pp2 });
        } else {
            out.push(p);
        }
    }
    return out;
}

/** Merge API payload over defaults so missing keys still work. */
export function mergeHomePageData(raw: Partial<HomePageData> | null | undefined): HomePageData {
    if (!raw || typeof raw !== "object") return DEFAULT_HOME_PAGE_DATA;
    const merged = deepMerge(DEFAULT_HOME_PAGE_DATA, raw as Partial<HomePageData>);
    merged.programs_preview = {
        ...merged.programs_preview,
        programs: normalizeProgramsPreviewPrograms(merged.programs_preview.programs),
    };
    return merged;
}
