/** Global “Our Classes” card images on every public centre page (`/locations/...`). */

export type CentreProgramCard = { id: number; image: string };

export type CentreProgramCardsData = { cards: CentreProgramCard[] };

export const CENTRE_PROGRAM_LABELS: Array<{ id: number; label: string }> = [
    { id: 1, label: "Play Group" },
    { id: 2, label: "Nursery" },
    { id: 3, label: "PP-1 / Junior KG / LKG" },
    { id: 4, label: "PP-2 / Senior KG / UKG" },
    { id: 5, label: "Summer Programs / Day Care" },
];

export const DEFAULT_CENTRE_PROGRAM_CARDS: CentreProgramCardsData = {
    cards: [
        { id: 1, image: "/1.png" },
        { id: 2, image: "/2 (1).png" },
        { id: 3, image: "/2.png" },
        { id: 4, image: "/16.png" },
        { id: 5, image: "/day care.png" },
    ],
};

export function normalizeCentreProgramCardsData(raw: unknown): CentreProgramCardsData {
    if (!raw || typeof raw !== "object") return { ...DEFAULT_CENTRE_PROGRAM_CARDS, cards: [...DEFAULT_CENTRE_PROGRAM_CARDS.cards] };
    const cardsRaw = (raw as CentreProgramCardsData).cards;
    if (!Array.isArray(cardsRaw)) return { cards: [...DEFAULT_CENTRE_PROGRAM_CARDS.cards] };
    const cards = cardsRaw
        .filter((c): c is CentreProgramCard => Boolean(c && typeof c === "object" && typeof (c as CentreProgramCard).id === "number"))
        .map((c) => ({ id: c.id, image: String(c.image || "").trim() }))
        .filter((c) => c.image)
        .sort((a, b) => a.id - b.id);
    return { cards: cards.length ? cards : [...DEFAULT_CENTRE_PROGRAM_CARDS.cards] };
}

/** Franchise overrides win per card id; otherwise use global CMS cards. */
export function mergeCentreProgramCards(
    globalCards: CentreProgramCard[],
    franchiseCards?: CentreProgramCard[] | null,
): CentreProgramCard[] {
    const map = new Map<number, string>();
    for (const c of globalCards) {
        if (c?.id && c.image?.trim()) map.set(c.id, c.image.trim());
    }
    for (const c of franchiseCards || []) {
        if (c?.id && c.image?.trim()) map.set(c.id, c.image.trim());
    }
    return Array.from(map.entries())
        .map(([id, image]) => ({ id, image }))
        .sort((a, b) => a.id - b.id);
}
