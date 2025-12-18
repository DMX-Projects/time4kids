"use client";

import { useMemo, useState } from "react";
import { Download, FileText, FolderOpen, GraduationCap, Megaphone, Search, ShieldCheck } from "lucide-react";

type ResourceItem = {
    title: string;
    description: string;
    actions?: { label: string; href: string; tone?: "orange" | "blue" }[];
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
            { title: "Social Media Uploads & Support Files", description: "Brand-safe packs, upload windows, and support collaterals.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
            { title: "Standard Operating Procedures (SOP)", description: "Daily operations handbook and compliance checklists.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Infrastructure Manual & Purchase List", description: "Approved vendors, fixtures, and procurement lists.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Concept Room Pictures & Displays", description: "Reference visuals for room setups and in-centre branding.", actions: [{ label: "Browse", href: "#", tone: "blue" }] },
            { title: "Formats", description: "Templates for letters, approvals, and internal communications.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Lease Agreement Documents", description: "Standard lease clauses and approval-ready documents.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Report Card Comments", description: "Ready-to-use comment bank for evaluations.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
            { title: "Artworks", description: "Print-ready creative assets and resizing guidelines.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Indent Documents (Inside & Outside AP)", description: "Regional indent formats and submission steps.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Ordering Documents (IK & SM)", description: "Ordering flows for IK & SM along with SLAs.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Student Transfer Policy", description: "Policy pack and approval workflow for student transfers.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Parenting Tips & Articles", description: "Curated articles for parent engagement.", actions: [{ label: "Browse", href: "#", tone: "blue" }] },
        ],
    },
    {
        id: "academic",
        title: "Academic Resources",
        accent: "blue",
        items: [
            { title: "Academic Documents (AY 2025–26)", description: "Year plans, lesson guides, and curriculum packs.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Summer Camp", description: "Camp planners, activity kits, and marketing ready files.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
            { title: "Refresher Course", description: "Facilitator refresher guides and assessments.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Counselling Tools & Report Cards", description: "Session trackers, counselling forms, and report formats.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Aksharabhyasam Support Sheets", description: "Support worksheets and practice trackers.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Parents Orientation Videos", description: "Orientation decks and curated videos.", actions: [{ label: "Watch", href: "#", tone: "blue" }] },
            { title: "Students Kit", description: "Checklists, inventory, and distribution guidelines.", actions: [{ label: "View", href: "#", tone: "blue" }] },
        ],
    },
    {
        id: "marketing",
        title: "Marketing & Media",
        accent: "orange",
        items: [
            { title: "Franchise Referral Incentives", description: "Referral slabs, approval steps, and payout trackers.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Newsletters", description: "Monthly newsletters archive and submission timelines.", actions: [{ label: "Browse", href: "#", tone: "blue" }] },
            { title: "Artworks", description: "Brand-safe creatives ready for print and digital.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Social Media Uploads & Support Files", description: "Upload portal and approval-ready posts.", actions: [{ label: "Upload", href: "#", tone: "orange" }] },
            { title: "Latest Events (Images & Videos)", description: "Approved galleries for campaigns and PR.", actions: [{ label: "Open", href: "#", tone: "blue" }] },
            { title: "Concept Room Pictures & Displays", description: "Visual references for campaigns inside centres.", actions: [{ label: "Browse", href: "#", tone: "blue" }] },
        ],
    },
    {
        id: "operations",
        title: "Operations & SOP",
        accent: "yellow",
        items: [
            { title: "Standard Operating Procedures (SOP)", description: "Operations handbook with stepwise guides.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Infrastructure Manual & Purchase List", description: "Capex/Opex purchase lists and vendor links.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Formats", description: "Operational templates for approvals and audits.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Lease Agreement Documents", description: "Standard terms, renewal checklists, and annexures.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Student Transfer Policy", description: "Operational flow for transfers across centres.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
        ],
    },
    {
        id: "admissions",
        title: "Admissions & Counselling",
        accent: "blue",
        items: [
            { title: "Admission Counselling", description: "Scripts, objection handlers, and follow-up cadences.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Counselling Tools & Report Cards", description: "Session packs and report templates for counsellors.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Parents Orientation Videos", description: "Orientation videos and agenda templates.", actions: [{ label: "Watch", href: "#", tone: "blue" }] },
            { title: "Report Card Comments", description: "Comment bank for admissions follow-ups.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
        ],
    },
    {
        id: "finance",
        title: "Finance & Payments",
        accent: "orange",
        items: [
            { title: "Royalty Payments", description: "Schedules, statements, and remittance slips.", actions: [{ label: "View", href: "#", tone: "blue" }] },
            { title: "Indents Placing", description: "Raise indents with current SLAs and cut-offs.", actions: [{ label: "Place", href: "#", tone: "orange" }] },
            { title: "Indent Documents (Inside & Outside AP)", description: "Region-specific indent packs.", actions: [{ label: "Download", href: "#", tone: "orange" }] },
            { title: "Ordering Documents (IK & SM)", description: "Ordering flows and payment handoffs.", actions: [{ label: "View", href: "#", tone: "blue" }] },
        ],
    },
    {
        id: "leads",
        title: "Leads & CRM",
        accent: "yellow",
        items: [
            { title: "Franchise Lead Management", description: "Lead pipeline, SLAs, and action history.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
            { title: "Franchise Lead Entry", description: "Create new lead with mandatory fields and validation.", actions: [{ label: "Add Lead", href: "#", tone: "orange" }] },
        ],
    },
    {
        id: "events",
        title: "Events & Media Gallery",
        accent: "blue",
        items: [
            { title: "Latest Events (Images & Videos)", description: "Curated media library for campaigns and parent updates.", actions: [{ label: "Browse", href: "#", tone: "blue" }] },
            { title: "Summer Camp", description: "Event assets, calendars, and recap templates.", actions: [{ label: "Open", href: "#", tone: "orange" }] },
        ],
    },
];

export default function FranchiseDashboardPage() {
    const [openSections, setOpenSections] = useState<string[]>(["documents", "academic"]);
    const [query, setQuery] = useState("");

    const filteredSections = useMemo(() => {
        const term = query.toLowerCase().trim();
        if (!term) return sections;
        return sections
            .map((section) => {
                const items = section.items.filter((item) => item.title.toLowerCase().includes(term) || item.description.toLowerCase().includes(term));
                return { ...section, items };
            })
            .filter((section) => section.items.length > 0);
    }, [query]);

    const toggle = (id: string) => {
        setOpenSections((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold text-[#111827]">Franchise Resource Hub</h1>
                    <p className="text-sm text-[#374151]">All centre resources organized by workflow. Expand a section to load its tools.</p>
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-3" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search resources"
                        className="w-full rounded-xl border border-[#E5E7EB] bg-white py-2.5 pl-9 pr-3 text-sm text-[#111827] focus:border-[#74C0FC] focus:outline-none shadow-sm"
                    />
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {filteredSections.map((section) => (
                    <AccordionCard key={section.id} section={section} isOpen={openSections.includes(section.id)} onToggle={() => toggle(section.id)} />
                ))}
                {filteredSections.length === 0 && (
                    <div className="col-span-full bg-white border border-[#E5E7EB] rounded-2xl p-6 text-sm text-[#374151] shadow-sm">
                        No resources match your search. Try a different keyword.
                    </div>
                )}
            </div>
        </div>
    );
}

function AccordionCard({ section, isOpen, onToggle }: { section: ResourceSection; isOpen: boolean; onToggle: () => void }) {
    const accent = section.accent === "yellow" ? "bg-[#FFF4CC]" : section.accent === "blue" ? "bg-[#E7F5FF]" : "bg-[#FFE8D6]";
    return (
        <section id={section.id} className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm transition-shadow duration-150 hover:shadow-md">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    <span className={`w-10 h-10 rounded-xl inline-flex items-center justify-center ${accent}`}>
                        {section.accent === "yellow" && <FolderOpen className="w-5 h-5 text-[#92400E]" />}
                        {section.accent === "blue" && <GraduationCap className="w-5 h-5 text-[#0F3B67]" />}
                        {section.accent === "orange" && <Megaphone className="w-5 h-5 text-[#9A3412]" />}
                    </span>
                    <div>
                        <p className="text-sm font-semibold text-[#111827]">{section.title}</p>
                        <p className="text-xs text-[#6B7280]">Expand to manage {section.items.length} resources</p>
                    </div>
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">{isOpen ? "Collapse" : "Expand"}</span>
            </button>
            {isOpen && (
                <div className="px-5 pb-4 space-y-3 animate-fade-up" style={{ animationDuration: "300ms" }}>
                    {section.items.map((item) => (
                        <ResourceRow key={item.title} item={item} />
                    ))}
                </div>
            )}
        </section>
    );
}

function ResourceRow({ item }: { item: ResourceItem }) {
    return (
        <div className="flex flex-col gap-2 border border-[#E5E7EB] rounded-xl p-4 transition-all duration-150 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-[#111827]">{item.title}</p>
                    <p className="text-xs text-[#6B7280]">{item.description}</p>
                </div>
                {item.actions && item.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2 justify-end">
                        {item.actions.map((action) => (
                            <ActionChip key={action.label} label={action.label} href={action.href} tone={action.tone} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionChip({ label, href, tone = "blue" }: { label: string; href: string; tone?: "orange" | "blue" }) {
    const styles = tone === "orange" ? "bg-[#FF922B] text-white hover:brightness-105" : "bg-[#74C0FC] text-white hover:brightness-105";
    return (
        <a href={href} className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${styles}`}>
            {label}
            {label.toLowerCase().includes("download") ? <Download className="w-4 h-4" /> : label.toLowerCase().includes("open") ? <FileText className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
        </a>
    );
}


