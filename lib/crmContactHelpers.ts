/**
 * Helpers for opening WhatsApp and Email with pre-filled content.
 * Ported from timekids_crm_clone/lib/contact-helpers.ts
 */

const DEFAULT_WHATSAPP_MESSAGE =
    "Hi! I am from T.I.M.E. Kids. We received your franchise enquiry and would love to connect with you. When would be a good time to talk?";

const DEFAULT_EMAIL_SUBJECT = "T.I.M.E. Kids – Follow-up on your franchise enquiry";
const DEFAULT_EMAIL_BODY = `Hi,

I'm following up on your franchise enquiry with T.I.M.E. Kids.

We'd love to discuss the opportunity with you. Please let us know a convenient time for a quick call.

Best regards,
T.I.M.E. Kids Team`;

export function getWhatsAppUrl(mobile: string, message: string = DEFAULT_WHATSAPP_MESSAGE): string {
    const digits = (mobile || "").replace(/\D/g, "").slice(-10);
    const num = digits.length === 10 ? `91${digits}` : digits || "91";
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${num}?text=${encoded}`;
}

export function getEmailMailto(
    email: string,
    subject: string = DEFAULT_EMAIL_SUBJECT,
    body: string = DEFAULT_EMAIL_BODY,
): string {
    const params = new URLSearchParams();
    if (subject) params.set("subject", subject);
    if (body) params.set("body", body);
    const q = params.toString();
    return `mailto:${encodeURIComponent(email)}${q ? `?${q}` : ""}`;
}
