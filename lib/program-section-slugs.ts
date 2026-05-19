import { slugify } from '@/lib/utils';

/** Stable section ids on `/programs` for deep links (e.g. `/programs#nursery`). */
const PROGRAM_SLUG_BY_KEY: Record<string, string> = {
    'play group': 'play-group',
    playgroup: 'play-group',
    nursery: 'nursery',
    'pp-1': 'pp-1',
    pp1: 'pp-1',
    'junior kg': 'pp-1',
    lkg: 'pp-1',
    'pp-2': 'pp-2',
    pp2: 'pp-2',
    'senior kg': 'pp-2',
    ukg: 'pp-2',
    'summer programs': 'summer-programs',
    'day care': 'summer-programs',
    daycare: 'summer-programs',
};

function normalizeProgramKey(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Maps a program display name (home preview, CMS, or programs page) to a section id.
 */
export function getProgramSectionSlug(programName: string): string {
    const key = normalizeProgramKey(programName.replace(/\n/g, ' '));
    if (PROGRAM_SLUG_BY_KEY[key]) return PROGRAM_SLUG_BY_KEY[key];

    if (key.includes('play group') || key.includes('playgroup')) return 'play-group';
    if (key.startsWith('nursery') || key === 'nursery') return 'nursery';
    if (key.startsWith('pp-1') || key.includes('junior kg') || /\blkg\b/.test(key)) return 'pp-1';
    if (key.startsWith('pp-2') || key.includes('senior kg') || /\bukg\b/.test(key)) return 'pp-2';
    if (key.includes('summer') || key.includes('day care') || key.includes('daycare')) return 'summer-programs';

    return slugify(programName);
}

export function programsSectionHref(programName: string): string {
    return `/programs#${getProgramSectionSlug(programName)}`;
}
