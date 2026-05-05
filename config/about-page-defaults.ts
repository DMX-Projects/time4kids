export type AboutHero = {
    badge_prefix?: string;
    badge_suffix?: string;
    title_prefix?: string;
    title_accent?: string;
    tagline?: string;
    subtitle?: string;
};

export type AboutMagicalStoryCard = {
    icon?: string; // lucide icon name
    icon_gradient?: string; // tailwind gradient classes (e.g. from-orange-400 to-orange-600)
    plane_position?: "left" | "right" | string;
    text?: string;
};

export type AboutMagicalStory = {
    title_prefix?: string;
    title_accent?: string;
    title_suffix?: string;
    subtitle?: string;
    cards?: AboutMagicalStoryCard[];
};

export type AboutBelief = {
    title?: string;
    text?: string;
};

export type AboutCoreValue = {
    title?: string;
    text?: string;
    icon?: string;
};

export type AboutBeliefs = {
    heading_prefix?: string;
    heading_accent?: string;
    subtitle?: string;
    vision?: AboutBelief;
    philosophy?: AboutBelief;
    core_values_title?: string;
    core_values?: AboutCoreValue[];
};

export type AboutBusiness = {
    name?: string;
    description?: string;
    icon?: string;
};

export type AboutTrustItem = {
    title?: string;
    text?: string;
    icon?: string;
};

export type AboutTimeGroup = {
    badge?: string;
    heading_prefix?: string;
    heading_accent?: string;
    subtitle?: string;
    businesses?: AboutBusiness[];
    trust_title_prefix?: string;
    trust_title_accent?: string;
    trust_items?: AboutTrustItem[];
};

export type AboutPageData = {
    hero?: AboutHero;
    magical_story?: AboutMagicalStory;
    beliefs?: AboutBeliefs;
    time_group?: AboutTimeGroup;
};

export const DEFAULT_ABOUT_PAGE_DATA: AboutPageData = {
    hero: {
        badge_prefix: "Trusted by",
        badge_suffix: "Schools Nationwide",
        title_prefix: "About",
        title_accent: "T.I.M.E. Kids",
        tagline: "Where little dreamers become big achievers!",
        subtitle: "A legacy of educational excellence spanning over 17 years in early childhood education",
    },
    magical_story: {
        title_prefix: "Our",
        title_accent: "Magical",
        title_suffix: "Story",
        subtitle: "A journey of love, learning, and laughter!",
        cards: [
            {
                icon: "Building2",
                icon_gradient: "from-orange-400 to-orange-600",
                plane_position: "right",
                text: "T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 250+ pre-schools is now poised for major expansion across the country.",
            },
            {
                icon: "Home",
                icon_gradient: "from-pink-400 to-pink-600",
                plane_position: "left",
                text: "The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the warm, safe and caring learning environment that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.",
            },
            {
                icon: "GraduationCap",
                icon_gradient: "from-purple-400 to-purple-600",
                plane_position: "right",
                text: "T.I.M.E. Kids pre-schools are backed by our educational expertise of over 30 years, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development practices.",
            },
        ],
    },
    beliefs: {
        heading_prefix: "What We",
        heading_accent: "Believe In",
        subtitle: "Our guiding stars in nurturing young minds",
        vision: {
            title: "Our Vision",
            text: "To be the most trusted and preferred preschool chain in India, providing world-class early childhood education that nurtures every child's potential and prepares them for a bright future.",
        },
        philosophy: {
            title: "Our Philosophy",
            text: "We believe in holistic development through play-based learning, fostering creativity, curiosity, and confidence in every child. Our approach combines traditional values with modern educational practices.",
        },
        core_values_title: "Our Core Values",
        core_values: [
            { title: "Care & Safety", text: "Every child is precious and deserves a nurturing environment", icon: "Heart" },
            { title: "Creativity First", text: "Encouraging imagination and innovative thinking", icon: "Sparkles" },
            { title: "Holistic Growth", text: "Developing mind, body, and character together", icon: "BookOpen" },
        ],
    },
    time_group: {
        badge: "30+ Years of Excellence",
        heading_prefix: "Part of the",
        heading_accent: "T.I.M.E. Group",
        subtitle:
            "Backed by three decades of educational excellence across multiple domains, bringing trusted expertise to early childhood education",
        businesses: [
            { name: "T.I.M.E.", description: "National leader in entrance exam training", icon: "Award" },
            { name: "CLAT Training", description: "Specialized coaching for law entrance exams", icon: "Building2" },
            { name: "School Level Programs", description: "Academic support for school students", icon: "Lightbulb" },
            { name: "T.I.M.E. School", description: "Complete K-12 education", icon: "Target" },
        ],
        trust_title_prefix: "Why Parents",
        trust_title_accent: "Trust Us",
        trust_items: [
            { title: "Proven Track Record", text: "30+ years of educational excellence and expertise", icon: "Award" },
            { title: "Trained Educators", text: "Well-qualified and caring teachers who love children", icon: "Users" },
            { title: "Age-Appropriate Curriculum", text: "Based on child development best practices", icon: "BookOpen" },
            { title: "Home-Like Environment", text: "Safe, warm, and nurturing spaces for learning", icon: "Home" },
        ],
    },
};

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);

export function mergeAboutPageData(raw: unknown): AboutPageData {
    if (!isObj(raw)) return DEFAULT_ABOUT_PAGE_DATA;
    const r = raw as AboutPageData;
    return {
        hero: { ...DEFAULT_ABOUT_PAGE_DATA.hero, ...(isObj(r.hero) ? r.hero : {}) },
        magical_story: {
            ...DEFAULT_ABOUT_PAGE_DATA.magical_story,
            ...(isObj(r.magical_story) ? r.magical_story : {}),
            cards: Array.isArray(r.magical_story?.cards) ? (r.magical_story?.cards as AboutMagicalStoryCard[]) : DEFAULT_ABOUT_PAGE_DATA.magical_story?.cards,
        },
        beliefs: {
            ...DEFAULT_ABOUT_PAGE_DATA.beliefs,
            ...(isObj(r.beliefs) ? r.beliefs : {}),
            vision: { ...DEFAULT_ABOUT_PAGE_DATA.beliefs?.vision, ...(isObj(r.beliefs?.vision) ? r.beliefs?.vision : {}) },
            philosophy: { ...DEFAULT_ABOUT_PAGE_DATA.beliefs?.philosophy, ...(isObj(r.beliefs?.philosophy) ? r.beliefs?.philosophy : {}) },
            core_values: Array.isArray(r.beliefs?.core_values) ? (r.beliefs?.core_values as AboutCoreValue[]) : DEFAULT_ABOUT_PAGE_DATA.beliefs?.core_values,
        },
        time_group: {
            ...DEFAULT_ABOUT_PAGE_DATA.time_group,
            ...(isObj(r.time_group) ? r.time_group : {}),
            businesses: Array.isArray(r.time_group?.businesses) ? (r.time_group?.businesses as AboutBusiness[]) : DEFAULT_ABOUT_PAGE_DATA.time_group?.businesses,
            trust_items: Array.isArray(r.time_group?.trust_items) ? (r.time_group?.trust_items as AboutTrustItem[]) : DEFAULT_ABOUT_PAGE_DATA.time_group?.trust_items,
        },
    };
}

