"use client";

import { useState } from "react";
import {
    Archive,
    ChevronRight,
    File,
    FileImage,
    FileSpreadsheet,
    FileText,
    Headphones,
    Presentation,
    Video,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    franchiseResourceIconWrapClasses,
    franchiseResourceRowAccentClasses,
    getFranchiseResourceFileMeta,
    type FranchiseResourceFileKind,
} from "@/lib/franchise-resource-file-meta";
import { openFranchiseHubDocumentBlobInNewTab } from "@/lib/franchise-hub-document-open";

export type FranchiseHubDoc = {
    id: number;
    category?: string;
    source_path?: string | null;
    title: string;
    description: string;
    file: string;
    display_title?: string;
    academic_year?: string;
};

function KindIcon({ kind, className }: { kind: FranchiseResourceFileKind; className?: string }) {
    const cn = className ?? "w-5 h-5";
    switch (kind) {
        case "archive":
            return <Archive className={cn} aria-hidden />;
        case "video":
            return <Video className={cn} aria-hidden />;
        case "audio":
            return <Headphones className={cn} aria-hidden />;
        case "pdf":
            return <FileText className={cn} aria-hidden />;
        case "image":
            return <FileImage className={cn} aria-hidden />;
        case "spreadsheet":
            return <FileSpreadsheet className={cn} aria-hidden />;
        case "document":
            return <FileText className={cn} aria-hidden />;
        case "presentation":
            return <Presentation className={cn} aria-hidden />;
        default:
            return <File className={cn} aria-hidden />;
    }
}

export function FranchiseResourceFileRow({ doc }: { doc: FranchiseHubDoc }) {
    const { authFetchBlob } = useAuth();
    const [opening, setOpening] = useState(false);
    const meta = getFranchiseResourceFileMeta(doc.file);
    const title = doc.display_title || doc.title;
    const iconWrap = franchiseResourceIconWrapClasses(meta.kind);
    const btn = franchiseResourceRowAccentClasses(meta.kind);

    const openAuthenticated = async () => {
        if (!doc.id || opening) return;
        setOpening(true);
        try {
            const blob = await authFetchBlob(`/documents/franchise/documents/${doc.id}/file/`);
            openFranchiseHubDocumentBlobInNewTab(blob);
        } catch (e) {
            window.alert(e instanceof Error ? e.message : "Could not open document.");
        } finally {
            setOpening(false);
        }
    };

    if (!doc.file) {
        return (
            <div className="flex flex-wrap items-start justify-between gap-4 border border-[#E5E7EB] rounded-2xl p-4 bg-white">
                <div className="flex gap-3 min-w-0">
                    <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
                        aria-hidden
                    >
                        <File className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827]">{title}</p>
                        {doc.description ? <p className="text-xs text-[#6B7280] mt-1">{doc.description}</p> : null}
                        <p className="text-xs text-amber-700 mt-2">No file attached yet.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-start justify-between gap-4 border border-[#E5E7EB] rounded-2xl p-4 bg-white shadow-sm">
            <div className="flex gap-3 min-w-0 flex-1">
                <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconWrap}`}
                    aria-hidden
                >
                    <KindIcon kind={meta.kind} />
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                        <p className="text-sm font-semibold text-[#111827]">{title}</p>
                        <span className="inline-flex items-center rounded-md border border-[#E5E7EB] bg-[#F9FAFB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#4B5563]">
                            {meta.extLabel}
                        </span>
                    </div>
                    {doc.description ? <p className="text-xs text-[#6B7280] mt-1">{doc.description}</p> : null}
                    {doc.academic_year ? (
                        <p className="text-[11px] text-[#9CA3AF] mt-1">Academic year: {doc.academic_year}</p>
                    ) : null}
                </div>
            </div>

            <button
                type="button"
                onClick={() => void openAuthenticated()}
                disabled={opening}
                className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 ${btn}`}
            >
                {opening ? "Opening…" : meta.actionLabel}
                <ChevronRight className="w-4 h-4 opacity-90" aria-hidden />
            </button>
        </div>
    );
}
