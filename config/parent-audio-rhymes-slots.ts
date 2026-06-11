/** Fixed upload rows for Admin → Parent documents → Audio Rhymes (AY 2026-27). */

export type ParentAudioRhymeSlotDef = {
    id: string;
    title: string;
    order: number;
};

const pgNurseryBlocks = Array.from({ length: 8 }, (_, i) => {
    const block = i + 1;
    return {
        id: `audio-rhymes-pg-nursery-block-${block}`,
        title: `Audio Rhymes for PG and Nursery Block-${block}`,
        order: i,
    };
});

const ppBlocks = Array.from({ length: 8 }, (_, i) => {
    const block = i + 1;
    return {
        id: `audio-rhymes-pp1-pp2-block-${block}`,
        title: `Audio Rhymes for PP1 and PP2 Block-${block}`,
        order: 8 + i,
    };
});

export const PARENT_AUDIO_RHYMES_UPLOAD_SLOTS: ParentAudioRhymeSlotDef[] = [
    ...pgNurseryBlocks,
    ...ppBlocks,
    {
        id: "audio-rhymes-hindi-swarakshar",
        title: "Audio file for Hindi Swarakshar",
        order: 16,
    },
    {
        id: "audio-rhymes-hindi-vyanjakshar",
        title: "Audio File for Hindi Vyanjakshar",
        order: 17,
    },
];
