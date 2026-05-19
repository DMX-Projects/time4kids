"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders, normalizeUploadedMediaPath, resolveCmsMediaUrl } from "@/lib/api-client";
import { EmbedVideoDraftPanel } from "@/components/admin/EmbedVideoDraftPanel";
import { Building2, Plus, Trash2, Upload } from "lucide-react";
import { parseEmbedInput, resolveFranchiseEmbedSrc } from "@/lib/franchise-embed-url";
import {
    DEFAULT_FRANCHISE_PAGE_DATA,
    FRANCHISE_SUCCESS_STORY_DEFAULT_TITLE,
    mergeFranchisePageData,
    type FranchiseBenefit,
    type FranchisePageData,
    type FranchiseTestimonial,
} from "@/config/franchise-page-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";
const MAX_VIDEO_BYTES = 20 * 1024 * 1024; // 20MB
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function CardPreview({ title, description }: { title: string; description: string }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-4">
            <div className="text-sm font-semibold text-slate-900">{title || "?"}</div>
            <div className="text-xs text-slate-600 mt-1 line-clamp-3 whitespace-pre-wrap">{description || "?"}</div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                <div className="font-semibold text-slate-900">{title}</div>
            </div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
}

export default function AdminFranchiseContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<FranchisePageData>(DEFAULT_FRANCHISE_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingKey, setUploadingKey] = useState<string | null>(null);
    const [uploadInfo, setUploadInfo] = useState<Record<string, string>>({});
    const [embedDraftTitle, setEmbedDraftTitle] = useState("");
    const [embedDraftInput, setEmbedDraftInput] = useState("");
    const [embedDraftThumbnail, setEmbedDraftThumbnail] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<FranchisePageData>("/common/page-content/franchise-opportunity/");
            setData(mergeFranchisePageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_FRANCHISE_PAGE_DATA);
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
            await authFetch("/common/page-content/franchise-opportunity/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify({
                    ...data,
                    testimonials: (data.testimonials ?? []).filter(
                        (t) => (t.video_url || "").trim() || (t.thumbnail_url || "").trim(),
                    ),
                }),
            });
            setMessage("Saved. Refresh /franchise to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const benefits = useMemo(() => (Array.isArray(data.benefits) ? data.benefits : []), [data.benefits]);
    const testimonials = useMemo(() => (Array.isArray(data.testimonials) ? data.testimonials : []), [data.testimonials]);

    const updateBenefit = (i: number, patch: Partial<FranchiseBenefit>) => {
        const next = [...benefits];
        next[i] = { ...next[i], ...patch };
        setData({ ...data, benefits: next });
    };
    const addBenefit = () => {
        setData({
            ...data,
            benefits: [...benefits, { icon: "Award", title: "New benefit", description: "Description" }],
        });
    };
    const removeBenefit = (i: number) => setData({ ...data, benefits: benefits.filter((_, j) => j !== i) });

    const updateOfferingText = (i: number, text: string) => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        const next = [...base];
        next[i] = text;
        setData({ ...data, offerings: next });
    };
    const addOffering = () => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        setData({ ...data, offerings: [...base, "New offering"] });
    };
    const removeOffering = (i: number) => {
        const base = Array.isArray(data.offerings) ? data.offerings : [];
        setData({ ...data, offerings: base.filter((_, j) => j !== i) });
    };

    const successStories: FranchiseTestimonial[] =
        testimonials.length > 0
            ? testimonials
            : [
                  {
                      title: FRANCHISE_SUCCESS_STORY_DEFAULT_TITLE,
                      author: "T.I.M.E. Kids",
                      location: "",
                      video_url: "",
                      thumbnail_url: "",
                  },
              ];

    const updateSuccessStory = (i: number, patch: Partial<FranchiseTestimonial>) => {
        const next = [...successStories];
        next[i] = { ...next[i], ...patch, location: "" };
        setData({ ...data, testimonials: next });
    };

    const addSuccessStory = () => {
        setData({
            ...data,
            testimonials: [
                ...successStories,
                {
                    title: `Success story ${successStories.length + 1}`,
                    author: "T.I.M.E. Kids",
                    location: "",
                    video_url: "",
                    thumbnail_url: "",
                },
            ],
        });
    };

    const removeSuccessStory = (i: number) => {
        setData({
            ...data,
            testimonials: successStories.filter((_, j) => j !== i),
        });
    };

    const normalizeStoryVideoUrl = (raw: string): string => {
        const trimmed = raw.trim();
        if (!trimmed) return "";
        const embed = resolveFranchiseEmbedSrc(parseEmbedInput(trimmed));
        return embed || trimmed;
    };

    const addEmbedSuccessStory = () => {
        setError(null);
        setMessage(null);
        const embedSrc = resolveFranchiseEmbedSrc(parseEmbedInput(embedDraftInput));
        if (!embedSrc) {
            setError("Paste a valid YouTube / MediaDelivery link or full <iframe ?> code.");
            return;
        }
        setData({
            ...data,
            testimonials: [
                ...successStories,
                {
                    title: embedDraftTitle.trim() || `Success story ${successStories.length + 1}`,
                    author: "T.I.M.E. Kids",
                    location: "",
                    video_url: embedSrc,
                    thumbnail_url: embedDraftThumbnail.trim(),
                },
            ],
        });
        setEmbedDraftTitle("");
        setEmbedDraftInput("");
        setEmbedDraftThumbnail("");
        setMessage("Embedded video added to carousel. Click Save changes when done.");
    };

    const uploadMediaFile = async (opts: { title: string; media_type: "image" | "video"; file: File }) => {
        const max = opts.media_type === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
        if (opts.file.size > max) {
            throw new Error(
                `File is too large (${formatMb(opts.file.size)}). Max allowed is ${opts.media_type === "video" ? "20MB" : "5MB"}.`,
            );
        }

        const formData = new FormData();
        formData.append("title", opts.title);
        formData.append("category", "Banner");
        formData.append("media_type", opts.media_type);
        formData.append("file", opts.file);

        const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
        const filePath = created?.file;
        if (!filePath || typeof filePath !== "string") {
            throw new Error("Upload succeeded but server did not return a file path.");
        }
        return normalizeUploadedMediaPath(filePath);
    };

    const uploadMedia = async (key: string, opts: { title: string; media_type: "image" | "video"; file: File }) => {
        setError(null);
        setMessage(null);
        setUploadingKey(key);
        try {
            setUploadInfo((prev) => ({ ...prev, [key]: `${opts.file.name} ? ${formatMb(opts.file.size)}` }));
            return await uploadMediaFile(opts);
        } finally {
            setUploadingKey(null);
        }
    };

    const bulkUploadSuccessVideos = async (fileList: FileList | null) => {
        if (!fileList?.length) return;
        const files = Array.from(fileList);
        setError(null);
        setMessage(null);
        setUploadingKey("story-bulk");
        const next: FranchiseTestimonial[] = [...successStories];
        let ok = 0;
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setUploadInfo((prev) => ({
                    ...prev,
                    "story-bulk": `Uploading ${i + 1} / ${files.length}: ${file.name}`,
                }));
                const url = await uploadMediaFile({
                    title: `Franchise success story ${next.length + 1}`,
                    media_type: "video",
                    file,
                });
                next.push({
                    title: `Success story ${next.length + 1}`,
                    author: "T.I.M.E. Kids",
                    location: "",
                    video_url: url,
                    thumbnail_url: "",
                });
                ok++;
            }
            setData({ ...data, testimonials: next });
            setMessage(
                `${ok} video(s) added to the carousel. Add thumbnails if you like, then click Save changes.`,
            );
        } catch (err: unknown) {
            if (ok > 0) {
                setData({ ...data, testimonials: next });
            }
            setError(err instanceof Error ? err.message : "Bulk video upload failed");
        } finally {
            setUploadingKey(null);
            setUploadInfo((prev) => {
                const { "story-bulk": _, ...rest } = prev;
                return rest;
            });
        }
    };

    return (
        <div className="pb-16 space-y-4 max-w-6xl">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-7 h-7 text-orange-500" />
                    Franchise page content
                </h1>
                <p className="text-sm text-slate-600">
                    Edit CMS content on <strong>/franchise</strong>. The enquiry form is embedded separately (Nopaper). Use <strong>Save</strong> when finished.
                </p>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading?</p>
            ) : (
                <div className="space-y-4">
                    <Section title="1. Hero (top heading)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Title (first word)</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.title_prefix}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title_prefix: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Title (second word)</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.title_accent}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, title_accent: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input
                                    className={inputClass}
                                    value={data.hero.subtitle}
                                    onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro paragraph 1 (below subtitle)</label>
                                <textarea
                                    className={`${inputClass} min-h-[80px]`}
                                    value={data.hero.intro_paragraphs?.[0] ?? ""}
                                    onChange={(e) => {
                                        const second = data.hero.intro_paragraphs?.[1] ?? "";
                                        setData({
                                            ...data,
                                            hero: { ...data.hero, intro_paragraphs: [e.target.value, second] },
                                        });
                                    }}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro paragraph 2</label>
                                <textarea
                                    className={`${inputClass} min-h-[80px]`}
                                    value={data.hero.intro_paragraphs?.[1] ?? ""}
                                    onChange={(e) => {
                                        const first = data.hero.intro_paragraphs?.[0] ?? "";
                                        setData({
                                            ...data,
                                            hero: { ...data.hero, intro_paragraphs: [first, e.target.value] },
                                        });
                                    }}
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="1b. Benefits section heading">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.heading_prefix ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: { ...data.benefits_section, heading_prefix: e.target.value, heading_accent: data.benefits_section?.heading_accent ?? "" },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (accent part)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.heading_accent ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: {
                                                ...data.benefits_section,
                                                heading_prefix: data.benefits_section?.heading_prefix ?? "",
                                                heading_accent: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Blurb under heading (optional)</label>
                                <input
                                    className={inputClass}
                                    value={data.benefits_section?.blurb ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            benefits_section: {
                                                heading_prefix: data.benefits_section?.heading_prefix ?? "",
                                                heading_accent: data.benefits_section?.heading_accent ?? "",
                                                blurb: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="2. Benefits (cards)">
                        {benefits.map((b, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800 truncate">
                                        {b.title?.trim() ? b.title : `Benefit card ${i + 1}`}
                                    </div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeBenefit(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <CardPreview title={b.title} description={b.description} />
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className={labelClass}>Title</label>
                                        <input className={inputClass} value={b.title} onChange={(e) => updateBenefit(i, { title: e.target.value })} />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className={labelClass}>Description</label>
                                        <textarea className={`${inputClass} min-h-[72px]`} value={b.description} onChange={(e) => updateBenefit(i, { description: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addBenefit} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add benefit card
                        </Button>
                    </Section>

                    <Section title="2b. Offerings section heading">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading (first part)</label>
                                <input
                                    className={inputClass}
                                    value={data.offerings_section?.heading_prefix ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                ...data.offerings_section,
                                                heading_prefix: e.target.value,
                                                heading_accent: data.offerings_section?.heading_accent ?? "",
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Heading (accent part)</label>
                                <input
                                    className={inputClass}
                                    value={data.offerings_section?.heading_accent ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                ...data.offerings_section,
                                                heading_prefix: data.offerings_section?.heading_prefix ?? "",
                                                heading_accent: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Intro above checklist (optional)</label>
                                <textarea
                                    className={`${inputClass} min-h-[72px]`}
                                    value={data.offerings_section?.intro ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            offerings_section: {
                                                heading_prefix: data.offerings_section?.heading_prefix ?? "",
                                                heading_accent: data.offerings_section?.heading_accent ?? "",
                                                intro: e.target.value,
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                    </Section>

                    <Section title="3. What we offer (list)">
                        {(Array.isArray(data.offerings) ? data.offerings : []).map((t, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800">Item {i + 1}</div>
                                    <button type="button" className="text-red-600 hover:bg-red-50 p-1 rounded" onClick={() => removeOffering(i)}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Text</label>
                                    <input className={inputClass} value={t} onChange={(e) => updateOfferingText(i, e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" size="sm" variant="outline" onClick={addOffering} className="inline-flex items-center gap-2">
                            <Plus className="w-4 h-4" /> Add offering
                        </Button>
                    </Section>

                    <Section title="4. What you need to get started (left column)">
                        <p className="text-xs text-slate-500">Shown under the enquiry form on /franchise.</p>
                        <div className="grid gap-3">
                            <div>
                                <label className={labelClass}>Section heading</label>
                                <input
                                    className={inputClass}
                                    value={data.getting_started?.heading ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            getting_started: {
                                                heading: e.target.value,
                                                intro: data.getting_started?.intro ?? "",
                                                items: data.getting_started?.items ?? [],
                                            },
                                        })
                                    }
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Intro</label>
                                <textarea
                                    className={`${inputClass} min-h-[72px]`}
                                    value={data.getting_started?.intro ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            getting_started: {
                                                heading: data.getting_started?.heading ?? "",
                                                intro: e.target.value,
                                                items: data.getting_started?.items ?? [],
                                            },
                                        })
                                    }
                                />
                            </div>
                        </div>
                        {(data.getting_started?.items ?? []).map((item, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-3 bg-slate-50/80 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-sm font-semibold text-slate-800">{item.title || `Item ${i + 1}`}</div>
                                    <button
                                        type="button"
                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        onClick={() => {
                                            const items = (data.getting_started?.items ?? []).filter((_, j) => j !== i);
                                            setData({
                                                ...data,
                                                getting_started: {
                                                    heading: data.getting_started?.heading ?? "",
                                                    intro: data.getting_started?.intro ?? "",
                                                    items,
                                                },
                                            });
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div>
                                    <label className={labelClass}>Title</label>
                                    <input
                                        className={inputClass}
                                        value={item.title}
                                        onChange={(e) => {
                                            const items = [...(data.getting_started?.items ?? [])];
                                            items[i] = { ...items[i], title: e.target.value };
                                            setData({
                                                ...data,
                                                getting_started: {
                                                    heading: data.getting_started?.heading ?? "",
                                                    intro: data.getting_started?.intro ?? "",
                                                    items,
                                                },
                                            });
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className={labelClass}>Description</label>
                                    <textarea
                                        className={`${inputClass} min-h-[72px]`}
                                        value={item.description}
                                        onChange={(e) => {
                                            const items = [...(data.getting_started?.items ?? [])];
                                            items[i] = { ...items[i], description: e.target.value };
                                            setData({
                                                ...data,
                                                getting_started: {
                                                    heading: data.getting_started?.heading ?? "",
                                                    intro: data.getting_started?.intro ?? "",
                                                    items,
                                                },
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setData({
                                    ...data,
                                    getting_started: {
                                        heading: data.getting_started?.heading ?? "What You Need to Get Started",
                                        intro: data.getting_started?.intro ?? "",
                                        items: [
                                            ...(data.getting_started?.items ?? []),
                                            { title: "New requirement", description: "" },
                                        ],
                                    },
                                })
                            }
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add requirement
                        </Button>
                    </Section>

                    <Section title="5. Closing block (orange box, main column)">
                        <p className="text-xs text-slate-500">Shown at the bottom of the main story column on /franchise.</p>
                        <div>
                            <label className={labelClass}>Heading</label>
                            <input
                                className={inputClass}
                                value={data.closing?.heading ?? ""}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        closing: {
                                            heading: e.target.value,
                                            paragraphs: data.closing?.paragraphs ?? [""],
                                        },
                                    })
                                }
                            />
                        </div>
                        {(data.closing?.paragraphs ?? [""]).map((p, i) => (
                            <div key={i} className="flex gap-2 items-start">
                                <textarea
                                    className={`${inputClass} flex-1 min-h-[72px]`}
                                    value={p}
                                    onChange={(e) => {
                                        const paragraphs = [...(data.closing?.paragraphs ?? [""])];
                                        paragraphs[i] = e.target.value;
                                        setData({
                                            ...data,
                                            closing: {
                                                heading: data.closing?.heading ?? "",
                                                paragraphs,
                                            },
                                        });
                                    }}
                                />
                                <button
                                    type="button"
                                    className="mt-2 text-red-600 p-1"
                                    onClick={() => {
                                        const paragraphs = (data.closing?.paragraphs ?? []).filter((_, j) => j !== i);
                                        setData({
                                            ...data,
                                            closing: {
                                                heading: data.closing?.heading ?? "",
                                                paragraphs: paragraphs.length ? paragraphs : [""],
                                            },
                                        });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setData({
                                    ...data,
                                    closing: {
                                        heading: data.closing?.heading ?? "",
                                        paragraphs: [...(data.closing?.paragraphs ?? []), ""],
                                    },
                                })
                            }
                        >
                            <Plus className="w-4 h-4 inline mr-1" /> Add paragraph
                        </Button>
                    </Section>

                    <Section title="6. Quick highlights (grid below form)">
                        <p className="text-xs text-slate-500">Full-width band under the form + story columns on /franchise.</p>
                        <div>
                            <label className={labelClass}>Section heading</label>
                            <input
                                className={inputClass}
                                value={data.quick_highlights?.heading ?? ""}
                                onChange={(e) =>
                                    setData({
                                        ...data,
                                        quick_highlights: {
                                            heading: e.target.value,
                                            items: data.quick_highlights?.items ?? [],
                                        },
                                    })
                                }
                            />
                        </div>
                        {(data.quick_highlights?.items ?? []).map((line, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input
                                    className={inputClass}
                                    value={line}
                                    onChange={(e) => {
                                        const items = [...(data.quick_highlights?.items ?? [])];
                                        items[i] = e.target.value;
                                        setData({
                                            ...data,
                                            quick_highlights: {
                                                heading: data.quick_highlights?.heading ?? "",
                                                items,
                                            },
                                        });
                                    }}
                                />
                                <button
                                    type="button"
                                    className="text-red-600 p-1"
                                    onClick={() => {
                                        const items = (data.quick_highlights?.items ?? []).filter((_, j) => j !== i);
                                        setData({
                                            ...data,
                                            quick_highlights: {
                                                heading: data.quick_highlights?.heading ?? "",
                                                items,
                                            },
                                        });
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setData({
                                    ...data,
                                    quick_highlights: {
                                        heading: data.quick_highlights?.heading ?? "Quick Highlights",
                                        items: [...(data.quick_highlights?.items ?? []), "New highlight"],
                                    },
                                })
                            }
                            className="inline-flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Add highlight
                        </Button>
                    </Section>
                    <Section title="7. Success stories ? multiple videos (/franchise)">
                        <p className="text-xs text-slate-600 mb-3 -mt-1">
                            <strong>Franchisee Success Stories</strong> on <strong>/franchise</strong> is one rectangular
                            slider. Add MP4 uploads, or iframe / YouTube / MediaDelivery links ? order here is
                            play order in the slider (Video 1, 2, 3?). Click a video on the site to open the popup player.
                        </p>
                        <EmbedVideoDraftPanel
                            className="mb-4"
                            draftTitle={embedDraftTitle}
                            onDraftTitleChange={setEmbedDraftTitle}
                            draftThumbnail={embedDraftThumbnail}
                            onDraftThumbnailChange={setEmbedDraftThumbnail}
                            draftEmbedInput={embedDraftInput}
                            onDraftEmbedInputChange={setEmbedDraftInput}
                            uploadingThumbnail={uploadingKey === "embed-draft-thumb"}
                            onThumbnailFileSelect={async (file) => {
                                try {
                                    const url = await uploadMedia("embed-draft-thumb", {
                                        title: `Franchise embed thumbnail: ${embedDraftTitle.trim() || "Story"}`,
                                        media_type: "image",
                                        file,
                                    });
                                    setEmbedDraftThumbnail(url);
                                    setMessage("Thumbnail uploaded. Paste embed code, then add to carousel.");
                                } catch (err: unknown) {
                                    setError(err instanceof Error ? err.message : "Thumbnail upload failed");
                                }
                            }}
                            onSubmit={addEmbedSuccessStory}
                            submitLabel="Add embedded video to carousel"
                        />
                        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-xl bg-orange-50 border border-orange-100">
                            <span className="text-sm font-semibold text-orange-900">
                                {successStories.length} video{successStories.length === 1 ? "" : "s"} in section
                            </span>
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addSuccessStory}
                                className="inline-flex items-center gap-2 bg-white"
                            >
                                <Plus className="w-4 h-4" /> Add empty slot
                            </Button>
                            <label
                                className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold cursor-pointer ${
                                    uploadingKey === "story-bulk"
                                        ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                        : "bg-orange-500 text-white border-orange-500 hover:bg-orange-600"
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="video/*"
                                    multiple
                                    className="hidden"
                                    disabled={uploadingKey === "story-bulk"}
                                    onChange={(e) => {
                                        void bulkUploadSuccessVideos(e.target.files);
                                        e.target.value = "";
                                    }}
                                />
                                <Upload className="w-4 h-4 mr-2" />
                                {uploadingKey === "story-bulk" ? "Uploading?" : "Upload multiple videos"}
                            </label>
                        </div>
                        {uploadInfo["story-bulk"] ? (
                            <p className="text-xs text-slate-500 mb-3">{uploadInfo["story-bulk"]}</p>
                        ) : null}
                        {successStories.map((story, i) => (
                            <div key={i} className="rounded-xl border border-slate-100 p-4 bg-slate-50/80 space-y-3 mb-3">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-sm font-semibold text-slate-800">
                                        Video {i + 1}
                                        {story.title?.trim() ? ` ? ${story.title}` : ""}
                                    </span>
                                    <button
                                        type="button"
                                        className="text-red-600 hover:bg-red-50 p-1 rounded"
                                        onClick={() => removeSuccessStory(i)}
                                        title="Remove this video"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-4">
                                    <div className="min-w-0 flex-1 space-y-3">
                                        <div>
                                            <label className={labelClass}>Thumbnail image</label>
                                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                                <input
                                                    className={inputClass}
                                                    value={story.thumbnail_url ?? ""}
                                                    onChange={(e) => updateSuccessStory(i, { thumbnail_url: e.target.value })}
                                                    placeholder="/media/? or /feature-annual-day-celebrations.png"
                                                />
                                                <label
                                                    className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                        uploadingKey === `story-${i}-thumb`
                                                            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                    }`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        disabled={uploadingKey === `story-${i}-thumb`}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            e.target.value = "";
                                                            if (!file) return;
                                                            try {
                                                                const url = await uploadMedia(`story-${i}-thumb`, {
                                                                    title: `Franchise story ${i + 1} thumbnail`,
                                                                    media_type: "image",
                                                                    file,
                                                                });
                                                                updateSuccessStory(i, { thumbnail_url: url });
                                                                setMessage("Thumbnail uploaded. Don?t forget to Save changes.");
                                                            } catch (err: unknown) {
                                                                setError(err instanceof Error ? err.message : "Thumbnail upload failed");
                                                            }
                                                        }}
                                                    />
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload
                                                </label>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">Max 5MB. JPG or PNG recommended.</p>
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                Video ? MP4 path, or iframe / YouTube / MediaDelivery URL
                                            </label>
                                            {resolveFranchiseEmbedSrc(parseEmbedInput(story.video_url || "")) ? (
                                                <p className="text-[11px] font-semibold text-blue-700 mb-1">
                                                    Iframe embed detected ? plays in popup on /franchise
                                                </p>
                                            ) : null}
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
                                                <textarea
                                                    className={`${inputClass} min-h-[72px] flex-1 font-mono text-xs`}
                                                    value={story.video_url ?? ""}
                                                    onChange={(e) => updateSuccessStory(i, { video_url: e.target.value })}
                                                    onBlur={(e) => {
                                                        const normalized = normalizeStoryVideoUrl(e.target.value);
                                                        if (normalized && normalized !== e.target.value.trim()) {
                                                            updateSuccessStory(i, { video_url: normalized });
                                                        }
                                                    }}
                                                    placeholder="https://iframe.mediadelivery.net/embed/? or paste <iframe ?> code"
                                                />
                                                <label
                                                    className={`shrink-0 inline-flex items-center justify-center rounded-lg border px-3 py-2 text-sm font-semibold ${
                                                        uploadingKey === `story-${i}-video`
                                                            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                                    }`}
                                                >
                                                    <input
                                                        type="file"
                                                        accept="video/*"
                                                        className="hidden"
                                                        disabled={uploadingKey === `story-${i}-video`}
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            e.target.value = "";
                                                            if (!file) return;
                                                            try {
                                                                const url = await uploadMedia(`story-${i}-video`, {
                                                                    title: `Franchise success story ${i + 1}`,
                                                                    media_type: "video",
                                                                    file,
                                                                });
                                                                updateSuccessStory(i, { video_url: url });
                                                                setMessage("Video uploaded. Don?t forget to Save changes.");
                                                            } catch (err: unknown) {
                                                                setError(err instanceof Error ? err.message : "Video upload failed");
                                                            }
                                                        }}
                                                    />
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Upload
                                                </label>
                                            </div>
                                            <p className="mt-1 text-[11px] text-slate-500">Max 20MB for uploaded MP4.</p>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Title (shown in video popup)</label>
                                            <input
                                                className={inputClass}
                                                value={story.title}
                                                onChange={(e) => updateSuccessStory(i, { title: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Subtitle (e.g. T.I.M.E. Kids)</label>
                                            <input
                                                className={inputClass}
                                                value={story.author}
                                                onChange={(e) => updateSuccessStory(i, { author: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    {(story.thumbnail_url || "").trim() ? (
                                        <div className="h-44 w-36 shrink-0 overflow-hidden rounded-2xl border-2 border-orange-200 bg-slate-100 shadow-inner">
                                            <img
                                                src={resolveCmsMediaUrl(story.thumbnail_url) || story.thumbnail_url}
                                                alt="Thumbnail preview"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={addSuccessStory}
                                className="inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add another video slot
                            </Button>
                        </div>
                    </Section>

                    <Section title="8. Connect with representative (map + contact)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className={labelClass}>Heading prefix</label>
                                <input className={inputClass} value={data.main_branch.heading_prefix} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, heading_prefix: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Heading accent</label>
                                <input className={inputClass} value={data.main_branch.heading_accent} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, heading_accent: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input className={inputClass} value={data.main_branch.subtitle} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, subtitle: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Google map embed URL</label>
                                <input className={inputClass} value={data.main_branch.map_embed_url} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, map_embed_url: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Corporate office title (left card)</label>
                                <input className={inputClass} value={data.main_branch.office_title} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, office_title: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Regional offices title (right card)</label>
                                <input
                                    className={inputClass}
                                    value={data.main_branch.regional_office_title ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            main_branch: { ...data.main_branch, regional_office_title: e.target.value },
                                        })
                                    }
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Corporate office address ? left card (HTML allowed, use &lt;br /&gt; for new lines)</label>
                                <textarea className={`${inputClass} min-h-[96px]`} value={data.main_branch.address_html} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, address_html: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Regional offices address ? right card</label>
                                <textarea
                                    className={`${inputClass} min-h-[180px]`}
                                    value={data.main_branch.regional_address_html ?? ""}
                                    onChange={(e) =>
                                        setData({
                                            ...data,
                                            main_branch: { ...data.main_branch, regional_address_html: e.target.value },
                                        })
                                    }
                                    placeholder="Uses tk-regional-offices grid HTML (state / city / phone columns). Leave blank to reset to default."
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input className={inputClass} value={data.main_branch.phone} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, phone: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Fax</label>
                                <input className={inputClass} value={data.main_branch.fax} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, fax: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Email</label>
                                <input className={inputClass} value={data.main_branch.email} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, email: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Franchise email</label>
                                <input className={inputClass} value={data.main_branch.franchise_email} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, franchise_email: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Cell</label>
                                <input className={inputClass} value={data.main_branch.cell} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, cell: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Directions URL</label>
                                <input className={inputClass} value={data.main_branch.directions_url} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, directions_url: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Directions button label</label>
                                <input className={inputClass} value={data.main_branch.directions_label} onChange={(e) => setData({ ...data, main_branch: { ...data.main_branch, directions_label: e.target.value } })} />
                            </div>
                        </div>
                    </Section>

                    <Section title="9. Brochure (bottom section)">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <label className={labelClass}>Heading</label>
                                <input className={inputClass} value={data.brochure.heading} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, heading: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Subtitle</label>
                                <input className={inputClass} value={data.brochure.subtitle} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, subtitle: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Button label</label>
                                <input className={inputClass} value={data.brochure.button_label} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, button_label: e.target.value } })} />
                            </div>
                            <div>
                                <label className={labelClass}>Fallback PDF URL</label>
                                <input className={inputClass} value={data.brochure.fallback_url} onChange={(e) => setData({ ...data, brochure: { ...data.brochure, fallback_url: e.target.value } })} />
                            </div>
                            <div className="md:col-span-2">
                                <label className={labelClass}>Marketing asset slug (optional)</label>
                                <input
                                    className={inputClass}
                                    value={data.brochure.marketing_asset_slug}
                                    onChange={(e) => setData({ ...data, brochure: { ...data.brochure, marketing_asset_slug: e.target.value } })}
                                />
                                <p className="mt-1 text-[11px] text-slate-500">
                                    If a Marketing Asset with this slug exists, its file/title will be used for the button.
                                </p>
                            </div>
                        </div>
                    </Section>
                </div>
            )}

            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-green-700">{message}</p>}

            <div className="flex flex-wrap gap-3 pt-4 mt-4 border-t border-slate-200">
                <Button size="sm" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving?" : "Save changes"}
                </Button>
                <Button size="sm" variant="outline" onClick={load} disabled={saving || loading}>
                    Reload from server
                </Button>
            </div>
        </div>
    );
}

