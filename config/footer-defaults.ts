import { SITE_CORPORATE_CONTACT, SITE_SOCIAL_LINKS } from "@/config/site-contact";

export type FooterSocialLinks = {
    facebook: string;
    instagram: string;
    youtube: string;
};

export type FooterContactBlock = {
    email: string;
    phone: string;
    phone_tel: string;
    location_label: string;
};

export type FooterSocialPatch = Partial<FooterSocialLinks>;
export type FooterContactPatch = Partial<FooterContactBlock>;

export type FooterPageData = {
    /** Column 1 — text under the logo. */
    about_text: string;
    contact: FooterContactBlock;
    /** Shown in footer on homepage only; other pages use `contact.phone`. */
    homepage_phone: string;
    homepage_phone_tel: string;
    social: FooterSocialLinks;
    /** QR code target URL (“Scan to connect”). */
    qr_code_url: string;
};

export const DEFAULT_FOOTER_PAGE_DATA: FooterPageData = {
    about_text:
        "17 Years of Legacy in Early Education. 250+ preschools across India providing quality education with NEP 2020 updated curriculum.",
    contact: {
        email: SITE_CORPORATE_CONTACT.email,
        phone: SITE_CORPORATE_CONTACT.phone,
        phone_tel: SITE_CORPORATE_CONTACT.phoneTel,
        location_label: SITE_CORPORATE_CONTACT.locationLabel,
    },
    homepage_phone: SITE_CORPORATE_CONTACT.franchiseCell,
    homepage_phone_tel: SITE_CORPORATE_CONTACT.franchiseCellTel,
    social: {
        facebook: SITE_SOCIAL_LINKS.facebook,
        instagram: SITE_SOCIAL_LINKS.instagram,
        youtube: SITE_SOCIAL_LINKS.youtube,
    },
    qr_code_url: "https://www.timekidspreschools.in",
};

function pickString(value: unknown, fallback: string): string {
    return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function mergeFooterPageData(raw: unknown): FooterPageData {
    const d = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
    const contactRaw =
        d.contact && typeof d.contact === "object" ? (d.contact as Record<string, unknown>) : {};
    const socialRaw = d.social && typeof d.social === "object" ? (d.social as Record<string, unknown>) : {};

    return {
        about_text: pickString(d.about_text, DEFAULT_FOOTER_PAGE_DATA.about_text),
        contact: {
            email: pickString(contactRaw.email, DEFAULT_FOOTER_PAGE_DATA.contact.email),
            phone: pickString(contactRaw.phone, DEFAULT_FOOTER_PAGE_DATA.contact.phone),
            phone_tel: pickString(contactRaw.phone_tel, DEFAULT_FOOTER_PAGE_DATA.contact.phone_tel),
            location_label: pickString(
                contactRaw.location_label,
                DEFAULT_FOOTER_PAGE_DATA.contact.location_label,
            ),
        },
        homepage_phone: pickString(d.homepage_phone, DEFAULT_FOOTER_PAGE_DATA.homepage_phone),
        homepage_phone_tel: pickString(d.homepage_phone_tel, DEFAULT_FOOTER_PAGE_DATA.homepage_phone_tel),
        social: {
            facebook: pickString(socialRaw.facebook, DEFAULT_FOOTER_PAGE_DATA.social.facebook),
            instagram: pickString(socialRaw.instagram, DEFAULT_FOOTER_PAGE_DATA.social.instagram),
            youtube: pickString(socialRaw.youtube, DEFAULT_FOOTER_PAGE_DATA.social.youtube),
        },
        qr_code_url: pickString(d.qr_code_url, DEFAULT_FOOTER_PAGE_DATA.qr_code_url),
    };
}
