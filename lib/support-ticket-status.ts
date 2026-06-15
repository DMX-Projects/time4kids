export const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number] | "CLOSED";

const STATUS_LABELS: Record<string, string> = {
    OPEN: "Open",
    IN_PROGRESS: "In progress",
    RESOLVED: "Resolved",
    CLOSED: "Resolved",
};

export function ticketStatusLabel(status: string): string {
    return STATUS_LABELS[status] ?? status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ticketStatusBadgeClass(status: string): string {
    switch (status) {
        case "OPEN":
            return "bg-amber-100 text-amber-800 border-amber-200";
        case "IN_PROGRESS":
            return "bg-sky-100 text-sky-800 border-sky-200";
        case "RESOLVED":
        case "CLOSED":
            return "bg-emerald-100 text-emerald-800 border-emerald-200";
        default:
            return "bg-orange-50 text-orange-700 border-orange-100";
    }
}
