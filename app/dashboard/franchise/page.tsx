"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
    ArrowRight,
    Download,
    Eye,
    ExternalLink,
    FolderOpen,
    GraduationCap,
    Megaphone,
    PenSquare,
    Plus,
    Send,
} from "lucide-react";

type ResourceItem = {
    title: string;
    description: string;
    actions?: { label: string; href: string }[];
};

type ResourceSection = {
    id: string;
    title: string;
    accent: "yellow" | "blue" | "orange";
    items: ResourceItem[];
};

const sections: ResourceSection[] = [
    {
        id: "documents",
        title: "Documents",
        accent: "yellow",
        items: [
            { title: "Social Media Uploads & Support Files", description: "Brand-safe packs, upload windows, and support collaterals.", actions: [{ label: "Open", href: "/dashboard/franchise/updates" }] },
            { title: "Standard Operating Procedures (SOP)", description: "Daily operations handbook and compliance checklists.", actions: [{ label: "View", href: "/dashboard/franchise/sop" }] },
            { title: "Infrastructure Manual & Purchase List", description: "Approved vendors, fixtures, and procurement lists.", actions: [{ label: "Download", href: "/dashboard/franchise/infrastructure-manual" }] },
            { title: "Concept Room Pictures & Displays", description: "Reference visuals for room setups and in-centre branding.", actions: [{ label: "Manage", href: "/dashboard/franchise/gallery" }] },
            { title: "Formats", description: "Templates for letters, approvals, and internal communications.", actions: [{ label: "Download", href: "/dashboard/franchise/formats" }] },
            { title: "Lease Agreement Documents", description: "Standard lease clauses and approval-ready documents.", actions: [{ label: "View", href: "/dashboard/franchise/lease-agreement-documents" }] },
            { title: "Report Card Comments", description: "Ready-to-use comment bank for evaluations.", actions: [{ label: "Manage", href: "/dashboard/franchise/add-grades" }] },
            { title: "Artworks", description: "Print-ready creative assets and resizing guidelines.", actions: [{ label: "Manage", href: "/dashboard/franchise/gallery" }] },
            { title: "Indent Documents (Inside & Outside AP)", description: "Regional indent formats and submission steps.", actions: [{ label: "View", href: "/dashboard/franchise/indent-documents" }] },
            { title: "Ordering Documents (IK & SM)", description: "Ordering flows for IK & SM along with SLAs.", actions: [{ label: "Download", href: "/dashboard/franchise/ordering-documents" }] },
            { title: "Student Transfer Policy", description: "Policy pack and approval workflow for student transfers.", actions: [{ label: "View", href: "/dashboard/franchise/student-transfer-policy" }] },
            { title: "Parenting Tips & Articles", description: "Curated articles for parent engagement.", actions: [{ label: "Manage", href: "/dashboard/franchise/parent-documents" }] },
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
            { title: "Parents Orientation Videos", description: "Orientation decks and curated videos.", actions: [{ label: "Manage", href: "/dashboard/franchise/parent-documents" }] },
            { title: "Students Kit", description: "Checklists, inventory, and distribution guidelines.", actions: [{ label: "View", href: "/dashboard/franchise/students-kit" }] },
        ],
    },
    {
        id: "marketing",
        title: "Marketing & Media",
        accent: "orange",
        items: [
            { title: "Franchise Referral Incentives", description: "Referral slabs, approval steps, and payout trackers.", actions: [{ label: "View", href: "/dashboard/franchise/franchise-referral-incentives" }] },
            { title: "Newsletters", description: "Monthly newsletters archive and submission timelines.", actions: [{ label: "Manage", href: "/dashboard/franchise/updates" }] },
            { title: "Artworks", description: "Brand-safe creatives ready for print and digital.", actions: [{ label: "Manage", href: "/dashboard/franchise/gallery" }] },
            { title: "Social Media Uploads & Support Files", description: "Upload portal and approval-ready posts.", actions: [{ label: "Manage", href: "/dashboard/franchise/updates" }] },
            { title: "Latest Events (Images & Videos)", description: "Approved galleries for campaigns and PR.", actions: [{ label: "Manage", href: "/dashboard/franchise/events" }] },
            { title: "Concept Room Pictures & Displays", description: "Visual references for campaigns inside centres.", actions: [{ label: "Manage", href: "/dashboard/franchise/gallery" }] },
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
            { title: "Parents Orientation Videos", description: "Orientation videos and agenda templates.", actions: [{ label: "Manage", href: "/dashboard/franchise/parent-documents" }] },
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
                title: "Home Page Photos",
                description: "Upload centre home-page slider photos shown on your public centre page.",
                actions: [{ label: "Manage", href: "/dashboard/franchise/hero-slider" }],
            },
            {
                title: "Centre Gallery Photos",
                description: "Upload event photos and videos visible in your centre gallery.",
                actions: [{ label: "Manage", href: "/dashboard/franchise/gallery" }],
            },
            {
                title: "Latest Announcements",
                description: "Post dynamic updates and notices to your school webpage.",
                actions: [{ label: "Manage", href: "/dashboard/franchise/updates" }],
            },
        ],
    },
];

export default function FranchiseDashboardPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>

            <div className="grid gap-5 lg:grid-cols-2">
                {sections.map((section) => (
                    <SectionCard key={section.id} section={section} />
                ))}
            </div>
        </div>
    );
}

function SectionCard({ section }: { section: ResourceSection }) {
    const accent =
        section.accent === "yellow"
            ? "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80"
            : section.accent === "blue"
              ? "bg-sky-100 text-sky-950 ring-1 ring-sky-200/80"
              : "bg-orange-100 text-orange-950 ring-1 ring-orange-200/80";

    return (
        <section id={section.id} className="rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${accent}`}>
                    {section.accent === "yellow" && <FolderOpen className="h-5 w-5" />}
                    {section.accent === "blue" && <GraduationCap className="h-5 w-5" />}
                    {section.accent === "orange" && <Megaphone className="h-5 w-5" />}
                </span>
                <h2 className="text-sm font-semibold text-slate-900">{section.title}</h2>
            </div>
            <div className="space-y-2 px-4 py-3">
                {section.items.map((item) => (
                    <ResourceRow key={item.title} item={item} />
                ))}
            </div>
        </section>
    );
}

function ResourceRow({ item }: { item: ResourceItem }) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-3.5 transition-colors hover:border-slate-300 hover:bg-white">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold leading-snug text-slate-900">{item.title}</p>
                    <p className="text-xs leading-relaxed text-slate-600">{item.description}</p>
                </div>
                {item.actions && item.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 sm:shrink-0 sm:justify-end">
                        {item.actions.map((action) => (
                            <ActionChip key={`${action.label}-${action.href}`} label={action.label} href={action.href} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function actionIcon(label: string): LucideIcon {
    const l = label.trim().toLowerCase();
    if (l.includes("download")) return Download;
    if (l.includes("view")) return Eye;
    if (l.includes("open")) return ExternalLink;
    if (l.includes("manage")) return PenSquare;
    if (l.includes("add")) return Plus;
    if (l.includes("place")) return Send;
    return ArrowRight;
}

function ActionChip({ label, href }: { label: string; href: string }) {
    const Icon = actionIcon(label);

    return (
        <Link
            href={href}
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs font-semibold text-orange-900 shadow-sm transition hover:border-orange-300 hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-1"
        >
            <Icon className="h-3.5 w-3.5 shrink-0 opacity-90" strokeWidth={2.25} aria-hidden />
            {label}
        </Link>
    );
}
