/** Public student kit pages (legacy URLs on timekidspreschools.in). */

export type StudentsKitPageConfig = {
    slug: string;
    path: string;
    title: string;
    shortLabel: string;
    imageSrc: string;
    imageAlt: string;
    /** CMS PDF URL when uploaded; optional download on public page */
    pdfSrc?: string;
};

export const STUDENTS_KIT_PUBLIC_PAGES: StudentsKitPageConfig[] = [
    {
        slug: "nursery",
        path: "/StudentskitNursery",
        title: "Nursery — Students kit for Academic Year 2026-27",
        shortLabel: "Nursery",
        imageSrc: "/students-kits/nursery-ay-2026-27.png",
        imageAlt: "T.I.M.E. Kids Nursery students kit checklist AY 2026-27",
    },
    {
        slug: "play-group",
        path: "/StudentskitPlayGroup",
        title: "Play Group — Students kit for Academic Year 2026-27",
        shortLabel: "Play Group",
        imageSrc: "/students-kits/play-group-ay-2026-27.png",
        imageAlt: "T.I.M.E. Kids Play Group students kit checklist AY 2026-27",
    },
    {
        slug: "pp1",
        path: "/StudentskitPP1",
        title: "PP-1 — Students kit for Academic Year 2026-27",
        shortLabel: "PP-1",
        imageSrc: "/students-kits/pp1-ay-2026-27.png",
        imageAlt: "T.I.M.E. Kids PP-1 students kit checklist AY 2026-27",
    },
    {
        slug: "pp2",
        path: "/StudentskitPP2",
        title: "PP-2 — Students kit for Academic Year 2026-27",
        shortLabel: "PP-2",
        imageSrc: "/students-kits/pp2-ay-2026-27.png",
        imageAlt: "T.I.M.E. Kids PP-2 students kit checklist AY 2026-27",
    },
];

const byPath = new Map(STUDENTS_KIT_PUBLIC_PAGES.map((p) => [p.path.toLowerCase(), p]));

export function getStudentsKitPageByPath(path: string): StudentsKitPageConfig | undefined {
    const normalized = path.replace(/\/$/, "").toLowerCase();
    return byPath.get(normalized);
}

export function isStudentsKitPublicPath(href: string): boolean {
    const trimmed = href.trim().replace(/\/$/, "").toLowerCase();
    return byPath.has(trimmed);
}

export function getStudentsKitPageBySlug(slug: string): StudentsKitPageConfig | undefined {
    return STUDENTS_KIT_PUBLIC_PAGES.find((p) => p.slug === slug);
}
