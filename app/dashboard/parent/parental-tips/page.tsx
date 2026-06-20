"use client";

import { Lightbulb } from "lucide-react";
import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";
import {
    PARENT_PARENTAL_TIPS_CATEGORY,
    PARENT_PARENTAL_TIPS_DESCRIPTION,
    PARENT_PARENTAL_TIPS_EMPTY_MESSAGE,
    PARENT_PARENTAL_TIPS_LABEL,
} from "@/config/parent-parental-tips";

export default function ParentalTipsPage() {
    return (
        <ParentDocList
            category={PARENT_PARENTAL_TIPS_CATEGORY}
            title={PARENT_PARENTAL_TIPS_LABEL}
            description={PARENT_PARENTAL_TIPS_DESCRIPTION}
            emptyMessage={PARENT_PARENTAL_TIPS_EMPTY_MESSAGE}
            headerIcon={<Lightbulb className="w-5 h-5" />}
        />
    );
}
