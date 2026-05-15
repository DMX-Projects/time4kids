import type { LucideIcon } from "lucide-react";
import {
    CircleDot,
    GraduationCap,
    Handshake,
    ImageIcon,
    LayoutGrid,
    Megaphone,
    MousePointerClick,
    Sparkles,
} from "lucide-react";

export type HomeCmsSectionId =
    | "hero"
    | "quick-links"
    | "programs"
    | "franchise"
    | "why-choose"
    | "welcome"
    | "methodology";

export type HomeCmsSection = {
    id: HomeCmsSectionId;
    label: string;
    description: string;
    icon: LucideIcon;
    /** Order on the public homepage (lower = higher). */
    pageOrder: number;
};

export const HOME_CMS_SECTIONS: HomeCmsSection[] = [
    {
        id: "hero",
        label: "Hero banner",
        description: "Top slider images — managed separately.",
        icon: ImageIcon,
        pageOrder: 0,
    },
    {
        id: "quick-links",
        label: "Quick links",
        description: "Icon row under the hero (Virtual tour, Gallery, etc.).",
        icon: MousePointerClick,
        pageOrder: 1,
    },
    {
        id: "programs",
        label: "Programs",
        description: "“Our Programs” circles on the home page.",
        icon: GraduationCap,
        pageOrder: 2,
    },
    {
        id: "franchise",
        label: "Franchise & news",
        description: "Why Partner section: videos, photos, and empty-state text for updates.",
        icon: Handshake,
        pageOrder: 3,
    },
    {
        id: "why-choose",
        label: "Why choose us",
        description: "Feature cards with images and colours.",
        icon: Sparkles,
        pageOrder: 4,
    },
    {
        id: "welcome",
        label: "Welcome text",
        description: "Intro copy (used on centre pages and legacy blocks).",
        icon: Megaphone,
        pageOrder: 5,
    },
    {
        id: "methodology",
        label: "Methodology",
        description: "Value-based methodology icon row.",
        icon: LayoutGrid,
        pageOrder: 6,
    },
];

export const HOME_CMS_RELATED_LINKS = [
    { label: "Hero slider images", href: "/dashboard/admin/hero-slides", icon: ImageIcon },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: CircleDot },
    { label: "News updates", href: "/dashboard/admin/updates", icon: Megaphone },
    { label: "Media library", href: "/dashboard/admin/media", icon: ImageIcon },
] as const;
