import {
    PARENT_DOCUMENT_CATEGORIES,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";

/** One upload row on Admin → Parent app documents (matches parent app categories). */
export type ParentAppDocumentSlot = {
    id: string;
    category: string;
    /** Full path shown to admin, e.g. Holiday Lists › Karnataka */
    breadcrumbLabel: string;
    /** Optional state code (holiday lists). */
    state?: string;
    /** When set, upload targets this centre; otherwise global (all parents). */
    franchiseId?: null;
    suggestedTitle?: string;
};

export type ParentAppDocumentSection = {
    id: string;
    title: string;
    category: string;
    slots: ParentAppDocumentSlot[];
};

const catLabel = (value: string) =>
    PARENT_DOCUMENT_CATEGORIES.find((c) => c.value === value)?.label ?? value;

function globalSlot(category: string, suffix = "All centres (global)"): ParentAppDocumentSlot {
    const section = catLabel(category);
    return {
        id: `${category}-global`,
        category,
        breadcrumbLabel: `${section} › ${suffix}`,
        franchiseId: null,
        suggestedTitle: section,
    };
}

export const PARENT_APP_DOCUMENT_CHECKLIST: ParentAppDocumentSection[] = [
    {
        id: "preschool-policies",
        title: catLabel("PRESCHOOL_POLICIES"),
        category: "PRESCHOOL_POLICIES",
        slots: [globalSlot("PRESCHOOL_POLICIES")],
    },
    {
        id: "class-timetable",
        title: catLabel("CLASS_TIMETABLE"),
        category: "CLASS_TIMETABLE",
        slots: [globalSlot("CLASS_TIMETABLE")],
    },
    {
        id: "holiday-lists",
        title: catLabel("HOLIDAY_LISTS"),
        category: "HOLIDAY_LISTS",
        slots: PARENT_DOCUMENT_STATES.map((s) => ({
            id: `holiday-${s.value}`,
            category: "HOLIDAY_LISTS",
            breadcrumbLabel: `${catLabel("HOLIDAY_LISTS")} › ${s.label}`,
            state: s.value,
            suggestedTitle: `${s.label} Holiday List`,
        })),
    },
    {
        id: "audio-rhymes",
        title: catLabel("AUDIO_RHYMES"),
        category: "AUDIO_RHYMES",
        slots: [globalSlot("AUDIO_RHYMES")],
    },
    {
        id: "videos",
        title: catLabel("VIDEOS"),
        category: "VIDEOS",
        slots: [globalSlot("VIDEOS", "All centres")],
    },
    {
        id: "newsletters",
        title: catLabel("NEWSLETTERS"),
        category: "NEWSLETTERS",
        slots: [globalSlot("NEWSLETTERS")],
    },
    {
        id: "students-kit",
        title: catLabel("STUDENTS_KIT"),
        category: "STUDENTS_KIT",
        slots: [globalSlot("STUDENTS_KIT")],
    },
    {
        id: "parenting-tips",
        title: catLabel("PARENTING_TIPS"),
        category: "PARENTING_TIPS",
        slots: [globalSlot("PARENTING_TIPS")],
    },
];
