"use client";

import { ParentDocList } from "@/components/dashboard/parent/ParentDocList";

export default function PreschoolPoliciesPage() {
    return (
        <ParentDocList
            category="PRESCHOOL_POLICIES"
            title="Preschool policies"
            description="Guidelines, rules, and standard operating procedures from your centre (PDFs)."
            emptyMessage="No policy documents yet. Your centre can upload PDFs under Parent resources → Preschool policies."
        />
    );
}
