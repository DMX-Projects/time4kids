/** Max words per Latest News & Updates ticker line (home page). */
export const NEWS_TICKER_MAX_WORDS = 1000;

export function countWords(text: string): number {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(Boolean).length;
}

export function truncateToWordLimit(text: string, maxWords: number = NEWS_TICKER_MAX_WORDS): string {
    const trimmed = text.trim();
    if (!trimmed) return "";
    const words = trimmed.split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) return trimmed;
    return words.slice(0, maxWords).join(" ");
}
