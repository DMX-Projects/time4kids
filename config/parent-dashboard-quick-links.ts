/**
 * Parent dashboard — right-rail quick links (“Student Referral”, “View Fee Details”).
 * Set your production URLs here (https://… or internal paths like `/dashboard/parent/fees`).
 */
export const PARENT_DASHBOARD_QUICK_LINKS = {
    /** Student referral placeholder — replace `about:blank` with your real URL when ready. */
    studentReferral: "about:blank",
    /** Parent dashboard fee summary (legacy TiKES data via API). */
    viewFeeDetails: "/dashboard/parent/fees",
} as const;
