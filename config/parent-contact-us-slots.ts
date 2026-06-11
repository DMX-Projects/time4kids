/** Fixed upload rows for Admin → Parent documents → Contact Us. */

export type ParentContactUsSlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_CONTACT_US_UPLOAD_SLOTS: ParentContactUsSlotDef[] = [
    { id: "contact-us-pdf", title: "Contact Us", order: 0 },
];
