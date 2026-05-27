"use client";

import { Upload } from "lucide-react";

export function ChecklistFileUploadField({
    id,
    accept,
    hint,
    required,
    currentName,
    onChange,
}: {
    id: string;
    accept?: string;
    hint: string;
    required?: boolean;
    currentName?: string | null;
    onChange: (file: File | null) => void;
}) {
    return (
        <div className="space-y-2">
            <label
                htmlFor={id}
                className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/60 px-4 py-6 text-center transition hover:border-orange-300 hover:bg-orange-50"
            >
                <Upload className="mb-2 h-8 w-8 text-orange-600" aria-hidden />
                <span className="text-sm font-semibold text-orange-900">
                    {currentName ? "Replace file" : "Choose file to upload"}
                </span>
                <span className="mt-1 text-xs text-slate-600">{hint}</span>
                {currentName ? (
                    <span className="mt-2 max-w-full truncate text-xs font-medium text-slate-800">{currentName}</span>
                ) : null}
            </label>
            <input
                id={id}
                type="file"
                accept={accept}
                required={required}
                className="sr-only"
                onChange={(e) => onChange(e.target.files?.[0] ?? null)}
            />
        </div>
    );
}
