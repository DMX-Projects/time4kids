"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders, resolveCmsMediaUrl } from "@/lib/api-client";
import { Images, Upload } from "lucide-react";
import {
    CENTRE_PROGRAM_LABELS,
    DEFAULT_CENTRE_PROGRAM_CARDS,
    normalizeCentreProgramCardsData,
    type CentreProgramCardsData,
} from "@/config/centre-program-cards-defaults";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

export default function AdminCentreProgramCardsPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<CentreProgramCardsData>(DEFAULT_CENTRE_PROGRAM_CARDS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [bulkUploading, setBulkUploading] = useState(false);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const cardMap = useMemo(() => new Map(data.cards.map((c) => [c.id, c.image])), [data.cards]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = await authFetch<CentreProgramCardsData>("/common/page-content/centre-program-cards/");
            setData(normalizeCentreProgramCardsData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_CENTRE_PROGRAM_CARDS);
            setError(e instanceof Error ? e.message : "Load failed");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        void load();
    }, [load]);

    const setImageFor = (id: number, image: string) => {
        setData((prev) => {
            const rest = prev.cards.filter((c) => c.id !== id);
            const trimmed = image.trim();
            const next = trimmed ? [...rest, { id, image: trimmed }] : rest;
            return { cards: next.sort((a, b) => a.id - b.id) };
        });
    };

    const uploadFile = async (id: number, file: File, label: string) => {
        if (file.size > MAX_UPLOAD_BYTES) {
            throw new Error(`${label}: file too large (${formatMb(file.size)}). Max 5MB.`);
        }
        const formData = new FormData();
        formData.append("title", `Centre classes: ${label}`);
        formData.append("category", "Banner");
        formData.append("media_type", "image");
        formData.append("file", file);
        const created = (await authFetch("/media/", { method: "POST", body: formData })) as { file?: string };
        const filePath = created?.file;
        if (!filePath || typeof filePath !== "string") {
            throw new Error(`${label}: upload OK but no file path returned.`);
        }
        setImageFor(id, filePath);
    };

    const uploadOne = async (id: number, file: File) => {
        const label = CENTRE_PROGRAM_LABELS.find((p) => p.id === id)?.label || `Program ${id}`;
        setError(null);
        setMessage(null);
        setUploadingId(id);
        try {
            await uploadFile(id, file, label);
            setMessage(`Uploaded ${label}. Click Save to publish on all centre pages.`);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploadingId(null);
        }
    };

    const uploadAllAtOnce = async (files: FileList | File[]) => {
        const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(f.name));
        if (!list.length) {
            setError("Choose one or more image files.");
            return;
        }
        if (list.length > CENTRE_PROGRAM_LABELS.length) {
            setError(`Select at most ${CENTRE_PROGRAM_LABELS.length} images (one per program card).`);
            return;
        }

        setError(null);
        setMessage(null);
        setBulkUploading(true);
        const problems: string[] = [];
        try {
            for (let i = 0; i < list.length; i++) {
                const slot = CENTRE_PROGRAM_LABELS[i];
                try {
                    await uploadFile(slot.id, list[i], slot.label);
                } catch (e: unknown) {
                    problems.push(e instanceof Error ? e.message : `${slot.label}: failed`);
                }
            }
            if (problems.length) {
                setError(problems.join("\n"));
            } else {
                setMessage(
                    `Uploaded ${list.length} image(s) in order (Play Group → Nursery → PP-1 → PP-2 → Summer). Click Save to publish on every centre page.`,
                );
            }
        } finally {
            setBulkUploading(false);
        }
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            await authFetch("/common/page-content/centre-program-cards/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. All centre pages will use these photos under Our Classes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl pb-16">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <Images className="w-7 h-7 text-orange-500" />
                        Centre page — class photos (all centres)
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                        Upload once here. Every public centre page uses these images under <strong>Our Classes</strong>.
                    </p>
                </div>
                <Button onClick={() => void save()} disabled={saving || loading || bulkUploading}>
                    {saving ? "Saving…" : "Save for all centres"}
                </Button>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-5 space-y-3">
                <p className="text-sm font-semibold text-slate-900">Upload all photos at once</p>
                <p className="text-xs text-slate-600">
                    Pick up to 5 images in this order: <strong>1 Play Group</strong>, <strong>2 Nursery</strong>,{" "}
                    <strong>3 PP-1</strong>, <strong>4 PP-2</strong>, <strong>5 Summer</strong>. Fewer than 5 updates only
                    those slots.
                </p>
                <label
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
                        bulkUploading ? "bg-slate-400" : "bg-orange-500 hover:bg-orange-600"
                    }`}
                >
                    <Upload className="w-4 h-4" />
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="sr-only"
                        disabled={bulkUploading || loading}
                        onChange={(e) => {
                            const files = e.target.files;
                            e.target.value = "";
                            if (files?.length) void uploadAllAtOnce(files);
                        }}
                    />
                    {bulkUploading ? "Uploading all…" : "Choose images (up to 5)"}
                </label>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {CENTRE_PROGRAM_LABELS.map((slot) => {
                        const src = cardMap.get(slot.id);
                        const preview = src ? resolveCmsMediaUrl(src) : "";
                        return (
                            <div key={slot.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
                                <div className="text-sm font-semibold text-slate-900">{slot.label}</div>
                                <div className="relative aspect-[4/3] rounded-xl border border-slate-100 bg-slate-50 overflow-hidden">
                                    {preview ? (
                                        <Image src={preview} alt={slot.label} fill className="object-cover" unoptimized />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
                                    )}
                                </div>
                                <input
                                    className={inputClass}
                                    value={src || ""}
                                    onChange={(e) => setImageFor(slot.id, e.target.value)}
                                    placeholder="/media/..."
                                />
                                <label
                                    className={`inline-flex w-full justify-center items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                                        uploadingId === slot.id
                                            ? "bg-slate-100 text-slate-500 cursor-not-allowed"
                                            : "bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="sr-only"
                                        disabled={uploadingId === slot.id || bulkUploading}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = "";
                                            if (file) void uploadOne(slot.id, file);
                                        }}
                                    />
                                    {uploadingId === slot.id ? "Uploading…" : "Replace this card"}
                                </label>
                            </div>
                        );
                    })}
                </div>
            )}

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm whitespace-pre-line">{error}</div>}
            {message && <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">{message}</div>}
        </div>
    );
}
