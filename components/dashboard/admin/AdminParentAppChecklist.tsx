"use client";

import { useMemo } from "react";
import { Pencil, Upload } from "lucide-react";
import {
    PARENT_APP_DOCUMENT_CHECKLIST,
    type ParentAppDocumentSection,
} from "@/config/parent-app-document-checklist";
import {
    buildParentAppUploadContexts,
    type AdminParentAppUploadContext,
    type ParentDocumentForMatch,
} from "@/lib/admin-parent-app-upload";

function UploadRow({
    ctx,
    onManage,
}: {
    ctx: AdminParentAppUploadContext;
    onManage: (ctx: AdminParentAppUploadContext) => void;
}) {
    const uploaded = ctx.matchedDocId != null;

    return (
        <div className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-slate-900">{ctx.breadcrumbLabel}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {uploaded ? (
                        <span className="text-emerald-700">Uploaded — visible in parent app</span>
                    ) : (
                        <span className="text-amber-800">Not uploaded yet</span>
                    )}
                </p>
            </div>
            <button
                type="button"
                onClick={() => onManage(ctx)}
                className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 hover:bg-orange-100"
            >
                {uploaded ? (
                    <>
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Edit
                    </>
                ) : (
                    <>
                        <Upload className="h-3.5 w-3.5" aria-hidden />
                        Upload
                    </>
                )}
            </button>
        </div>
    );
}

function SectionBlock({
    section,
    contexts,
    onManage,
}: {
    section: ParentAppDocumentSection;
    contexts: AdminParentAppUploadContext[];
    onManage: (ctx: AdminParentAppUploadContext) => void;
}) {
    const rows = contexts.filter((c) => c.category === section.category && !c.id.startsWith("extra-"));
    const extras = contexts.filter((c) => c.category === section.category && c.id.startsWith("extra-"));

    if (rows.length === 0 && extras.length === 0) return null;

    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900">
                {section.title}
            </h2>
            <div className="px-4">
                {rows.map((ctx) => (
                    <UploadRow key={ctx.id} ctx={ctx} onManage={onManage} />
                ))}
                {extras.length > 0 ? (
                    <div className="border-t border-dashed border-slate-200 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Additional uploads in this section
                        </p>
                        {extras.map((ctx) => (
                            <UploadRow key={ctx.id} ctx={ctx} onManage={onManage} />
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export function AdminParentAppChecklist({
    docs,
    onManageLink,
}: {
    docs: ParentDocumentForMatch[];
    onManageLink: (ctx: AdminParentAppUploadContext) => void;
}) {
    const contexts = useMemo(
        () => buildParentAppUploadContexts(PARENT_APP_DOCUMENT_CHECKLIST, docs),
        [docs],
    );

    const extraSections = useMemo(() => {
        const known = new Set(PARENT_APP_DOCUMENT_CHECKLIST.map((s) => s.category));
        const orphanCats = Array.from(
            new Set(docs.map((d) => d.category).filter((c) => !known.has(c))),
        );
        return orphanCats.map((category) => ({
            id: `orphan-${category}`,
            title: category,
            category,
            slots: [],
        }));
    }, [docs]);

    const allSections = useMemo(
        () => [...PARENT_APP_DOCUMENT_CHECKLIST, ...extraSections],
        [extraSections],
    );

    return (
        <div className="space-y-4">
            {allSections.map((section) => (
                <SectionBlock
                    key={section.id}
                    section={section}
                    contexts={contexts}
                    onManage={onManageLink}
                />
            ))}
        </div>
    );
}
