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
    applyResolvedLinkLookup,
    buildResolvedLinkLookup,
    groupFranchiseHubDocsByCategory,
    groupFranchiseHubDocsBySourcePath,
    linkResolutionKey,
    type ResolvedLinkMeta,
} from "@/lib/franchise-center-page-links";

export type CentrePageLinkLookupBuilder = (
    item: CenterPageTopItem,
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>,
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>,
) => Map<string, ResolvedLinkMeta>;
import {
    buildAdminUploadContext,
    type AdminCenterPageUploadContext,
} from "@/lib/admin-center-page-upload";
import { linkIdFromCustomRowKey, rowKeyForChecklistLink, type CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";

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

export type CentrePageRenameRequest = import("@/lib/centre-page-nav-custom").CentrePageRenameTarget;

function DeleteIconButton({ onClick, title = "Delete" }: { onClick: () => void; title?: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-800 hover:bg-red-50"
            title={title}
            aria-label={title}
        >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
        </button>
    );
}

function HeadingBar({
    title,
    level,
    addOptions,
    onAdd,
    onDelete,
    onRename,
}: {
    title: string;
    level: "top" | "group" | "nested";
    addOptions: { kind: CentrePageAddKind; label: string }[];
    onAdd: (kind: CentrePageAddKind) => void;
    onDelete?: () => void;
    onRename?: () => void;
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
                {onRename ? (
                    <button
                        type="button"
                        onClick={onRename}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        title="Rename"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Rename
                    </button>
                ) : null}
                {onDelete ? <DeleteIconButton onClick={onDelete} title="Delete section" /> : null}
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
    onDeleteUpload,
    onRemoveLink,
    onRenameLink,
    indent = false,
}: {
    ctx: AdminCenterPageUploadContext;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onRemoveLink?: () => void;
    onRenameLink?: () => void;
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
                        <span className="text-amber-800">Not uploaded yet — click Upload</span>
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
                {onRenameLink ? (
                    <button
                        type="button"
                        onClick={onRenameLink}
                        className="inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                        <Pencil className="h-3.5 w-3.5" aria-hidden />
                        Rename
                    </button>
                ) : null}
                {(uploaded && onDeleteUpload) || (!uploaded && onRemoveLink) ? (
                    <DeleteIconButton
                        title={uploaded ? "Delete uploaded file" : "Delete row"}
                        onClick={() => {
                            if (uploaded && onDeleteUpload) onDeleteUpload(ctx);
                            else if (onRemoveLink) onRemoveLink();
                        }}
                    />
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
    linkLookup,
    onManage,
    onDeleteUpload,
    onRemoveRequest,
    onRenameRequest,
    canRemoveLink,
}: {
    links: CenterPageLink[];
    topTitle: string;
    topId: string;
    groupTitle?: string;
    nestedTitle?: string;
    linkLookup: Map<string, ResolvedLinkMeta>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    onRenameRequest?: (req: CentrePageRenameRequest) => void;
    canRemoveLink?: (rowKey?: string) => boolean;
}) {
    const rows = links
        .map((link) =>
            buildAdminUploadContext({
                topTitle,
                groupTitle,
                nestedTitle,
                link,
                matchedDocId: linkLookup.get(linkResolutionKey(link))?.franchiseHubDocId,
            }),
        )
        .filter((ctx): ctx is AdminCenterPageUploadContext => ctx != null);

    if (rows.length === 0) return null;

    return (
        <>
            {rows.map((ctx, i) => {
                const link = links[i];
                const removable = onRemoveRequest
                    ? canRemoveLink
                        ? canRemoveLink(ctx.rowKey ?? link?.rowKey)
                        : true
                    : false;
                const rowKey = ctx.rowKey ?? link?.rowKey ?? rowKeyForChecklistLink(link);
                return (
                    <AdminUploadRow
                        key={ctx.rowKey ?? ctx.breadcrumbLabel}
                        ctx={ctx}
                        onManage={onManage}
                        onDeleteUpload={onDeleteUpload}
                        onRenameLink={
                            onRenameRequest
                                ? () =>
                                      onRenameRequest({
                                          kind: "link",
                                          anchor: {
                                              topId,
                                              topTitle,
                                              groupTitle,
                                              nestedTitle,
                                          },
                                          rowKey,
                                          linkId: linkIdFromCustomRowKey(rowKey),
                                          currentTitle: ctx.linkLabel,
                                      })
                                : undefined
                        }
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
    linkLookup,
    onManage,
    onDeleteUpload,
    onAddRequest,
    onRemoveRequest,
    onRenameRequest,
}: {
    block: CenterPageNestedBlock;
    item: CenterPageTopItem;
    group: CenterPageSubsection;
    linkLookup: Map<string, ResolvedLinkMeta>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    onRenameRequest?: (req: CentrePageRenameRequest) => void;
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
                addOptions={[{ kind: "link", label: "Add another file / link here" }]}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRename={
                    onRenameRequest
                        ? () =>
                              onRenameRequest({
                                  kind: "nested",
                                  topId: item.id,
                                  groupTitle: group.title,
                                  nestedTitle: block.title,
                                  currentTitle: block.title,
                              })
                        : undefined
                }
                onDelete={onRemoveRequest ? () => onRemoveRequest({ kind: "nested", anchor }) : undefined}
            />
            <LinkRowsBlock
                links={block.links}
                topId={item.id}
                topTitle={item.title}
                groupTitle={group.title}
                nestedTitle={block.title}
                linkLookup={linkLookup}
                onManage={onManage}
                onDeleteUpload={onDeleteUpload}
                onRemoveRequest={onRemoveRequest}
                onRenameRequest={onRenameRequest}
            />
        </div>
    );
}

function GroupBlock({
    group,
    item,
    linkLookup,
    onManage,
    onDeleteUpload,
    onAddRequest,
    onRemoveRequest,
    onRenameRequest,
}: {
    group: CenterPageSubsection;
    item: CenterPageTopItem;
    linkLookup: Map<string, ResolvedLinkMeta>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    onRenameRequest?: (req: CentrePageRenameRequest) => void;
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
                    { kind: "link", label: "Add another file / link here" },
                ]}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRename={
                    onRenameRequest
                        ? () =>
                              onRenameRequest({
                                  kind: "group",
                                  topId: item.id,
                                  groupTitle: group.title,
                                  currentTitle: group.title,
                              })
                        : undefined
                }
                onDelete={onRemoveRequest ? () => onRemoveRequest({ kind: "subsection", anchor }) : undefined}
            />
            {group.nested?.map((block, blockIndex) => (
                <NestedBlock
                    key={`${group.title}::n${blockIndex}::${block.title}`}
                    block={block}
                    item={item}
                    group={group}
                    linkLookup={linkLookup}
                    onManage={onManage}
                    onDeleteUpload={onDeleteUpload}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    onRenameRequest={onRenameRequest}
                />
            ))}
            {group.links && group.links.length > 0 ? (
                <LinkRowsBlock
                    links={group.links}
                    topId={item.id}
                    topTitle={item.title}
                    groupTitle={group.title}
                    linkLookup={linkLookup}
                    onManage={onManage}
                    onDeleteUpload={onDeleteUpload}
                    onRemoveRequest={onRemoveRequest}
                    onRenameRequest={onRenameRequest}
                />
            ) : !hasNested ? (
                <p className="px-8 py-2 text-xs text-slate-400">
                    No files yet — click <strong>Add</strong> → &quot;Add another file / link here&quot;.
                </p>
            ) : null}
        </div>
    );
}

function SectionBlock({
    item,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
    onDeleteUpload,
    onAddRequest,
    onRemoveRequest,
    onRenameRequest,
    isCustomTop,
    linkLookupBuilder,
}: {
    item: CenterPageTopItem;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    onRenameRequest?: (req: CentrePageRenameRequest) => void;
    isCustomTop?: boolean;
    linkLookupBuilder?: CentrePageLinkLookupBuilder;
}) {
    const linkLookup = useMemo(
        () =>
            linkLookupBuilder
                ? linkLookupBuilder(item, hubDocsByCategory, hubDocsBySourcePath)
                : buildResolvedLinkLookup(item, hubDocsByCategory, hubDocsBySourcePath),
        [item, hubDocsByCategory, hubDocsBySourcePath, linkLookupBuilder],
    );
    const anchor: CentrePageLinkAnchor = { topId: item.id, topTitle: item.title };
    const hasGroups = item.groups.length > 0;
    const hasDirect = (item.directLinks?.length ?? 0) > 0;
    const isEmpty = !hasGroups && !hasDirect;

    if (isEmpty && !isCustomTop && !onAddRequest) return null;

    const topAddOptions: { kind: CentrePageAddKind; label: string }[] = [
        { kind: "subsection", label: "Add subsection" },
        { kind: "link", label: "Add file / link to this section" },
    ];

    return (
        <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <HeadingBar
                title={item.title}
                level="top"
                addOptions={onAddRequest ? topAddOptions : []}
                onAdd={(kind) => onAddRequest?.({ kind, anchor })}
                onRename={
                    onRenameRequest
                        ? () =>
                              onRenameRequest({
                                  kind: "top",
                                  topId: item.id,
                                  currentTitle: item.title,
                              })
                        : undefined
                }
                onDelete={
                    onRemoveRequest ? () => onRemoveRequest?.({ kind: "topSection", anchor }) : undefined
                }
            />

            {item.directLinks && item.directLinks.length > 0 ? (
                <LinkRowsBlock
                    links={item.directLinks}
                    topId={item.id}
                    topTitle={item.title}
                    linkLookup={linkLookup}
                    onManage={onManage}
                    onDeleteUpload={onDeleteUpload}
                    onRemoveRequest={onRemoveRequest}
                    onRenameRequest={onRenameRequest}
                />
            ) : null}

            {item.groups.map((group, groupIndex) => (
                <GroupBlock
                    key={`${item.id}::g${groupIndex}::${group.title}`}
                    group={group}
                    item={item}
                    linkLookup={linkLookup}
                    onManage={onManage}
                    onDeleteUpload={onDeleteUpload}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    onRenameRequest={onRenameRequest}
                />
            ))}

            {isEmpty && onAddRequest ? (
                <p className="px-4 py-3 text-xs text-slate-500">
                    No subsections yet — click <strong>Add</strong> to add a subsection or a file/link directly in
                    this section.
                </p>
            ) : null}
        </section>
    );
}

export function AdminCentrePageChecklist({
    sections,
    hubDocs,
    onManageLink,
    onDeleteUpload,
    onAddRequest,
    onRemoveRequest,
    onRenameRequest,
    isCustomTop,
    linkLookupBuilder,
}: {
    sections: CenterPageTopItem[][];
    hubDocs: FranchiseHubDoc[];
    onManageLink: (ctx: AdminCenterPageUploadContext) => void;
    onDeleteUpload?: (ctx: AdminCenterPageUploadContext) => void;
    onAddRequest?: (req: CentrePageAddRequest) => void;
    onRemoveRequest?: (req: CentrePageRemoveRequest) => void;
    onRenameRequest?: (req: CentrePageRenameRequest) => void;
    isCustomTop?: (topId: string) => boolean;
    linkLookupBuilder?: CentrePageLinkLookupBuilder;
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
                    onDeleteUpload={onDeleteUpload}
                    onAddRequest={onAddRequest}
                    onRemoveRequest={onRemoveRequest}
                    onRenameRequest={onRenameRequest}
                    isCustomTop={isCustomTop?.(item.id)}
                    linkLookupBuilder={linkLookupBuilder}
                />
            ))}
        </div>
    );
}
