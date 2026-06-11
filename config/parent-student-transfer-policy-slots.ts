/** Fixed upload rows for Admin → Parent documents → Student Transfer Policy. */

export type ParentStudentTransferPolicySlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_STUDENT_TRANSFER_POLICY_UPLOAD_SLOTS: ParentStudentTransferPolicySlotDef[] = [
    { id: "student-transfer-policy-pdf", title: "Student Transfer Policy", order: 0 },
];
