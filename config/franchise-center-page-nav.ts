/**
 * Franchise "Center Page" — same order and copy as the head-office checklist (two blocks).
 * Each top item opens to grey pill sub-headings, unless `directLinks` is set (links only under yellow).
 * A subsection may list `links` directly, or use `nested` for an extra pill level (e.g. Block Material → Block-1).
 *
 * `adminCategory`: maps to `FranchiseDocument` in the documents app. Centre dashboard resolves
 * links to uploaded files when titles match; otherwise falls back to legacy URLs or the category hub page.
 */

export type CenterPageLink = {
    label: string;
    href: string;
    /** FranchiseDocumentCategory value for admin filter alignment */
    adminCategory?: string;
    /** Stronger label (e.g. PP2 welcome letter in HO checklist). */
    emphasize?: boolean;
    /** Stable list key when the same label+href appears twice */
    rowKey?: string;
};

/** Third level (e.g. “Block-1”) — grey pill, then handprint links */
export type CenterPageNestedBlock = {
    title: string;
    links: CenterPageLink[];
};

/**
 * Second level under a yellow top row.
 * Use `links` for a flat list, `nested` for an extra accordion level (grey pills), or both.
 */
export type CenterPageSubsection = {
    title: string;
    links?: CenterPageLink[];
    nested?: CenterPageNestedBlock[];
};

export type CenterPageTopItem = {
    id: string;
    title: string;
    emphasize?: boolean;
    /**
     * Grey pill sections under the yellow bar. Use an empty array when `directLinks` carries
     * the whole list (no intermediate pill).
     */
    groups: CenterPageSubsection[];
    /** When non-empty, handprint links render directly under the yellow header (skips grey pills). */
    directLinks?: CenterPageLink[];
};

/** Block 1 — first checklist image (13 rows) */
export const FRANCHISE_CENTER_PAGE_BLOCK_A: CenterPageTopItem[] = [
    {
        id: "social-media-support",
        title: "Social Media Uploads and Support Files",
        groups: [],
        directLinks: [
            {
                label: "Step-by-Step Guide to Upload Instagram Reels",
                href: "http://103.65.21.245:8080/uploads/pc/Social-Media-Uploads-and-Support-Files/Step%20by%20step%20guide%20to%20upload%20reels%20on%20Instagram.pdf",
            },
            {
                label: "Sample Google Reviews (Editable)",
                href: "http://103.65.21.245:8080/uploads/pc/Social-Media-Uploads-and-Support-Files/Sample%20Google%20Reviews.pdf",
            },
            {
                label: "Sample Parent Testimonial Video Script (Editable)",
                href: "http://103.65.21.245:8080/uploads/pc/Social-Media-Uploads-and-Support-Files/Sample%20Parent%20Testimonial%20Script.pdf",
            },
        ],
    },
    {
        id: "academic-ay",
        title: "Academic Documents AY 2026-27",
        groups: [
            {
                title: "Block Material (AY 2026-27)",
                nested: [
                    {
                        title: "Block-1",
                        links: [
                            {
                                label: "Playgroup - Study material Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/PG-Study-Material-for-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                            {
                                label: "Nursery - Study material Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/Nursery-Study-Material-for-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                            {
                                label: "PP1 - Study material Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/PP1-Study-Material-for-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                            {
                                label: "PP2 - Study material Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/PP2-Study-Material-for-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                            {
                                label: "2nd Language TGN's for PP1 Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/2nd-Language-TGNs-for-PP1-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                            {
                                label: "2nd Language TGN's for PP2 Block - 1",
                                href: "http://103.65.21.245:8080/uploads/pc/study-material-26-27/Block-1/2nd-Language-TGNs-for-PP2-Block-1.zip",
                                adminCategory: "ACADEMIC_DOCUMENTS",
                            },
                        ],
                    },
                ],
            },
            {
                title: "Holiday Lists (AY 2026-27)",
                nested: [
                    {
                        title: "Regular Holiday Lists AY 2026-27",
                        links: [
                            {
                                label: "AP Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/AP%20Holiday%20List%202026-2027.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Bihar holiday list 2026-2027",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Bihar%20holiday%20list%202026-2027.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Gujarat Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Gujarat%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Karnataka Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Karnataka%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Kerala Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Kerala%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Madhya Pradesh Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Madhya%20Pradesh%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Maharashtra Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Maharashtra%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Odisha Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Odisha%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Punjab Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Punjab%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Telangana Holiday List 2026- 2027",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Telangana%20Holiday%20List%202026-%202027.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "Tamil Nadu Holiday 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/TamilNadu%20Holiday%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                            {
                                label: "West Bengal Holiday List 2026-27",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/West%20Bengal%20Holiday%20List%202026-27.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                            },
                        ],
                    },
                    {
                        title: "Holiday Lists for Student Diary AY 2026-27",
                        links: [
                            {
                                label: "Andhra Pradesh — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Andhra-Pradesh.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-ap-2026-27",
                            },
                            {
                                label: "Bihar — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Bihar.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-bihar-2026-27",
                            },
                            {
                                label: "Gujarat — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Gujarat.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-gujarat-2026-27",
                            },
                            {
                                label: "Karnataka — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Karnataka.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-karnataka-2026-27",
                            },
                            {
                                label: "Kerala — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Kerala.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-kerala-2026-27",
                            },
                            {
                                label: "Madhya Pradesh — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Madhya-Pradesh.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-mp-2026-27",
                            },
                            {
                                label: "Maharashtra — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Maharashtra.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-maharashtra-2026-27",
                            },
                            {
                                label: "Odisha — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Odisha.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-odisha-2026-27",
                            },
                            {
                                label: "Punjab — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Punjab.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-punjab-2026-27",
                            },
                            {
                                label: "Telangana — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Telangana.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-telangana-2026-27",
                            },
                            {
                                label: "Tamil Nadu — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-Tamilnadu.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-tn-2026-27",
                            },
                            {
                                label: "West Bengal — Student Diary",
                                href: "http://103.65.21.245:8080/uploads/pc/holidayslist-2026-27/Holiday%20Lists%20for%20student%20Diary%20AY%202026-27/TK-dairy-for-2026-West-Bengal.pdf",
                                adminCategory: "HOLIDAY_LISTS",
                                rowKey: "holiday-diary-wb-2026-27",
                            },
                        ],
                    },
                ],
            },
            {
                title: "Welcome letters (For new enrolments)",
                links: [
                    {
                        label: "Play Group Welcome Letter(New enrollments)",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-letters/Play%20Group%20Welcome%20Letter%20(AY%202026-27).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "Nursery Welcome Letter (New enrollments)",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-letters/Nursery%20Welcome%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "PP1 Welcome Letter (New Enrollments)",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-letters/PP1%20Welcome%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "PP2 Welcome Letter (New Enrollments)",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-letters/PP2%20Welcome%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                        emphasize: true,
                    },
                ],
            },
            {
                title: "Welcome Back letters (For existing students)",
                links: [
                    {
                        label: "Nursery Welcome Back Letter",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-back-letters/Nursery%20Welcome%20Back%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "PP1 Welcome Back Letter",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-back-letters/PP1%20Welcome%20Back%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "PP2 Welcome back Letter",
                        href: "http://103.65.21.245:8080/uploads/pc/Welcome-letters-2026-27/Welcome-back-letters/PP2%20Welcome%20back%20Letter%20(2026-2027).pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                ],
            },
            {
                title: "Additional resources",
                links: [
                    {
                        label: "Alphabet Phonic Song Flashcards",
                        href: "http://103.65.21.245:8080/uploads/pc/Academic-Documents-AY-2025-26/Phonic%20Song%20Flashcard.pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                    {
                        label: "Tips for using Double and Square ruled books for Children",
                        href: "http://103.65.21.245:8080/uploads/pc/Academic-Documents-AY-2025-26/Tips%20for%20using%20%20Double%20and%20Square%20ruled%20books%20for%20Children.pdf",
                        adminCategory: "ACADEMIC_DOCUMENTS",
                    },
                ],
            },
        ],
    },
    {
        id: "refresher-2026",
        title: "Refresher Course 2026",
        groups: [
            {
                title: "Level 1",
                links: [
                    {
                        label: "Refresher Course - Level 1",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Refresher%20Course%20-%20Level%201.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-overview",
                    },
                    {
                        label: "Refresher Course Nursery",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Refresher%20Course%20Nursery.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-nursery",
                    },
                    {
                        label: "Page 1",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%201.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p1",
                    },
                    {
                        label: "Page 2",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%202.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p2",
                    },
                    {
                        label: "Page 3",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%203.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p3",
                    },
                    {
                        label: "Page 4",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%204.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p4",
                    },
                    {
                        label: "Page 5",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%205.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p5",
                    },
                    {
                        label: "Page 6",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%206.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p6",
                    },
                    {
                        label: "Page 7",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%207.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p7",
                    },
                    {
                        label: "Page 8",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%208.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p8",
                    },
                    {
                        label: "Page 9",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%209.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p9",
                    },
                    {
                        label: "Page 10",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%201/Page%2010.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l1-p10",
                    },
                ],
            },
            {
                title: "Level 2",
                links: [
                    {
                        label: "Level 2 Time table",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%202/Time%20Table%20for%20Refresher%20Course%20Level%202.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l2-time-table",
                    },
                    {
                        label: "Level 2 TGN",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Level%202/Refresher%20Course%20Level%202-TGN.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l2-tgn",
                    },
                    {
                        label: "Counselling Sheet for Refresher Course 2026",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Refresher%20Course%20counseling%20sheet.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l2-counselling-sheet",
                    },
                    {
                        label: "Consent form for Refresher Course 2026",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Consent%20Form%20-%20Refresher%20Course%202026.doc.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l2-consent-form",
                    },
                    {
                        label: "Refresher Course Consent Form-2026",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Refresher%20Course%20Consent%20Form-2026.pdf",
                        adminCategory: "REFRESHER_COURSE",
                        rowKey: "refresher-l2-consent-form-2026",
                    },
                ],
            },
        ],
    },
    {
        id: "summer-camp-2026",
        title: "Summer Camp 2026",
        groups: [
            {
                title: "Summer Camp Themes",
                links: [
                    {
                        label: "SC-Curious Minds",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Curious%20Minds.zip",
                        rowKey: "summer-theme-curious-minds",
                    },
                    {
                        label: "SC-Dino Discovery",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Dino%20Discovery.zip",
                        rowKey: "summer-theme-dino",
                    },
                    {
                        label: "SC-Explore and Experiment",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Explore%20and%20Experiment.zip",
                        rowKey: "summer-theme-explore",
                    },
                    {
                        label: "SC-Joyful Journey",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Joyful%20Journey.zip",
                        rowKey: "summer-theme-joyful",
                    },
                    {
                        label: "SC-Sea Life Safari",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Sea%20Life%20Safari.zip",
                        rowKey: "summer-theme-sea-life",
                    },
                    {
                        label: "SC-Spark and Shine",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Spark%20and%20Shine.zip",
                        rowKey: "summer-theme-spark",
                    },
                    {
                        label: "SC-Sunshine Smiles",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summercamp-themes/SC-Sunshine%20Smiles.zip",
                        rowKey: "summer-theme-sunshine",
                    },
                ],
            },
            {
                title: "Support Sheets",
                links: [
                    {
                        label: "Mother's Day",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summer-camp-support-sheets/Mothers%20Day%2026-27.pdf",
                        rowKey: "summer-support-mothers-day",
                    },
                    {
                        label: "Earth Day",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summer-camp-support-sheets/Earth%20Day%20pp1.pdf",
                        rowKey: "summer-support-earth-day",
                    },
                    {
                        label: "Prayer sheet",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/summer-camp-support-sheets/Prayer%20Sheet-for%20Summer%20Camp-2026.pdf",
                        rowKey: "summer-support-prayer",
                    },
                    {
                        label: "Summer Camp Consent Form-2026",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Summer%20Camp%20Consent%20Form-2026.pdf",
                        rowKey: "summer-support-consent-2026",
                    },
                    {
                        label: "Summer Camp Counselling sheet 2026",
                        href: "http://103.65.21.245:8080/uploads/pc/refreshercourse-and-summercamp-2026/Summer%20Camp%20Counselling%20sheet%202026.pdf",
                        rowKey: "summer-support-counselling-2026",
                    },
                ],
            },
        ],
    },
    {
        id: "watch-hear-learn",
        title: "Watch Hear and Learn (AY 2026-27)",
        groups: [
            {
                title: "Videos & audio",
                links: [
                    {
                        label: "Days of the Week - Video",
                        href: "http://103.65.21.245:8080/rhymes-videos.php?id=6f94bad6-13ae-4bd1-a4ef-01751fe2d412",
                        emphasize: true,
                        rowKey: "watch-days-week-video",
                    },
                    {
                        label: "Phonic Song - Video",
                        href: "http://103.65.21.245:8080/rhymes-videos.php?id=ea426670-3a65-4559-88d5-78e92004a112",
                        rowKey: "watch-phonic-song-video",
                    },
                    {
                        label: "Circle Time - Video",
                        href: "http://103.65.21.245:8080/rhymes-videos.php?id=3bb01f2a-e132-458f-8aed-36da5bec61f5",
                        rowKey: "watch-circle-time-video",
                    },
                    {
                        label: "School Assembly Prayer - Audio",
                        href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=31",
                        rowKey: "watch-assembly-prayer-audio",
                    },
                    {
                        label: "School Pledge - Audio",
                        href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=32",
                        rowKey: "watch-school-pledge-audio",
                    },
                    {
                        label: "Morning Prayer - Audio",
                        href: "http://103.65.21.245:8080/uploads/pc/rhymes.php?rid=33",
                        rowKey: "watch-morning-prayer-audio",
                    },
                ],
            },
        ],
    },
    {
        id: "admission-counselling",
        title: "Admission Counselling",
        groups: [],
        directLinks: [
            {
                label: "PARENT ORIENTATION",
                href: "http://103.65.21.245:8080/uploads/pc/Admission-Counselling-2025-26/PARENT%20ORIENTATION.pdf",
                rowKey: "admission-parent-orientation",
            },
            {
                label: "T.I.M.E. Kids Admission Counselling(PDF)",
                href: "http://103.65.21.245:8080/uploads/pc/Admission-Counselling-2023-24/TIME-Kids-Admission-Counselling.pdf",
                rowKey: "admission-counselling-pdf",
            },
            {
                label: "T.I.M.E. Kids Admission Counselling(PPT)",
                href: "http://103.65.21.245:8080/uploads/pc/Admission-Counselling-2023-24/TIME-Kids-Admission-Counselling.ppt",
                rowKey: "admission-counselling-ppt",
            },
        ],
    },
    {
        id: "students-kit",
        title: "Students Kit AY 2026-27",
        groups: [],
        directLinks: [
            {
                label: "Students Kit-Play Group-AY-2026-27",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-Play%20Group-AY-2026-27.pdf",
                adminCategory: "STUDENTS_KIT",
                rowKey: "students-kit-pg-2026-27",
            },
            {
                label: "Students Kit-Nursery-AY-2026-27",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-Nursery-AY-2026-27.pdf",
                adminCategory: "STUDENTS_KIT",
                rowKey: "students-kit-nursery-2026-27",
            },
            {
                label: "Students Kit-PP1-AY-2026-27",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-PP1-AY-2026-27.pdf",
                adminCategory: "STUDENTS_KIT",
                rowKey: "students-kit-pp1-2026-27",
            },
            {
                label: "Students Kit-PP2-AY-2026-27",
                href: "http://103.65.21.245:8080/uploads/pc/Students%20Kit-PP2-AY-2026-27.pdf",
                adminCategory: "STUDENTS_KIT",
                rowKey: "students-kit-pp2-2026-27",
            },
        ],
    },
    {
        id: "new-artworks",
        title: "New Artworks for AY 2026-27",
        groups: [],
        directLinks: [
            {
                label: "Admission-Artwork1",
                href: "http://103.65.21.245:8080/uploads/pc/Admission-Artwork1.jpeg",
                rowKey: "new-artwork-admission-1",
            },
            {
                label: "Admission-Artwork2",
                href: "http://103.65.21.245:8080/uploads/pc/Admission-Artwork2.jpeg",
                rowKey: "new-artwork-admission-2",
            },
        ],
    },
    {
        id: "referral-incentive",
        title: "Franchise referral Incentive 2025",
        groups: [],
        directLinks: [
            {
                label: "Franchise referral Incentive 2025 Email sent on 1st Feb 2025",
                href: "http://103.65.21.245:8080/uploads/pc/Franchise%20referral%20Incentive%202025%20Email%20sent%20on%201st%20Feb%202025.pdf",
                adminCategory: "FRANCHISE_REFERRAL_INCENTIVES",
                rowKey: "referral-incentive-feb-2025",
            },
            {
                label: "Franchise referral Incentive 2025 Email sent on 7th Oct 2025",
                href: "http://103.65.21.245:8080/uploads/pc/Franchise%20referral%20Incentive%202025%20Email%20sent%20on%207th%20Oct%202025.pdf",
                adminCategory: "FRANCHISE_REFERRAL_INCENTIVES",
                rowKey: "referral-incentive-oct-2025",
            },
        ],
    },
    {
        id: "sop",
        title: "Standard Operating Procedure (SOP)",
        groups: [],
        directLinks: [
            {
                label: "SOP - PTM",
                href: "http://103.65.21.245:8080/uploads/pc/SOP%20-%20PTM.pdf",
                adminCategory: "SOP",
                emphasize: true,
                rowKey: "sop-ptm",
            },
            {
                label: "SOP - Assembly",
                href: "http://103.65.21.245:8080/uploads/pc/SOP%20-%20Assembly.pdf",
                adminCategory: "SOP",
                rowKey: "sop-assembly",
            },
            {
                label: "SOP - Field Trips",
                href: "http://103.65.21.245:8080/uploads/pc/SOP%20-%20Field%20Trips.pdf",
                adminCategory: "SOP",
                rowKey: "sop-field-trips",
            },
        ],
    },
    {
        id: "report-cards-tool",
        title: "Counselling Tool - New Report Cards",
        groups: [],
        directLinks: [
            {
                label: "Counselling Tool - New Report Cards",
                href: "http://103.65.21.245:8080/uploads/pc/Counselling%20Tool%20-%20New%20Report%20Cards.pdf",
                rowKey: "counselling-tool-report-cards",
            },
        ],
    },
    {
        id: "parents-orientation-video",
        title: "Parents orientation details for centres - Video",
        groups: [],
        directLinks: [
            {
                label: "Parents orientation details for centres",
                href: "http://103.65.21.245:8080/uploads/pc/Parents%20orientation%20details%20for%20centres.htm",
                rowKey: "parents-orientation-centres",
            },
        ],
    },
    {
        id: "infrastructure-manual",
        title: "Infrastructure Manual & Purchase List",
        groups: [],
        directLinks: [
            {
                label: "Infrastructure Development Manual",
                href: "http://103.65.21.245:8080/uploads/pc/Infrastructure%20Development%20Manual.pdf",
                adminCategory: "INFRASTRUCTURE_MANUAL",
                rowKey: "infrastructure-development-manual",
            },
        ],
    },
];

/** Block 2 — second checklist image (9 rows) */
export const FRANCHISE_CENTER_PAGE_BLOCK_B: CenterPageTopItem[] = [
    {
        id: "concept-rooms",
        title: "Pictures of Different Concept Rooms & Displays",
        groups: [],
        directLinks: [
            {
                label: "Artistic wall paintings",
                href: "http://103.65.21.245:8080/uploads/pc/Artistic%20wall%20paintings.pdf",
                rowKey: "concept-rooms-artistic-wall",
            },
            {
                label: "Class Display Images",
                href: "http://103.65.21.245:8080/uploads/pc/Class%20Display%20Images.pdf",
                rowKey: "concept-rooms-class-display",
            },
            {
                label: "Concept Rooms",
                href: "http://103.65.21.245:8080/uploads/pc/Concept%20Rooms.pdf",
                rowKey: "concept-rooms-rooms",
            },
            {
                label: "Infrastructure images",
                href: "http://103.65.21.245:8080/uploads/pc/Infrastructure%20images.pdf",
                rowKey: "concept-rooms-infrastructure",
            },
        ],
    },
    {
        id: "formats",
        title: "Formats",
        groups: [],
        directLinks: [
            {
                label: "Bonafide Certificate",
                href: "http://103.65.21.245:8080/uploads/pc/Bonafide%20Certificate.pdf",
                adminCategory: "FORMATS",
                rowKey: "formats-bonafide",
            },
            {
                label: "Transfer Certificate Option-1",
                href: "http://103.65.21.245:8080/uploads/pc/Transfer%20Certificate%20Option-1.pdf",
                adminCategory: "FORMATS",
                rowKey: "formats-transfer-opt1",
            },
            {
                label: "Transfer Certificate Option-2",
                href: "http://103.65.21.245:8080/uploads/pc/Transfer%20Certificate%20Option-2.pdf",
                adminCategory: "FORMATS",
                rowKey: "formats-transfer-opt2",
            },
        ],
    },
    {
        id: "lease",
        title: "Documents For Lease Agreement",
        groups: [],
        directLinks: [
            {
                label: "Lease-Deposit-Letter",
                href: "http://103.65.21.245:8080/uploads/pc/Lease-Deposit-Letter.pdf",
                adminCategory: "LEASE_AGREEMENT_DOCUMENTS",
                rowKey: "lease-deposit-letter",
            },
            {
                label: "Lease-Agreement",
                href: "http://103.65.21.245:8080/uploads/pc/Lease-Agreement.pdf",
                adminCategory: "LEASE_AGREEMENT_DOCUMENTS",
                rowKey: "lease-agreement",
            },
            {
                label: "Items-check-before-getting-into-a-lease-agreement",
                href: "http://103.65.21.245:8080/uploads/pc/Items-check-before-getting-into-a-lease-agreement.pdf",
                adminCategory: "LEASE_AGREEMENT_DOCUMENTS",
                rowKey: "lease-items-check",
            },
        ],
    },
    {
        id: "report-card-comments",
        title: "Report Card Comments - Note to Teacher",
        groups: [],
        directLinks: [
            {
                label: "Report-Card-Comments",
                href: "http://103.65.21.245:8080/uploads/pc/Report-Card-Comments.pdf",
                rowKey: "report-card-comments-pdf",
            },
        ],
    },
    {
        id: "artworks",
        title: "Artworks",
        emphasize: true,
        groups: [
            {
                title: "Social Media Promotions-Admissions-AY 2026-27",
                links: [
                    {
                        label: "Admissions Open — Limited Seats",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-1.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-1",
                    },
                    {
                        label: "Dedicated Teaching Staff — Admissions AY 2026-27",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-2.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-2",
                    },
                    {
                        label: "Where Learning Begins with Joy",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-3.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-3",
                    },
                    {
                        label: "Admissions Open — Call / Visit Today",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-4.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-4",
                    },
                    {
                        label: "Give Your Child the Right Start",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-5.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-5",
                    },
                    {
                        label: "Care and Safety — Admissions AY 2026-27",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-6.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-6",
                    },
                    {
                        label: "A Safe & Nurturing Start",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-7.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-7",
                    },
                    {
                        label: "The Best Pre-school for Your Child",
                        href: "/franchise-artworks/social-media-promotions-ay-2026-27/social-media-promotion-8.png",
                        adminCategory: "ARTWORKS_MARKETING",
                        rowKey: "artworks-sm-admissions-8",
                    },
                ],
            },
        ],
    },
    {
        id: "indent",
        title: "Documents For Indent (Centres Outside AP)",
        groups: [],
        directLinks: [
            {
                label: "Documents-For-Indent",
                href: "http://103.65.21.245:8080/uploads/pc/Documents-For-Indent.pdf",
                adminCategory: "INDENT_DOCUMENTS",
                emphasize: true,
                rowKey: "indent-documents-pdf",
            },
        ],
    },
    {
        id: "ordering-ik-sm",
        title: "User Document For Ordering IK and SM",
        groups: [],
        directLinks: [
            {
                label: "User-Document-For-Ordering-IK-And-SM-2015",
                href: "http://103.65.21.245:8080/uploads/pc/User-Document-For-Ordering-IK-And-SM-2015.pdf",
                adminCategory: "ORDERING_DOCUMENTS",
                rowKey: "ordering-ik-sm-2015",
            },
        ],
    },
    {
        id: "student-transfer",
        title: "Student Transfer Policy",
        groups: [],
        directLinks: [
            {
                label: "Student Transfer Policy",
                href: "http://103.65.21.245:8080/uploads/pc/Student%20Transfer%20Policy.pdf",
                adminCategory: "STUDENT_TRANSFER_POLICY",
                rowKey: "student-transfer-policy-pdf",
            },
        ],
    },
    {
        id: "parenting-tips",
        title: "Parenting Tips & Articles",
        groups: [],
        directLinks: [
            {
                label: "Parenting-Style",
                href: "http://103.65.21.245:8080/uploads/pc/Parenting-Style.pdf",
                rowKey: "parenting-style",
            },
            {
                label: "Learning-through-Senses",
                href: "http://103.65.21.245:8080/uploads/pc/Learning-through-Senses.pdf",
                rowKey: "parenting-learning-senses",
            },
            {
                label: "Kitchen-Activities",
                href: "http://103.65.21.245:8080/uploads/pc/Kitchen-Activities.pdf",
                rowKey: "parenting-kitchen-activities",
            },
            {
                label: "when-to-introduce-your-child-smartphone",
                href: "http://103.65.21.245:8080/uploads/pc/when-to-introduce-your-child-smartphone.pdf",
                rowKey: "parenting-smartphone",
            },
            {
                label: "I Am Bored What Your Child Is Really Telling You",
                href: "http://103.65.21.245:8080/uploads/pc/I%20Am%20Bored%20What%20Your%20Child%20Is%20Really%20Telling%20You.pdf",
                rowKey: "parenting-i-am-bored",
            },
            {
                label: "Helping-your-kids-adjust-to-preschool",
                href: "http://103.65.21.245:8080/uploads/pc/Helping-your-kids-adjust-to-preschool.jpg",
                rowKey: "parenting-adjust-preschool",
            },
            {
                label: "GamePlanforParentingYourPreschooler",
                href: "http://103.65.21.245:8080/uploads/pc/GamePlanforParentingYourPreschooler.pdf",
                rowKey: "parenting-game-plan",
            },
            {
                label: "Fussy_eaters",
                href: "http://103.65.21.245:8080/uploads/pc/Fussy_eaters.pdf",
                rowKey: "parenting-fussy-eaters",
            },
            {
                label: "Building-Character-in-childern-Parenting-Tips",
                href: "http://103.65.21.245:8080/uploads/pc/Building-Character-in-childern-Parenting-Tips.pdf",
                rowKey: "parenting-building-character",
            },
            {
                label: "Back-to-School",
                href: "http://103.65.21.245:8080/uploads/pc/Back-to-School.pdf",
                rowKey: "parenting-back-to-school",
            },
            {
                label: "8-Mistakes-to-Avoid-With-Your-Toddler-Nov-2014",
                href: "http://103.65.21.245:8080/uploads/pc/8-Mistakes-to-Avoid-With-Your-Toddler-Nov-2014.pdf",
                rowKey: "parenting-8-mistakes-toddler",
            },
        ],
    },
];

export const FRANCHISE_CENTER_PAGE_ALL: CenterPageTopItem[] = [...FRANCHISE_CENTER_PAGE_BLOCK_A, ...FRANCHISE_CENTER_PAGE_BLOCK_B];
