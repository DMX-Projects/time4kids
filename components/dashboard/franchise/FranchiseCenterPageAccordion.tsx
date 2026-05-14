"use client";

import Link from "next/link";

import { useCallback, useId, useState } from "react";

import { ChevronDown, ChevronRight } from "lucide-react";

import type {
  CenterPageLink,
  CenterPageNestedBlock,
  CenterPageSubsection,
  CenterPageTopItem,
} from "@/config/franchise-center-page-nav";

type Mode = "franchise" | "admin";

function isNestedGroup(
  group: CenterPageSubsection,
): group is { title: string; nested: CenterPageNestedBlock[] } {
  return "nested" in group && Array.isArray(group.nested);
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

/** Yellow bar with notched left/right ends (reference: brush / torn paper feel). */

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
        "relative flex min-h-[3rem] w-full items-center gap-2.5 px-4 py-2.5 text-left shadow-sm transition",

        "bg-[#FFEB3B] text-black font-serif",

        emphasize ? "font-bold" : "font-semibold",

        "border border-amber-400/45",
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

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href.trim());
}

function LinkRows({
  links,

  mode,

  onAdminPickCategory,
}: {
  links: CenterPageLink[];

  mode: Mode;

  onAdminPickCategory?: (category: string) => void;
}) {
  const franchiseRowClass =
    "group/link flex items-start gap-2.5 font-serif text-sm leading-snug text-slate-600 hover:text-slate-900";

  return (
    <ul role="list" className="list-none space-y-2 py-1">
      {links.map((link, index) => {
        const franchiseLabelClass = link.emphasize
          ? "font-semibold text-slate-900 underline decoration-slate-700 decoration-2 underline-offset-[3px]"
          : "text-slate-700 underline-offset-[3px] decoration-slate-400/60 group-hover/link:underline group-hover/link:decoration-slate-500";
        const adminLabelClass = link.emphasize
          ? "font-semibold text-slate-900 underline decoration-slate-600"
          : "";

        return (
          <li key={link.rowKey ?? `link-${index}-${link.label}`}>
            {mode === "franchise" ? (
              isExternalHref(link.href) ? (
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

  onAdminPickCategory,
}: {
  blocks: CenterPageTopItem[];

  mode: Mode;

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
              className="group w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
            >
              <ZigzagBar emphasize={item.emphasize}>
                {expanded ? (
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-[#1e3a5f]"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                ) : (
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-[#1e3a5f]"
                    strokeWidth={2.25}
                    aria-hidden
                  />
                )}

                <span className="text-[0.95rem] leading-snug sm:text-base">
                  {item.title}
                </span>
              </ZigzagBar>
            </button>

            {expanded ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="ml-0 space-y-2 border-l-2 border-amber-200/90 pl-3 sm:ml-1 sm:pl-4"
              >
                {item.directLinks && item.directLinks.length > 0 ? (
                  <div className="border-l border-dashed border-slate-300/80 py-1 pl-3 sm:pl-4">
                    <LinkRows
                      links={item.directLinks}
                      mode={mode}
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
                                  className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              ) : (
                                <ChevronRight
                                  className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              )}

                              <span>{group.title}</span>
                            </GrayPillRow>
                          </button>

                          {subOpen ? (
                            <div
                              id={subPanelId}
                              role="region"
                              aria-labelledby={subBtnId}
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
                                            className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                            strokeWidth={2.25}
                                            aria-hidden
                                          />
                                        ) : (
                                          <ChevronRight
                                            className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                            strokeWidth={2.25}
                                            aria-hidden
                                          />
                                        )}

                                        <span>{block.title}</span>
                                      </GrayPillRow>
                                    </button>

                                    {nestOpen ? (
                                      <div
                                        id={nestPanelId}
                                        role="region"
                                        aria-labelledby={nestBtnId}
                                        className="ml-3 border-l border-dashed border-slate-300/80 py-1 pl-3 sm:ml-4 sm:pl-4"
                                      >
                                        <LinkRows
                                          links={block.links}
                                          mode={mode}
                                          onAdminPickCategory={
                                            onAdminPickCategory
                                          }
                                        />
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : null}
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
                                className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            ) : (
                              <ChevronRight
                                className="h-4 w-4 shrink-0 text-[#1e3a5f]"
                                strokeWidth={2.25}
                                aria-hidden
                              />
                            )}

                            <span>{group.title}</span>
                          </GrayPillRow>
                        </button>

                        {subOpen ? (
                          <div
                            id={subPanelId}
                            role="region"
                            aria-labelledby={subBtnId}
                            className="ml-3 border-l border-dashed border-slate-300/80 py-1.5 pl-3 sm:ml-4 sm:pl-4"
                          >
                            <LinkRows
                              links={group.links}
                              mode={mode}
                              onAdminPickCategory={onAdminPickCategory}
                            />
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            ) : null}
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
  const baseId = useId();

  const [openTop, setOpenTop] = useState<Set<string>>(() => new Set());

  const [openSub, setOpenSub] = useState<Set<string>>(() => new Set());

  const [openNested, setOpenNested] = useState<Set<string>>(() => new Set());

  const toggleTop = useCallback((id: string) => {
    setOpenTop((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }, []);

  const toggleSub = useCallback((key: string) => {
    setOpenSub((prev) => {
      const next = new Set(prev);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  }, []);

  const toggleNested = useCallback((key: string) => {
    setOpenNested((prev) => {
      const next = new Set(prev);

      if (next.has(key)) next.delete(key);
      else next.add(key);

      return next;
    });
  }, []);

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white shadow-md">
      <div className="bg-[#1e3a5f] px-4 py-3 text-center sm:px-6 sm:text-left">
        <h2 className="text-lg font-bold tracking-wide text-white sm:text-xl">
          Center Page
        </h2>

        <p className="mt-0.5 text-xs text-blue-100/90 sm:text-sm">
          Open each yellow bar, then grey sub-headings (and any inner blocks) to
          reach links. Same checklist order as head office.
        </p>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        {sections.map((chunk, idx) => (
          <div key={idx} className="space-y-2">
            <BlockItems
              blocks={chunk}
              mode={mode}
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
