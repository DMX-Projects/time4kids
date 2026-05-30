"use client";

import Link from "next/link";

import { useCallback, useEffect, useId, useMemo, useReducer, useState } from "react";

import { ChevronDown, ChevronRight, Upload, Pencil, Plus, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import {
  applyResolvedLinkLookup,
  buildResolvedLinkLookup,
  groupFranchiseHubDocsByCategory,
  groupFranchiseHubDocsBySourcePath,
  shouldOpenFranchiseLinkInNewTab,
  type ResolvedLinkMeta,
} from "@/lib/franchise-center-page-links";
import { downloadFilenameFromLink, extensionFromPath } from "@/lib/franchise-download-filename";
import {
  openFranchiseEmbedLink,
  openFranchiseFileFromHref,
  openFranchiseHubDocument,
} from "@/lib/franchise-hub-document-open";

import type {
  CenterPageLink,
  CenterPageNestedBlock,
  CenterPageSubsection,
  CenterPageTopItem,
} from "@/config/franchise-center-page-nav";
import {
  buildAdminUploadContext,
  type AdminCenterPageUploadContext,
} from "@/lib/admin-center-page-upload";
import type { CentrePageLinkAnchor } from "@/lib/centre-page-nav-custom";
import {
  rowKeyForChecklistLink,
  rowKeyForUploadedDoc,
} from "@/lib/centre-page-nav-custom";

type Mode = "franchise" | "admin";

export type CentrePageAdminTools = {
  selectedRowKeys: Set<string>;
  onToggleRow: (rowKey: string, checked: boolean) => void;
  onAddTopSection: () => void;
  onAddGroup: (anchor: CentrePageLinkAnchor) => void;
  onAddNested: (anchor: CentrePageLinkAnchor & { groupTitle: string }) => void;
  onAddLink: (anchor: CentrePageLinkAnchor) => void;
  onDeleteUploaded: (docId: number) => Promise<void>;
  canRemoveTopSection?: (topId: string) => boolean;
  onRemoveTopSection?: (topId: string) => void;
};

function AdminToolbarButton({
  children,
  onClick,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold",
        variant === "danger"
          ? "border-red-200 bg-red-50 text-red-800 hover:bg-red-100"
          : "border-orange-200 bg-orange-50 text-orange-900 hover:bg-orange-100",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

type AccordionSetsState = {
  openTop: Set<string>;
  openSub: Set<string>;
  openNested: Set<string>;
};

const emptyAccordionSets: AccordionSetsState = {
  openTop: new Set(),
  openSub: new Set(),
  openNested: new Set(),
};

function collectAccordionKeysForItems(items: CenterPageTopItem[]): AccordionSetsState {
  const openTop = new Set<string>();
  const openSub = new Set<string>();
  const openNested = new Set<string>();

  for (const item of items) {
    openTop.add(item.id);
    for (const group of item.groups) {
      const subKey = `${item.id}::${group.title}`;
      openSub.add(subKey);
      if (group.nested) {
        for (const block of group.nested) {
          openNested.add(`${subKey}::${block.title}`);
        }
      }
    }
  }

  return { openTop, openSub, openNested };
}

function initialAccordionSets(
  items: CenterPageTopItem[],
  hub?: { initialOpenTopIds?: string[]; expandAllSections?: boolean },
): AccordionSetsState {
  if (hub?.expandAllSections) {
    const ids = hub.initialOpenTopIds?.length
      ? new Set(hub.initialOpenTopIds)
      : undefined;
    const scoped = ids ? items.filter((item) => ids.has(item.id)) : items;
    return collectAccordionKeysForItems(scoped);
  }
  if (hub?.initialOpenTopIds?.length) {
    return { ...emptyAccordionSets, openTop: new Set(hub.initialOpenTopIds) };
  }
  return emptyAccordionSets;
}

function accordionSetsReducer(
  state: AccordionSetsState,
  action:
    | { type: "toggleTop"; id: string }
    | { type: "toggleTopTree"; id: string; item: CenterPageTopItem }
    | { type: "toggleSub"; key: string }
    | { type: "toggleNested"; key: string },
): AccordionSetsState {
  switch (action.type) {
    case "toggleTopTree": {
      const { id, item } = action;
      if (state.openTop.has(id)) {
        const nextTop = new Set(Array.from(state.openTop));
        nextTop.delete(id);
        return {
          openTop: nextTop,
          openSub: new Set(
            Array.from(state.openSub).filter((k) => !k.startsWith(`${id}::`)),
          ),
          openNested: new Set(
            Array.from(state.openNested).filter((k) => !k.startsWith(`${id}::`)),
          ),
        };
      }
      return collectAccordionKeysForItems([item]);
    }
    case "toggleTop": {
      const { id } = action;
      if (state.openTop.has(id)) {
        const nextTop = new Set(Array.from(state.openTop));
        nextTop.delete(id);
        return {
          openTop: nextTop,
          openSub: new Set(
            Array.from(state.openSub).filter((k) => !k.startsWith(`${id}::`)),
          ),
          openNested: new Set(
            Array.from(state.openNested).filter((k) => !k.startsWith(`${id}::`)),
          ),
        };
      }
      return {
        openTop: new Set([id]),
        openSub: new Set(),
        openNested: new Set(),
      };
    }
    case "toggleSub": {
      const { key } = action;
      if (state.openSub.has(key)) {
        const nextSub = new Set(Array.from(state.openSub));
        nextSub.delete(key);
        return {
          ...state,
          openSub: nextSub,
          openNested: new Set(
            Array.from(state.openNested).filter((nk) => !nk.startsWith(`${key}::`)),
          ),
        };
      }
      return {
        ...state,
        openSub: new Set([key]),
        openNested: new Set(),
      };
    }
    case "toggleNested": {
      const { key } = action;
      if (state.openNested.has(key)) {
        const next = new Set(Array.from(state.openNested));
        next.delete(key);
        return { ...state, openNested: next };
      }
      return { ...state, openNested: new Set([key]) };
    }
    default:
      return state;
  }
}

function isNestedGroup(
  group: CenterPageSubsection,
): group is CenterPageSubsection & { nested: CenterPageNestedBlock[] } {
  return Array.isArray(group.nested) && group.nested.length > 0;
}

/** Small filled handprint for nested link rows (reference: green child handprint). */

function HandprintBullet({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 36"
      aria-hidden
      width={20}
      height={22}
    >
      <g fill="currentColor">
        <ellipse cx="10" cy="9" rx="3.2" ry="5" transform="rotate(-18 10 9)" />

        <ellipse cx="16" cy="6" rx="3" ry="5.5" />

        <ellipse cx="22" cy="9" rx="3.2" ry="5" transform="rotate(18 22 9)" />

        <ellipse
          cx="6.5"
          cy="16"
          rx="2.6"
          ry="4.2"
          transform="rotate(-35 6.5 16)"
        />

        <ellipse
          cx="25.5"
          cy="16"
          rx="2.6"
          ry="4.2"
          transform="rotate(35 25.5 16)"
        />

        <path d="M16 18c-4 0-7 2.5-8.5 6.5l-1 3c-.5 1.5.5 3 2 3.5 1 .4 2 .6 3 .6h15c2.8 0 5-2.2 5-5v-1c0-4-3.5-7.5-7.5-7.5h-1.5c-.8-1.8-2.5-3-4.5-3z" />
      </g>
    </svg>
  );
}

/** Orange bar (same `#FF922B` as dashboard Logout) with notched ends. */

function ZigzagBar({
  children,
  emphasize,
}: {
  children: React.ReactNode;
  emphasize?: boolean;
}) {
  const edge =
    "polygon(0 0,calc(100% - 12px) 0,100% 50%,calc(100% - 12px) 100%,12px 100%,0 50%)";

  return (
    <div
      className={[
        "relative flex min-h-[3rem] w-full items-center gap-2.5 bg-[#FF922B] px-4 py-2.5 text-left font-serif text-black shadow-sm transition hover:brightness-105",

        emphasize ? "font-bold" : "font-semibold",

        "border border-orange-600/25",
      ].join(" ")}
      style={{ clipPath: edge }}
    >
      {children}
    </div>
  );
}

/** Grey pill row — second/third accordion levels; orange sans-serif (reference). */

function GrayPillRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[2.35rem] w-full max-w-full items-center gap-2 rounded-full border border-slate-300/55 bg-slate-200/95 px-4 py-2 text-left text-sm font-semibold font-serif text-[#f58220] shadow-sm ring-1 ring-white/40 sm:text-[0.9375rem]">
      {children}
    </div>
  );
}

function AdminChecklistLinkRow({
  link,
  topTitle,
  groupTitle,
  nestedTitle,
  onAdminManageLink,
  adminTools,
}: {
  link: CenterPageLink;
  topTitle: string;
  groupTitle?: string;
  nestedTitle?: string;
  onAdminManageLink?: (ctx: AdminCenterPageUploadContext) => void;
  adminTools?: CentrePageAdminTools;
}) {
  const ctx = buildAdminUploadContext({
    topTitle,
    groupTitle,
    nestedTitle,
    link,
    matchedDocId: link.franchiseHubDocId,
  });
  const uploaded = link.franchiseHubDocId != null;
  const rowKey = uploaded
    ? rowKeyForUploadedDoc(link.franchiseHubDocId!)
    : rowKeyForChecklistLink(link);
  const selected = adminTools?.selectedRowKeys.has(rowKey) ?? false;

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-orange-100 bg-white px-3 py-2.5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-start gap-2">
        {adminTools ? (
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            checked={selected}
            onChange={(e) => adminTools.onToggleRow(rowKey, e.target.checked)}
            aria-label={`Select ${link.label}`}
          />
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="font-serif text-sm font-medium leading-snug text-slate-800">{link.label}</p>
          {!link.adminCategory ? (
            <p className="mt-0.5 text-[11px] text-slate-500">External checklist link — not in upload categories</p>
          ) : uploaded ? (
            <p className="mt-0.5 text-[11px] font-medium text-emerald-700">File in database (ID {link.franchiseHubDocId})</p>
          ) : (
            <p className="mt-0.5 text-[11px] font-medium text-amber-800">Not uploaded yet — franchises see legacy URL until you upload</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        {uploaded && adminTools ? (
          <button
            type="button"
            onClick={() => void adminTools.onDeleteUploaded(link.franchiseHubDocId!)}
            className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
            Delete
          </button>
        ) : null}
        {ctx && onAdminManageLink ? (
          <button
            type="button"
            onClick={() => onAdminManageLink(ctx)}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-900 transition hover:bg-orange-100"
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
        ) : null}
      </div>
    </div>
  );
}

function SectionHeading({ title, nested }: { title: string; nested?: boolean }) {
  if (nested) {
    return (
      <h4 className="text-sm font-semibold font-serif tracking-tight text-[#c2410c] sm:text-[0.9375rem]">
        {title}
      </h4>
    );
  }
  return (
    <h3 className="flex min-h-[2.35rem] w-full max-w-full items-center rounded-full border border-slate-300/55 bg-slate-200/95 px-4 py-2 text-left text-sm font-semibold font-serif text-[#f58220] shadow-sm ring-1 ring-white/40 sm:text-[0.9375rem]">
      {title}
    </h3>
  );
}

function TopItemGroupsDocumentTree({
  item,
  mode,
  linkLookup,
  hubDocsByCategory,
  hubDocsBySourcePath,
  onAdminPickCategory,
  onAdminManageLink,
  adminTools,
}: {
  item: CenterPageTopItem;
  mode: Mode;
  linkLookup?: Map<string, ResolvedLinkMeta>;
  hubDocsByCategory?: Map<string, FranchiseHubDoc[]>;
  hubDocsBySourcePath?: Map<string, FranchiseHubDoc>;
  onAdminPickCategory?: (category: string) => void;
  onAdminManageLink?: (ctx: AdminCenterPageUploadContext) => void;
  adminTools?: CentrePageAdminTools;
}) {
  const linkProps = {
    mode,
    topTitle: item.title,
    topId: item.id,
    linkLookup,
    hubDocsByCategory,
    hubDocsBySourcePath,
    onAdminPickCategory,
    onAdminManageLink,
    adminTools,
  };

  const anchorBase: CentrePageLinkAnchor = { topId: item.id, topTitle: item.title };

  return (
    <div className="space-y-5">
      {mode === "admin" && adminTools ? (
        <div className="flex flex-wrap gap-2">
          <AdminToolbarButton onClick={() => adminTools.onAddGroup(anchorBase)}>
            <Plus className="h-3 w-3" aria-hidden />
            Add subsection
          </AdminToolbarButton>
          <AdminToolbarButton onClick={() => adminTools.onAddLink(anchorBase)}>
            <Plus className="h-3 w-3" aria-hidden />
            Add file / link
          </AdminToolbarButton>
        </div>
      ) : null}
      {item.groups.map((group) => {
        const subKey = `${item.id}::${group.title}`;
        const groupAnchor = { ...anchorBase, groupTitle: group.title };

        if (isNestedGroup(group)) {
          return (
            <section key={subKey} className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <SectionHeading title={group.title} />
                {mode === "admin" && adminTools ? (
                  <div className="flex flex-wrap gap-2">
                    <AdminToolbarButton onClick={() => adminTools.onAddNested(groupAnchor)}>
                      <Plus className="h-3 w-3" aria-hidden />
                      Add nested section
                    </AdminToolbarButton>
                    <AdminToolbarButton onClick={() => adminTools.onAddLink(groupAnchor)}>
                      <Plus className="h-3 w-3" aria-hidden />
                      Add file / link
                    </AdminToolbarButton>
                  </div>
                ) : null}
              </div>
              <div className="ml-0.5 space-y-4 border-l-2 border-dashed border-slate-300/85 pl-3 sm:ml-1 sm:pl-4">
                {group.nested.map((block) => (
                  <div key={`${subKey}::${block.title}`} className="space-y-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <SectionHeading title={block.title} nested />
                      {mode === "admin" && adminTools ? (
                        <AdminToolbarButton
                          onClick={() =>
                            adminTools.onAddLink({
                              ...groupAnchor,
                              nestedTitle: block.title,
                            })
                          }
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                          Add file / link
                        </AdminToolbarButton>
                      ) : null}
                    </div>
                    <LinkRows
                      links={block.links}
                      {...linkProps}
                      groupTitle={group.title}
                      nestedTitle={block.title}
                    />
                  </div>
                ))}
                {group.links && group.links.length > 0 ? (
                  <div className="space-y-2 border-t border-dashed border-slate-300/80 pt-3">
                    <LinkRows links={group.links} {...linkProps} groupTitle={group.title} />
                  </div>
                ) : null}
              </div>
            </section>
          );
        }

        return (
          <section key={subKey} className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <SectionHeading title={group.title} />
              {mode === "admin" && adminTools ? (
                <div className="flex flex-wrap gap-2">
                  <AdminToolbarButton onClick={() => adminTools.onAddNested(groupAnchor)}>
                    <Plus className="h-3 w-3" aria-hidden />
                    Add nested section
                  </AdminToolbarButton>
                  <AdminToolbarButton onClick={() => adminTools.onAddLink(groupAnchor)}>
                    <Plus className="h-3 w-3" aria-hidden />
                    Add file / link
                  </AdminToolbarButton>
                </div>
              ) : null}
            </div>
            <div className="border-l-2 border-dashed border-slate-300/80 py-0.5 pl-3 sm:pl-4">
              <LinkRows links={group.links ?? []} {...linkProps} groupTitle={group.title} />
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LinkRows({
  links,

  mode,

  topTitle,

  groupTitle,

  nestedTitle,

  linkLookup,

  hubDocsByCategory,

  hubDocsBySourcePath,

  onAdminPickCategory,

  onAdminManageLink,
  adminTools,
}: {
  links: CenterPageLink[];

  mode: Mode;

  topTitle?: string;

  topId?: string;

  groupTitle?: string;

  nestedTitle?: string;

  linkLookup?: Map<string, ResolvedLinkMeta>;

  hubDocsByCategory?: Map<string, FranchiseHubDoc[]>;

  hubDocsBySourcePath?: Map<string, FranchiseHubDoc>;

  onAdminPickCategory?: (category: string) => void;

  onAdminManageLink?: (ctx: AdminCenterPageUploadContext) => void;

  adminTools?: CentrePageAdminTools;
}) {
  const { tokens, authFetchBlobResponse, authFetchBlobFromHref } = useAuth();
  const displayLinks =
    (mode === "franchise" || mode === "admin") && linkLookup
      ? links.map((link) => applyResolvedLinkLookup(link, linkLookup))
      : links;
  const franchiseRowClass =
    "group/link flex min-w-0 items-start gap-2.5 font-serif text-sm leading-snug text-slate-600 hover:text-slate-900";

  const findHubDocById = (docId: number): FranchiseHubDoc | undefined => {
    if (hubDocsBySourcePath) {
      for (const d of Array.from(hubDocsBySourcePath.values())) {
        if (d.id === docId) return d;
      }
    }
    if (hubDocsByCategory) {
      for (const list of Array.from(hubDocsByCategory.values())) {
        const found = list.find((d) => d.id === docId);
        if (found) return found;
      }
    }
    return undefined;
  };

  const openFranchiseLink = (link: CenterPageLink) => {
    const doc = link.franchiseHubDocId != null ? findHubDocById(link.franchiseHubDocId) : undefined;
    if (doc?.embed_url?.trim()) {
      openFranchiseEmbedLink(doc.embed_url);
      return;
    }
    const ext =
      extensionFromPath(doc?.source_path) ||
      extensionFromPath(doc?.file) ||
      extensionFromPath(link.href) ||
      ".pdf";
    const downloadName = downloadFilenameFromLink(link.label, link.href, ext);

    const access = tokens?.access;
    if (link.franchiseHubDocId != null) {
      openFranchiseHubDocument(
        access,
        authFetchBlobResponse,
        authFetchBlobFromHref,
        `/documents/franchise/documents/${link.franchiseHubDocId}/file/`,
        downloadName,
        link.franchiseHubDocId,
        link.href,
      );
      return;
    }
    if (shouldOpenFranchiseLinkInNewTab(link.href)) {
      openFranchiseFileFromHref(
        access,
        authFetchBlobResponse,
        authFetchBlobFromHref,
        link.href,
        downloadName,
      );
    }
  };

  return (
    <ul role="list" className="list-none space-y-2 py-1">
      {displayLinks.map((link, index) => {
        const franchiseLabelClass = link.emphasize
          ? "min-w-0 break-words font-semibold text-slate-900 underline decoration-slate-700 decoration-2 underline-offset-[3px]"
          : "min-w-0 break-words text-slate-700 underline-offset-[3px] decoration-slate-400/60 group-hover/link:underline group-hover/link:decoration-slate-500";
        const adminLabelClass = link.emphasize
          ? "font-semibold text-slate-900 underline decoration-slate-600"
          : "";

        const hubDocId = link.franchiseHubDocId;
        const openAsFile =
          mode === "franchise" &&
          (hubDocId != null || shouldOpenFranchiseLinkInNewTab(link.href));

        return (
          <li key={link.rowKey ?? `link-${index}-${link.label}`} className="min-w-0">
            {mode === "franchise" ? (
              openAsFile ? (
                <button
                  type="button"
                  onClick={() => openFranchiseLink(link)}
                  className={`${franchiseRowClass} w-full text-left`}
                >
                  <HandprintBullet className="mt-0.5 shrink-0 text-emerald-600" />

                  <span className={franchiseLabelClass}>{link.label}</span>
                </button>
              ) : (
                <Link href={link.href} className={franchiseRowClass}>
                  <HandprintBullet className="mt-0.5 shrink-0 text-emerald-600" />

                  <span className={franchiseLabelClass}>{link.label}</span>
                </Link>
              )
            ) : mode === "admin" && topTitle ? (
              <AdminChecklistLinkRow
                link={link}
                topTitle={topTitle}
                groupTitle={groupTitle}
                nestedTitle={nestedTitle}
                onAdminManageLink={onAdminManageLink}
                adminTools={adminTools}
              />
            ) : (
              <div className="flex flex-wrap items-start gap-2.5">
                <HandprintBullet className="mt-0.5 shrink-0 text-emerald-600" />

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 font-serif text-sm leading-snug text-slate-600">
                  <span className={adminLabelClass}>{link.label}</span>

                  {link.adminCategory && onAdminPickCategory ? (
                    <button
                      type="button"
                      className="text-xs font-semibold text-orange-800 underline decoration-orange-400/70"
                      onClick={() => onAdminPickCategory(link.adminCategory!)}
                    >
                      Filter → {link.adminCategory}
                    </button>
                  ) : null}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Smooth height open/close (grid `0fr` → `1fr`); respects `prefers-reduced-motion`. */
function AccordionCollapse({
  open,
  children,
}: {
  open: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={[
        "grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out",
        "motion-reduce:transition-none motion-reduce:duration-0",
        open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      ].join(" ")}
    >
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

function BlockItems({
  blocks,

  mode,

  baseId,

  openTop,

  openSub,

  openNested,

  toggleTop,

  toggleSub,

  toggleNested,

  hubDocsByCategory,

  hubDocsBySourcePath,

  linkLookupsByTopId,

  onAdminPickCategory,

  onAdminManageLink,

  flattenTopLevel,

  documentTreeLayout,

  onToggleTop,

  adminTools,
}: {
  blocks: CenterPageTopItem[];

  mode: Mode;

  hubDocsByCategory?: Map<string, FranchiseHubDoc[]>;

  hubDocsBySourcePath?: Map<string, FranchiseHubDoc>;

  linkLookupsByTopId?: Map<string, Map<string, ResolvedLinkMeta>>;

  baseId: string;

  openTop: Set<string>;

  openSub: Set<string>;

  openNested: Set<string>;

  toggleTop: (id: string) => void;

  toggleSub: (key: string) => void;

  toggleNested: (key: string) => void;

  onAdminPickCategory?: (category: string) => void;

  onAdminManageLink?: (ctx: AdminCenterPageUploadContext) => void;

  flattenTopLevel?: boolean;

  documentTreeLayout?: boolean;

  onToggleTop?: (id: string, item: CenterPageTopItem) => void;

  adminTools?: CentrePageAdminTools;
}) {
  const flattenSingleTop = Boolean(flattenTopLevel && blocks.length === 1);
  const useDocumentTree = Boolean(documentTreeLayout);

  return (
    <>
      {blocks.map((item) => {
        const expanded = flattenSingleTop || openTop.has(item.id);
        const linkLookup = linkLookupsByTopId?.get(item.id);

        const panelId = `${baseId}-panel-${item.id}`;

        const btnId = `${baseId}-btn-${item.id}`;

        return (
          <div key={item.id} className="space-y-1.5">
            {!flattenSingleTop ? (
              <div className="space-y-1.5">
                <button
                  id={btnId}
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={panelId}
                  onClick={() =>
                    onToggleTop ? onToggleTop(item.id, item) : toggleTop(item.id)
                  }
                  className="group w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                >
                  <ZigzagBar emphasize={item.emphasize}>
                    {expanded ? (
                      <ChevronDown
                        className="h-5 w-5 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    ) : (
                      <ChevronRight
                        className="h-5 w-5 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                    )}

                    <span className="text-[0.95rem] leading-snug sm:text-base">
                      {item.title}
                    </span>
                  </ZigzagBar>
                </button>
                {mode === "admin" && adminTools && expanded ? (
                  <div className="flex flex-wrap gap-2 pl-1">
                    <AdminToolbarButton
                      onClick={() =>
                        adminTools.onAddGroup({ topId: item.id, topTitle: item.title })
                      }
                    >
                      <Plus className="h-3 w-3" aria-hidden />
                      Add subsection
                    </AdminToolbarButton>
                    {adminTools.canRemoveTopSection?.(item.id) ? (
                      <AdminToolbarButton
                        variant="danger"
                        onClick={() => adminTools.onRemoveTopSection?.(item.id)}
                      >
                        <Trash2 className="h-3 w-3" aria-hidden />
                        Remove section
                      </AdminToolbarButton>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <AccordionCollapse open={expanded}>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                aria-hidden={!expanded}
                className={
                  flattenSingleTop
                    ? "ml-0 space-y-2"
                    : "ml-0 space-y-2 border-l-2 border-orange-200/90 pl-3 sm:ml-1 sm:pl-4"
                }
              >
                {item.directLinks && item.directLinks.length > 0 ? (
                  <div className="border-l border-dashed border-slate-300/80 py-1 pl-3 sm:pl-4">
                    {mode === "admin" && adminTools ? (
                      <div className="mb-2 flex flex-wrap gap-2">
                        <AdminToolbarButton
                          onClick={() =>
                            adminTools.onAddLink({ topId: item.id, topTitle: item.title })
                          }
                        >
                          <Plus className="h-3 w-3" aria-hidden />
                          Add file / link
                        </AdminToolbarButton>
                      </div>
                    ) : null}
                    <LinkRows
                      links={item.directLinks}
                      mode={mode}
                      topTitle={item.title}
                      topId={item.id}
                      linkLookup={linkLookup}
                      hubDocsByCategory={hubDocsByCategory}
                      hubDocsBySourcePath={hubDocsBySourcePath}
                      onAdminPickCategory={onAdminPickCategory}
                      onAdminManageLink={onAdminManageLink}
                      adminTools={adminTools}
                    />
                  </div>
                ) : useDocumentTree ? (
                  <TopItemGroupsDocumentTree
                    item={item}
                    mode={mode}
                    linkLookup={linkLookup}
                    hubDocsByCategory={hubDocsByCategory}
                    hubDocsBySourcePath={hubDocsBySourcePath}
                    onAdminPickCategory={onAdminPickCategory}
                    onAdminManageLink={onAdminManageLink}
                    adminTools={adminTools}
                  />
                ) : (
                  item.groups.map((group) => {
                    const subKey = `${item.id}::${group.title}`;

                    const subOpen = openSub.has(subKey);

                    const subBtnId = `${baseId}-subbtn-${subKey}`;

                    const subPanelId = `${baseId}-subpanel-${subKey}`;

                    if (isNestedGroup(group)) {
                      return (
                        <div key={subKey} className="space-y-2">
                          <button
                            id={subBtnId}
                            type="button"
                            aria-expanded={subOpen}
                            aria-controls={subPanelId}
                            onClick={() => toggleSub(subKey)}
                            className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 rounded-full"
                          >
                            <GrayPillRow>
                              {subOpen ? (
                                <ChevronDown
                                  className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              ) : (
                                <ChevronRight
                                  className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              )}

                              <span>{group.title}</span>
                            </GrayPillRow>
                          </button>

                          <AccordionCollapse open={subOpen}>
                            <div
                              id={subPanelId}
                              role="region"
                              aria-labelledby={subBtnId}
                              aria-hidden={!subOpen}
                              className="ml-3 space-y-2 border-l border-dashed border-slate-300/90 pl-3 sm:ml-5 sm:pl-4"
                            >
                              {group.nested.map((block) => {
                                const nestKey = `${subKey}::${block.title}`;

                                const nestOpen = openNested.has(nestKey);

                                const nestBtnId = `${baseId}-nestbtn-${nestKey}`;

                                const nestPanelId = `${baseId}-nestpanel-${nestKey}`;

                                return (
                                  <div key={nestKey} className="space-y-1.5">
                                    <button
                                      id={nestBtnId}
                                      type="button"
                                      aria-expanded={nestOpen}
                                      aria-controls={nestPanelId}
                                      onClick={() => toggleNested(nestKey)}
                                      className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 rounded-full"
                                    >
                                      <GrayPillRow>
                                        {nestOpen ? (
                                          <ChevronDown
                                            className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                            strokeWidth={2.25}
                                            aria-hidden
                                          />
                                        ) : (
                                          <ChevronRight
                                            className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                            strokeWidth={2.25}
                                            aria-hidden
                                          />
                                        )}

                                        <span>{block.title}</span>
                                      </GrayPillRow>
                                    </button>

                                    <AccordionCollapse open={nestOpen}>
                                      <div
                                        id={nestPanelId}
                                        role="region"
                                        aria-labelledby={nestBtnId}
                                        aria-hidden={!nestOpen}
                                        className="ml-3 border-l border-dashed border-slate-300/80 py-1 pl-3 sm:ml-4 sm:pl-4"
                                      >
                                        <LinkRows
                                          links={block.links}
                                          mode={mode}
                                          linkLookup={linkLookup}
                                          hubDocsByCategory={hubDocsByCategory}
                                          hubDocsBySourcePath={hubDocsBySourcePath}
                                          onAdminPickCategory={
                                            onAdminPickCategory
                                          }
                                        />
                                      </div>
                                    </AccordionCollapse>
                                  </div>
                                );
                              })}
                              {group.links && group.links.length > 0 ? (
                                <div className="mt-3 border-t border-dashed border-slate-300/80 pt-3">
                                  <LinkRows
                                    links={group.links}
                                    mode={mode}
                                    linkLookup={linkLookup}
                                    hubDocsByCategory={hubDocsByCategory}
                                    hubDocsBySourcePath={hubDocsBySourcePath}
                                    onAdminPickCategory={onAdminPickCategory}
                                  />
                                </div>
                              ) : null}
                            </div>
                          </AccordionCollapse>
                        </div>
                      );
                    }

                    return (
                      <div key={subKey} className="space-y-1">
                        <button
                          id={subBtnId}
                          type="button"
                          aria-expanded={subOpen}
                          aria-controls={subPanelId}
                          onClick={() => toggleSub(subKey)}
                          className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1 rounded-full"
                        >
                          <GrayPillRow>
                            {subOpen ? (
                              <ChevronDown
                                className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            ) : (
                              <ChevronRight
                                className="h-4 w-4 shrink-0 text-[#1e3a5f] transition-transform duration-300 ease-out motion-reduce:duration-0"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            )}

                            <span>{group.title}</span>
                          </GrayPillRow>
                        </button>

                        <AccordionCollapse open={subOpen}>
                          <div
                            id={subPanelId}
                            role="region"
                            aria-labelledby={subBtnId}
                            aria-hidden={!subOpen}
                            className="ml-3 border-l border-dashed border-slate-300/80 py-1.5 pl-3 sm:ml-4 sm:pl-4"
                          >
                            <LinkRows
                              links={group.links ?? []}
                              mode={mode}
                              linkLookup={linkLookup}
                              hubDocsByCategory={hubDocsByCategory}
                              hubDocsBySourcePath={hubDocsBySourcePath}
                              onAdminPickCategory={onAdminPickCategory}
                            />
                          </div>
                        </AccordionCollapse>
                      </div>
                    );
                  })
                )}
              </div>
            </AccordionCollapse>
          </div>
        );
      })}
    </>
  );
}

export type FranchiseCenterPageHubOptions = {
  /** Replaces the default “Center Page” card header. */
  title: string;
  description?: string;
  /** Open these orange sections on first paint (e.g. `["academic-ay"]`). */
  initialOpenTopIds?: string[];
  /** Open every grey pill and nested block under the opened top sections. */
  expandAllSections?: boolean;
  /** On a single-section hub page, skip the orange top bar and show grey headings directly. */
  flattenTopLevel?: boolean;
};

export function FranchiseCenterPageAccordion({
  sections,

  mode,

  onAdminPickCategory,

  onAdminManageLink,

  hub,

  externalHubDocs,

  adminTools,
}: {
  sections: CenterPageTopItem[][];

  mode: Mode;

  onAdminPickCategory?: (category: string) => void;

  onAdminManageLink?: (ctx: AdminCenterPageUploadContext) => void;

  hub?: FranchiseCenterPageHubOptions;

  /** When set (admin page), skips internal fetch. */
  externalHubDocs?: FranchiseHubDoc[];

  /** Admin centre-page: add sections, multi-select, delete uploads. */
  adminTools?: CentrePageAdminTools;
}) {
  const { authFetch } = useAuth();
  const baseId = useId();
  const flatItems = useMemo(() => sections.flat(), [sections]);
  const [hubDocs, setHubDocs] = useState<FranchiseHubDoc[]>([]);

  useEffect(() => {
    if (externalHubDocs) return;
    if (mode !== "franchise" && mode !== "admin") return;
    let cancelled = false;

    const load = async () => {
      try {
        const path =
          mode === "admin"
            ? "/documents/admin/franchise-documents/"
            : "/documents/franchise/documents/";
        const data = await authFetch<FranchiseHubDoc[] | { results: FranchiseHubDoc[] }>(path);
        const list = Array.isArray(data) ? data : data?.results ?? [];
        if (!cancelled) setHubDocs(list);
      } catch {
        if (!cancelled) setHubDocs([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, mode, externalHubDocs]);

  const effectiveHubDocs = externalHubDocs ?? hubDocs;

  const hubDocsByCategory = useMemo(
    () =>
      mode === "franchise" || mode === "admin"
        ? groupFranchiseHubDocsByCategory(effectiveHubDocs)
        : undefined,
    [effectiveHubDocs, mode],
  );

  const hubDocsBySourcePath = useMemo(
    () =>
      mode === "franchise" || mode === "admin"
        ? groupFranchiseHubDocsBySourcePath(effectiveHubDocs)
        : undefined,
    [effectiveHubDocs, mode],
  );

  const linkLookupsByTopId = useMemo(() => {
    const lookups = new Map<string, Map<string, ResolvedLinkMeta>>();
    if (!hubDocsByCategory || !hubDocsBySourcePath) return lookups;
    for (const item of flatItems) {
      lookups.set(
        item.id,
        buildResolvedLinkLookup(item, hubDocsByCategory, hubDocsBySourcePath),
      );
    }
    return lookups;
  }, [flatItems, hubDocsByCategory, hubDocsBySourcePath]);

  const documentTreeLayout =
    mode === "admin" ||
    (mode === "franchise" && Boolean(hub?.flattenTopLevel || hub?.expandAllSections));

  const [{ openTop, openSub, openNested }, dispatch] = useReducer(
    accordionSetsReducer,
    flatItems,
    (items) => initialAccordionSets(items, hub),
  );

  const toggleTop = useCallback((id: string) => {
    dispatch({ type: "toggleTop", id });
  }, []);

  const toggleTopTree = useCallback(
    (id: string, item: CenterPageTopItem) => {
      dispatch({ type: "toggleTopTree", id, item });
    },
    [],
  );

  const toggleSub = useCallback((key: string) => {
    dispatch({ type: "toggleSub", key });
  }, []);

  const toggleNested = useCallback((key: string) => {
    dispatch({ type: "toggleNested", key });
  }, []);

  const isHub = Boolean(hub);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-md">
      {isHub ? (
        <div className="border-b border-slate-200/90 bg-gradient-to-r from-[#fffaf0] to-white px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700/90">
            Head office resources
          </p>
          <p className="mt-1 text-sm text-slate-600">
            Grey headings group files. Nested topics (e.g. Block-1) sit under their parent;
            other sections show download links right below the heading.
          </p>
        </div>
      ) : mode === "admin" ? (
        <div className="border-b border-orange-100 bg-gradient-to-r from-[#fffaf0] to-white px-4 py-3 sm:px-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-orange-950 sm:text-xl">Centre Page checklist</h2>
              <p className="mt-1 text-sm text-slate-600">
                Open a section, use <strong>Add subsection</strong> or <strong>Add nested section</strong> to
                extend the tree. Select multiple rows to delete uploads in bulk.
              </p>
            </div>
            {adminTools ? (
              <AdminToolbarButton onClick={() => adminTools.onAddTopSection()}>
                <Plus className="h-3.5 w-3.5" aria-hidden />
                Add top section
              </AdminToolbarButton>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="bg-[#1e3a5f] px-4 py-3 text-center sm:px-6 sm:text-left">
          <h2 className="text-lg font-bold tracking-wide text-white sm:text-xl">
            Center Page
          </h2>

          <p className="mt-0.5 text-xs text-blue-100/90 sm:text-sm">
            Tap an orange section to open it. Grey headings group topics; some have a second
            heading (e.g. Block-1), others show download links directly below.
          </p>
        </div>
      )}

      <div className="space-y-2 p-3 sm:p-4">
        {sections.map((chunk, idx) => (
          <div key={idx} className="space-y-2">
            <BlockItems
              blocks={chunk}
              mode={mode}
              hubDocsByCategory={hubDocsByCategory}
              hubDocsBySourcePath={hubDocsBySourcePath}
              linkLookupsByTopId={linkLookupsByTopId}
              baseId={baseId}
              openTop={openTop}
              openSub={openSub}
              openNested={openNested}
              toggleTop={toggleTop}
              toggleSub={toggleSub}
              toggleNested={toggleNested}
              onAdminPickCategory={onAdminPickCategory}
              onAdminManageLink={onAdminManageLink}
              flattenTopLevel={hub?.flattenTopLevel}
              documentTreeLayout={documentTreeLayout}
              onToggleTop={documentTreeLayout ? toggleTopTree : undefined}
              adminTools={adminTools}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
