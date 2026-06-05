"use client";

import { Newspaper } from "lucide-react";
import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";
import {
    PARENT_NEWSLETTER_CATEGORY,
    PARENT_NEWSLETTER_DESCRIPTION,
    PARENT_NEWSLETTER_EMPTY_MESSAGE,
    PARENT_NEWSLETTER_LABEL,
} from "@/config/parent-newsletter";

export default function NewsletterPage() {
    return (
        <ParentDocList
            category={PARENT_NEWSLETTER_CATEGORY}
            title={PARENT_NEWSLETTER_LABEL}
            description={PARENT_NEWSLETTER_DESCRIPTION}
            emptyMessage={PARENT_NEWSLETTER_EMPTY_MESSAGE}
            headerIcon={<Newspaper className="w-5 h-5" />}
        />
    );
}
