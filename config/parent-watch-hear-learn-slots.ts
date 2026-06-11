/** Fixed upload rows for Admin → Parent documents → Watch Hear and Learn (AY 2026-27). */

export type ParentWatchHearLearnSlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_WATCH_HEAR_LEARN_UPLOAD_SLOTS: ParentWatchHearLearnSlotDef[] = [
    { id: "watch-hear-learn-days-week-video", title: "Days of the Week", order: 0 },
    { id: "watch-hear-learn-phonic-song-video", title: "Phonic Song", order: 1 },
    { id: "watch-hear-learn-circle-time-video", title: "Circle Time", order: 2 },
    { id: "watch-hear-learn-assembly-prayer-audio", title: "School Assembly Prayer", order: 3 },
    { id: "watch-hear-learn-school-pledge-audio", title: "School Pledge", order: 4 },
    { id: "watch-hear-learn-morning-prayer-audio", title: "Morning Prayer", order: 5 },
];
