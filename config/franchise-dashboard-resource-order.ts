/**
 * Franchise dashboard resource **order** for admin document categories and related tooling.
 * The interactive Centre Page checklist (nested accordions) lives in `franchise-center-page-nav.ts`.
 *
 * `FranchiseDocumentCategory` values in checklist order (subset of centre resources that map to DB categories).
 * Any category not on the public checklist is listed last. Admin Franchise resources uses this for the
 * filter dropdown, create/edit category field, and default table sort.
 */
export const FRANCHISE_DOCUMENT_CATEGORY_ORDER: { value: string; label: string }[] = [
    { value: "ACADEMIC_DOCUMENTS", label: "Academic Documents" },
    { value: "REFRESHER_COURSE", label: "Refresher Course" },
    { value: "STUDENTS_KIT", label: "Students Kit" },
    { value: "FRANCHISE_REFERRAL_INCENTIVES", label: "Franchise Referral Incentives" },
    { value: "SOP", label: "Standard Operating Procedures (SOP)" },
    { value: "INFRASTRUCTURE_MANUAL", label: "Infrastructure Manual & Purchase List" },
    { value: "FORMATS", label: "Formats" },
    { value: "LEASE_AGREEMENT_DOCUMENTS", label: "Lease Agreement Documents" },
    { value: "INDENT_DOCUMENTS", label: "Indent Documents (Inside & Outside AP)" },
    { value: "ORDERING_DOCUMENTS", label: "Ordering Documents (IK & SM)" },
    { value: "STUDENT_TRANSFER_POLICY", label: "Student Transfer Policy" },
    { value: "AKSHARABHYASAM_SUPPORT_SHEETS", label: "Aksharabhyasam Support Sheets" },
    { value: "ROYALTY_PAYMENTS", label: "Royalty Payments" },
];
