/** Parent mobile app document categories (matches Django DocumentCategory). */
export const PARENT_DOCUMENT_CATEGORIES = [
    { value: "PRESCHOOL_POLICIES", label: "Preschool Policies (PDF)" },
    { value: "CLASS_TIMETABLE", label: "Newsletter" },
    { value: "HOLIDAY_LISTS", label: "Holiday Lists" },
    { value: "AUDIO_RHYMES", label: "Audio Rhymes (AY 2026-27)" },
    { value: "VIDEOS", label: "Watch Hear and Learn (AY 2026-27)" },
    { value: "NEWSLETTERS", label: "Newsletters" },
    { value: "STUDENTS_KIT", label: "Students Kit AY 2026-27" },
    { value: "CONTACT_US", label: "Contact Us" },
    { value: "GENERAL_RHYMES", label: "General Rhymes" },
    { value: "STUDENT_TRANSFER_POLICY", label: "Student Transfer Policy" },
    { value: "PARENTING_TIPS", label: "Parenting Tips & Articles" },
] as const;

/** Head-office CMS — Newsletter is uploaded by franchise centres only. */
export const ADMIN_PARENT_DOCUMENT_CATEGORIES = PARENT_DOCUMENT_CATEGORIES.filter(
    (c) => c.value !== "CLASS_TIMETABLE",
);

export const DEFAULT_HOLIDAY_ACADEMIC_YEAR = "AY 2026-27";

/** Indian states for holiday list uploads (matches ParentDocument.State). */
export const PARENT_DOCUMENT_STATES = [
    { value: "AP", label: "Andhra Pradesh" },
    { value: "AR", label: "Arunachal Pradesh" },
    { value: "AS", label: "Assam" },
    { value: "BR", label: "Bihar" },
    { value: "CG", label: "Chhattisgarh" },
    { value: "GA", label: "Goa" },
    { value: "GJ", label: "Gujarat" },
    { value: "HR", label: "Haryana" },
    { value: "HP", label: "Himachal Pradesh" },
    { value: "JH", label: "Jharkhand" },
    { value: "KA", label: "Karnataka" },
    { value: "KL", label: "Kerala" },
    { value: "MP", label: "Madhya Pradesh" },
    { value: "MH", label: "Maharashtra" },
    { value: "MN", label: "Manipur" },
    { value: "ML", label: "Meghalaya" },
    { value: "MZ", label: "Mizoram" },
    { value: "NL", label: "Nagaland" },
    { value: "OD", label: "Odisha" },
    { value: "PB", label: "Punjab" },
    { value: "RJ", label: "Rajasthan" },
    { value: "SK", label: "Sikkim" },
    { value: "TN", label: "Tamil Nadu" },
    { value: "TS", label: "Telangana" },
    { value: "TR", label: "Tripura" },
    { value: "UP", label: "Uttar Pradesh" },
    { value: "UK", label: "Uttarakhand" },
    { value: "WB", label: "West Bengal" },
] as const;
