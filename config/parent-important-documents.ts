/**
 * Parent dashboard — “Parent Important Documents” accordion.
 * Use `body` for optional intro text, and `resourceLinks` for PDF / video URLs.
 */
export type ParentImportantResourceLink = {
    label: string;
    href: string;
};

export type ParentImportantDocumentItem = {
    id: string;
    title: string;
    /** Optional intro shown above `resourceLinks`. */
    body?: string;
    /** Optional files (PDF, MP4, etc.). */
    resourceLinks?: ParentImportantResourceLink[];
};

export const PARENT_IMPORTANT_DOCUMENTS: ParentImportantDocumentItem[] = [
    {
        id: "audio-rhymes",
        title: "Audio Rhymes (AY 2025-26)",
        resourceLinks: [
            {
                label: "Audio Rhymes for PG and Nursery Block-1",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio%20Rhymes%20for%20PG%20and%20Nursery-Block%201.mp4",
            },
            {
                label: "Audio Rhymes for PP1 and PP2 Block-1",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio%20Rhymes%20for%20PP1%20and%20PP2-Block%201.mp4",
            },
            {
                label: "Audio Rhymes for PG and Nursery Block-2",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PG-and-Nursery-Block-2.mp4",
            },
            {
                label: "Audio Rhymes for PP1 and PP2 Block-2",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PP1-and-PP2-Block-2.mp4",
            },
            {
                label: "Audio file for Hindi Swarakshar",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio%20file%20for%20Hindi%20Swarakshar.mp4",
            },
            {
                label: "Audio File for Hindi Vyanjakshar",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio%20File%20for%20Hindi%20Vyanjakshar.mp4",
            },
            {
                label: "Audio Rhymes for PG and Nursery Block-3",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PG-and-Nursery-Block3.mp4",
            },
            {
                label: "Audio Rhymes for PP1 and PP2 Block-3",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PP1-and-PP2-Block3.mp4",
            },
            {
                label: "Audio Rhymes for PG and Nursery Block-4",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PG-and-Nursery-Block4.mp4",
            },
            {
                label: "Audio Rhymes for PP1 and PP2 Block-4",
                href: "http://103.65.21.245:8080/uploads/pc/Rhymes-2025-26/Audio-Rhymes-for-PP1-and-PP2-Block4.mp4",
            },
        ],
    },
    {
        id: "watch-hear-learn",
        title: "Watch Hear Learn (AY 2026-27)",
        body: "These use the legacy T.I.M.E. media site.",
        resourceLinks: [
            {
                label: "Days of the Week — Video",
                href: "http://103.65.21.245:8080/rhymes-videos.php?id=6f94bad6-13ae-4bd1-a4ef-01751fe2d412",
            },
            {
                label: "Phonic Song — Video",
                href: "http://103.65.21.245:8080/rhymes-videos.php?id=ea426670-3a65-4559-88d5-78e92004a112",
            },
            {
                label: "Circle Time — Video",
                href: "http://103.65.21.245:8080/rhymes-videos.php?id=3bb01f2a-e132-458f-8aed-36da5bec61f5",
            },
            {
                label: "School Assembly Prayer — Audio",
                href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=31",
            },
            {
                label: "School Pledge — Audio",
                href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=32",
            },
            {
                label: "Morning Prayer — Audio",
                href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=33",
            },
        ],
    },
    {
        id: "students-kit",
        title: "Students Kit AY 2026-27",
        resourceLinks: [
            {
                label: "Students Kit — PP1 (AY 2026-27)",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-PP1-AY-2026-27.pdf",
            },
            {
                label: "Students Kit — Play Group (AY 2026-27)",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-Play%20Group-AY-2026-27.pdf",
            },
            {
                label: "Students Kit — Nursery (AY 2026-27)",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-Nursery-AY-2026-27.pdf",
            },
            {
                label: "Students Kit — PP2 (AY 2026-27)",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-PP2-AY-2026-27.pdf",
            },
        ],
    },
    {
        id: "contact-us",
        title: "Contact Us",
        resourceLinks: [
            {
                label: "Contact Us",
                href: "http://103.65.21.245:8080/uploads/pc/Contact%20Us.pdf",
            },
        ],
    },
    {
        id: "general-rhymes",
        title: "General Rhymes",
        resourceLinks: [
            {
                label: "English Rhymes",
                href: "http://103.65.21.245:8080/uploads/pc/English%20Rhymes.pdf",
            },
            {
                label: "Hindi Rhymes",
                href: "http://103.65.21.245:8080/uploads/pc/Hindi%20Rhymes.pdf",
            },
            {
                label: "Telugu Rhymes",
                href: "http://103.65.21.245:8080/uploads/pc/Telugu%20Rhymes.pdf",
            },
            {
                label: "Malayalam Rhymes",
                href: "http://103.65.21.245:8080/uploads/pc/Malayalam%20Rhymes.pdf",
            },
        ],
    },
    {
        id: "student-transfer-policy",
        title: "Student Transfer Policy",
        resourceLinks: [
            {
                label: "Student Transfer Policy",
                href: "http://103.65.21.245:8080/uploads/pc/Student%20Transfer%20Policy.pdf",
            },
        ],
    },
    {
        id: "parenting-tips",
        title: "Parenting Tips & Articles",
        resourceLinks: [
            {
                label: "5 Things You Should Never Say to Your Kids",
                href: "http://103.65.21.245:8080/uploads/pc/5Things%20You%20Should%20Never%20Say%20To%20Your%20Kids.pdf",
            },
            {
                label: "8 Mistakes to Avoid With Your Toddler (Nov 2014)",
                href: "http://103.65.21.245:8080/uploads/pc/8-Mistakes-to-Avoid-With-Your-Toddler-Nov-2014.pdf",
            },
            {
                label: "Article — June 2013",
                href: "http://103.65.21.245:8080/uploads/pc/Article_for_June_2013.pdf",
            },
            {
                label: "Fussy eaters",
                href: "http://103.65.21.245:8080/uploads/pc/Fussy_eaters.pdf",
            },
            {
                label: "I Am Bored — What Your Child Is Really Telling You",
                href: "http://103.65.21.245:8080/uploads/pc/I%20Am%20Bored%20What%20Your%20Child%20Is%20Really%20Telling%20You.pdf",
            },
            {
                label: "Learning Through Senses",
                href: "http://103.65.21.245:8080/uploads/pc/Learning_Through_Senses.pdf",
            },
            {
                label: "Teach Our Children",
                href: "http://103.65.21.245:8080/uploads/pc/Teach-Our-Children.pdf",
            },
            {
                label: "Tips for Safe Diwali",
                href: "http://103.65.21.245:8080/uploads/pc/Tips-For-Safe%20Diwali.pdf",
            },
        ],
    },
];
