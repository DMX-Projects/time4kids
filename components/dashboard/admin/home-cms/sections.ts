import type { LucideIcon } from "lucide-react";
import {
    CircleDot,
    GraduationCap,
    Handshake,
    ImageIcon,
    LayoutGrid,
    Megaphone,
    Sparkles,
} from "lucide-react";

export type HomeCmsSectionId =
    | "hero"
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
        id: "programs",
        label: "Programs",
        description: "“Our Programs” circles on the home page.",
        icon: GraduationCap,
        pageOrder: 1,
    },
    {
        id: "franchise",
        label: "Franchise & news",
        description: "Why Partner section: videos, photos, and empty-state text for updates.",
        icon: Handshake,
        pageOrder: 2,
    },
    {
        id: "why-choose",
        label: "Why parents love timekids",
        description: "Feature cards with images and colours.",
        icon: Sparkles,
        pageOrder: 3,
    },
    {
        id: "welcome",
        label: "Welcome text",
        description: "Intro copy (used on centre pages and legacy blocks).",
        icon: Megaphone,
        pageOrder: 4,
    },
    {
        id: "methodology",
        label: "Methodology",
        description: "Value-based methodology icon row.",
        icon: LayoutGrid,
        pageOrder: 5,
    },
];

export const HOME_CMS_RELATED_LINKS = [
    { label: "Hero slider images", href: "/dashboard/admin/hero-slides", icon: ImageIcon },
    { label: "Testimonials", href: "/dashboard/admin/testimonials", icon: CircleDot },
    { label: "News updates", href: "/dashboard/admin/updates", icon: Megaphone },
    { label: "Media library", href: "/dashboard/admin/media", icon: ImageIcon },
] as const;
