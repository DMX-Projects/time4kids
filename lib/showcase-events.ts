/** Matches franchise parent-portal Showcase auto-created events (not real calendar items). */
export const SHOWCASE_AUTO_DESCRIPTION = "Auto-created from Showcase upload";

export function isShowcasePlaceholderEvent(ev: { venue?: string; notes?: string; location?: string }): boolean {
    const venue = (ev.venue ?? ev.location ?? "").trim().toLowerCase();
    if (venue === "showcase") return true;
    const notes = (ev.notes ?? "").trim();
    if (notes === SHOWCASE_AUTO_DESCRIPTION) return true;
    return false;
}

export function filterCalendarEvents<T extends { venue?: string; notes?: string; location?: string }>(events: T[]): T[] {
    return events.filter((e) => !isShowcasePlaceholderEvent(e));
}
