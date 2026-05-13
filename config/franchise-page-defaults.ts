/** Mirrors `common/home_page_defaults.py` FRANCHISE_PAGE_DATA. */

export type FranchiseBenefit = { icon: string; title: string; description: string };
export type FranchiseTestimonial = { title: string; author: string; location: string; video_url?: string; thumbnail_url?: string };

export type FranchiseSectionHeading = {
    heading_prefix: string;
    heading_accent: string;
    /** Optional line under the split heading */
    blurb?: string;
};

export type FranchiseGettingStartedItem = { title: string; description: string };

export type FranchiseGettingStarted = {
    heading: string;
    intro: string;
    items: FranchiseGettingStartedItem[];
};

export type FranchiseClosing = {
    heading: string;
    paragraphs: string[];
};

export type FranchiseQuickHighlights = {
    heading: string;
    items: string[];
};

export type FranchisePageData = {
    hero: {
        title_prefix: string;
        title_accent: string;
        subtitle: string;
        /** Shown under the hero subtitle */
        intro_paragraphs?: string[];
    };
    /** Heading above the benefit cards */
    benefits_section?: FranchiseSectionHeading;
    benefits: FranchiseBenefit[];
    /** Heading above the offerings list */
    offerings_section?: FranchiseSectionHeading & { intro?: string };
    offerings: string[];
    /** Space, investment, etc. */
    getting_started?: FranchiseGettingStarted;
    /** Closing CTA block before highlights */
    closing?: FranchiseClosing;
    quick_highlights?: FranchiseQuickHighlights;
    testimonials: FranchiseTestimonial[];
    main_branch: {
        heading_prefix: string;
        heading_accent: string;
        subtitle: string;
        map_embed_url: string;
        office_title: string;
        address_html: string;
        phone: string;
        fax: string;
        email: string;
        franchise_email: string;
        cell: string;
        directions_url: string;
        directions_label: string;
    };
    brochure: {
        heading: string;
        subtitle: string;
        button_label: string;
        fallback_url: string;
        marketing_asset_slug: string;
    };
};

export const DEFAULT_FRANCHISE_PAGE_DATA: FranchisePageData = {
    hero: {
        title_prefix: "Why Partner with",
        title_accent: "T.I.M.E. Kids Preschools?",
        subtitle: "Join India's Most Trusted Preschool Franchise Network",
        intro_paragraphs: [
            "Build a meaningful and rewarding business with T.I.M.E. Kids Preschools — a preschool brand backed by the educational legacy of T.I.M.E., one of India's most respected names in learning and test preparation.",
            "With decades of educational expertise, a strong nationwide presence, and a child-first philosophy, T.I.M.E. Kids offers aspiring entrepreneurs an opportunity to create both financial success and lasting social impact.",
        ],
    },
    benefits_section: {
        heading_prefix: "The T.I.M.E. Kids",
        heading_accent: "Advantage",
        blurb: "",
    },
    benefits: [
        {
            icon: "Award",
            title: "Proven Educational Legacy",
            description:
                "Leverage the strength of a trusted education group that has built a growing network of 250+ preschool centres across 60+ cities, creating a strong foundation of trust, quality, and educational excellence.",
        },
        {
            icon: "TrendingUp",
            title: "Fast-Growing Preschool Industry",
            description:
                "India's preschool sector continues to witness rapid growth, making this the ideal time to invest in early childhood education — a segment driven by increasing awareness of quality foundational learning among parents.",
        },
        {
            icon: "BookOpen",
            title: "Research-Based Curriculum",
            description:
                "Gain access to a professionally designed and continuously evolving curriculum aligned with modern early learning methodologies and compatible with CBSE, ICSE, and SSC educational frameworks.\n\nThe curriculum follows a playway method of teaching focused on the holistic development of every child, preparing them confidently for primary schooling.",
        },
        {
            icon: "Heart",
            title: "Strong Brand Credibility",
            description:
                "Benefit from the reputation and trust associated with the T.I.M.E. brand — known nationwide for academic excellence, structured systems, and student success.",
        },
        {
            icon: "Headphones",
            title: "Comprehensive Franchise Support",
            description:
                "At T.I.M.E. Kids, franchisees receive end-to-end support at every stage — from setup and launch to operations and long-term growth.",
        },
    ],
    offerings_section: {
        heading_prefix: "Comprehensive",
        heading_accent: "Franchise Support",
        intro: "At T.I.M.E. Kids, franchisees receive end-to-end support at every stage — from setup and launch to operations and long-term growth.",
        blurb: "",
    },
    offerings: [
        "Infrastructure & Setup Guidance — Expert assistance in planning and establishing child-friendly infrastructure that meets preschool operational and safety standards.",
        "Recruitment & Teacher Training — Support in recruiting qualified staff along with professional training programs for teachers and centre teams.",
        "Marketing & Admissions Support — Guidance on local marketing initiatives, branding activities, parent outreach, and admissions strategies to help build strong enrolments.",
        "Academic & Operational Training — Comprehensive training on curriculum delivery, classroom management, child engagement practices, and day-to-day centre operations.",
        "Continuous Handholding — Ongoing academic and operational support designed to help centres achieve stability, sustained growth, and long-term profitability.",
    ],
    getting_started: {
        heading: "What You Need to Get Started",
        intro: "We are looking for passionate individuals who believe in nurturing young learners while building a successful and impactful business.",
        items: [
            {
                title: "Space Requirement",
                description:
                    "Minimum 1,800 sq. ft. constructed area. Independent building or house in a good residential locality preferred.",
            },
            {
                title: "Investment",
                description:
                    "Approximate investment: ₹12–15 lakhs. Includes infrastructure setup and operational readiness for launching the preschool.",
            },
        ],
    },
    closing: {
        heading: "Start Your Journey with T.I.M.E. Kids",
        paragraphs: [
            "Become part of a growing national preschool network committed to creating safe, engaging, and joyful learning environments for children across India.",
            'Together, we can build centres that truly become a "second home" for every child.',
        ],
    },
    quick_highlights: {
        heading: "Quick Highlights",
        items: [
            "250+ Centres Across India",
            "34+ Years of Educational Excellence",
            "Child-Safe & Non-Toxic Infrastructure Standards",
            "Low Investment with Strong Growth Potential",
            "High Social-Impact Business Opportunity",
            "End-to-End Academic & Operational Support",
            "Proven Systems & Structured Processes",
            "Trusted Brand with Nationwide Recognition",
        ],
    },
    testimonials: [
        { title: "Best business decision", author: "Franchise Partner", location: "Bangalore", video_url: "", thumbnail_url: "" },
        { title: "Complete support from day one", author: "Franchise Partner", location: "Chennai", video_url: "", thumbnail_url: "" },
        { title: "Rewarding and fulfilling", author: "Franchise Partner", location: "Pune", video_url: "", thumbnail_url: "" },
    ],
    main_branch: {
        heading_prefix: "Visit Our",
        heading_accent: "Main Branch",
        subtitle: "Come meet our team and explore our flagship centre",
        map_embed_url:
            "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Siddamsetty+Complex+Parklane+Secunderabad+500003&zoom=15",
        office_title: "T.I.M.E. Kids Corporate Office",
        address_html:
            "Triumphant Institute of Management Education Pvt. (T.I.M.E.)<br />95B, Second Floor<br />Siddamsetty Complex<br />Parklane, Secunderabad<br />500003",
        phone: "040-40088300",
        fax: "040-27847334",
        email: "info@timekidspreschools.com",
        franchise_email: "franchise@timekidspreschools.com",
        cell: "8096355335",
        directions_url: "https://www.google.com/maps/dir/?api=1&destination=Siddamsetty+Complex+Secunderabad+500003",
        directions_label: "Get Directions",
    },
    brochure: {
        heading: "Download Franchise Brochure",
        subtitle: "Get detailed information about investment, support, and franchise benefits",
        button_label: "Download Brochure (PDF)",
        fallback_url: "https://www.timekidspreschools.in/uploads/pc/TIME-Kids-Franchise%20Brochure.pdf",
        marketing_asset_slug: "franchise-brochure",
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

function ensureFranchiseShape(merged: FranchisePageData): FranchisePageData {
    const d = DEFAULT_FRANCHISE_PAGE_DATA;
    if (!Array.isArray(merged.benefits)) merged.benefits = d.benefits;
    if (!Array.isArray(merged.offerings)) merged.offerings = d.offerings;
    if (!Array.isArray(merged.testimonials)) merged.testimonials = d.testimonials;
    if (!merged.hero || typeof merged.hero !== "object") merged.hero = d.hero;
    if (!Array.isArray(merged.hero.intro_paragraphs)) merged.hero.intro_paragraphs = d.hero.intro_paragraphs;
    if (!merged.benefits_section) merged.benefits_section = d.benefits_section;
    if (!merged.offerings_section) merged.offerings_section = d.offerings_section;
    if (!merged.getting_started?.items || !Array.isArray(merged.getting_started.items)) merged.getting_started = d.getting_started;
    if (!merged.closing?.paragraphs || !Array.isArray(merged.closing.paragraphs)) merged.closing = d.closing;
    if (!merged.quick_highlights?.items || !Array.isArray(merged.quick_highlights.items)) merged.quick_highlights = d.quick_highlights;
    return merged;
}

export function mergeFranchisePageData(raw: Partial<FranchisePageData> | null | undefined): FranchisePageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_FRANCHISE_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_FRANCHISE_PAGE_DATA, raw as Partial<FranchisePageData>);
        return ensureFranchiseShape(merged);
    } catch {
        return DEFAULT_FRANCHISE_PAGE_DATA;
    }
}
