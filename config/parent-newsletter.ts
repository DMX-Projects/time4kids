/** Parent app Newsletter (stored as CLASS_TIMETABLE in the API). */

export const PARENT_NEWSLETTER_CATEGORY = "CLASS_TIMETABLE" as const;

export const PARENT_NEWSLETTER_LABEL = "Newsletter";

export const PARENT_NEWSLETTER_DESCRIPTION =
    "Published for each academic block (20 school days). Each issue covers activities planned and completed during that block — typically a 3–4 page report across all classes, from Play Group to PP2.";

export const PARENT_NEWSLETTER_FILE_ACCEPT =
    ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const PARENT_NEWSLETTER_FILE_HINT = "PDF or Word document";

export const PARENT_NEWSLETTER_UPLOAD_LABEL = "Newsletter Upload – PDF or Word document";

export const PARENT_NEWSLETTER_EMPTY_MESSAGE =
    "No newsletter uploaded for your centre yet. Your school publishes one per academic block (20 school days).";

export function isNewsletterUploadFile(file: File): boolean {
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    return (
        name.endsWith(".pdf") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx") ||
        type === "application/pdf" ||
        type === "application/msword" ||
        type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
}

export function validateNewsletterUpload(file: File): string | null {
    if (!isNewsletterUploadFile(file)) {
        return "Newsletter must be a PDF or Word document.";
    }
    return null;
}
