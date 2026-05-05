"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { LayoutTemplate, Plus, Trash2 } from "lucide-react";
import {
    DEFAULT_ABOUT_PAGE_DATA,
    mergeAboutPageData,
    type AboutBusiness,
    type AboutCoreValue,
    type AboutMagicalStoryCard,
    type AboutPageData,
    type AboutTrustItem,
} from "@/config/about-page-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="font-semibold text-slate-900">{title}</div>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
}

function MiniPreviewBox({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-3">
            <div className="text-xs font-semibold text-slate-700 mb-2">Preview • {title}</div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">{children}</div>
        </div>
    );
}

export default function AdminAboutContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<AboutPageData>(DEFAULT_ABOUT_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<AboutPageData>("/common/page-content/about/");
            setData(mergeAboutPageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_ABOUT_PAGE_DATA);
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
            await authFetch("/common/page-content/about/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh /about to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const hero = data.hero || {};
    const magical = data.magical_story || {};
    const beliefs = data.beliefs || {};
    const timeGroup = data.time_group || {};

    const magicalCards = useMemo(
        () => (Array.isArray(magical.cards) ? (magical.cards as AboutMagicalStoryCard[]) : []),
        [magical.cards],
    );
    const coreValues = useMemo(
        () => (Array.isArray(beliefs.core_values) ? (beliefs.core_values as AboutCoreValue[]) : []),
        [beliefs.core_values],
    );
    const businesses = useMemo(
        () => (Array.isArray(timeGroup.businesses) ? (timeGroup.businesses as AboutBusiness[]) : []),
        [timeGroup.businesses],
    );
    const trustItems = useMemo(
        () => (Array.isArray(timeGroup.trust_items) ? (timeGroup.trust_items as AboutTrustItem[]) : []),
        [timeGroup.trust_items],
    );

    const updateHero = (patch: Record<string, unknown>) => setData((p) => ({ ...p, hero: { ...(p.hero || {}), ...patch } }));
    const updateMagical = (patch: Record<string, unknown>) =>
        setData((p) => ({ ...p, magical_story: { ...(p.magical_story || {}), ...patch } }));
    const updateBeliefs = (patch: Record<string, unknown>) => setData((p) => ({ ...p, beliefs: { ...(p.beliefs || {}), ...patch } }));
    const updateTimeGroup = (patch: Record<string, unknown>) =>
        setData((p) => ({ ...p, time_group: { ...(p.time_group || {}), ...patch } }));

    const updateMagicalCard = (i: number, patch: Partial<AboutMagicalStoryCard>) => {
        const next = [...magicalCards];
        next[i] = { ...next[i], ...patch };
        updateMagical({ cards: next });
    };
    const addMagicalCard = () =>
        updateMagical({
            cards: [
                ...magicalCards,
                {
                    icon: "Building2",
                    icon_gradient: "from-orange-400 to-orange-600",
                    plane_position: magicalCards.length % 2 === 0 ? "right" : "left",
                    text: "New story item…",
                },
            ],
        });
    const removeMagicalCard = (i: number) => updateMagical({ cards: magicalCards.filter((_, j) => j !== i) });

    const updateCoreValue = (i: number, patch: Partial<AboutCoreValue>) => {
        const next = [...coreValues];
        next[i] = { ...next[i], ...patch };
        updateBeliefs({ core_values: next });
    };
    const addCoreValue = () => updateBeliefs({ core_values: [...coreValues, { title: "New value", text: "Description…", icon: "Heart" }] });
    const removeCoreValue = (i: number) => updateBeliefs({ core_values: coreValues.filter((_, j) => j !== i) });

    const updateBusiness = (i: number, patch: Partial<AboutBusiness>) => {
        const next = [...businesses];
        next[i] = { ...next[i], ...patch };
        updateTimeGroup({ businesses: next });
    };
    const addBusiness = () => updateTimeGroup({ businesses: [...businesses, { name: "New business", description: "Description…", icon: "Award" }] });
    const removeBusiness = (i: number) => updateTimeGroup({ businesses: businesses.filter((_, j) => j !== i) });

    const updateTrustItem = (i: number, patch: Partial<AboutTrustItem>) => {
        const next = [...trustItems];
        next[i] = { ...next[i], ...patch };
        updateTimeGroup({ trust_items: next });
    };
    const addTrustItem = () => updateTimeGroup({ trust_items: [...trustItems, { title: "New item", text: "Description…", icon: "Award" }] });
    const removeTrustItem = (i: number) => updateTimeGroup({ trust_items: trustItems.filter((_, j) => j !== i) });

    return (
        <div className="pb-16 space-y-4 max-w-6xl">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <LayoutTemplate className="w-6 h-6 text-orange-500" /> About page content
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Edit the public <span className="font-semibold text-slate-900">/about</span> page sections. Preview first, then edit below.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => load()} className="bg-white border border-slate-200 text-slate-800">
                        Reload
                    </Button>
                    <Button onClick={save} disabled={saving} className="bg-orange-500 text-white">
                        {saving ? "Saving…" : "Save changes"}
                    </Button>
                </div>
            </div>

            {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div> : null}
            {message ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{message}</div>
            ) : null}

            {loading ? <div className="text-sm text-slate-600">Loading…</div> : null}

            <Section title="1. Hero">
                <MiniPreviewBox title="Hero">
                    <div className="space-y-1">
                        <div className="text-xs font-semibold text-slate-700">
                            {(hero.badge_prefix || "—") + " {total_schools}+ " + (hero.badge_suffix || "—")}
                        </div>
                        <div className="text-lg font-bold text-slate-900">
                            {(hero.title_prefix || "—") + " "} <span className="text-orange-600">{hero.title_accent || "—"}</span>
                        </div>
                        <div className="text-sm text-slate-700">{hero.tagline || "—"}</div>
                        <div className="text-xs text-slate-600">{hero.subtitle || "—"}</div>
                    </div>
                </MiniPreviewBox>

                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Badge prefix</span>
                        <input value={hero.badge_prefix || ""} onChange={(e) => updateHero({ badge_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Badge suffix</span>
                        <input value={hero.badge_suffix || ""} onChange={(e) => updateHero({ badge_suffix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Title prefix</span>
                        <input value={hero.title_prefix || ""} onChange={(e) => updateHero({ title_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Title accent</span>
                        <input value={hero.title_accent || ""} onChange={(e) => updateHero({ title_accent: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                        <span className={labelClass}>Tagline</span>
                        <input value={hero.tagline || ""} onChange={(e) => updateHero({ tagline: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                        <span className={labelClass}>Subtitle line</span>
                        <input value={hero.subtitle || ""} onChange={(e) => updateHero({ subtitle: e.target.value })} className={inputClass} />
                    </label>
                </div>
            </Section>

            <Section title="2. Our magical story (plane banners)">
                <MiniPreviewBox title="Story header">
                    <div className="text-sm font-semibold text-slate-900">
                        {(magical.title_prefix || "—") + " "}
                        <span className="text-orange-600">{magical.title_accent || "—"}</span>
                        {" " + (magical.title_suffix || "—")}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{magical.subtitle || "—"}</div>
                </MiniPreviewBox>

                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Title prefix</span>
                        <input value={magical.title_prefix || ""} onChange={(e) => updateMagical({ title_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Title accent</span>
                        <input value={magical.title_accent || ""} onChange={(e) => updateMagical({ title_accent: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Title suffix</span>
                        <input value={magical.title_suffix || ""} onChange={(e) => updateMagical({ title_suffix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                        <span className={labelClass}>Subtitle</span>
                        <input value={magical.subtitle || ""} onChange={(e) => updateMagical({ subtitle: e.target.value })} className={inputClass} />
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm font-semibold text-slate-900">Story cards</div>
                    <Button onClick={addMagicalCard} className="bg-white border border-slate-200 text-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> Add card
                    </Button>
                </div>

                <div className="space-y-3">
                    {magicalCards.map((c, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
                            <MiniPreviewBox title={`Card ${i + 1}`}>
                                <div className="text-xs text-slate-700">
                                    <span className="font-semibold">Icon:</span> {c.icon || "—"}{" "}
                                    <span className="font-semibold ml-3">Plane:</span> {String(c.plane_position || "—")}
                                </div>
                                <div className="text-xs text-slate-600 mt-2 whitespace-pre-wrap line-clamp-4">{c.text || "—"}</div>
                            </MiniPreviewBox>

                            <div className="grid md:grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Icon (lucide name)</span>
                                    <input value={c.icon || ""} onChange={(e) => updateMagicalCard(i, { icon: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Icon gradient (tailwind)</span>
                                    <input
                                        value={c.icon_gradient || ""}
                                        onChange={(e) => updateMagicalCard(i, { icon_gradient: e.target.value })}
                                        className={inputClass}
                                        placeholder="from-orange-400 to-orange-600"
                                    />
                                </label>
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Plane position</span>
                                    <select
                                        value={String(c.plane_position || "right")}
                                        onChange={(e) => updateMagicalCard(i, { plane_position: e.target.value })}
                                        className={inputClass}
                                    >
                                        <option value="right">Plane on right</option>
                                        <option value="left">Plane on left</option>
                                    </select>
                                </label>
                                <div className="flex items-end justify-end">
                                    <Button onClick={() => removeMagicalCard(i)} className="bg-white border border-red-200 text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                                <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                                    <span className={labelClass}>Text</span>
                                    <textarea
                                        value={c.text || ""}
                                        onChange={(e) => updateMagicalCard(i, { text: e.target.value })}
                                        rows={4}
                                        className={inputClass}
                                    />
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="3. What we believe in">
                <MiniPreviewBox title="Section header">
                    <div className="text-sm font-semibold text-slate-900">
                        {(beliefs.heading_prefix || "—") + " "} <span className="text-orange-600">{beliefs.heading_accent || "—"}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{beliefs.subtitle || "—"}</div>
                </MiniPreviewBox>

                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Heading prefix</span>
                        <input value={beliefs.heading_prefix || ""} onChange={(e) => updateBeliefs({ heading_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Heading accent</span>
                        <input value={beliefs.heading_accent || ""} onChange={(e) => updateBeliefs({ heading_accent: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                        <span className={labelClass}>Subtitle</span>
                        <input value={beliefs.subtitle || ""} onChange={(e) => updateBeliefs({ subtitle: e.target.value })} className={inputClass} />
                    </label>
                </div>

                <div className="grid md:grid-cols-2 gap-3 pt-2">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Vision title</span>
                        <input
                            value={beliefs.vision?.title || ""}
                            onChange={(e) => updateBeliefs({ vision: { ...(beliefs.vision || {}), title: e.target.value } })}
                            className={inputClass}
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Philosophy title</span>
                        <input
                            value={beliefs.philosophy?.title || ""}
                            onChange={(e) =>
                                updateBeliefs({ philosophy: { ...(beliefs.philosophy || {}), title: e.target.value } })
                            }
                            className={inputClass}
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-1">
                        <span className={labelClass}>Vision text</span>
                        <textarea
                            value={beliefs.vision?.text || ""}
                            onChange={(e) => updateBeliefs({ vision: { ...(beliefs.vision || {}), text: e.target.value } })}
                            rows={4}
                            className={inputClass}
                        />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-1">
                        <span className={labelClass}>Philosophy text</span>
                        <textarea
                            value={beliefs.philosophy?.text || ""}
                            onChange={(e) =>
                                updateBeliefs({ philosophy: { ...(beliefs.philosophy || {}), text: e.target.value } })
                            }
                            rows={4}
                            className={inputClass}
                        />
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm font-semibold text-slate-900">Core values</div>
                    <Button onClick={addCoreValue} className="bg-white border border-slate-200 text-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> Add value
                    </Button>
                </div>

                <label className="text-xs font-semibold text-slate-700">
                    <span className={labelClass}>Core values section title</span>
                    <input value={beliefs.core_values_title || ""} onChange={(e) => updateBeliefs({ core_values_title: e.target.value })} className={inputClass} />
                </label>

                <div className="space-y-3">
                    {coreValues.map((v, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
                            <MiniPreviewBox title={`Value ${i + 1}`}>
                                <div className="text-sm font-semibold text-slate-900">{v.title || "—"}</div>
                                <div className="text-xs text-slate-600 mt-1">{v.text || "—"}</div>
                                <div className="text-[11px] text-slate-500 mt-2">Icon: {v.icon || "—"}</div>
                            </MiniPreviewBox>
                            <div className="grid md:grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Title</span>
                                    <input value={v.title || ""} onChange={(e) => updateCoreValue(i, { title: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Icon (lucide name)</span>
                                    <input value={v.icon || ""} onChange={(e) => updateCoreValue(i, { icon: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                                    <span className={labelClass}>Text</span>
                                    <textarea value={v.text || ""} onChange={(e) => updateCoreValue(i, { text: e.target.value })} rows={3} className={inputClass} />
                                </label>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button onClick={() => removeCoreValue(i)} className="bg-white border border-red-200 text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="4. T.I.M.E. group businesses + trust section">
                <MiniPreviewBox title="Section header">
                    <div className="text-xs font-semibold text-slate-700">{timeGroup.badge || "—"}</div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                        {(timeGroup.heading_prefix || "—") + " "} <span className="text-orange-600">{timeGroup.heading_accent || "—"}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">{timeGroup.subtitle || "—"}</div>
                </MiniPreviewBox>

                <div className="grid md:grid-cols-2 gap-3">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Badge</span>
                        <input value={timeGroup.badge || ""} onChange={(e) => updateTimeGroup({ badge: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Heading prefix</span>
                        <input value={timeGroup.heading_prefix || ""} onChange={(e) => updateTimeGroup({ heading_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Heading accent</span>
                        <input value={timeGroup.heading_accent || ""} onChange={(e) => updateTimeGroup({ heading_accent: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                        <span className={labelClass}>Subtitle</span>
                        <textarea value={timeGroup.subtitle || ""} onChange={(e) => updateTimeGroup({ subtitle: e.target.value })} rows={2} className={inputClass} />
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm font-semibold text-slate-900">Business cards</div>
                    <Button onClick={addBusiness} className="bg-white border border-slate-200 text-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> Add business
                    </Button>
                </div>

                <div className="space-y-3">
                    {businesses.map((b, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
                            <MiniPreviewBox title={`Business ${i + 1}`}>
                                <div className="text-sm font-semibold text-slate-900">{b.name || "—"}</div>
                                <div className="text-xs text-slate-600 mt-1">{b.description || "—"}</div>
                                <div className="text-[11px] text-slate-500 mt-2">Icon: {b.icon || "—"}</div>
                            </MiniPreviewBox>
                            <div className="grid md:grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Name</span>
                                    <input value={b.name || ""} onChange={(e) => updateBusiness(i, { name: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Icon (lucide name)</span>
                                    <input value={b.icon || ""} onChange={(e) => updateBusiness(i, { icon: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                                    <span className={labelClass}>Description</span>
                                    <textarea value={b.description || ""} onChange={(e) => updateBusiness(i, { description: e.target.value })} rows={2} className={inputClass} />
                                </label>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button onClick={() => removeBusiness(i)} className="bg-white border border-red-200 text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-3 pt-2">
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Trust title prefix</span>
                        <input value={timeGroup.trust_title_prefix || ""} onChange={(e) => updateTimeGroup({ trust_title_prefix: e.target.value })} className={inputClass} />
                    </label>
                    <label className="text-xs font-semibold text-slate-700">
                        <span className={labelClass}>Trust title accent</span>
                        <input value={timeGroup.trust_title_accent || ""} onChange={(e) => updateTimeGroup({ trust_title_accent: e.target.value })} className={inputClass} />
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <div className="text-sm font-semibold text-slate-900">Trust items</div>
                    <Button onClick={addTrustItem} className="bg-white border border-slate-200 text-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> Add item
                    </Button>
                </div>

                <div className="space-y-3">
                    {trustItems.map((t, i) => (
                        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-3 space-y-3">
                            <MiniPreviewBox title={`Item ${i + 1}`}>
                                <div className="text-sm font-semibold text-slate-900">{t.title || "—"}</div>
                                <div className="text-xs text-slate-600 mt-1">{t.text || "—"}</div>
                                <div className="text-[11px] text-slate-500 mt-2">Icon: {t.icon || "—"}</div>
                            </MiniPreviewBox>
                            <div className="grid md:grid-cols-2 gap-3">
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Title</span>
                                    <input value={t.title || ""} onChange={(e) => updateTrustItem(i, { title: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700">
                                    <span className={labelClass}>Icon (lucide name)</span>
                                    <input value={t.icon || ""} onChange={(e) => updateTrustItem(i, { icon: e.target.value })} className={inputClass} />
                                </label>
                                <label className="text-xs font-semibold text-slate-700 md:col-span-2">
                                    <span className={labelClass}>Text</span>
                                    <textarea value={t.text || ""} onChange={(e) => updateTrustItem(i, { text: e.target.value })} rows={2} className={inputClass} />
                                </label>
                                <div className="md:col-span-2 flex justify-end">
                                    <Button onClick={() => removeTrustItem(i)} className="bg-white border border-red-200 text-red-700">
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>
        </div>
    );
}

