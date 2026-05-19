import {
    DEFAULT_CENTRE_PROGRAM_CARDS,
    normalizeCentreProgramCardsData,
    type CentreProgramCard,
    type CentreProgramCardsData,
} from "@/config/centre-program-cards-defaults";

export type { CentreProgramCard };
export { mergeCentreProgramCards } from "@/config/centre-program-cards-defaults";

function apiBaseForServer(): string {
    const internal = (process.env.INTERNAL_API_URL || process.env.DJANGO_DEV_BACKEND_URL || "").replace(/\/$/, "");
    if (internal) return `${internal}/api`;
    const port = process.env.NEXT_PUBLIC_BACKEND_PORT?.trim() || "8000";
    return `http://127.0.0.1:${port}/api`;
}

export async function fetchGlobalCentreProgramCards(): Promise<CentreProgramCard[]> {
    try {
        const res = await fetch(`${apiBaseForServer()}/common/page-content/centre-program-cards/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return [...DEFAULT_CENTRE_PROGRAM_CARDS.cards];
        const data = (await res.json()) as CentreProgramCardsData;
        return normalizeCentreProgramCardsData(data).cards;
    } catch {
        return [...DEFAULT_CENTRE_PROGRAM_CARDS.cards];
    }
}
