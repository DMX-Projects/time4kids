"use client";

import type { SendToForm, SendToMode, SendToStudent } from "@/lib/manual-notification-send-to";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

const selectClass =
    "mt-1 w-full rounded-xl border border-[#E5E7EB] px-3 py-2 text-sm bg-white disabled:bg-slate-50";

type Props = {
    value: SendToForm;
    onChange: (next: SendToForm) => void;
    classOptions: string[];
    students: SendToStudent[];
    disabled?: boolean;
    allowClassStudent?: boolean;
    studentsLoading?: boolean;
};

export function ManualNotificationSendToFields({
    value,
    onChange,
    classOptions,
    students,
    disabled = false,
    allowClassStudent = true,
    studentsLoading = false,
}: Props) {
    const setMode = (mode: SendToMode) => {
        onChange({
            mode,
            class_name: mode === "class" ? value.class_name : "",
            student: mode === "student" ? value.student : "",
        });
    };

    const studentOptions = students.map((student) => ({
        value: String(student.id),
        label: `${student.full_name} (${student.class_name})`,
    }));

    const classSelectOptions = classOptions.map((className) => ({
        value: className,
        label: className,
    }));

    return (
        <div className="mt-1 space-y-2">
            <select
                value={allowClassStudent ? value.mode : "all"}
                onChange={(e) => setMode(e.target.value as SendToMode)}
                disabled={disabled || !allowClassStudent}
                className={selectClass}
            >
                <option value="all">All parents</option>
                {allowClassStudent ? <option value="class">Classes</option> : null}
                {allowClassStudent ? <option value="student">Students</option> : null}
            </select>

            {allowClassStudent && value.mode === "class" ? (
                <SearchableSelect
                    value={value.class_name}
                    onChange={(class_name) => onChange({ ...value, class_name })}
                    options={classSelectOptions}
                    placeholder="Select class"
                    searchPlaceholder="Search class…"
                    disabled={disabled}
                    emptyMessage="No class matches your search."
                />
            ) : null}

            {allowClassStudent && value.mode === "student" ? (
                <SearchableSelect
                    value={value.student}
                    onChange={(student) => onChange({ ...value, student })}
                    options={studentOptions}
                    placeholder="Select student"
                    searchPlaceholder="Search student name or class…"
                    disabled={disabled}
                    loading={studentsLoading}
                    emptyMessage={studentsLoading ? "Loading students…" : "No student matches your search."}
                />
            ) : null}
        </div>
    );
}
