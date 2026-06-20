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
    { value: "HOLIDAY_LISTS", label: "Holiday Lists" },
    { value: "WELCOME_LETTERS", label: "Welcome Letters" },
    { value: "REFRESHER_COURSE", label: "Refresher Course" },
    { value: "SUMMER_CAMP", label: "Summer Camp" },
    { value: "STUDENTS_KIT", label: "Students Kit" },
    { value: "SOCIAL_MEDIA_SUPPORT", label: "Social Media Uploads & Support Files" },
    { value: "WATCH_HEAR_LEARN", label: "Watch • Hear • Learn" },
    { value: "ADMISSION_COUNSELLING", label: "Admission Counselling" },
    { value: "FRANCHISE_REFERRAL_INCENTIVES", label: "Franchise Referral Incentives" },
    { value: "SOP", label: "Standard Operating Procedures (SOP)" },
    { value: "COUNSELLING_TOOLS", label: "Counselling Tools & Report Cards" },
    { value: "PARENT_ORIENTATION", label: "Parents Orientation" },
    { value: "INFRASTRUCTURE_MANUAL", label: "Infrastructure Manual & Purchase List" },
    { value: "CONCEPT_ROOM_DISPLAYS", label: "Concept Room Pictures & Displays" },
    { value: "FORMATS", label: "Formats" },
    { value: "LEASE_AGREEMENT_DOCUMENTS", label: "Lease Agreement Documents" },
    { value: "REPORT_CARD_COMMENTS", label: "Report Card Comments" },
    { value: "ARTWORKS_MARKETING", label: "Artworks & Marketing" },
    { value: "INDENT_DOCUMENTS", label: "Indent Documents (Inside & Outside AP)" },
    { value: "ORDERING_DOCUMENTS", label: "Ordering Documents (IK & SM)" },
    { value: "STUDENT_TRANSFER_POLICY", label: "Student Transfer Policy" },
    { value: "PARENTING_TIPS", label: "Parental Tips" },
    { value: "AKSHARABHYASAM_SUPPORT_SHEETS", label: "Aksharabhyasam Support Sheets" },
    { value: "ROYALTY_PAYMENTS", label: "Royalty Payments" },
];
