/**
 * Parent dashboard — right-rail quick links (“Student Referral”, “View Fee Details”).
 * Set your production URLs here (https://… or internal paths like `/dashboard/parent/fees`).
 */
export const PARENT_DASHBOARD_QUICK_LINKS = {
    /** Student referral placeholder — replace `about:blank` with your real URL when ready. */
    studentReferral: "about:blank",
    /** Fee / student details on legacy TiKES host (opens in a new tab). */
    viewFeeDetails:
        "http://103.65.21.245:8080/parent_homepage_viewstudentdetails.php?idno=565f483f565f480e565f481d565f480a565f4801565f481b565f485e565f48",
} as const;
