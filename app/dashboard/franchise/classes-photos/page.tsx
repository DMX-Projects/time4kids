"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { Images, Upload, Trash2 } from "lucide-react";

type ProgramCardOverride = { id: number; image: string };

type ApiFranchiseProfile = {
    id: number;
    school_program_cards?: ProgramCardOverride[] | null;
};

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const RECOMMENDED = { w: 1200, h: 900 }; // 4:3
const MIN = { w: 800, h: 600 };

function formatMb(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap === "function") {
        const bmp = await createImageBitmap(file);
        const dims = { width: bmp.width, height: bmp.height };
        bmp.close?.();
        return dims;
    }
    const url = URL.createObjectURL(file);
    try {
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const el = new window.Image();
            el.onload = () => resolve(el);
            el.onerror = () => reject(new Error("Could not read image"));
            el.src = url;
        });
        return { width: img.naturalWidth, height: img.naturalHeight };
    } finally {
        URL.revokeObjectURL(url);
    }
}

const PROGRAMS: Array<{ id: number; label: string }> = [
    { id: 1, label: "Play Group" },
    { id: 2, label: "Nursery" },
    { id: 3, label: "Pre-Primary 1" },
    { id: 4, label: "Pre-Primary 2" },
    { id: 5, label: "Day Care" },
];

export default function FranchiseClassesPhotosPage() {
    const { authFetch } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [uploadingId, setUploadingId] = useState<number | null>(null);
    const [selectedInfo, setSelectedInfo] = useState<Record<number, string>>({});
    const [cards, setCards] = useState<ProgramCardOverride[]>([]);

    const cardMap = useMemo(() => new Map(cards.map((c) => [c.id, c.image])), [cards]);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        setMessage(null);
        try {
            const profile = await authFetch<ApiFranchiseProfile>("/franchises/franchise/profile/");
            setCards(Array.isArray(profile.school_program_cards) ? profile.school_program_cards : []);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Failed to load profile");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        load();
    }, [load]);

    const setImageFor = (id: number, image: string) => {
        setCards((prev) => {
            const next = prev.filter((p) => p.id !== id);
            if (image.trim()) next.push({ id, image: image.trim() });
            return next.sort((a, b) => a.id - b.id);
        });
    };

    const uploadFor = async (id: number, file: File) => {
        setError(null);
        setMessage(null);
        setUploadingId(id);
        try {
            const dims = await getImageDimensions(file);
            setSelectedInfo((prev) => ({
                ...prev,
                [id]: `${file.name} • ${dims.width}×${dims.height}px • ${formatMb(file.size)}`,
            }));

            if (file.size > MAX_UPLOAD_BYTES) {
                throw new Error(`File is too large (${formatMb(file.size)}). Max allowed is 5MB.`);
            }
            if (dims.width < MIN.w || dims.height < MIN.h) {
                throw new Error(`Image is too small (${dims.width}×${dims.height}). Minimum is ${MIN.w}×${MIN.h}. Recommended ${RECOMMENDED.w}×${RECOMMENDED.h} (4:3).`);
            }
            const aspect = dims.width / Math.max(1, dims.height);
            const ideal = 4 / 3;
            const tol = 0.25;
            if (Math.abs(aspect - ideal) > tol) {
                throw new Error(`Image ratio should be close to 4:3 (e.g. ${RECOMMENDED.w}×${RECOMMENDED.h}). Your image is ${dims.width}×${dims.height} (${aspect.toFixed(2)}:1).`);
            }

            const formData = new FormData();
            formData.append("title", `Centre classes photo ${id}`);
            formData.append("category", "Banner");
            formData.append("media_type", "image");
            formData.append("file", file);
            const created = (await authFetch("/media/", { method: "POST", body: formData })) as any;
            const filePath = created?.file;
            if (!filePath || typeof filePath !== "string") {
                throw new Error("Upload succeeded but server did not return a file path.");
            }
            setImageFor(id, filePath);
            setMessage("Uploaded. Click Save to publish on your centre page.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
            setUploadingId(null);
        }
    };

    const save = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);
        try {
            await authFetch("/franchises/franchise/profile/", {
                method: "PATCH",
                headers: jsonHeaders(),
                body: JSON.stringify({ school_program_cards: cards }),
            });
            setMessage("Saved. Refresh your public centre page to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl pb-16">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 flex items-center gap-2">
                        <Images className="w-7 h-7 text-orange-500" />
                        Classes Photos
                    </h1>
                    <p className="text-sm text-slate-600 mt-2">
                        These photos appear on your public centre page under <strong>Our Classes → Learning Pathways</strong>.
                    </p>
                    <div className="mt-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Requirements:</span>{" "}
                        Max <strong>5MB</strong>, minimum <strong>{MIN.w}×{MIN.h}</strong>, recommended <strong>{RECOMMENDED.w}×{RECOMMENDED.h} (4:3)</strong>.
                    </div>
                </div>
                <Button size="sm" onClick={save} disabled={saving || loading}>
                    {saving ? "Saving…" : "Save"}
                </Button>
            </div>

            {loading ? (
                <p className="text-slate-500">Loading…</p>
            ) : (
                <div className="space-y-4">
                    {PROGRAMS.map((p) => (
                        <div key={p.id} className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 space-y-3">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-slate-900">{p.label}</div>
                                <div className="text-xs text-slate-500">Card ID: {p.id}</div>
                            </div>

                            <div className="grid sm:grid-cols-[1fr_auto_auto] gap-2 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-slate-600 mb-1">Image path</label>
                                    <input
                                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                        value={cardMap.get(p.id) ?? ""}
                                        onChange={(e) => setImageFor(p.id, e.target.value)}
                                        placeholder="/media/... or /public/path.png"
                                    />
                                </div>

                                <label
                                    className={`inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                                        uploadingId === p.id
                                            ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer"
                                    }`}
                                    title="Upload and auto-fill image path"
                                >
                                    <Upload className="w-4 h-4" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        disabled={uploadingId === p.id}
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            e.target.value = "";
                                            if (!file) return;
                                            uploadFor(p.id, file);
                                        }}
                                    />
                                    {uploadingId === p.id ? "Uploading…" : "Upload"}
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setImageFor(p.id, "")}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                                    title="Remove image from this card"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Remove
                                </button>
                            </div>

                            {selectedInfo[p.id] && <div className="text-xs text-slate-600">Selected: {selectedInfo[p.id]}</div>}
                        </div>
                    ))}
                </div>
            )}

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm whitespace-pre-line">{error}</div>}
            {message && <div className="p-3 rounded-lg bg-green-50 text-green-800 text-sm">{message}</div>}

            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-200">
                <Button size="sm" onClick={load} disabled={saving || loading}>
                    Reload
                </Button>
            </div>
        </div>
    );
}

