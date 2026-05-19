/**
 * Franchise dashboard home — legacy section cards (not used on `/dashboard/franchise/` home;
 * display order is `franchise-dashboard-resource-order.ts`). Kept for reference / copy.
 *
 * - Array order = display order (left-to-right, top-to-bottom in the grid).
 * - Remove a section object to hide that whole block.
 * - Remove an `items` entry to hide a single row.
 *
 * Sidebar links for all franchise routes live in `config/franchise-sidebar-nav.tsx`.
 */

export type FranchiseResourceItem = {
    title: string;
    description: string;
    actions?: { label: string; href: string }[];
};

export type FranchiseResourceSection = {
    id: string;
    title: string;
    accent: "yellow" | "blue" | "orange";
    items: FranchiseResourceItem[];
};

/** Edit this list when stakeholders change section order or removals. */
export const FRANCHISE_DASHBOARD_SECTIONS: FranchiseResourceSection[] = [
    {
        id: "documents",
        title: "Documents",
        accent: "yellow",
        items: [
            { title: "Social Media Uploads & Support Files", description: "Brand-safe packs, upload windows, and support collaterals.", actions: [{ label: "Open", href: "/dashboard/franchise/#center-page" }] },
            { title: "Standard Operating Procedures (SOP)", description: "Daily operations handbook and compliance checklists.", actions: [{ label: "View", href: "/dashboard/franchise/sop" }] },
            { title: "Infrastructure Manual & Purchase List", description: "Approved vendors, fixtures, and procurement lists.", actions: [{ label: "Download", href: "/dashboard/franchise/infrastructure-manual" }] },
            { title: "Concept Room Pictures & Displays", description: "Reference visuals for room setups and in-centre branding.", actions: [{ label: "Manage", href: "/dashboard/franchise/events/" }] },
            { title: "Formats", description: "Templates for letters, approvals, and internal communications.", actions: [{ label: "Download", href: "/dashboard/franchise/formats" }] },
            { title: "Lease Agreement Documents", description: "Standard lease clauses and approval-ready documents.", actions: [{ label: "View", href: "/dashboard/franchise/lease-agreement-documents" }] },
            { title: "Report Card Comments", description: "Ready-to-use comment bank for evaluations.", actions: [{ label: "Manage", href: "/dashboard/franchise/add-grades" }] },
            { title: "Artworks", description: "Print-ready creative assets and resizing guidelines.", actions: [{ label: "Manage", href: "/dashboard/franchise/events/" }] },
            { title: "Indent Documents (Inside & Outside AP)", description: "Regional indent formats and submission steps.", actions: [{ label: "View", href: "/dashboard/franchise/indent-documents" }] },
            { title: "Ordering Documents (IK & SM)", description: "Ordering flows for IK & SM along with SLAs.", actions: [{ label: "Download", href: "/dashboard/franchise/ordering-documents" }] },
            { title: "Student Transfer Policy", description: "Policy pack and approval workflow for student transfers.", actions: [{ label: "View", href: "/dashboard/franchise/student-transfer-policy" }] },
            { title: "Parenting Tips & Articles", description: "Curated articles for parent engagement (managed by head office).", actions: [{ label: "Open portal", href: "/dashboard/franchise/parent-portal/" }] },
        ],
    },
    {
        id: "academic",
        title: "Academic Resources",
        accent: "blue",
        items: [
            { title: "Academic Documents (AY 2025–26)", description: "Year plans, lesson guides, and curriculum packs.", actions: [{ label: "Download", href: "/dashboard/franchise/academic-documents" }] },
            { title: "Summer Camp", description: "Camp planners, activity kits, and marketing ready files.", actions: [{ label: "Manage", href: "/dashboard/franchise/events" }] },
            { title: "Refresher Course", description: "Facilitator refresher guides and assessments.", actions: [{ label: "View", href: "/dashboard/franchise/refresher-course" }] },
            { title: "Counselling Tools & Report Cards", description: "Session trackers, counselling forms, and report formats.", actions: [{ label: "Manage", href: "/dashboard/franchise/enquiries" }] },
            { title: "Aksharabhyasam Support Sheets", description: "Support worksheets and practice trackers.", actions: [{ label: "Download", href: "/dashboard/franchise/aksharabhyasam-support-sheets" }] },
            { title: "Parents Orientation Videos", description: "Orientation decks and curated videos (managed by head office).", actions: [{ label: "Open portal", href: "/dashboard/franchise/parent-portal/" }] },
            { title: "Students Kit", description: "Checklists, inventory, and distribution guidelines.", actions: [{ label: "View", href: "/dashboard/franchise/students-kit" }] },
        ],
    },
    {
        id: "marketing",
        title: "Marketing & Media",
        accent: "orange",
        items: [
            { title: "Franchise Referral Incentives", description: "Referral slabs, approval steps, and payout trackers.", actions: [{ label: "View", href: "/dashboard/franchise/franchise-referral-incentives" }] },
            { title: "Newsletters", description: "Monthly newsletters archive and submission timelines.", actions: [{ label: "View", href: "/dashboard/franchise/#center-page" }] },
            { title: "Artworks", description: "Brand-safe creatives ready for print and digital.", actions: [{ label: "Manage", href: "/dashboard/franchise/events/" }] },
            { title: "Social Media Uploads & Support Files", description: "Head-office files on your Center Page checklist.", actions: [{ label: "View", href: "/dashboard/franchise/#center-page" }] },
            { title: "Latest Events (Images & Videos)", description: "Approved galleries for campaigns and PR.", actions: [{ label: "Manage", href: "/dashboard/franchise/events" }] },
            { title: "Concept Room Pictures & Displays", description: "Visual references for campaigns inside centres.", actions: [{ label: "Manage", href: "/dashboard/franchise/events/" }] },
        ],
    },
    {
        id: "operations",
        title: "Operations & SOP",
        accent: "yellow",
        items: [
            { title: "Standard Operating Procedures (SOP)", description: "Operations handbook with stepwise guides.", actions: [{ label: "View", href: "/dashboard/franchise/sop" }] },
            { title: "Infrastructure Manual & Purchase List", description: "Capex/Opex purchase lists and vendor links.", actions: [{ label: "Download", href: "/dashboard/franchise/infrastructure-manual" }] },
            { title: "Formats", description: "Operational templates for approvals and audits.", actions: [{ label: "Download", href: "/dashboard/franchise/formats" }] },
            { title: "Lease Agreement Documents", description: "Standard terms, renewal checklists, and annexures.", actions: [{ label: "View", href: "/dashboard/franchise/lease-agreement-documents" }] },
            { title: "Student Transfer Policy", description: "Operational flow for transfers across centres.", actions: [{ label: "Manage", href: "/dashboard/franchise/student-transfer-policy" }] },
        ],
    },
    {
        id: "admissions",
        title: "Admissions & Counselling",
        accent: "blue",
        items: [
            { title: "Admission Counselling", description: "Scripts, objection handlers, and follow-up cadences.", actions: [{ label: "Manage", href: "/dashboard/franchise/enquiries" }] },
            { title: "Counselling Tools & Report Cards", description: "Session packs and report templates for counsellors.", actions: [{ label: "Manage", href: "/dashboard/franchise/add-grades" }] },
            { title: "Parents Orientation Videos", description: "Orientation videos and agenda templates (managed by head office).", actions: [{ label: "Open portal", href: "/dashboard/franchise/parent-portal/" }] },
            { title: "Report Card Comments", description: "Comment bank for admissions follow-ups.", actions: [{ label: "Manage", href: "/dashboard/franchise/add-grades" }] },
        ],
    },
    {
        id: "finance",
        title: "Finance & Payments",
        accent: "orange",
        items: [
            { title: "Royalty Payments", description: "Schedules, statements, and remittance slips.", actions: [{ label: "View", href: "/dashboard/franchise/royalty-payments" }] },
            { title: "Indents Placing", description: "Raise indents with current SLAs and cut-offs.", actions: [{ label: "Place", href: "/dashboard/franchise/indents-placing" }] },
            { title: "Indent Documents (Inside & Outside AP)", description: "Region-specific indent packs.", actions: [{ label: "Download", href: "/dashboard/franchise/indent-documents" }] },
            { title: "Ordering Documents (IK & SM)", description: "Ordering flows and payment handoffs.", actions: [{ label: "View", href: "/dashboard/franchise/ordering-documents" }] },
        ],
    },
    {
        id: "leads",
        title: "Leads & CRM",
        accent: "yellow",
        items: [
            { title: "Franchise Lead Management", description: "Lead pipeline, SLAs, and action history.", actions: [{ label: "Manage", href: "/dashboard/franchise/enquiries" }] },
            { title: "Franchise Lead Entry", description: "Create new lead with mandatory fields and validation.", actions: [{ label: "Add", href: "/dashboard/franchise/enquiries" }] },
        ],
    },
    {
        id: "events",
        title: "Events & Media Gallery",
        accent: "blue",
        items: [
            { title: "Latest Events (Images & Videos)", description: "Curated media library for campaigns and parent updates.", actions: [{ label: "Manage", href: "/dashboard/franchise/events" }] },
            { title: "Summer Camp", description: "Event assets, calendars, and recap templates.", actions: [{ label: "Manage", href: "/dashboard/franchise/events" }] },
        ],
    },
    {
        id: "updates",
        title: "Webpage Updates",
        accent: "orange",
        items: [
            {
                title: "Centre Gallery Photos",
                description: "Upload event photos and videos visible in your centre gallery.",
                actions: [{ label: "Manage", href: "/dashboard/franchise/events/" }],
            },
        ],
    },
];
