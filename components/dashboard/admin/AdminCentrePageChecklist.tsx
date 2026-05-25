"use client";

import { useMemo } from "react";
import { Pencil, Trash2, Upload } from "lucide-react";
import { ChecklistAddMenu } from "@/components/dashboard/admin/ChecklistAddMenu";
import type {
    CenterPageLink,
    CenterPageNestedBlock,
    CenterPageSubsection,
    CenterPageTopItem,
} from "@/config/franchise-center-page-nav";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import {
    groupFranchiseHubDocsByCategory,
    groupFranchiseHubDocsBySourcePath,
    resolveCenterPageLinks,
} from "@/lib/franchise-center-page-links";
import {
    buildAdminUploadContext,
    type AdminCenterPageUploadContext,
} from "@/lib/admin-center-page-upload";
import { isCustomLinkRow, type CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";

export type CentrePageAddKind = "subsection" | "nested" | "link" | "topSection";

export type CentrePageAddRequest = {
    kind: CentrePageAddKind;
    anchor: CentrePageLinkAnchor;
};

export type CentrePageRemoveKind = "topSection" | "subsection" | "nested" | "link";

export type CentrePageRemoveRequest = {
    kind: CentrePageRemoveKind;
    anchor: CentrePageLinkAnchor;
    rowKey?: string;
    /** Set when ``kind === "link"`` (label shown in confirm dialog). */
    linkLabel?: string;
};

function HeadingBar({
    title,
    level,
    addOptions,
    onAdd,
    onRemove,
    removeLabel = "Remove",
}: {
    title: string;
    level: "top" | "group" | "nested";
    addOptions: { kind: CentrePageAddKind; label: string }[];
    onAdd: (kind: CentrePageAddKind) => void;
    onRemove?: () => void;
    removeLabel?: string;
}) {
    const styles = {
        top: "bg-slate-50 text-base font-semibold text-slate-900 border-b border-slate-100",
        group: "bg-slate-50/80 text-sm font-semibold text-slate-800 border-b border-slate-100",
        nested: "text-sm font-semibold text-orange-800 border-b border-dashed border-slate-100",
    };

    return (
        <div
            className={`flex items-center justify-between gap-3 px-4 py-2.5 ${styles[level]} ${level === "nested" ? "pl-8" : level === "group" ? "pl-6" : ""}`}
        >
            <span className="min-w-0 truncate">{title}</span>
            <div className="flex shrink-0 items-center gap-2">
                {onRemove ? (
                    <button
                        type="button"
                        onClick={onRemove}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        {removeLabel}
                    </button>
                ) : null}
                {addOptions.length > 0 ? (
                    <ChecklistAddMenu options={addOptions} onPick={onAdd} sectionTitle={title} />
                ) : null}
            </div>
        </div>
    );
}

function AdminUploadRow({
    ctx,
    onManage,
    onRemoveLink,
    indent = false,
}: {
    ctx: AdminCenterPageUploadContext;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onRemoveLink?: () => void;
    indent?: boolean;
}) {
    const uploaded = ctx.matchedDocId != null;

    return (
        <div
            className={`flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between ${indent ? "pl-8 pr-4" : "px-4"}`}
        >
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug text-slate-900">{ctx.breadcrumbLabel}</p>
                <p className="mt-0.5 text-xs text-slate-500">
                    {uploaded ? (
                        <span className="text-emerald-700">Uploaded to database</span>
                    ) : (
                        <span className="text-amber-800">Not uploaded yet</span>
                    )}
                    {ctx.sourcePath ? (
                        <>
                            {" "}
                            · <span className="font-mono">{ctx.sourcePath}</span>
                        </>
                    ) : null}
                </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {onRemoveLink ? (
                    <button
                        type="button"
                        onClick={onRemoveLink}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-50"
                    >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden />
                        Remove
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

function LinkRowsBlock({
    links,
    topTitle,
    topId,
    groupTitle,
    nestedTitle,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
    onRemoveRequest,
    canRemoveLink,
}: {
    links: CenterPageLink[];
    topTitle: string;
    topId: string;
    groupTitle?: string;
    nestedTitle?: string;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    canRemoveLink?: (rowKey?: string) => boolean;
}) {
    const resolved = resolveCenterPageLinks(links, hubDocsByCategory, hubDocsBySourcePath);
    const rows = links
        .map((link, i) =>
            buildAdminUploadContext({
                topTitle,
                groupTitle,
                nestedTitle,
                link,
                matchedDocId: resolved[i]?.franchiseHubDocId,
            }),
        )
        .filter((ctx): ctx is AdminCenterPageUploadContext => ctx != null);

    if (rows.length === 0) return null;

    return (
        <>
            {rows.map((ctx, i) => {
                const link = links[i];
                const removable = canRemoveLink?.(ctx.rowKey ?? link?.rowKey) ?? false;
                return (
                    <AdminUploadRow
                        key={ctx.rowKey ?? ctx.breadcrumbLabel}
                        ctx={ctx}
                        onManage={onManage}
                        onRemoveLink={
                            removable && onRemoveRequest
                                ? () =>
                                      onRemoveRequest({
                                          kind: "link",
                                          anchor: {
                                              topId,
                                              topTitle,
                                              groupTitle,
                                              nestedTitle,
                                          },
                                          rowKey: ctx.rowKey ?? link?.rowKey,
                                          linkLabel: ctx.linkLabel,
                                      })
                                : undefined
                        }
                        indent
                    />
                );
            })}
        </>
    );
}

function NestedBlock({
    block,
    item,
    group,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
    onAddRequest,
    onRemoveRequest,
    canRemoveNested,
}: {
    block: CenterPageNestedBlock;
    item: CenterPageTopItem;
    group: CenterPageSubsection;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    canRemoveNested?: (anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string }) => boolean;
}) {
    const anchor: CentrePageLinkAnchor = {
        topId: item.id,
        topTitle: item.title,
        groupTitle: group.title,
        nestedTitle: block.title,
    };

    return (
        <div>
            <HeadingBar
                title={block.title}
                level="nested"
                addOptions={[{ kind: "link", label: "Add file / link" }]}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRemove={
                    canRemoveNested?.(anchor as CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string })
                        ? () => onRemoveRequest?.({ kind: "nested", anchor })
                        : undefined
                }
                removeLabel="Remove nested"
            />
            <LinkRowsBlock
                links={block.links}
                topId={item.id}
                topTitle={item.title}
                groupTitle={group.title}
                nestedTitle={block.title}
                hubDocsByCategory={hubDocsByCategory}
                hubDocsBySourcePath={hubDocsBySourcePath}
                onManage={onManage}
                onRemoveRequest={onRemoveRequest}
                canRemoveLink={isCustomLinkRow}
            />
        </div>
    );
}

function GroupBlock({
    group,
    item,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
    onAddRequest,
    onRemoveRequest,
    canRemoveGroup,
    canRemoveNested,
}: {
    group: CenterPageSubsection;
    item: CenterPageTopItem;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    canRemoveGroup?: (anchor: CentrePageLinkAnchor & { groupTitle: string }) => boolean;
    canRemoveNested?: (anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string }) => boolean;
}) {
    const anchor: CentrePageLinkAnchor = {
        topId: item.id,
        topTitle: item.title,
        groupTitle: group.title,
    };
    const hasNested = Array.isArray(group.nested) && group.nested.length > 0;

    return (
        <div className="border-t border-slate-100 first:border-t-0">
            <HeadingBar
                title={group.title}
                level="group"
                addOptions={[
                    { kind: "nested", label: "Add nested section" },
                    { kind: "link", label: "Add file / link" },
                ]}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRemove={
                    canRemoveGroup?.(anchor as CentrePageLinkAnchor & { groupTitle: string })
                        ? () => onRemoveRequest?.({ kind: "subsection", anchor })
                        : undefined
                }
                removeLabel="Remove subsection"
            />
            {group.nested?.map((block) => (
                <NestedBlock
                    key={`${group.title}::${block.title}`}
                    block={block}
                    item={item}
                    group={group}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onManage={onManage}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    canRemoveNested={canRemoveNested}
                />
            ))}
            {group.links && group.links.length > 0 ? (
                <LinkRowsBlock
                    links={group.links}
                    topId={item.id}
                    topTitle={item.title}
                    groupTitle={group.title}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onManage={onManage}
                    onRemoveRequest={onRemoveRequest}
                    canRemoveLink={isCustomLinkRow}
                />
            ) : !hasNested ? (
                <p className="px-8 py-2 text-xs text-slate-400">No files yet — use Add to add a link.</p>
            ) : null}
        </div>
    );
}

function SectionBlock({
    item,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
    onAddRequest,
    onRemoveRequest,
    isCustomTop,
    canRemoveGroup,
    canRemoveNested,
}: {
    item: CenterPageTopItem;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    isCustomTop?: boolean;
    canRemoveGroup?: (anchor: CentrePageLinkAnchor & { groupTitle: string }) => boolean;
    canRemoveNested?: (anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string }) => boolean;
}) {
    const anchor: CentrePageLinkAnchor = { topId: item.id, topTitle: item.title };
    const hasGroups = item.groups.length > 0;
    const hasDirect = (item.directLinks?.length ?? 0) > 0;
    const isEmpty = !hasGroups && !hasDirect;

    if (isEmpty && !isCustomTop && !onAddRequest) return null;

    const topAddOptions: { kind: CentrePageAddKind; label: string }[] = [
        { kind: "subsection", label: "Add subsection" },
        { kind: "link", label: "Add file / link" },
    ];

    return (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <HeadingBar
                title={item.title}
                level="top"
                addOptions={onAddRequest ? topAddOptions : []}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRemove={
                    isCustomTop ? () => onRemoveRequest?.({ kind: "topSection", anchor }) : undefined
                }
                removeLabel="Remove section"
            />

            {item.directLinks && item.directLinks.length > 0 ? (
                <LinkRowsBlock
                    links={item.directLinks}
                    topId={item.id}
                    topTitle={item.title}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onManage={onManage}
                    onRemoveRequest={onRemoveRequest}
                    canRemoveLink={isCustomLinkRow}
                />
            ) : null}

            {item.groups.map((group) => (
                <GroupBlock
                    key={`${item.id}::${group.title}`}
                    group={group}
                    item={item}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onManage={onManage}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    canRemoveGroup={canRemoveGroup}
                    canRemoveNested={canRemoveNested}
                />
            ))}

            {isEmpty && onAddRequest ? (
                <p className="px-4 py-3 text-xs text-slate-500">
                    No subsections yet — click <strong>Add</strong> to add a subsection or file.
                </p>
            ) : null}
        </section>
    );
}

export function AdminCentrePageChecklist({
    sections,
    hubDocs,
    onManageLink,
    onAddRequest,
    onRemoveRequest,
    isCustomTop,
    canRemoveGroup,
    canRemoveNested,
}: {
    sections: CenterPageTopItem[][];
    hubDocs: FranchiseHubDoc[];
    onManageLink: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    isCustomTop?: (topId: string) => boolean;
    canRemoveGroup?: (anchor: CentrePageLinkAnchor & { groupTitle: string }) => boolean;
    canRemoveNested?: (anchor: CentrePageLinkAnchor & { groupTitle: string; nestedTitle: string }) => boolean;
}) {
    const hubDocsByCategory = useMemo(() => groupFranchiseHubDocsByCategory(hubDocs), [hubDocs]);
    const hubDocsBySourcePath = useMemo(() => groupFranchiseHubDocsBySourcePath(hubDocs), [hubDocs]);

    const allItems = useMemo(() => sections.flat(), [sections]);

    return (
        <div className="space-y-4">
            {allItems.map((item) => (
                <SectionBlock
                    key={item.id}
                    item={item}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onManage={onManageLink}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    isCustomTop={isCustomTop?.(item.id)}
                    canRemoveGroup={canRemoveGroup}
                    canRemoveNested={canRemoveNested}
                />
            ))}
        </div>
    );
}
