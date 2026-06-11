/** Fixed upload rows for Admin → Parent documents → Students Kit AY 2026-27. */

export type ParentStudentsKitSlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_STUDENTS_KIT_UPLOAD_SLOTS: ParentStudentsKitSlotDef[] = [
    { id: "students-kit-pp1", title: "PP1", order: 0 },
    { id: "students-kit-play-group", title: "Play Group", order: 1 },
    { id: "students-kit-nursery", title: "Nursery", order: 2 },
    { id: "students-kit-pp2", title: "PP2", order: 3 },
];
