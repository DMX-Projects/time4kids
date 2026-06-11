/** Fixed upload rows for Admin → Parent documents → General Rhymes. */

export type ParentGeneralRhymeSlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_GENERAL_RHYMES_UPLOAD_SLOTS: ParentGeneralRhymeSlotDef[] = [
    { id: "general-rhymes-english", title: "English Rhymes", order: 0 },
    { id: "general-rhymes-hindi", title: "Hindi Rhymes", order: 1 },
    { id: "general-rhymes-telugu", title: "Telugu Rhymes", order: 2 },
    { id: "general-rhymes-malayalam", title: "Malayalam Rhymes", order: 3 },
];
