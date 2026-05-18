"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Film, Link2, Plus, Trash2, Upload } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import { FranchiseLocalFolderPicker } from "@/components/franchise/FranchiseLocalFolderPicker";
import { apiUrl, mediaUrl } from "@/lib/api-client";
import { resolveFranchiseEmbedSrc, parseEmbedInput } from "@/lib/franchise-embed-url";
import { extensionOf, titleFromFileName } from "@/lib/franchise-centre-upload";

type GallerySection = {
    id: number;
    title: string;
    slug: string;
    order: number;
    is_active: boolean;
    item_count?: number;
};

type MediaRow = {
    id: number;
    title: string;
    caption?: string;
    file: string;
    embed_url?: string;
    media_type: "image" | "video" | "embed";
    section?: number | null;
    section_title?: string;
    order?: number;
    created_at: string;
};

function sortByOrder(items: MediaRow[]): MediaRow[] {
    return [...items].sort((a, b) => {
        const oa = a.order ?? 0;
        const ob = b.order ?? 0;
        if (oa !== ob) return oa - ob;
        return a.id - b.id;
    });
}

function nextOrderForSection(items: MediaRow[], sectionId: number): number {
    const inSection = items.filter((i) => i.section === sectionId);
    if (!inSection.length) return 0;
    return Math.max(...inSection.map((i) => i.order ?? 0)) + 1;
}

function detectMediaType(file: File): "image" | "video" {
    const ext = extensionOf(file);
    if (file.type.startsWith("video/") || [".mp4", ".webm", ".mov", ".m4v"].includes(ext)) return "video";
    return "image";
}

export function GalleryMediaManager() {
    const { authFetch, tokens } = useAuth();
    const { showToast } = useToast();

    const [sections, setSections] = useState<GallerySection[]>([]);
    const [items, setItems] = useState<MediaRow[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState("");

    const [newHeading, setNewHeading] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const [uploadAs, setUploadAs] = useState<"auto" | "image" | "video">("auto");
    const [embedInput, setEmbedInput] = useState("");
    const [embedTitle, setEmbedTitle] = useState("");
    const [reorderingId, setReorderingId] = useState<number | null>(null);

    const selected = sections.find((s) => s.id === selectedId) ?? null;

    const loadSections = useCallback(async () => {
        const data = await authFetch<GallerySection[]>("/media/sections/");
        const list = Array.isArray(data) ? data : [];
        setSections(list);
        if (list.length && selectedId == null) setSelectedId(list[0].id);
        else if (selectedId && !list.some((s) => s.id === selectedId)) setSelectedId(list[0]?.id ?? null);
    }, [authFetch, selectedId]);

    const loadItems = useCallback(async () => {
        const q = selectedId ? `?section=${selectedId}&page_size=500` : "?page_size=500";
        const data = await authFetch<{ results?: MediaRow[] } | MediaRow[]>(`/media/${q}`);
        const list = Array.isArray(data) ? data : data.results ?? [];
        setItems(list);
    }, [authFetch, selectedId]);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            await loadSections();
            await loadItems();
        } finally {
            setLoading(false);
        }
    }, [loadSections, loadItems]);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    useEffect(() => {
        if (selectedId != null) void loadItems();
    }, [selectedId, loadItems]);

    const addHeading = async (e: FormEvent) => {
        e.preventDefault();
        const title = newHeading.trim();
        if (!title) return;
        try {
            const created = await authFetch<GallerySection>("/media/sections/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, order: sections.length, is_active: true }),
            });
            setNewHeading("");
            setSelectedId(created.id);
            await loadSections();
            showToast("Heading created", "success");
        } catch {
            showToast("Could not create heading", "error");
        }
    };

    const deleteHeading = async (id: number) => {
        if (!confirm("Delete this heading and all its photos/videos?")) return;
        try {
            await authFetch(`/media/sections/${id}/`, { method: "DELETE" });
            if (selectedId === id) setSelectedId(null);
            await refresh();
            showToast("Heading deleted", "success");
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const uploadFiles = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) {
            showToast("Create or select a heading first", "error");
            return;
        }
        if (!files.length) {
            showToast("Choose files or a folder", "error");
            return;
        }
        if (!tokens?.access) {
            showToast("Please sign in again", "error");
            return;
        }

        setUploading(true);
        let ok = 0;
        let fail = 0;
        const baseOrder = nextOrderForSection(items, selected.id);
        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                setProgress(`${i + 1} / ${files.length}`);
                const kind = uploadAs === "auto" ? detectMediaType(file) : uploadAs;
                const fd = new FormData();
                fd.append("section", String(selected.id));
                fd.append("title", `${selected.title} - ${titleFromFileName(file)}`);
                fd.append("caption", titleFromFileName(file));
                fd.append("category", "Events");
                fd.append("media_type", kind);
                fd.append("order", String(baseOrder + i));
                fd.append("file", file);
                try {
                    const res = await fetch(apiUrl("/media/"), {
                        method: "POST",
                        headers: { Authorization: `Bearer ${tokens.access}` },
                        body: fd,
                    });
                    if (res.ok) {
                        ok++;
                    } else {
                        fail++;
                        let detail = res.statusText;
                        try {
                            const err = (await res.json()) as { detail?: string };
                            if (err?.detail) detail = String(err.detail);
                        } catch {
                            /* ignore */
                        }
                        console.error(`Upload failed for ${file.name}:`, detail);
                    }
                } catch (err) {
                    fail++;
                    console.error(`Upload failed for ${file.name}:`, err);
                }
            }
            showToast(`${ok} uploaded${fail ? `, ${fail} failed` : ""}`, ok ? "success" : "error");
            setFiles([]);
            await refresh();
        } finally {
            setUploading(false);
            setProgress("");
        }
    };

    const addEmbed = async (e: FormEvent) => {
        e.preventDefault();
        if (!selected) {
            showToast("Select a heading first", "error");
            return;
        }
        const parsed = parseEmbedInput(embedInput);
        const embedSrc = resolveFranchiseEmbedSrc(parsed);
        if (!embedSrc) {
            showToast("Paste a valid YouTube / MediaDelivery link or iframe code", "error");
            return;
        }
        try {
            const order = nextOrderForSection(items, selected.id);
            await authFetch("/media/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    section: selected.id,
                    title: embedTitle.trim() || `${selected.title} - Video`,
                    caption: embedTitle.trim() || "Embedded video",
                    category: "Events",
                    media_type: "embed",
                    embed_url: embedSrc,
                    order,
                }),
            });
            setEmbedInput("");
            setEmbedTitle("");
            await refresh();
            showToast("Iframe video added — live on gallery", "success");
        } catch {
            showToast("Could not add embed", "error");
        }
    };

    const deleteItem = async (id: number) => {
        if (!confirm("Delete this item?")) return;
        try {
            await authFetch(`/media/${id}/`, { method: "DELETE" });
            await refresh();
            showToast("Deleted", "success");
        } catch {
            showToast("Delete failed", "error");
        }
    };

    const moveItem = async (id: number, direction: "up" | "down") => {
        if (!selectedId) return;
        const sorted = sortByOrder(items.filter((i) => i.section === selectedId));
        const idx = sorted.findIndex((i) => i.id === id);
        if (idx < 0) return;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sorted.length) return;

        const reordered = [...sorted];
        [reordered[idx], reordered[swapIdx]] = [reordered[swapIdx], reordered[idx]];

        setReorderingId(id);
        try {
            await Promise.all(
                reordered.map((item, order) =>
                    authFetch(`/media/${item.id}/`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ order }),
                    }),
                ),
            );
            await loadItems();
            showToast("Order updated", "success");
        } catch {
            showToast("Could not reorder", "error");
        } finally {
            setReorderingId(null);
        }
    };

    const sectionItems = selectedId
        ? sortByOrder(items.filter((i) => i.section === selectedId))
        : sortByOrder(items);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Photo / Video Gallery (CMS)</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Create headings (albums), then upload photos, videos, or iframe embeds under each heading only.
                    Use event names like &quot;Annual Day 2025&quot; — not &quot;Franchise Videos and Posters&quot; (that name is used by home-page uploads).
                    Public page: <a href="/gallery" className="text-orange-600 font-semibold" target="_blank" rel="noreferrer">/gallery</a>
                </p>
            </div>

            <div className="grid lg:grid-cols-[280px_1fr] gap-6">
                <aside className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 h-fit">
                    <h2 className="text-sm font-semibold text-gray-800">Gallery headings</h2>
                    <form onSubmit={addHeading} className="flex gap-2">
                        <input
                            value={newHeading}
                            onChange={(e) => setNewHeading(e.target.value)}
                            placeholder="e.g. Annual Day 2025"
                            className="flex-1 min-w-0 rounded-lg border px-3 py-2 text-sm"
                        />
                        <button type="submit" className="p-2 rounded-lg bg-orange-500 text-white" title="Add heading">
                            <Plus className="w-4 h-4" />
                        </button>
                    </form>
                    <ul className="space-y-1 max-h-64 overflow-y-auto">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    onClick={() => setSelectedId(s.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between gap-2 ${
                                        selectedId === s.id ? "bg-orange-100 text-orange-900 font-semibold" : "hover:bg-gray-50"
                                    }`}
                                >
                                    <span className="truncate">{s.title}</span>
                                    <span className="text-xs text-gray-500 shrink-0">{s.item_count ?? 0}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                    {selected && (
                        <button
                            type="button"
                            onClick={() => deleteHeading(selected.id)}
                            className="text-xs text-red-600 font-semibold flex items-center gap-1"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete heading
                        </button>
                    )}
                </aside>

                <div className="space-y-6 min-w-0">
                    {!selected ? (
                        <p className="text-sm text-gray-500 bg-gray-50 rounded-xl p-6 border border-dashed">
                            Add a heading on the left, then upload media for that album.
                        </p>
                    ) : (
                        <>
                            <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
                                <h2 className="text-lg font-semibold text-gray-800">
                                    Upload to: <span className="text-orange-600">{selected.title}</span>
                                </h2>

                                <form onSubmit={uploadFiles} className="space-y-4">
                                    <div className="flex flex-wrap gap-3 text-sm">
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={uploadAs === "auto"}
                                                onChange={() => setUploadAs("auto")}
                                            />
                                            Auto (detect photo vs video)
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={uploadAs === "image"}
                                                onChange={() => setUploadAs("image")}
                                            />
                                            Photos only
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                checked={uploadAs === "video"}
                                                onChange={() => setUploadAs("video")}
                                            />
                                            Videos only
                                        </label>
                                    </div>

                                    <FranchiseLocalFolderPicker
                                        files={files}
                                        onFilesChange={(next) => {
                                            setFiles(next);
                                            if (next.length > 0) {
                                                showToast(`${next.length} file(s) ready — click “Upload file(s)” below`, "success");
                                            }
                                        }}
                                        disabled={uploading}
                                        hint="1) Choose files or folder  2) Check the list  3) Click orange Upload button (folder does not upload by itself)."
                                    />

                                    {files.length > 0 && !uploading && (
                                        <p className="text-sm font-semibold text-green-800 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                            {files.length} file(s) selected — click <strong>Upload file(s)</strong> to send to the server.
                                        </p>
                                    )}

                                    {progress && <p className="text-xs text-gray-500">Uploading {progress}…</p>}

                                    <Button type="submit" disabled={uploading || !files.length} className="bg-orange-500">
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploading ? "Uploading…" : `Upload ${files.length || ""} file(s)`}
                                    </Button>
                                </form>
                            </section>

                            <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-3">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Link2 className="w-5 h-5 text-blue-600" />
                                    Add iframe / YouTube / MediaDelivery video
                                </h2>
                                <form onSubmit={addEmbed} className="space-y-3">
                                    <input
                                        value={embedTitle}
                                        onChange={(e) => setEmbedTitle(e.target.value)}
                                        placeholder="Video title (optional)"
                                        className="w-full rounded-lg border px-3 py-2 text-sm"
                                    />
                                    <textarea
                                        value={embedInput}
                                        onChange={(e) => setEmbedInput(e.target.value)}
                                        rows={3}
                                        placeholder="Paste embed URL or full <iframe …> code"
                                        className="w-full rounded-lg border px-3 py-2 text-sm font-mono"
                                    />
                                    <Button type="submit" className="bg-blue-600">
                                        Add embedded video
                                    </Button>
                                </form>
                            </section>

                            <section className="bg-white rounded-2xl border border-gray-200 p-5">
                                <h2 className="text-sm font-semibold text-gray-800 mb-1">
                                    Items in this heading ({sectionItems.length})
                                </h2>
                                <p className="text-xs text-gray-500 mb-3">
                                    Order is left to right, top to bottom (#1 first on the public gallery). Use arrows to
                                    reorder; new uploads are added at the end in the order you selected files.
                                </p>
                                {loading ? (
                                    <p className="text-sm text-gray-500">Loading…</p>
                                ) : sectionItems.length === 0 ? (
                                    <p className="text-sm text-gray-500">No items yet. Upload above.</p>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {sectionItems.map((item, index) => (
                                            <div
                                                key={item.id}
                                                className="relative group rounded-xl border overflow-hidden aspect-square bg-gray-100"
                                            >
                                                <span className="absolute top-2 left-2 z-10 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-black/70 px-1.5 text-[10px] font-bold text-white">
                                                    #{index + 1}
                                                </span>
                                                <div className="absolute left-2 top-10 z-10 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        type="button"
                                                        disabled={index === 0 || reorderingId === item.id}
                                                        onClick={() => void moveItem(item.id, "up")}
                                                        className="p-1 rounded-md bg-white/95 text-slate-700 shadow disabled:opacity-40"
                                                        title="Move earlier"
                                                        aria-label="Move earlier"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={index === sectionItems.length - 1 || reorderingId === item.id}
                                                        onClick={() => void moveItem(item.id, "down")}
                                                        className="p-1 rounded-md bg-white/95 text-slate-700 shadow disabled:opacity-40"
                                                        title="Move later"
                                                        aria-label="Move later"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                {item.media_type === "embed" ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-white p-2">
                                                        <Film className="w-8 h-8 mb-1" />
                                                        <span className="text-[10px] text-center line-clamp-2">Iframe video</span>
                                                    </div>
                                                ) : item.media_type === "video" ? (
                                                    <video src={mediaUrl(item.file)} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img
                                                        src={mediaUrl(item.file)}
                                                        alt={item.caption || item.title || ""}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => deleteItem(item.id)}
                                                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] p-1 truncate">
                                                    {item.caption || item.title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

