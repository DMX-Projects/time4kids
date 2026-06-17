"use client";

import { Users } from "lucide-react";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

type Props = {
    /** Compact styling for page sections (vs global header). */
    variant?: "header" | "inline";
    className?: string;
};

export function ParentChildSwitcher({ variant = "header", className = "" }: Props) {
    const { linkedStudents, selectedStudentId, setSelectedStudentId, hasMultipleChildren, selectedStudent } =
        useParentData();

    if (!hasMultipleChildren) return null;

    const selectClass =
        variant === "header"
            ? "rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-[#1F2937] focus:border-orange-400 focus:outline-none max-w-[12rem] sm:max-w-xs"
            : "rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-medium text-[#1F2937] focus:border-orange-400 focus:outline-none max-w-xs";

    return (
        <label
            className={`inline-flex items-center gap-2 min-w-0 ${className}`}
            aria-label="Switch child"
        >
            <Users className="w-4 h-4 text-orange-500 shrink-0" aria-hidden />
            <span className="hidden md:inline text-xs font-semibold text-[#374151] shrink-0">Viewing:</span>
            <select
                value={selectedStudentId ?? ""}
                onChange={(e) => setSelectedStudentId(e.target.value || null)}
                className={selectClass}
            >
                {linkedStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                        {s.name}
                        {s.grade ? ` · ${s.grade}` : ""}
                    </option>
                ))}
            </select>
            {variant === "inline" && selectedStudent ? (
                <span className="text-xs text-orange-700 hidden sm:inline truncate">{selectedStudent.grade}</span>
            ) : null}
        </label>
    );
}
