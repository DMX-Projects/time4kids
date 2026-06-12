import type { ParentAppNavCustomData } from "@/lib/parent-app-nav-custom";

/** Parent home dashboard — classic menu order and labels (matches legacy parent app). */
export type ParentDashboardDocumentSection = {
    id: string;
    kind: "documents";
    category: string;
    title: string;
    subtitle: string;
};

export type ParentDashboardLinkSection = {
    id: string;
    kind: "link";
    title: string;
    href: string;
    subtitle: string;
};

export type ParentDashboardSection = ParentDashboardDocumentSection | ParentDashboardLinkSection;

export const PARENT_DASHBOARD_DISPLAY_SECTIONS: ParentDashboardSection[] = [
    {
        id: "audio-rhymes",
        kind: "documents",
        category: "AUDIO_RHYMES",
        title: "Audio Rhymes (AY 2026-27)",
        subtitle: "MP3, WAV, MP4, and other audio/video files",
    },
    {
        id: "videos",
        kind: "documents",
        category: "VIDEOS",
        title: "Watch Hear and Learn (AY 2026-27)",
        subtitle: "Videos, audio, PDFs, and learning files",
    },
    {
        id: "students-kit",
        kind: "documents",
        category: "STUDENTS_KIT",
        title: "Students Kit AY 2026-27",
        subtitle: "Tap to view or download",
    },
    {
        id: "contact-us",
        kind: "documents",
        category: "CONTACT_US",
        title: "Contact Us",
        subtitle: "PDF files only",
    },
    {
        id: "general-rhymes",
        kind: "documents",
        category: "GENERAL_RHYMES",
        title: "General Rhymes",
        subtitle: "PDF files only",
    },
    {
        id: "student-transfer-policy",
        kind: "documents",
        category: "STUDENT_TRANSFER_POLICY",
        title: "Student Transfer Policy",
        subtitle: "PDF files only",
    },
    {
        id: "parenting-tips",
        kind: "documents",
        category: "PARENTING_TIPS",
        title: "Parenting Tips & Articles",
        subtitle: "PDF files only",
    },
];

export function mergeParentDashboardSections(
    custom: ParentAppNavCustomData | null | undefined,
): ParentDashboardSection[] {
    const sectionTitles = custom?.sectionTitles ?? {};
    return PARENT_DASHBOARD_DISPLAY_SECTIONS.map((section) => {
        const override = sectionTitles[section.id]?.trim();
        return override ? { ...section, title: override } : section;
    });
}
