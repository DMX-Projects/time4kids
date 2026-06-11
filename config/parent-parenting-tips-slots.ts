/** Fixed upload rows for Admin → Parent documents → Parenting Tips & Articles. */

export type ParentParentingTipsSlotDef = {
    id: string;
    title: string;
    order: number;
};

export const PARENT_PARENTING_TIPS_UPLOAD_SLOTS: ParentParentingTipsSlotDef[] = [
    { id: "parenting-tips-never-say-to-kids", title: "5Things You Should Never Say To Your Kids", order: 0 },
    {
        id: "parenting-tips-toddler-mistakes",
        title: "8-Mistakes-to-Avoid-With-Your-Toddler-Nov-2014",
        order: 1,
    },
    { id: "parenting-tips-june-2013", title: "Article_for_June_2013", order: 2 },
    { id: "parenting-tips-fussy-eaters", title: "Fussy_eaters", order: 3 },
    {
        id: "parenting-tips-i-am-bored",
        title: "I Am Bored What Your Child Is Really Telling You",
        order: 4,
    },
    { id: "parenting-tips-learning-senses", title: "Learning_Through_Senses", order: 5 },
    { id: "parenting-tips-teach-children", title: "Teach-Our-Children", order: 6 },
    { id: "parenting-tips-safe-diwali", title: "Tips-For-Safe Diwali", order: 7 },
];
