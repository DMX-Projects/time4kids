"use client";

import { useMemo } from "react";
import { Pencil, Trash2, Upload } from "lucide-react";
import { ChecklistAddMenu } from "@/components/dashboard/admin/ChecklistAddMenu";
import {
    type ParentAppDocumentSection,
} from "@/config/parent-app-document-checklist";
import {
    buildParentAppUploadContexts,
    type AdminParentAppUploadContext,
    type ParentDocumentForMatch,
} from "@/lib/admin-parent-app-upload";
import { mergeParentAppChecklist } from "@/lib/parent-app-nav-custom";

export type ParentAppAddKind = "document" | "centreDocument";

export type ParentAppAddRequest = {
    kind: ParentAppAddKind;
    section: ParentAppDocumentSection;
};

const PARENT_APP_ADD_OPTIONS: { kind: ParentAppAddKind; label: string }[] = [
    { kind: "document", label: "Add another file (all centres)" },
    { kind: "centreDocument", label: "Add another file (one centre)" },
];

export type ParentAppRenameRequest = import("@/lib/parent-app-nav-custom").ParentAppRenameTarget;

function UploadRow({
    ctx,
    onManage,
    onDeleteUpload,
    onRename,
}: {
    ctx: AdminParentAppUploadContext;
    onManage: (ctx: AdminParentAppUploadContext) => void;
    onDeleteUpload?: (ctx: AdminParentAppUploadContext) => void;
    onRename?: () => void;
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
                        <span className="text-amber-800">Not uploaded yet — click Upload</span>
                    )}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {onRename && !ctx.id.startsWith("extra-") ? (
                    <button
                        type="button"
                        onClick={onRename}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Rename
                    </button>
                ) : null}
                {uploaded && onDeleteUpload ? (
                    <button
                        type="button"
                        onClick={() => onDeleteUpload(ctx)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Delete
                    </button>
                ) : null}
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
        </div>
    );
}

function SectionBlock({
    section,
    contexts,
    onManage,
    onDeleteUpload,
    onAddRequest,
    onRenameRequest,
}: {
    section: ParentAppDocumentSection;
    contexts: AdminParentAppUploadContext[];
    onManage: (ctx: AdminParentAppUploadContext) => void;
    onDeleteUpload?: (ctx: AdminParentAppUploadContext) => void;
    onAddRequest?: (req: ParentAppAddRequest) => void;
    onRenameRequest?: (req: ParentAppRenameRequest) => void;
}) {
    const rows = contexts.filter((c) => c.category === section.category && !c.id.startsWith("extra-"));
    const extras = contexts.filter((c) => c.category === section.category && c.id.startsWith("extra-"));

    if (rows.length === 0 && extras.length === 0 && !onAddRequest) return null;

    return (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5">
                <h2 className="min-w-0 truncate text-base font-semibold text-slate-900">{section.title}</h2>
                <div className="flex shrink-0 items-center gap-2">
                    {onRenameRequest ? (
                        <button
                            type="button"
                            onClick={() =>
                                onRenameRequest({
                                    kind: "section",
                                    sectionId: section.id,
                                    currentTitle: section.title,
                                })
                            }
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            <Pencil className="h-3.5 w-3.5" aria-hidden />
                            Rename
                        </button>
                    ) : null}
                    {onAddRequest ? (
                        <ChecklistAddMenu
                            options={PARENT_APP_ADD_OPTIONS}
                            onPick={(kind) => onAddRequest({ kind, section })}
                            sectionTitle={section.title}
                        />
                    ) : null}
                </div>
            </div>
            <div className="px-4">
                {rows.map((ctx) => (
                    <UploadRow
                        key={ctx.id}
                        ctx={ctx}
                        onManage={onManage}
                        onDeleteUpload={onDeleteUpload}
                        onRename={
                            onRenameRequest
                                ? () =>
                                      onRenameRequest({
                                          kind: "slot",
                                          slotId: ctx.id,
                                          currentTitle: ctx.breadcrumbLabel.split(" › ").pop() || ctx.breadcrumbLabel,
                                      })
                                : undefined
                        }
                    />
                ))}
                {extras.length > 0 ? (
                    <div className="border-t border-dashed border-slate-200 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Additional uploads in this section
                        </p>
                        {extras.map((ctx) => (
                            <UploadRow key={ctx.id} ctx={ctx} onManage={onManage} onDeleteUpload={onDeleteUpload} />
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export function AdminParentAppChecklist({
    docs,
    sections = mergeParentAppChecklist(null),
    onManageLink,
    onDeleteUpload,
    onAddRequest,
    onRenameRequest,
}: {
    docs: ParentDocumentForMatch[];
    sections?: ParentAppDocumentSection[];
    onManageLink: (ctx: AdminParentAppUploadContext) => void;
    onDeleteUpload?: (ctx: AdminParentAppUploadContext) => void;
    onAddRequest?: (req: ParentAppAddRequest) => void;
    onRenameRequest?: (req: ParentAppRenameRequest) => void;
}) {
    const contexts = useMemo(
        () => buildParentAppUploadContexts(sections, docs),
        [sections, docs],
    );

    const extraSections = useMemo(() => {
        const known = new Set(sections.map((s) => s.category));
        const orphanCats = Array.from(
            new Set(docs.map((d) => d.category).filter((c) => !known.has(c))),
        );
        return orphanCats.map((category) => ({
            id: `orphan-${category}`,
            title: category,
            category,
            slots: [],
        }));
    }, [docs, sections]);

    const allSections = useMemo(
        () => [...sections, ...extraSections],
        [sections, extraSections],
    );

    return (
        <div className="space-y-4">
            {allSections.map((section) => (
                <SectionBlock
                    key={section.id}
                    section={section}
                    contexts={contexts}
                    onManage={onManageLink}
                    onDeleteUpload={onDeleteUpload}
                    onAddRequest={onAddRequest}
                    onRenameRequest={onRenameRequest}
                />
            ))}
        </div>
    );
}
