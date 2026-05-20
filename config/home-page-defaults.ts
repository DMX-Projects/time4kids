/** Mirrors `common/home_page_defaults.py` — used when API is down or keys are missing. */

import { NEWS_TICKER_MAX_WORDS, truncateToWordLimit } from "@/lib/text-limit";
import { FRANCHISE_BROCHURE_PDF_URL } from "@/config/site-public";

export type KeyNavItem = {
    icon: string;
    alt: string;
    href: string;
    label: string;
    nav_class: string;
    external?: boolean;
};

/** Default homepage franchise video thumbnail (`public/franchise-gallery/`). */
export const DEFAULT_FRANCHISE_VIDEO_POSTER = "/franchise-gallery/franchise-promo-1.png";

export type FranchiseAdvantageVideoItem = {
    /** Thumbnail inside the blob (path, /media/…, or full URL). */
    poster: string;
    /** MP4, `/media/…`, or YouTube watch / embed / shorts URL. */
    src: string;
    alt?: string;
};

export type FranchiseAdvantagePhotoItem = {
    /** Image inside the blob (path, /media/…, or full URL). */
    src: string;
    alt?: string;
};

export type NewsTickerItem = {
    text: string;
};

/** Google Street View / Maps embed used as the public “Virtual Tour” destination. */
export const VIRTUAL_TOUR_MAPS_URL =
    "https://www.google.com/maps/embed?pb=!1m0!3m2!1sen!2s!4v1456003231726!6m8!1m7!1sUEc7Ta_OzQcAAAQq3Rq0gw!2m2!1d17.40666583994208!2d78.48091207922675!3f90!4f0!5f0.4000000000000002";

export type HomePageData = {
    key_navigation: KeyNavItem[];
    franchise_benefits?: string[];
    franchise_advantage_videos: FranchiseAdvantageVideoItem[];
    franchise_advantage_photos: FranchiseAdvantagePhotoItem[];
    /** Scrolling lines under “Latest News & Updates” (home franchise section). */
    news_ticker_items: NewsTickerItem[];
    updates_empty_message?: string;
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
        { icon: "/icon-nearstcenter.png", alt: "Find your Nearest Centre", href: "/locate-centre", label: "Find your Nearest  Centre", nav_class: "nav-link3" },
        { icon: "/icon-franchise.png", alt: "Become a Franchisee", href: "/franchise", label: "Become a Franchisee", nav_class: "nav-link1" },
        {
            icon: "/icon-tour.png",
            alt: "Virtual Tour",
            href: VIRTUAL_TOUR_MAPS_URL,
            label: "Virtual\nTour",
            nav_class: "nav-link1",
        },
        { icon: "/icon-gallery.png", alt: "Photo / Video Gallery", href: "/gallery", label: "Photo / Video Gallery", nav_class: "nav-link2" },
        {
            icon: "/icon-brochure.png",
            alt: "Download Brochure",
            href: FRANCHISE_BROCHURE_PDF_URL,
            label: "Download Brochure",
            nav_class: "nav-link2",
            external: true,
        },
        { icon: "/icon-media.svg", alt: "Media", href: "/gallery", label: "Media", nav_class: "nav-link3" },
    ],
    franchise_benefits: [
        "Low Investment High Returns",
        "Strong Brand Name of T.I.M.E.",
        "Complete Curriculum Support",
        "Regular Staff Training",
        "Operational Support",
    ],
    franchise_advantage_videos: [
        {
            poster: DEFAULT_FRANCHISE_VIDEO_POSTER,
            src: "https://iframe.mediadelivery.net/embed/117208/9005f10d-a5c3-4cd7-831e-fac0c2b5334f?autoplay=true",
            alt: "T.I.M.E. Kids franchise advantage",
        },
    ],
    franchise_advantage_photos: [
        { src: "/franchise-gallery/franchise-nep-compliant.png", alt: "NEP 2020 compliant — T.I.M.E. Kids" },
        { src: "/franchise-gallery/franchise-brochure-cover.png", alt: "Become a franchisee of T.I.M.E. Kids pre-schools" },
        { src: "/franchise-gallery/franchise-promo-1.png", alt: "Start your own preschool with T.I.M.E. Kids" },
        { src: "/franchise-gallery/franchise-promo-2.png", alt: "Partner with India's trusted preschool network" },
        { src: "/franchise-gallery/franchise-promo-3.png", alt: "Franchise opportunity — T.I.M.E. Kids" },
        { src: "/franchise-gallery/franchise-promo-4.png", alt: "Start your preschool franchise today" },
        { src: "/franchise-gallery/franchise-promo-5.png", alt: "Preschool franchise with T.I.M.E. Kids" },
        { src: "/franchise-gallery/franchise-promo-6.png", alt: "Launch a preschool with T.I.M.E. Kids" },
        { src: "/franchise-gallery/franchise-promo-7.png", alt: "Franchise opportunity — invest in preschool" },
    ],
    news_ticker_items: [
        {
            text: "Our New centres opened for Academic year 2026-27 (Bengaluru – Dommasandra, Horamavu New, JP Nagar 9th Phase, Kamakshipalya) (Bhadrak – Motel Chhak) (Bhubaneswar – Patrapada) (Chennai – Chitlapakkam, Kovur, Mugalivakkam New, Porur, Pozhichalur, Tondiarpet New, West Mambalam) (Cuttack – CDA) (Ernakulam – Irumpanam) (Guntakal – Alur Road) (Guntur – Krishna Nagar) (Hyderabad – Ameenpur, Goshamahal, Kuntloor, Medchal, Presidency Avenue – Alwal, RR Colony – Ameenpur, Sri Ram Nagar - Jeedimetla) (Kolkata – Kestopur) (Kollam – Paravur) (Kozhikode – Pantheerankav) (Pathanamthitta – Changanassery) (Patna – Gola Road New, Khagaul Road, Priyadarshi) (Thrissur – Chiyyaram, Nellikunnu) (Tiruvannamalai – Arani) (Trichy – Pon Nagar) (Trivandrum – Kalathukal, Attingal, Vettu Road)",
        },
    ],
    updates_empty_message: "Add scrolling news lines under Admin → Home page content → Latest news ticker.",
    intro: {
        title: "Welcome to T.I.M.E. Kids",
        subtitle:
            "A chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training.",
        paragraphs: [
            "T.I.M.E. Kids pre-schools is a chain of pre-schools launched by T.I.M.E., the national leader in entrance exam training. After its hugely successful beginning in Hyderabad, T.I.M.E. Kids with 250+ pre-schools in 60 cities across India is now poised for major expansion across the country.",
            "The programme at T.I.M.E. Kids pre-schools aims at making the transition from home to school easy, by providing the warm, safe and caring and learning environment that young children have at home. Our play schools offer wholesome, fun-filled and memorable childhood education to our children.",
            "We are backed by our educational expertise of over 27 years, well trained care providers and a balanced educational programme. The programme at T.I.M.E. Kids pre-schools is based on the principles of age-appropriate child development.",
        ],
    },
    why_choose_us: {
        heading_prefix: "why parents love ",
        heading_accent: "timekids",
        features: [
            { image: "/feature-safe-infrastructure.png", title: "Safe Infrastructure", desc: "Secure premises for complete peace of mind.", color: "#FEE2E2", accent: "#EF4444" },
            { image: "/feature-trained-teachers.png", title: "Trained Teachers", desc: "Experienced educators nurturing your child.", color: "#E0F2FE", accent: "#0EA5E9" },
            { image: "/nep-2020-curriculum.png", title: "NEP 2020 Curriculum", desc: "Modern curriculum for holistic growth.", color: "#FFEDD5", accent: "#F97316" },
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
                ageGroup: "Age group : 2-3 years",
                description: "Introduction to social interaction and basic motor skills.",
                color: "#ef5f5f",
                yOffset: "-20px",
            },
            {
                image: "/images/nursery_girl.png",
                programName: "Nursery",
                ageGroup: "Age group : 3-4 years",
                description: "Building foundation for language, numbers, and expression.",
                color: "#fbd267",
                yOffset: "40px",
                imageStyle: { objectPosition: "center 20%" },
            },
            {
                image: "/1.png",
                programName: "PP-1",
                ageGroup: "Age group : 4-5 years",
                description:
                    "Expanding from school to the world around — curious, interactive, and building strong foundations.",
                color: "#e74c3c",
                yOffset: "-30px",
            },
            {
                image: "/11.png",
                programName: "PP-2",
                ageGroup: "Age group : 5-6 years",
                description:
                    "Confident learners ready for formal schooling — communication, independence, and core skills.",
                color: "#2980b9",
                yOffset: "20px",
            },
            {
                image: "/images/landing-banner.jpg",
                programName: "Summer Programs",
                ageGroup: "Age group : 2-10 years",
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

/** Coerce API items; migrate legacy `franchise_advantage_spotlight` when `franchise_advantage_videos` is absent. */
export function normalizeFranchiseAdvantageVideos(merged: HomePageData, raw: Record<string, unknown>): void {
    const defaults = DEFAULT_HOME_PAGE_DATA.franchise_advantage_videos;
    const rawVideos = raw.franchise_advantage_videos;
    if (Array.isArray(rawVideos) && rawVideos.length > 0) {
        const cleaned: FranchiseAdvantageVideoItem[] = [];
        for (const row of rawVideos) {
            if (!row || typeof row !== "object" || Array.isArray(row)) continue;
            const o = row as Record<string, unknown>;
            const poster = String(o.poster ?? "").trim();
            const src = String(o.src ?? "").trim();
            const alt = typeof o.alt === "string" ? o.alt : undefined;
            if (!poster && !src) continue;
            cleaned.push({ poster: poster || DEFAULT_FRANCHISE_VIDEO_POSTER, src, alt });
        }
        merged.franchise_advantage_videos = cleaned.length > 0 ? cleaned : [...defaults];
        return;
    }
    const legacy = raw.franchise_advantage_spotlight;
    if (legacy && typeof legacy === "object" && !Array.isArray(legacy)) {
        const o = legacy as Record<string, unknown>;
        const poster = String(o.video_poster ?? "").trim();
        const src = String(o.video_src ?? "").trim();
        const alt = typeof o.video_alt === "string" ? o.video_alt : undefined;
        if (poster || src) {
            merged.franchise_advantage_videos = [{ poster: poster || "/16.png", src, alt }];
            return;
        }
    }
    merged.franchise_advantage_videos = [...defaults];
}

/** Coerce scrolling news ticker lines for the franchise updates board. */
export function normalizeNewsTickerItems(merged: HomePageData, raw: Record<string, unknown>): void {
    const defaults = DEFAULT_HOME_PAGE_DATA.news_ticker_items;
    const rawItems = raw.news_ticker_items;
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
        merged.news_ticker_items = [...defaults];
        return;
    }
    const cleaned: NewsTickerItem[] = [];
    for (const row of rawItems) {
        if (!row || typeof row !== "object" || Array.isArray(row)) continue;
        const text = truncateToWordLimit(String((row as Record<string, unknown>).text ?? ""), NEWS_TICKER_MAX_WORDS);
        if (!text) continue;
        cleaned.push({ text });
    }
    merged.news_ticker_items = cleaned.length > 0 ? cleaned : [...defaults];
}

/** Coerce franchise advantage photo slides for the home carousel. */
export function normalizeFranchiseAdvantagePhotos(merged: HomePageData, raw: Record<string, unknown>): void {
    const defaults = DEFAULT_HOME_PAGE_DATA.franchise_advantage_photos;
    const rawPhotos = raw.franchise_advantage_photos;
    if (Array.isArray(rawPhotos) && rawPhotos.length > 0) {
        const cleaned: FranchiseAdvantagePhotoItem[] = [];
        for (const row of rawPhotos) {
            if (!row || typeof row !== "object" || Array.isArray(row)) continue;
            const o = row as Record<string, unknown>;
            const src = String(o.src ?? "").trim();
            if (!src) continue;
            const alt = typeof o.alt === "string" ? o.alt : undefined;
            cleaned.push({ src, alt });
        }
        merged.franchise_advantage_photos = cleaned.length > 0 ? cleaned : [...defaults];
        return;
    }
    merged.franchise_advantage_photos = [...defaults];
}

/** Stable href key so `/Gallery` matches `/gallery` for dedupe. */
function keyNavHrefKey(href: string): string {
    const t = href.trim();
    if (!t) return "";
    if (/^https?:\/\//i.test(t)) {
        try {
            const u = new URL(t);
            return u.href.replace(/\/$/, "");
        } catch {
            return t.toLowerCase();
        }
    }
    const p = t.startsWith("/") ? t : `/${t}`;
    const lower = p.toLowerCase();
    return lower.length > 1 && lower.endsWith("/") ? lower.slice(0, -1) : lower;
}

/**
 * One logical slot per home key-nav tile (Virtual tour, Gallery, etc.).
 * Icon + label checked before href so two defaults both using `/gallery` stay distinct.
 */
function keyNavSlot(x: KeyNavItem): string {
    const icon = (x.icon || "").trim().toLowerCase();
    const lab = (x.label || "").replace(/\s+/g, " ").trim().toLowerCase();
    const alt = (x.alt || "").trim().toLowerCase();
    const h = keyNavHrefKey(x.href);

    if (icon.endsWith("icon-tour.png") || /^virtual\s*tour\b/i.test(lab) || alt.includes("virtual tour")) return "tour";
    if (icon.endsWith("icon-gallery.png") || /photo\s*\/\s*video\s*gallery/i.test(lab) || /photo.*video.*gallery/i.test(lab))
        return "gallery";
    if (icon.includes("nearstcenter") || h.includes("locate-centre") || /find\s*your\s*nearest/i.test(lab) || /nearest\s*centre/i.test(lab))
        return "locate";
    if (icon.includes("icon-franchise") || h.endsWith("/franchise") || /become\s*a?\s*franchise/i.test(lab)) return "franchise";
    if (icon.includes("brochure") || /\.pdf(\b|[?#])/i.test(h) || /download\s*brochure/i.test(lab)) return "brochure";
    if (
        icon.endsWith("icon-media.svg") ||
        icon.includes("icon-television") ||
        h.includes("tv-commercial") ||
        /^media$/i.test(lab) ||
        /tv\s*commercial/i.test(lab)
    )
        return "media";

    if (h) return `other:${h}`;
    return `other:icon:${icon || "none"}:${lab.slice(0, 48)}`;
}

/** Public homepage quick-link order (locate + franchise first). */
const KEY_NAV_SLOT_ORDER = ["locate", "franchise", "tour", "gallery", "brochure", "media"] as const;

function sortKeyNavByDisplayOrder(rows: KeyNavItem[]): KeyNavItem[] {
    const rank = new Map<string, number>(KEY_NAV_SLOT_ORDER.map((slot, i) => [slot, i]));
    return [...rows].sort((a, b) => {
        const ra = rank.get(keyNavSlot(a)) ?? 99;
        const rb = rank.get(keyNavSlot(b)) ?? 99;
        return ra - rb;
    });
}

/** Keep the first row per slot so CMS + merged defaults never show duplicate tiles. */
function dedupeKeyNavBySlot(rows: KeyNavItem[]): KeyNavItem[] {
    const seen = new Set<string>();
    const out: KeyNavItem[] = [];
    for (const r of rows) {
        const slot = keyNavSlot(r);
        if (seen.has(slot)) continue;
        seen.add(slot);
        out.push(r);
    }
    return out;
}

/** Legacy home quick-link: “Media” / “TV Commercial” → public gallery. */
export function fixKeyNavItem(item: KeyNavItem): KeyNavItem {
    const href = (item.href || "").trim();
    const slot = keyNavSlot(item);
    if (slot === "media" || /tv-commercial/i.test(href)) {
        return {
            ...item,
            href: "/gallery",
            icon: item.icon?.includes("icon-media") || item.icon?.includes("icon-television") ? item.icon : "/icon-media.svg",
            alt: item.alt || "Media",
            label: /^tv\s*commercial$/i.test((item.label || "").replace(/\s+/g, " ").trim()) ? "Media" : item.label || "Media",
            external: false,
        };
    }
    return item;
}

/** CMS often drops the last quick-link (e.g. Media / TV commercial). Append defaults only for empty slots. */
export function normalizeKeyNavigation(rows: unknown): KeyNavItem[] {
    const defaults = DEFAULT_HOME_PAGE_DATA.key_navigation;
    if (!Array.isArray(rows) || rows.length === 0) {
        return [...defaults];
    }
    const out: KeyNavItem[] = [];
    for (const r of rows) {
        if (!r || typeof r !== "object" || Array.isArray(r)) continue;
        const o = r as Record<string, unknown>;
        out.push(
            fixKeyNavItem({
                icon: String(o.icon ?? ""),
                alt: String(o.alt ?? ""),
                href: String(o.href ?? ""),
                label: String(o.label ?? ""),
                nav_class: String(o.nav_class ?? "nav-link1"),
                external: Boolean(o.external),
            }),
        );
    }
    let merged = dedupeKeyNavBySlot(out);
    const seenSlots = new Set(merged.map(keyNavSlot));
    for (const d of defaults) {
        const slot = keyNavSlot(d);
        if (seenSlots.has(slot)) continue;
        merged.push(fixKeyNavItem(d));
        seenSlots.add(slot);
    }
    return sortKeyNavByDisplayOrder(dedupeKeyNavBySlot(merged));
}

/** Merge API payload over defaults so missing keys still work. */
export function mergeHomePageData(raw: Partial<HomePageData> | null | undefined): HomePageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        return DEFAULT_HOME_PAGE_DATA;
    }
    try {
        const merged = deepMerge(DEFAULT_HOME_PAGE_DATA, raw as Partial<HomePageData>);
        const basePp = DEFAULT_HOME_PAGE_DATA.programs_preview;
        const rawPp = merged.programs_preview;
        const pp =
            rawPp && typeof rawPp === "object" && !Array.isArray(rawPp) ? rawPp : basePp;
        const programs = Array.isArray(pp.programs) ? pp.programs : basePp.programs;
        merged.programs_preview = {
            ...basePp,
            ...pp,
            programs: normalizeProgramsPreviewPrograms(programs),
        };
        normalizeFranchiseAdvantageVideos(merged, raw as Record<string, unknown>);
        normalizeFranchiseAdvantagePhotos(merged, raw as Record<string, unknown>);
        normalizeNewsTickerItems(merged, raw as Record<string, unknown>);
        merged.key_navigation = normalizeKeyNavigation(merged.key_navigation);
        return merged;
    } catch {
        return DEFAULT_HOME_PAGE_DATA;
    }
}
