/** Corporate / franchise contact shown on Contact page, footer, etc. */
export const SITE_CORPORATE_CONTACT = {
    companyName: "Triumphant Institute of Management Education Pvt. Ltd. (T.I.M.E.)",
    addressLines: [
        "95B, Second Floor,",
        "Siddamsetty Complex,",
        "Parklane, Secunderabad",
        "500003.",
    ],
    phone: "040-40088300",
    phoneTel: "tel:+914040088300",
    fax: "040-27847334",
    email: "info@timekidspreschools.com",
    franchiseCell: "8096355335",
    franchiseCellTel: "tel:+918096355335",
    franchiseEmail: "franchise@timekidspreschools.com",
    locationLabel: "Hyderabad, Telangana, India",
} as const;

/** Phone shown in the site footer on the homepage only (franchise cell). */
export const SITE_HOMEPAGE_FOOTER_PHONE = SITE_CORPORATE_CONTACT.franchiseCell;
export const SITE_HOMEPAGE_FOOTER_PHONE_TEL = SITE_CORPORATE_CONTACT.franchiseCellTel;

/** Site-wide social profile URLs (footer, contact page, etc.). */
export const SITE_SOCIAL_LINKS = {
    facebook: "https://www.facebook.com/pages/TIME-Kids/187099544682886",
    instagram: "https://www.instagram.com/timekidsindia?igsh=czcxb2pkem8zNGVk",
    youtube: "https://youtu.be/zRQzyPqGmgs?si=dZc5tu7RZ5tRHr5_",
} as const;
