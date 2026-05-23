"use client";

import { useMemo } from "react";
import { Pencil, Upload } from "lucide-react";
import type { CenterPageTopItem } from "@/config/franchise-center-page-nav";
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

function AdminUploadRow({
    ctx,
    onManage,
}: {
    ctx: AdminCenterPageUploadContext;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
}) {
    const uploaded = ctx.matchedDocId != null;

    return (
        <div className="flex flex-col gap-2 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
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
    item,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onManage,
}: {
    item: CenterPageTopItem;
    hubDocsByCategory: Map<string, FranchiseHubDoc[]>;
    hubDocsBySourcePath: Map<string, FranchiseHubDoc>;
    onManage: (ctx: AdminCenterPageUploadContext) => void;
}) {
    const rows: AdminCenterPageUploadContext[] = [];

    if (item.directLinks?.length) {
        const resolved = resolveCenterPageLinks(item.directLinks, hubDocsByCategory, hubDocsBySourcePath);
        item.directLinks.forEach((link, i) => {
            const ctx = buildAdminUploadContext({
                topTitle: item.title,
                link,
                matchedDocId: resolved[i]?.franchiseHubDocId,
            });
            if (ctx) rows.push(ctx);
        });
    }

    for (const group of item.groups) {
        if (group.nested) {
            for (const block of group.nested) {
                const resolved = resolveCenterPageLinks(block.links, hubDocsByCategory, hubDocsBySourcePath);
                block.links.forEach((link, i) => {
                    const ctx = buildAdminUploadContext({
                        topTitle: item.title,
                        groupTitle: group.title,
                        nestedTitle: block.title,
                        link,
                        matchedDocId: resolved[i]?.franchiseHubDocId,
                    });
                    if (ctx) rows.push(ctx);
                });
            }
        }
        if (group.links?.length) {
            const resolved = resolveCenterPageLinks(group.links, hubDocsByCategory, hubDocsBySourcePath);
            group.links.forEach((link, i) => {
                const ctx = buildAdminUploadContext({
                    topTitle: item.title,
                    groupTitle: group.title,
                    link,
                    matchedDocId: resolved[i]?.franchiseHubDocId,
                });
                if (ctx) rows.push(ctx);
            });
        }
    }

    if (rows.length === 0) return null;

    return (
        <section className="rounded-xl border border-slate-200 bg-white">
            <h2 className="border-b border-slate-100 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-900">
                {item.title}
            </h2>
            <div className="px-4">
                {rows.map((ctx) => (
                    <AdminUploadRow
                        key={ctx.rowKey ?? ctx.breadcrumbLabel}
                        ctx={ctx}
                        onManage={onManage}
                    />
                ))}
            </div>
        </section>
    );
}

export function AdminCentrePageChecklist({
    sections,
    hubDocs,
    onManageLink,
}: {
    sections: CenterPageTopItem[][];
    hubDocs: FranchiseHubDoc[];
    onManageLink: (ctx: AdminCenterPageUploadContext) => void;
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
                />
            ))}
        </div>
    );
}
