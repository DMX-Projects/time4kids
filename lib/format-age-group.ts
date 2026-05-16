/** Normalize age labels to `Age group : 2-3 years` (handles CMS variants). */
export function formatAgeGroupLabel(ageGroup: string): string {
    const trimmed = ageGroup.trim();
    if (!trimmed) return trimmed;
    if (!/\d/.test(trimmed)) return trimmed;

    let rest = trimmed;
    const colonMatch = rest.match(/^age\s*group\s*:\s*(.+)$/i);
    if (colonMatch) rest = colonMatch[1];
    else rest = rest.replace(/^age\s*group\s*/i, '').trim();

    const withoutYears = rest.replace(/\s*years?\s*$/i, '').trim();
    const range = withoutYears.replace(/\s*-\s*/g, '-').replace(/\s+/g, '');
    return `Age group : ${range} years`;
}
