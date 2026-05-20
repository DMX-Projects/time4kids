"use client";

import { useId } from "react";
import { FolderOpen, Files } from "lucide-react";
import { collectLocalUploadFiles } from "@/lib/franchise-parent-upload";

type Props = {
    files: File[];
    onFilesChange: (files: File[]) => void;
    accept?: string;
    disabled?: boolean;
    hint?: string;
};

export function FranchiseLocalFolderPicker({ files, onFilesChange, accept, disabled, hint }: Props) {
    const fileInputId = useId();
    const folderInputId = useId();
    const mergeFiles = (incoming: FileList | null) => {
        const next = collectLocalUploadFiles(incoming);
        if (!next.length) return;
        const seen = new Set(files.map((f) => `${f.name}|${f.size}|${f.lastModified}`));
        const merged = [...files];
        for (const f of next) {
            const key = `${f.name}|${f.size}|${f.lastModified}`;
            if (!seen.has(key)) {
                seen.add(key);
                merged.push(f);
            }
        }
        onFilesChange(merged);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <label
                    htmlFor={fileInputId}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-4 py-2 text-sm font-semibold text-[#1F2937] hover:bg-[#FFF7ED] ${disabled ? "pointer-events-none opacity-50" : ""}`}
                >
                    <Files className="h-4 w-4 text-[#FF922B]" />
                    Choose files
                </label>
                <label
                    htmlFor={folderInputId}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#FF922B] bg-[#FFF7ED] px-4 py-2 text-sm font-semibold text-[#9A3412] hover:bg-[#FFEDD5] ${disabled ? "pointer-events-none opacity-50" : ""}`}
                >
                    <FolderOpen className="h-4 w-4" />
                    Choose folder
                </label>
                {files.length > 0 && (
                    <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onFilesChange([])}
                        className="text-xs font-semibold text-red-600 px-2 py-2"
                    >
                        Clear all ({files.length})
                    </button>
                )}
            </div>

            <input
                id={fileInputId}
                type="file"
                multiple
                accept={accept}
                className="sr-only"
                disabled={disabled}
                onChange={(e) => {
                    mergeFiles(e.target.files);
                    e.target.value = "";
                }}
            />
            <input
                id={folderInputId}
                type="file"
                multiple
                className="sr-only"
                disabled={disabled}
                {...({
                    webkitdirectory: "",
                    directory: "",
                    mozdirectory: "",
                } as React.InputHTMLAttributes<HTMLInputElement>)}
                onChange={(e) => {
                    mergeFiles(e.target.files);
                    e.target.value = "";
                }}
            />

            <p className="text-[11px] text-[#6B7280] leading-relaxed">
                {hint ||
                    "Pick any files or an entire folder from your computer (Windows/Mac). Subfolders are included when you choose a folder."}
            </p>

            {files.length > 0 && (
                <ul className="max-h-40 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] p-2 text-xs text-[#374151] space-y-1">
                    {files.slice(0, 80).map((f, i) => (
                        <li key={`${f.name}-${i}`} className="truncate font-mono">
                            {(f as File & { webkitRelativePath?: string }).webkitRelativePath || f.name}
                            <span className="text-[#9CA3AF]"> ({(f.size / 1024).toFixed(0)} KB)</span>
                        </li>
                    ))}
                    {files.length > 80 && <li className="text-[#6B7280]">…and {files.length - 80} more</li>}
                </ul>
            )}
        </div>
    );
}
