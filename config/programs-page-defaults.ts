/** Mirrors `common/home_page_defaults.py` PROGRAMS_PAGE_DATA. */

export type ProgramsPageProgram = {
    image: string;
    name: string;
    ageGroup: string;
    duration: string;
    description: string;
    features: string[];
};

export type ProgramsPageData = {
    hero: {
        badge: string;
        title_prefix: string;
        title_accent: string;
        subtitle: string;
        cta_label: string;
        cta_href: string;
    };
    programs: ProgramsPageProgram[];
};

const PROGRAM_DESCRIPTIONS = {
    playGroup:
        "At TimeKids Play Group, we provide a warm, safe, and joyful environment where toddlers begin their learning journey through play, exploration, and interaction. The Play Group program is a child's first step into a world beyond home, focusing on a smooth transition through a caring and playful atmosphere. Our educators nurture a love for discovery, helping children understand the world around them while strengthening their cognitive and social abilities.\n\nThe program focuses on developing social skills, sensory experiences, communication, and motor coordination through fun-filled activities, music, storytelling, and guided play. Our caring educators ensure that every child feels comfortable, confident, and emotionally secure while gradually adapting to a structured learning environment. We encourage curiosity, creativity, and independent expression, helping children build a strong foundation for future learning in a happy and nurturing atmosphere. It truly becomes a home away from home for your child.",
    nursery:
        "The Nursery program at TimeKids is designed to nurture curiosity, confidence, and early learning skills in young minds. At this stage, the focus shifts toward building a strong foundation in language, numbers, and self-expression. Through activity-based learning, children are introduced to language development, phonics, numbers, creative expression, and social interaction in an engaging and enjoyable manner.\n\nOur curriculum encourages children to explore, ask questions, and develop communication and thinking abilities through stories, music, art, games, and hands-on activities. Children are also introduced to pre-writing strokes of alphabets and numbers. Special emphasis is placed on emotional development, classroom participation, and building independence, helping children smoothly transition into structured academic learning with confidence and enthusiasm.",
    pp1:
        "The PP-1 program focuses on strengthening foundational academic and life skills through an interactive and child-friendly approach. Children are introduced to pre-reading, pre-writing, phonics, number concepts, logical thinking, and problem-solving activities that prepare them for advanced learning.\n\nThe curriculum promotes creativity, confidence, communication, and teamwork through experiential learning, role play, projects, and classroom activities. The PP-1 program is designed to expand a child's horizons from the classroom to the world around them. We nurture curious and interactive learners by encouraging them to ask questions and explore how and why.\n\nThe curriculum also focuses on building strong foundations in reading readiness, logical thinking, and environmental awareness. Our educators create a stimulating environment where every child is encouraged to explore their potential, develop independent thinking, and build the confidence required for formal schooling and lifelong learning.",
    pp2:
        "The PP-2 program prepares children for a smooth transition into primary school by building strong academic readiness and essential life skills. The curriculum focuses on reading readiness, writing skill development, vocabulary building, mathematical concepts, reasoning, creativity, and independent learning.\n\nAs the final preschool stage, the PP-2 program focuses on refining communication, independence, and core academic skills. Through engaging classroom activities, collaborative learning, and hands-on experiences, children develop confidence, communication abilities, and problem-solving skills.\n\nEqual importance is given to personality development, discipline, social interaction, and emotional growth, ensuring that children are well-prepared to confidently step into formal schooling with enthusiasm and a love for learning. Our graduates emerge as well-rounded individuals, equipped with the knowledge and social maturity needed to excel in any formal school environment.",
    summer:
        "At TimeKids, we offer two types of Summer Programs: Summer Camp and Refresher Course.\n\nSummer Camp provides a safe, caring, and stimulating environment where children feel secure, happy, and engaged throughout the program. It combines supervised care with age-appropriate learning activities, creative play, storytelling, music, indoor games, and social interaction to ensure holistic development.\n\nWith trained caregivers, child-friendly infrastructure, and a nurturing atmosphere, we focus on every child's emotional well-being, hygiene, comfort, and daily routine. The program is thoughtfully designed to support working parents while ensuring children enjoy a balanced day filled with learning, care, fun, and meaningful engagement.\n\nThe camp includes a healthy mix of rest, nutritious meals, and supervised play. We also offer enrichment activities such as creative hobbies, physical games, and interactive group activities to keep children active, productive, and happy. Whether exploring a new storybook or participating in team activities, children receive personalized attention that supports their emotional and social development until they are reunited with their parents.\n\nThe TimeKids Refresher Program focuses on improving writing readiness and confidence in young learners. Designed for children in the 3-4 years and 4-5 years age groups, the program includes pre-writing skills, writing improvement exercises, and activities that help children gain confidence in writing alphabets and numbers.\n\nThe program prepares children for a smooth and confident transition into PP-1 and PP-2 after the summer break. As the name suggests, the Refresher Program strengthens and refreshes the basics of writing skills, making children more confident, fluent, and comfortable with writing activities appropriate to their age group.",
};

export const DEFAULT_PROGRAMS_PAGE_DATA: ProgramsPageData = {
    hero: {
        badge: "Bright futures start here",
        title_prefix: "Our",
        title_accent: "Programs",
        subtitle: "Curiosity-led learning adventures for every stage of your child's magical early years.",
        cta_label: "Enroll Your Child",
        cta_href: "/admission",
    },
    programs: [
        {
            image: "/1.png",
            name: "Play Group",
            ageGroup: "Age group : 2-3 years",
            duration: "2-3 hours",
            description: PROGRAM_DESCRIPTIONS.playGroup,
            features: ["Smooth Transition Beyond Home", "Sensory & Guided Play", "Music and Storytelling", "Social and Motor Skills"],
        },
        {
            image: "/2 (1).png",
            name: "Nursery",
            ageGroup: "Age group : 3-4 years",
            duration: "3-4 hours",
            description: PROGRAM_DESCRIPTIONS.nursery,
            features: ["Language and Phonics", "Numbers and Pre-Writing", "Creative Expression", "Confidence and Independence"],
        },
        {
            image: "/2.png",
            name: "PP-1 / Junior KG / LKG",
            ageGroup: "Age group : 4-5 years",
            duration: "4-5 hours",
            description: PROGRAM_DESCRIPTIONS.pp1,
            features: ["Pre-Reading and Phonics", "Number Concepts", "Logical Thinking", "Projects and Role Play"],
        },
        {
            image: "/16.png",
            name: "PP-2 / Senior KG / UKG",
            ageGroup: "Age group : 5-6 years",
            duration: "4-5 hours",
            description: PROGRAM_DESCRIPTIONS.pp2,
            features: ["Reading and Writing Readiness", "Vocabulary and Maths", "Reasoning and Creativity", "Primary School Confidence"],
        },
        {
            image: "/day care.png",
            name: "Summer Programs",
            ageGroup: "Summer Camp and Refresher Course",
            duration: "Full Day",
            description: PROGRAM_DESCRIPTIONS.summer,
            features: ["Summer Camp", "Refresher Course", "Writing Readiness", "Care, Play, and Enrichment"],
        },
    ],
};

function deepMerge<T extends Record<string, unknown>>(base: T, patch: Partial<T> | null | undefined): T {
    if (!patch || typeof patch !== "object") return base;
    const out = { ...base } as T;
    for (const k of Object.keys(patch) as (keyof T)[]) {
        const pv = patch[k];
        const bv = base[k];
        if (pv !== undefined && typeof pv === "object" && pv !== null && !Array.isArray(pv) && typeof bv === "object" && bv !== null && !Array.isArray(bv)) {
            (out as Record<string, unknown>)[k as string] = deepMerge(bv as Record<string, unknown>, pv as Record<string, unknown>);
        } else if (pv !== undefined) {
            (out as Record<string, unknown>)[k as string] = pv as unknown;
        }
    }
    return out;
}

function canonicalProgramIndex(name: string, fallbackIndex: number): number {
    const value = name.trim().toLowerCase();
    if (value.includes("play group")) return 0;
    if (value.includes("nursery")) return 1;
    if (value.includes("pp-1") || value.includes("junior") || value.includes("lkg") || value.includes("pre-primary 1")) return 2;
    if (value.includes("pp-2") || value.includes("senior") || value.includes("ukg") || value.includes("pre-primary 2")) return 3;
    if (value.includes("summer") || value.includes("day care") || value.includes("refresher")) return 4;
    return fallbackIndex;
}

function normalizeProgram(program: ProgramsPageProgram, index: number): ProgramsPageProgram {
    const canonical = DEFAULT_PROGRAMS_PAGE_DATA.programs[canonicalProgramIndex(program.name, index)];
    if (!canonical) return program;
    return {
        ...canonical,
        image: program.image || canonical.image,
    };
}

export function mergeProgramsPageData(raw: Partial<ProgramsPageData> | null | undefined): ProgramsPageData {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) return DEFAULT_PROGRAMS_PAGE_DATA;
    try {
        const merged = deepMerge(DEFAULT_PROGRAMS_PAGE_DATA, raw as Partial<ProgramsPageData>);
        if (!Array.isArray(merged.programs)) merged.programs = DEFAULT_PROGRAMS_PAGE_DATA.programs;
        merged.programs = merged.programs
            .filter((p) => p && typeof p === "object")
            .map((p, index) =>
                normalizeProgram(
                    {
                        image: String((p as any).image || ""),
                        name: String((p as any).name || ""),
                        ageGroup: String((p as any).ageGroup || ""),
                        duration: String((p as any).duration || ""),
                        description: String((p as any).description || ""),
                        features: Array.isArray((p as any).features) ? (p as any).features.map((x: any) => String(x || "")).filter(Boolean) : [],
                    },
                    index,
                ),
            );
        return merged;
    } catch {
        return DEFAULT_PROGRAMS_PAGE_DATA;
    }
}

