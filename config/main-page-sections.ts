/**
 * Single catalog of public home page (/) blocks: stable ids, accessibility labels,
 * and where admins can edit content. Used by the site sections and Admin → Main page.
 */
export type MainPageSectionMeta = {
    id: string;
    /** Shown as aria-label on the public site and as the admin-facing block name */
    label: string;
    summary: string;
    editHref: string | null;
    codeNote?: string;
};

const sections = {
    hero: {
        id: "section-hero",
        label: "Homepage hero — banner slider",
        summary: "Full-width rotating banners, overlays, and admission enquiry.",
        editHref: "/dashboard/admin/hero-slides",
    },
    keyNavigation: {
        id: "section-key-navigation",
        label: "Quick links — tour, gallery, centres, franchise",
        summary: "Icon row below the hero (virtual tour, gallery, locate centre, etc.).",
        editHref: null,
        codeNote: "components/home/KeyNavigation.tsx and image files in /public (e.g. icon-tour.png).",
    },
    intro: {
        id: "about",
        label: "Welcome — introduction",
        summary: "“Welcome to T.I.M.E. Kids” heading and introductory paragraphs.",
        editHref: null,
        codeNote: "components/home/IntroSection.tsx",
    },
    benefitsUpdates: {
        id: "section-benefits-updates",
        label: "Franchise benefits and T.I.M.E. Kids Updates",
        summary: "Benefits list plus updates carousel (head-office items from the API).",
        editHref: "/dashboard/admin/updates",
        codeNote: "Static benefit bullets: components/home/BenefitsUpdates.tsx. Carousel: Dashboard → Updates (leave franchise empty for main site).",
    },
    whyChooseUs: {
        id: "section-why-choose-us",
        label: "Why Choose T.I.M.E. Kids",
        summary: "Six feature cards with images and short descriptions.",
        editHref: null,
        codeNote: "components/home/WhyChooseUs.tsx",
    },
    programsPreview: {
        id: "section-programs-preview",
        label: "Our Programs preview",
        summary: "Program cards and decorative scene above the methodology strip.",
        editHref: null,
        codeNote: "components/home/ProgramsPreview.tsx",
    },
    methodology: {
        id: "section-methodology",
        label: "Value based methodology",
        summary: "Six methodology icons linking to programs and admission.",
        editHref: null,
        codeNote: "components/home/MethodologySection.tsx",
    },
    counters: {
        id: "section-milestones",
        label: "Milestone counters",
        summary: "Schools, cities, and students figures (from public stats API when available).",
        editHref: null,
        codeNote: "components/home/CounterSection.tsx — data from /franchises/public/stats/; centres managed under Locations / franchises.",
    },
    testimonialsSlider: {
        id: "section-testimonials-slider",
        label: "Parent testimonials — curved slider",
        summary: "Quoted testimonials carousel (managed in dashboard).",
        editHref: "/dashboard/admin/testimonials",
        codeNote: "Public component: components/home/TestimonialSlider.tsx (loads from API).",
    },
    testimonialsMedia: {
        id: "section-life-at-time-kids",
        label: "Life at T.I.M.E. Kids — photo and video grid",
        summary: "Media mosaic; may load from the API with static fallback.",
        editHref: "/dashboard/admin/media",
        codeNote: "components/home/TestimonialsSection.tsx",
    },
    locations: {
        id: "section-our-presence",
        label: "Our Presence — locations ladder",
        summary: "Cities and preschool locations visual grid.",
        editHref: "/dashboard/admin/locations",
    },
} as const satisfies Record<string, MainPageSectionMeta>;

export type MainPageSectionKey = keyof typeof sections;

export const MAIN_PAGE_SECTIONS: typeof sections = sections;

export const MAIN_PAGE_SECTION_ORDER: MainPageSectionKey[] = [
    "hero",
    "keyNavigation",
    "intro",
    "benefitsUpdates",
    "whyChooseUs",
    "programsPreview",
    "methodology",
    "counters",
    "testimonialsSlider",
    "testimonialsMedia",
    "locations",
];

export function mainPageSectionProps(
    key: MainPageSectionKey,
): { id: string; "aria-label": string } {
    const s = MAIN_PAGE_SECTIONS[key];
    return { id: s.id, "aria-label": s.label };
}

export function mainPageSectionsForAdmin(): Array<MainPageSectionMeta & { key: MainPageSectionKey }> {
    return MAIN_PAGE_SECTION_ORDER.map((key) => ({ key, ...MAIN_PAGE_SECTIONS[key] }));
}
