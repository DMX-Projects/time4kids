"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { LayoutTemplate, Plus, Trash2, ChevronDown } from "lucide-react";
import {
    DEFAULT_HOME_PAGE_DATA,
    mergeHomePageData,
    type HomePageData,
    type KeyNavItem,
} from "@/config/home-page-defaults";

const NAV_CLASS_OPTIONS = [
    { value: "nav-link1", label: "Style A (nav-link1)" },
    { value: "nav-link2", label: "Style B (nav-link2)" },
    { value: "nav-link3", label: "Style C (nav-link3)" },
];

const METH_CLASS_PRESETS = ["nav-item1", "nav-item2", "nav-item3", "nav-item4", "nav-item5", "nav-item6"];

function Section({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    return (
        <details
            open={defaultOpen}
            className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden group"
        >
            <summary className="cursor-pointer list-none flex items-center justify-between gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-900">
                <span>{title}</span>
                <ChevronDown className="w-5 h-5 text-slate-500 transition-transform group-open:rotate-180" />
            </summary>
            <div className="p-4 border-t border-slate-100 space-y-4">{children}</div>
        </details>
    );
}

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

export default function AdminHomeContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<HomePageData>(DEFAULT_HOME_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<HomePageData>("/common/home-page-content/");
            setData(mergeHomePageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_HOME_PAGE_DATA);
            setError(e instanceof Error ? e.message : "Load failed");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        load();
    }, [load]);

    const save = async () => {
        setMessage(null);
        setError(null);
        setSaving(true);
        try {
            await authFetch("/common/home-page-content/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh the public homepage to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const reset = async () => {
        if (!confirm("Reset all sections to the original default text and layout?")) return;
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            const raw = await authFetch<HomePageData>("/common/home-page-content/reset/", { method: "POST" });
            setData(mergeHomePageData(raw));
            setMessage("Restored defaults.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Reset failed");
        } finally {
            setSaving(false);
        }
    };

    const updateKeyNav = (i: number, patch: Partial<KeyNavItem>) => {
        const next = [...data.key_navigation];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, key_navigation: next });
    };

    const addKeyNav = () => {
        setData({
            ...data,
            key_navigation: [
                ...data.key_navigation,
                {
                    icon: "/icon-tour.png",
                    alt: "",
                    href: "/",
                    label: "New link",
                    nav_class: "nav-link1",
                },
            ],
        });
    };

    const removeKeyNav = (i: number) => {
        setData({
            ...data,
            key_navigation: data.key_navigation.filter((_, j) => j !== i),
        });
    };

    return (
        <div className="space-y-6 max-w-4xl pb-16">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <LayoutTemplate className="w-7 h-7 text-orange-500" />
                    Home page content
                </h1>
                <p className="text-sm text-slate-600 mt-2">
                    Edit the sections below. Use <strong>Save</strong> when finished. Line breaks in “Link text” become new lines on the site
                    (e.g. Virtual Tour on two lines).
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    <Section title="1. Key navigation (icons under the hero)">
                        <p className="text-xs text-slate-500">
                            Image paths are under <code className="bg-slate-100 px-1 rounded">/public</code> (e.g.{" "}
                            <code className="bg-slate-100 px-1 rounded">/icon-tour.png</code>).
                        </p>
                        {data.key_navigation.map((row, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-700">Link {i + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeKeyNav(i)}
                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        aria-label="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelClass}>Icon image path</label>
                                        <input className={inputClass} value={row.icon} onChange={(e) => updateKeyNav(i, { icon: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Alt text (accessibility)</label>
                                        <input className={inputClass} value={row.alt} onChange={(e) => updateKeyNav(i, { alt: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Link URL</label>
                                        <input className={inputClass} value={row.href} onChange={(e) => updateKeyNav(i, { href: e.target.value })} />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Link text (use Enter for a new line)</label>
                                        <textarea
                                            className={`${inputClass} min-h-[60px]`}
                                            value={row.label}
                                            onChange={(e) => updateKeyNav(i, { label: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Visual style</label>
                                        <select
                                            className={inputClass}
                                            value={row.nav_class}
                                            onChange={(e) => updateKeyNav(i, { nav_class: e.target.value })}
                                        >
                                            {NAV_CLASS_OPTIONS.map((o) => (
                                                <option key={o.value} value={o.value}>
                                                    {o.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-end pb-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={!!row.external}
                                                onChange={(e) => updateKeyNav(i, { external: e.target.checked })}
                                            />
                                            Open in new tab (for PDFs / external sites)
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={addKeyNav} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add navigation item
                        </Button>
                    </Section>

                    <Section title="2. Welcome / intro (heading and paragraphs)">
                        <div>
                            <label className={labelClass}>Main heading</label>
                            <input
                                className={inputClass}
                                value={data.intro.title}
                                onChange={(e) => setData({ ...data, intro: { ...data.intro, title: e.target.value } })}
                            />
                        </div>
                        <div>
                            <label className={labelClass}>Subheading</label>
                            <textarea
                                className={`${inputClass} min-h-[72px]`}
                                value={data.intro.subtitle}
                                onChange={(e) => setData({ ...data, intro: { ...data.intro, subtitle: e.target.value } })}
                            />
                        </div>
                        <p className="text-xs font-medium text-slate-600">Paragraphs</p>
                        {data.intro.paragraphs.map((p, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <textarea
                                    className={`${inputClass} flex-1 min-h-[80px]`}
                                    value={p}
                                    onChange={(e) => {
                                        const next = [...data.intro.paragraphs];
                                        next[i] = e.target.value;
                                        setData({ ...data, intro: { ...data.intro, paragraphs: next } });
                                    }}
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-red-600 p-1"
                                    onClick={() =>
                                        setData({
                                            ...data,
                                            intro: {
                                                ...data.intro,
                                                paragraphs: data.intro.paragraphs.filter((_, j) => j !== i),
                                            },
                                        })
                                    }
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    intro: { ...data.intro, paragraphs: [...data.intro.paragraphs, ""] },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add paragraph
                        </Button>
                    </Section>

                    <Section title='3. Why Choose Us (cards with photos)'>
                        <div className="grid sm:grid-cols-2 gap-2">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.why_choose_us.heading_prefix}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            why_choose_us: { ...data.why_choose_us, heading_prefix: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (orange part)</label>
                                <input
                                    className={inputClass}
                                    value={data.why_choose_us.heading_accent}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            why_choose_us: { ...data.why_choose_us, heading_accent: e.target.value },
                                        })
                                    }
                                />
                            </div>
                        </div>
                        {data.why_choose_us.features.map((f, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Card {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                why_choose_us: {
                                                    ...data.why_choose_us,
                                                    features: data.why_choose_us.features.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image path</label>
                                        <input
                                            className={inputClass}
                                            value={f.image}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], image: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input
                                            className={inputClass}
                                            value={f.title}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], title: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Short description</label>
                                        <input
                                            className={inputClass}
                                            value={f.desc}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], desc: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Card background colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={f.color}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], color: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Accent colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={f.accent}
                                            onChange={(e) => {
                                                const next = [...data.why_choose_us.features];
                                                next[i] = { ...next[i], accent: e.target.value };
                                                setData({ ...data, why_choose_us: { ...data.why_choose_us, features: next } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    why_choose_us: {
                                        ...data.why_choose_us,
                                        features: [
                                            ...data.why_choose_us.features,
                                            {
                                                image: "/infra.jpg",
                                                title: "New card",
                                                desc: "Description",
                                                color: "#FEE2E2",
                                                accent: "#EF4444",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add card
                        </Button>
                    </Section>

                    <Section title="4. Programs preview (circles on the home page)">
                        {data.programs_preview.programs.map((prog, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 space-y-2 bg-slate-50/80">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium">Program {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                programs_preview: {
                                                    ...data.programs_preview,
                                                    programs: data.programs_preview.programs.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    <div>
                                        <label className={labelClass}>Program name</label>
                                        <input
                                            className={inputClass}
                                            value={prog.programName}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], programName: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Age group</label>
                                        <input
                                            className={inputClass}
                                            value={prog.ageGroup}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], ageGroup: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image path</label>
                                        <input
                                            className={inputClass}
                                            value={prog.image}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], image: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Description</label>
                                        <textarea
                                            className={`${inputClass} min-h-[60px]`}
                                            value={prog.description}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], description: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Theme colour (hex)</label>
                                        <input
                                            className={inputClass}
                                            value={prog.color}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], color: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Vertical offset (e.g. -20px or 40px)</label>
                                        <input
                                            className={inputClass}
                                            value={prog.yOffset}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                next[i] = { ...next[i], yOffset: e.target.value };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className={labelClass}>Image crop (optional, e.g. center 20%)</label>
                                        <input
                                            className={inputClass}
                                            placeholder="center 20%"
                                            value={prog.imageStyle?.objectPosition ?? ""}
                                            onChange={(e) => {
                                                const next = [...data.programs_preview.programs];
                                                const v = e.target.value.trim();
                                                next[i] = {
                                                    ...next[i],
                                                    imageStyle: v ? { objectPosition: v } : undefined,
                                                };
                                                setData({ ...data, programs_preview: { ...data.programs_preview, programs: next } });
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    programs_preview: {
                                        ...data.programs_preview,
                                        programs: [
                                            ...data.programs_preview.programs,
                                            {
                                                image: "/day care.png",
                                                programName: "New program",
                                                ageGroup: "0 - 0 years",
                                                description: "",
                                                color: "#ef5f5f",
                                                yOffset: "0px",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add program
                        </Button>
                    </Section>

                    <Section title="5. Value based methodology (icon row)">
                        <div>
                            <label className={labelClass}>Section title</label>
                            <input
                                className={inputClass}
                                value={data.methodology.title}
                                onChange={(e) => setData({ ...data, methodology: { ...data.methodology, title: e.target.value } })}
                            />
                        </div>
                        {data.methodology.items.map((item, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 grid sm:grid-cols-2 gap-2 bg-slate-50/80">
                                <div className="sm:col-span-2 flex justify-between items-center">
                                    <span className="text-sm font-medium">Item {i + 1}</span>
                                    <button
                                        type="button"
                                        className="text-red-600 p-1"
                                        onClick={() =>
                                            setData({
                                                ...data,
                                                methodology: {
                                                    ...data.methodology,
                                                    items: data.methodology.items.filter((_, j) => j !== i),
                                                },
                                            })
                                        }
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Icon path</label>
                                    <input
                                        className={inputClass}
                                        value={item.icon}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], icon: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Label</label>
                                    <input
                                        className={inputClass}
                                        value={item.label}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], label: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Link</label>
                                    <input
                                        className={inputClass}
                                        value={item.href}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], href: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Shape style</label>
                                    <select
                                        className={inputClass}
                                        value={item.class}
                                        onChange={(e) => {
                                            const next = [...data.methodology.items];
                                            next[i] = { ...next[i], class: e.target.value };
                                            setData({ ...data, methodology: { ...data.methodology, items: next } });
                                        }}
                                    >
                                        {METH_CLASS_PRESETS.map((c) => (
                                            <option key={c} value={c}>
                                                {c}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setData({
                                    ...data,
                                    methodology: {
                                        ...data.methodology,
                                        items: [
                                            ...data.methodology.items,
                                            {
                                                icon: "/methodology-icon1.png",
                                                label: "New item",
                                                class: "nav-item1",
                                                href: "/programs",
                                            },
                                        ],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add item
                        </Button>
                    </Section>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
                <Button size="sm" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving…" : "Save changes"}
                </Button>
                <Button size="sm" variant="outline" onClick={load} disabled={saving || loading}>
                    Reload from server
                </Button>
                <Button size="sm" variant="outline" onClick={reset} disabled={saving || loading} className="text-amber-800 border-amber-200">
                    Reset to defaults
                </Button>
            </div>
        </div>
    );
}
