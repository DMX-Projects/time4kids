"use client";

import Link from "next/link";

import { useCallback, useEffect, useId, useMemo, useReducer, useState } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import {
  groupFranchiseHubDocsByCategory,
  groupFranchiseHubDocsBySourcePath,
  resolveCenterPageLinks,
  shouldOpenFranchiseLinkInNewTab,
} from "@/lib/franchise-center-page-links";

import type {
  CenterPageLink,
  CenterPageNestedBlock,
  CenterPageSubsection,
  CenterPageTopItem,
} from "@/config/franchise-center-page-nav";

type Mode = "franchise" | "admin";

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

function accordionSetsReducer(
  state: AccordionSetsState,
  action:
    | { type: "toggleTop"; id: string }
    | { type: "toggleSub"; key: string }
    | { type: "toggleNested"; key: string },
): AccordionSetsState {
  switch (action.type) {
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

function LinkRows({
  links,

  mode,

  hubDocsByCategory,

  hubDocsBySourcePath,

  onAdminPickCategory,
}: {
  links: CenterPageLink[];

  mode: Mode;

  hubDocsByCategory?: Map<string, FranchiseHubDoc[]>;

  hubDocsBySourcePath?: Map<string, FranchiseHubDoc>;

  onAdminPickCategory?: (category: string) => void;
}) {
  const displayLinks =
    mode === "franchise" && hubDocsByCategory
      ? resolveCenterPageLinks(links, hubDocsByCategory, hubDocsBySourcePath)
      : links;
  const franchiseRowClass =
    "group/link flex min-w-0 items-start gap-2.5 font-serif text-sm leading-snug text-slate-600 hover:text-slate-900";

  return (
    <ul role="list" className="list-none space-y-2 py-1">
      {displayLinks.map((link, index) => {
        const franchiseLabelClass = link.emphasize
          ? "min-w-0 break-words font-semibold text-slate-900 underline decoration-slate-700 decoration-2 underline-offset-[3px]"
          : "min-w-0 break-words text-slate-700 underline-offset-[3px] decoration-slate-400/60 group-hover/link:underline group-hover/link:decoration-slate-500";
        const adminLabelClass = link.emphasize
          ? "font-semibold text-slate-900 underline decoration-slate-600"
          : "";

        const openInNewTab =
          mode === "franchise" && shouldOpenFranchiseLinkInNewTab(link.href);

        return (
          <li key={link.rowKey ?? `link-${index}-${link.label}`} className="min-w-0">
            {mode === "franchise" ? (
              openInNewTab ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={franchiseRowClass}
                >
                  <HandprintBullet className="mt-0.5 shrink-0 text-emerald-600" />

                  <span className={franchiseLabelClass}>{link.label}</span>
                </a>
              ) : (
                <Link href={link.href} className={franchiseRowClass}>
                  <HandprintBullet className="mt-0.5 shrink-0 text-emerald-600" />

                  <span className={franchiseLabelClass}>{link.label}</span>
                </Link>
              )
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

  onAdminPickCategory,
}: {
  blocks: CenterPageTopItem[];

  mode: Mode;

  hubDocsByCategory?: Map<string, FranchiseHubDoc[]>;

  hubDocsBySourcePath?: Map<string, FranchiseHubDoc>;

  baseId: string;

  openTop: Set<string>;

  openSub: Set<string>;

  openNested: Set<string>;

  toggleTop: (id: string) => void;

  toggleSub: (key: string) => void;

  toggleNested: (key: string) => void;

  onAdminPickCategory?: (category: string) => void;
}) {
  return (
    <>
      {blocks.map((item) => {
        const expanded = openTop.has(item.id);

        const panelId = `${baseId}-panel-${item.id}`;

        const btnId = `${baseId}-btn-${item.id}`;

        return (
          <div key={item.id} className="space-y-1.5">
            <button
              id={btnId}
              type="button"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => toggleTop(item.id)}
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

            <AccordionCollapse open={expanded}>
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                aria-hidden={!expanded}
                className="ml-0 space-y-2 border-l-2 border-orange-200/90 pl-3 sm:ml-1 sm:pl-4"
              >
                {item.directLinks && item.directLinks.length > 0 ? (
                  <div className="border-l border-dashed border-slate-300/80 py-1 pl-3 sm:pl-4">
                    <LinkRows
                      links={item.directLinks}
                      mode={mode}
                      hubDocsByCategory={hubDocsByCategory}
                      hubDocsBySourcePath={hubDocsBySourcePath}
                      onAdminPickCategory={onAdminPickCategory}
                    />
                  </div>
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

export function FranchiseCenterPageAccordion({
  sections,

  mode,

  onAdminPickCategory,
}: {
  sections: CenterPageTopItem[][];

  mode: Mode;

  onAdminPickCategory?: (category: string) => void;
}) {
  const { authFetch } = useAuth();
  const baseId = useId();
  const [hubDocs, setHubDocs] = useState<FranchiseHubDoc[]>([]);

  useEffect(() => {
    if (mode !== "franchise") return;
    let cancelled = false;

    const load = async () => {
      try {
        const data = await authFetch<FranchiseHubDoc[]>("/documents/franchise/documents/");
        if (!cancelled) setHubDocs(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setHubDocs([]);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [authFetch, mode]);

  const hubDocsByCategory = useMemo(
    () => (mode === "franchise" ? groupFranchiseHubDocsByCategory(hubDocs) : undefined),
    [hubDocs, mode],
  );

  const hubDocsBySourcePath = useMemo(
    () => (mode === "franchise" ? groupFranchiseHubDocsBySourcePath(hubDocs) : undefined),
    [hubDocs, mode],
  );

  const [{ openTop, openSub, openNested }, dispatch] = useReducer(
    accordionSetsReducer,
    emptyAccordionSets,
  );

  const toggleTop = useCallback((id: string) => {
    dispatch({ type: "toggleTop", id });
  }, []);

  const toggleSub = useCallback((key: string) => {
    dispatch({ type: "toggleSub", key });
  }, []);

  const toggleNested = useCallback((key: string) => {
    dispatch({ type: "toggleNested", key });
  }, []);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-md">
      <div className="bg-[#1e3a5f] px-4 py-3 text-center sm:px-6 sm:text-left">
        <h2 className="text-lg font-bold tracking-wide text-white sm:text-xl">
          Center Page
        </h2>

        <p className="mt-0.5 text-xs text-blue-100/90 sm:text-sm">
          Only one orange section stays open at a time; grey sub-headings and inner
          blocks work the same way (opening one closes the others). Same checklist
          order as head office.
        </p>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        {sections.map((chunk, idx) => (
          <div key={idx} className="space-y-2">
            <BlockItems
              blocks={chunk}
              mode={mode}
              hubDocsByCategory={hubDocsByCategory}
              hubDocsBySourcePath={hubDocsBySourcePath}
              baseId={baseId}
              openTop={openTop}
              openSub={openSub}
              openNested={openNested}
              toggleTop={toggleTop}
              toggleSub={toggleSub}
              toggleNested={toggleNested}
              onAdminPickCategory={onAdminPickCategory}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
