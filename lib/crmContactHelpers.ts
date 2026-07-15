/**
 * Helpers for WhatsApp links and Email templates.
 * Direct Contact Email is sent server-side From franchise@… (not mailto).
 */

/** From address used by CRM Direct Contact / reminder emails (SendGrid) */
export const CRM_FRANCHISE_EMAIL = "franchise@timekidspreschools.com";

const DEFAULT_WHATSAPP_MESSAGE =
    "Hi! I am from T.I.M.E. Kids. We received your franchise enquiry and would like to connect with you. When would be a good time to talk?";

const DEFAULT_EMAIL_SUBJECT = "T.I.M.E. Kids – Follow-up on your franchise enquiry";
const DEFAULT_EMAIL_BODY = `Hi,

I'm following up on your franchise enquiry with T.I.M.E. Kids.

We'd like to discuss the opportunity with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`;

export function getWhatsAppUrl(mobile: string, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);
    const num = digits.length === 10 ? `91${digits}` : digits || "91";
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${num}?text=${encoded}`;
}

/** @deprecated Prefer server send via /leads/send-reminder; kept for fallbacks. */
export function getEmailMailto(
    email: string,
    subject: string = DEFAULT_EMAIL_SUBJECT,
    body: string = DEFAULT_EMAIL_BODY,
): string {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const q = params.toString();
    const to = (email || "").trim();
    return `mailto:${encodeURIComponent(to)}${q ? `?${q}` : ""}`;
}
