declare global {
    interface Window {
        dataLayer?: Array<Record<string, unknown>>;
        gtag?: (...args: unknown[]) => void;
    }
}

type LeadEventPayload = {
    formType: "contact" | "admission";
    location: string;
    franchiseSlug?: string;
};

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;

export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export function trackLeadSubmission(payload: LeadEventPayload) {
    if (typeof window === "undefined") return;

    const eventData = {
        event: "generate_lead",
        form_type: payload.formType,
        page_location: payload.location,
        franchise_slug: payload.franchiseSlug || "",
    };

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(eventData);

    if (window.gtag && GA4_MEASUREMENT_ID) {
        window.gtag("event", "generate_lead", {
            form_type: payload.formType,
            franchise_slug: payload.franchiseSlug || "",
            page_location: payload.location,
            send_to: GA4_MEASUREMENT_ID,
        });
    }
}

