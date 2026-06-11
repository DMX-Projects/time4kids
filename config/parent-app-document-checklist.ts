import { PARENT_AUDIO_RHYMES_UPLOAD_SLOTS } from "@/config/parent-audio-rhymes-slots";
import { PARENT_CONTACT_US_UPLOAD_SLOTS } from "@/config/parent-contact-us-slots";
import { PARENT_GENERAL_RHYMES_UPLOAD_SLOTS } from "@/config/parent-general-rhymes-slots";
import { PARENT_PARENTING_TIPS_UPLOAD_SLOTS } from "@/config/parent-parenting-tips-slots";
import { PARENT_STUDENTS_KIT_UPLOAD_SLOTS } from "@/config/parent-students-kit-slots";
import { PARENT_STUDENT_TRANSFER_POLICY_UPLOAD_SLOTS } from "@/config/parent-student-transfer-policy-slots";
import { PARENT_WATCH_HEAR_LEARN_UPLOAD_SLOTS } from "@/config/parent-watch-hear-learn-slots";
import {
    PARENT_DOCUMENT_CATEGORIES,
    PARENT_DOCUMENT_STATES,
} from "@/config/parent-document-categories";

/** One upload row on Admin → Parent documents (matches parent app categories). */
export type ParentAppDocumentSlot = {
    id: string;
    category: string;
    /** Row label shown in admin (section title is shown separately above). */
    breadcrumbLabel: string;
    /** Optional state code (holiday lists). */
    state?: string;
    /** When set, upload targets this centre; otherwise global (all parents). */
    franchiseId?: null;
    suggestedTitle?: string;
    /** Display order in the parent app when uploading from this row. */
    suggestedOrder?: number;
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
        breadcrumbLabel: suffix,
        franchiseId: null,
        suggestedTitle: section,
    };
}

function fixedUploadSlot(category: string, row: { id: string; title: string; order: number }): ParentAppDocumentSlot {
    return {
        id: row.id,
        category,
        breadcrumbLabel: row.title,
        franchiseId: null,
        suggestedTitle: row.title,
        suggestedOrder: row.order,
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
        id: "holiday-lists",
        title: catLabel("HOLIDAY_LISTS"),
        category: "HOLIDAY_LISTS",
        slots: PARENT_DOCUMENT_STATES.map((s) => ({
            id: `holiday-${s.value}`,
            category: "HOLIDAY_LISTS",
            breadcrumbLabel: s.label,
            state: s.value,
            suggestedTitle: `${s.label} Holiday List`,
        })),
    },
    {
        id: "audio-rhymes",
        title: catLabel("AUDIO_RHYMES"),
        category: "AUDIO_RHYMES",
        slots: PARENT_AUDIO_RHYMES_UPLOAD_SLOTS.map((row) => fixedUploadSlot("AUDIO_RHYMES", row)),
    },
    {
        id: "general-rhymes",
        title: catLabel("GENERAL_RHYMES"),
        category: "GENERAL_RHYMES",
        slots: PARENT_GENERAL_RHYMES_UPLOAD_SLOTS.map((row) => fixedUploadSlot("GENERAL_RHYMES", row)),
    },
    {
        id: "videos",
        title: catLabel("VIDEOS"),
        category: "VIDEOS",
        slots: PARENT_WATCH_HEAR_LEARN_UPLOAD_SLOTS.map((row) => fixedUploadSlot("VIDEOS", row)),
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
        slots: PARENT_STUDENTS_KIT_UPLOAD_SLOTS.map((row) => fixedUploadSlot("STUDENTS_KIT", row)),
    },
    {
        id: "contact-us",
        title: catLabel("CONTACT_US"),
        category: "CONTACT_US",
        slots: PARENT_CONTACT_US_UPLOAD_SLOTS.map((row) => fixedUploadSlot("CONTACT_US", row)),
    },
    {
        id: "student-transfer-policy",
        title: catLabel("STUDENT_TRANSFER_POLICY"),
        category: "STUDENT_TRANSFER_POLICY",
        slots: PARENT_STUDENT_TRANSFER_POLICY_UPLOAD_SLOTS.map((row) => fixedUploadSlot("STUDENT_TRANSFER_POLICY", row)),
    },
    {
        id: "parenting-tips",
        title: catLabel("PARENTING_TIPS"),
        category: "PARENTING_TIPS",
        slots: PARENT_PARENTING_TIPS_UPLOAD_SLOTS.map((row) => fixedUploadSlot("PARENTING_TIPS", row)),
    },
];
