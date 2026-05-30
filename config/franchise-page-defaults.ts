/** Mirrors `common/home_page_defaults.py` FRANCHISE_PAGE_DATA. */

import { FRANCHISE_BROCHURE_PDF_URL } from "@/config/site-public";

export type FranchiseBenefit = { icon: string; title: string; description: string };
export type FranchiseTestimonial = { title: string; author: string; location: string; video_url?: string; thumbnail_url?: string };

/** Default card title on /franchise → Franchisee Success Stories */
export const FRANCHISE_SUCCESS_STORY_DEFAULT_TITLE =
    "What our Franchise has to say about T.I.M.E. Kids";

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
        regional_office_title: string;
        /** Plain address lines — saved to CMS; rendered as HTML on the public page */
        address_lines?: string[];
        /** Structured regional rows — saved to CMS; rendered as HTML on the public page */
        regional_offices?: FranchiseRegionalOffice[];
        regional_address_html: string;
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

type RegionalOfficeSubCity = { city: string; phone: string };

export type FranchiseRegionalOffice = {
    state: string;
    city: string;
    phone: string;
    subCities?: RegionalOfficeSubCity[];
};

export type FranchiseRegionalSubCity = RegionalOfficeSubCity;

const REGIONAL_OFFICE_ENTRIES: FranchiseRegionalOffice[] = [
    { state: "Bihar & Jharkhand", city: "Patna", phone: "7979833564" },
    {
        state: "Kerala",
        city: "Kochin",
        phone: "9074586895 / 8089001116",
        subCities: [
            { city: "Thiruananthpuram", phone: "9074586895 / 8089001116" },
            { city: "Calicut", phone: "7907467952" },
        ],
    },
    { state: "Maharashtra", city: "Pune", phone: "9958546677" },
    { state: "Odissa & Chattisgarh", city: "Bhuvaneshwar", phone: "8917320143" },
    { state: "Tamilnadu", city: "Chennai", phone: "9566349498" },
    { state: "Telangana & Andhra Pradesh", city: "Hyderabad", phone: "7989281696" },
    { state: "West Bengal", city: "Kolkata", phone: "8335807272" },
];

function escapeRegionalHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function regionalPhoneHtml(phone: string): string {
    const parts = phone
        .split(/\s*\/\s*/)
        .map((p) => p.trim())
        .filter(Boolean);
    const numbers =
        parts.length > 1
            ? parts
                  .map((n) => `<span class="tk-regional-offices__number">${escapeRegionalHtml(n)}</span>`)
                  .join("")
            : `<span class="tk-regional-offices__number">${escapeRegionalHtml(parts[0] ?? phone)}</span>`;

    return (
        `<span class="tk-regional-offices__phone">` +
        `<span class="tk-regional-offices__label">Cell :</span>` +
        `<span class="tk-regional-offices__numbers">${numbers}</span>` +
        `</span>`
    );
}

function regionalOfficeRowHtml(city: string, phone: string, state?: string): string {
    const isSub = !state;
    const stateCell = state
        ? `<span class="tk-regional-offices__state"><strong>${escapeRegionalHtml(state)}</strong></span>`
        : `<span class="tk-regional-offices__state" aria-hidden="true"></span>`;
    const rowClass = isSub ? "tk-regional-offices__row tk-regional-offices__row--sub" : "tk-regional-offices__row";
    const dot = isSub
        ? `<span class="tk-regional-offices__dot" aria-hidden="true"></span>`
        : `<span class="tk-regional-offices__dot" aria-hidden="true">•</span>`;

    return (
        `<li class="${rowClass}">` +
        `${dot}${stateCell}` +
        `<span class="tk-regional-offices__city">${escapeRegionalHtml(city)}</span>` +
        regionalPhoneHtml(phone) +
        `</li>`
    );
}

/** Regional office lines for the right contact card (aligned state / city / phone grid). */
export function buildRegionalOfficesAddressHtml(entries: FranchiseRegionalOffice[] = REGIONAL_OFFICE_ENTRIES): string {
    const rows: string[] = [];
    for (const entry of entries) {
        rows.push(regionalOfficeRowHtml(entry.city, entry.phone, entry.state));
        for (const sub of entry.subCities ?? []) {
            rows.push(regionalOfficeRowHtml(sub.city, sub.phone));
        }
    }
    return `<ul class="tk-regional-offices">${rows.join("")}</ul>`;
}

export const DEFAULT_FRANCHISE_REGIONAL_OFFICES: FranchiseRegionalOffice[] = REGIONAL_OFFICE_ENTRIES.map((row) => ({
    ...row,
    subCities: row.subCities?.map((sub) => ({ ...sub })),
}));

export const DEFAULT_REGIONAL_ADDRESS_HTML = buildRegionalOfficesAddressHtml();

const LEGACY_REGIONAL_ADDRESS_VALUES = [
    "Telangana & Andhra Pradesh - Hyderabad - 7989281696",
    "Telangana & Andhra Pradesh - Hyderabad - Cell : 7989281696",
];

function shouldMigrateRegionalAddress(html: string | undefined): boolean {
    const trimmed = (html ?? "").trim();
    if (!trimmed) return true;
    if (!trimmed.includes("tk-regional-offices")) return true;
    if (!trimmed.includes("tk-regional-offices__numbers")) return true;
    if (LEGACY_REGIONAL_ADDRESS_VALUES.includes(trimmed)) return true;
    if (trimmed.includes("Kids Early Education")) return true;
    if (trimmed.includes("→")) return true;
    if ((trimmed.match(/Kerala/g) ?? []).length > 1) return true;
    if (trimmed.includes("<br />")) return true;
    if (!trimmed.includes("Tamilnadu")) return true;
    const telanganaPos = trimmed.indexOf("Telangana");
    const biharPos = trimmed.indexOf("Bihar");
    if (telanganaPos >= 0 && biharPos >= 0 && telanganaPos < biharPos) return true;
    return false;
}

/** Split legacy corporate address HTML into plain lines for the admin form. */
export function addressHtmlToLines(html: string | undefined): string[] {
    if (!html?.trim()) return [];
    return html
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/?[^>]+(>|$)/g, "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
}

/** Join address lines for the public /franchise page card. */
export function addressLinesToHtml(lines: string[]): string {
    return lines
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) =>
            line
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;"),
        )
        .join("<br />");
}

function cloneRegionalOffices(rows: FranchiseRegionalOffice[]): FranchiseRegionalOffice[] {
    return rows.map((row) => ({
        state: row.state ?? "",
        city: row.city ?? "",
        phone: row.phone ?? "",
        subCities: row.subCities?.map((sub) => ({ city: sub.city ?? "", phone: sub.phone ?? "" })),
    }));
}

/** Ensure structured contact fields exist and keep HTML in sync for the live page. */
export function prepareMainBranchForAdmin(
    mainBranch: FranchisePageData["main_branch"],
): FranchisePageData["main_branch"] {
    const next = { ...mainBranch };
    if (!Array.isArray(next.address_lines) || !next.address_lines.some((l) => l.trim())) {
        next.address_lines = addressHtmlToLines(next.address_html);
    }
    if (!Array.isArray(next.regional_offices) || !next.regional_offices.length) {
        next.regional_offices = cloneRegionalOffices(DEFAULT_FRANCHISE_REGIONAL_OFFICES);
    }
    return next;
}

export function syncMainBranchContactFields(
    mainBranch: FranchisePageData["main_branch"],
): FranchisePageData["main_branch"] {
    const next = prepareMainBranchForAdmin(mainBranch);
    next.address_lines = next.address_lines!.map((l) => l.trim()).filter(Boolean);
    next.address_html = addressLinesToHtml(next.address_lines);
    next.regional_offices = cloneRegionalOffices(next.regional_offices!);
    next.regional_address_html = buildRegionalOfficesAddressHtml(next.regional_offices);
    return next;
}

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
        {
            title: FRANCHISE_SUCCESS_STORY_DEFAULT_TITLE,
            author: "T.I.M.E. Kids",
            location: "",
            video_url: "",
            thumbnail_url: "/feature-annual-day-celebrations.png",
        },
    ],
    main_branch: {
        heading_prefix: "Connect with Our",
        heading_accent: "Representative",
        subtitle: "Come meet our team and explore our flagship centre",
        map_embed_url:
            "https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Siddamsetty+Complex+Parklane+Secunderabad+500003&zoom=15",
        office_title: "T.I.M.E. Kids Corporate Office",
        regional_office_title: "T.I.M.E. Kids Regional Offices",
        address_lines: [
            "Kids Early Education Pvt. Ltd.",
            "95B, Second Floor",
            "Siddamsetty Complex",
            "Parklane, Secunderabad",
            "500003",
        ],
        regional_offices: DEFAULT_FRANCHISE_REGIONAL_OFFICES.map((row) => ({
            ...row,
            subCities: row.subCities?.map((sub) => ({ ...sub })),
        })),
        regional_address_html: DEFAULT_REGIONAL_ADDRESS_HTML,
        address_html:
            "Kids Early Education Pvt. Ltd.<br />95B, Second Floor<br />Siddamsetty Complex<br />Parklane, Secunderabad<br />500003",
        phone: "040-40088300",
        fax: "040-27847334",
        email: "admissions@timekidspreschools.com",
        franchise_email: "franchise@timekidspreschools.com",
        cell: "8096355335",
        directions_url: "https://www.google.com/maps/dir/?api=1&destination=Siddamsetty+Complex+Secunderabad+500003",
        directions_label: "Get Directions",
    },
    brochure: {
        heading: "Download Franchise Brochure",
        subtitle: "Get detailed information about investment, support, and franchise benefits",
        button_label: "Download Brochure (PDF)",
        fallback_url: FRANCHISE_BROCHURE_PDF_URL,
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
    merged.testimonials = merged.testimonials
        .filter((t): t is FranchiseTestimonial => Boolean(t && typeof t === "object"))
        .map((story, i) => {
            const t = (story.title || "").trim();
            if (!t || t === "Annual Day Fun") {
                story.title = i === 0 ? FRANCHISE_SUCCESS_STORY_DEFAULT_TITLE : `Success story ${i + 1}`;
            }
            story.location = "";
            return story;
        });
    if (merged.testimonials.length === 0) merged.testimonials = d.testimonials;
    if (!merged.hero || typeof merged.hero !== "object") merged.hero = d.hero;
    if (!Array.isArray(merged.hero.intro_paragraphs)) merged.hero.intro_paragraphs = d.hero.intro_paragraphs;
    if (!merged.benefits_section) merged.benefits_section = d.benefits_section;
    if (!merged.offerings_section) merged.offerings_section = d.offerings_section;
    if (!merged.getting_started?.items || !Array.isArray(merged.getting_started.items)) merged.getting_started = d.getting_started;
    if (!merged.closing?.paragraphs || !Array.isArray(merged.closing.paragraphs)) merged.closing = d.closing;
    if (!merged.quick_highlights?.items || !Array.isArray(merged.quick_highlights.items)) merged.quick_highlights = d.quick_highlights;
    if (!merged.main_branch || typeof merged.main_branch !== "object") merged.main_branch = d.main_branch;
    if (!merged.main_branch.regional_office_title?.trim()) {
        merged.main_branch.regional_office_title = d.main_branch.regional_office_title;
    }
    if (shouldMigrateRegionalAddress(merged.main_branch.regional_address_html)) {
        merged.main_branch.regional_address_html = d.main_branch.regional_address_html;
    } else if (merged.main_branch.regional_address_html === merged.main_branch.address_html) {
        merged.main_branch.regional_address_html = d.main_branch.regional_address_html;
    }
    if (
        merged.main_branch.heading_prefix === "Visit Our" &&
        merged.main_branch.heading_accent === "Main Branch"
    ) {
        merged.main_branch.heading_prefix = d.main_branch.heading_prefix;
        merged.main_branch.heading_accent = d.main_branch.heading_accent;
    }
    if (merged.main_branch.address_html?.includes("Triumphant Institute of Management Education")) {
        merged.main_branch.address_html = d.main_branch.address_html;
    }
    if (merged.main_branch.email === "info@timekidspreschools.com") {
        merged.main_branch.email = d.main_branch.email;
    }
    merged.main_branch = prepareMainBranchForAdmin(merged.main_branch);
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
