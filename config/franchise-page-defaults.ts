/** Mirrors `common/home_page_defaults.py` FRANCHISE_PAGE_DATA. */

export type FranchiseBenefit = { icon: string; title: string; description: string };
export type FranchiseTestimonial = { title: string; author: string; location: string; video_url?: string; thumbnail_url?: string };

export type FranchisePageData = {
    hero: {
        title_prefix: string;
        title_accent: string;
        subtitle: string;
    };
    benefits: FranchiseBenefit[];
    offerings: string[];
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
        title_prefix: "Franchise",
        title_accent: "Opportunity",
        subtitle: "Partner with India's trusted preschool brand and build a rewarding business",
    },
    benefits: [
        {
            icon: "Award",
            title: "Strong Brand Name",
            description: "Leverage 17 years of T.I.M.E. Kids legacy and 30+ years of T.I.M.E. Group expertise",
        },
        { icon: "DollarSign", title: "Low Investment, High Returns", description: "Profitable business model with quick ROI and sustainable growth" },
        { icon: "BookOpen", title: "Complete Curriculum Support", description: "NEP 2020 updated curriculum, teaching materials, and activity plans" },
        { icon: "Users", title: "Regular Staff Training", description: "Continuous training programs for teachers and staff development" },
        { icon: "Headphones", title: "Operational Support", description: "End-to-end support in setup, marketing, and daily operations" },
        { icon: "TrendingUp", title: "Marketing Assistance", description: "National and local marketing support to grow your centre" },
    ],
    offerings: [
        "Proven business model with 250+ successful centres",
        "Comprehensive training for franchisees and staff",
        "Marketing and promotional materials",
        "Technology platform for operations",
        "Quality assurance and monitoring",
        "Parent engagement programs",
    ],
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

export function mergeFranchisePageData(raw: Partial<FranchisePageData> | null | undefined): FranchisePageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_FRANCHISE_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_FRANCHISE_PAGE_DATA, raw as Partial<FranchisePageData>);
        if (!Array.isArray(merged.benefits)) merged.benefits = DEFAULT_FRANCHISE_PAGE_DATA.benefits;
        if (!Array.isArray(merged.offerings)) merged.offerings = DEFAULT_FRANCHISE_PAGE_DATA.offerings;
        if (!Array.isArray(merged.testimonials)) merged.testimonials = DEFAULT_FRANCHISE_PAGE_DATA.testimonials;
        return merged;
    } catch {
        return DEFAULT_FRANCHISE_PAGE_DATA;
    }
}

