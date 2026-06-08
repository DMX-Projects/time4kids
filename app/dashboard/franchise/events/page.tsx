"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, CheckCircle2, AlertCircle, Eye, MapPin, Pencil, Search, Trash2, XCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { useFranchiseData } from "@/components/dashboard/franchise/FranchiseDataProvider";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";
import { EventGalleryImage } from "@/components/ui/EventGalleryImage";
import { EventGalleryVideo } from "@/components/ui/EventGalleryVideo";
import { centrePublicPagePath } from "@/lib/centre-public-url";
import {
    IMAGE_FILE_ACCEPT,
    VIDEO_FILE_ACCEPT,
    isImageUploadFile,
    isVideoUploadFile,
    validateEventGalleryImageSize,
} from "@/lib/franchise-centre-upload";

const pastelCard = "bg-white border border-orange-100 rounded-xl shadow-sm";

type MediaAlert = { type: "success" | "error" | "warning"; message: string };

function MediaUploadAlert({ alert }: { alert: MediaAlert }) {
    const styles =
        alert.type === "success"
            ? "border-green-200 bg-green-50 text-green-900"
            : alert.type === "warning"
              ? "border-amber-200 bg-amber-50 text-amber-950"
              : "border-red-200 bg-red-50 text-red-900";
    const Icon = alert.type === "success" ? CheckCircle2 : alert.type === "warning" ? AlertCircle : XCircle;
    const title =
        alert.type === "success" ? "Uploaded successfully" : alert.type === "warning" ? "Partially uploaded" : "Upload failed";

    return (
        <div className={`flex gap-3 rounded-xl border px-4 py-3 ${styles}`} role="status" aria-live="polite">
            <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden />
            <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-sm mt-0.5 leading-relaxed">{alert.message}</p>
            </div>
        </div>
    );
}

export default function FranchiseEventsPage() {
    const { tokens } = useAuth();
    const { showToast } = useToast();
    const { profile } = useFranchiseData();
    const { events, eventMedia, addEvent, updateEvent, deleteEvent, addEventMedia, deleteEventMedia, refreshEvents } =
        useSchoolData();
    const publicCentrePath =
        profile.slug && profile.city ? centrePublicPagePath(profile.city, profile.slug) : null;

    const editSectionRef = useRef<HTMLElement>(null);
    const [query, setQuery] = useState("");
    const [form, setForm] = useState({ title: "", date: "", venue: "", notes: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);

    const [mediaEventId, setMediaEventId] = useState<string | null>(null);
    const [mediaFiles, setMediaFiles] = useState<File[]>([]);
    const [mediaFileInputKey, setMediaFileInputKey] = useState(0);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [mediaCaption, setMediaCaption] = useState("");
    const [videoLinkUrl, setVideoLinkUrl] = useState("");

    const [eventError, setEventError] = useState<string | null>(null);
    const [mediaAlert, setMediaAlert] = useState<MediaAlert | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mediaSubmitting, setMediaSubmitting] = useState(false);
    const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        const term = query.toLowerCase();
        return events.filter((e) => [e.title, e.venue, e.date].some((f) => (f || "").toLowerCase().includes(term)));
    }, [events, query]);

    useEffect(() => {
        if (editingId && editSectionRef.current) {
            editSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }, [editingId]);

    useEffect(() => {
        if (editingId) setMediaEventId(editingId);
    }, [editingId]);

    const resetForm = () => {
        setForm({ title: "", date: "", venue: "", notes: "" });
        setEditingId(null);
    };

    const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        if (!form.date?.trim()) {
            setEventError("Please choose an event date.");
            return;
        }
        setEventError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateEvent(editingId, form);
            } else {
                await addEvent(form);
            }
            resetForm();
        } catch (err: any) {
            setEventError(err?.message || "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const selectedEventTitle = events.find((ev) => ev.id === mediaEventId)?.title || "this event";

    const showMediaResult = (alert: MediaAlert) => {
        setMediaAlert(alert);
        showToast(alert.message, alert.type === "error" ? "error" : alert.type === "warning" ? "info" : "success");
    };

    const handleUploadMedia = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!mediaEventId) {
            showMediaResult({ type: "error", message: "Select an event before uploading photos or videos." });
            return;
        }
        const hasVideoLink = mediaType === "video" && videoLinkUrl.trim().length > 0;
        const hasFiles = mediaFiles.length > 0;
        if (mediaType === "video") {
            if (!hasVideoLink && !hasFiles) {
                showMediaResult({
                    type: "error",
                    message: "Add a YouTube/Bunny link or choose at least one video file to upload.",
                });
                return;
            }
        } else if (!hasFiles) {
            showMediaResult({ type: "error", message: "Choose one or more image files to upload." });
            return;
        }
        setMediaAlert(null);
        setMediaSubmitting(true);
        try {
            let linkSaved = false;
            let ok = 0;
            let failed = 0;
            const sizeErrors: string[] = [];

            if (hasVideoLink) {
                try {
                    await addEventMedia({
                        eventId: mediaEventId,
                        title: mediaCaption.trim() || "Video",
                        description: mediaCaption || undefined,
                        type: "video",
                        url: videoLinkUrl.trim(),
                    });
                    linkSaved = true;
                } catch (err: unknown) {
                    showMediaResult({
                        type: "error",
                        message: err instanceof Error ? err.message : "Video link could not be saved. Check the URL and try again.",
                    });
                    return;
                }
            }

            for (const file of mediaFiles) {
                const isImage = mediaType === "image";
                if (isImage && !isImageUploadFile(file)) {
                    failed++;
                    continue;
                }
                if (!isImage && !isVideoUploadFile(file)) {
                    failed++;
                    continue;
                }
                if (isImage) {
                    const sizeErr = validateEventGalleryImageSize(file);
                    if (sizeErr) {
                        sizeErrors.push(sizeErr);
                        failed++;
                        continue;
                    }
                }
                try {
                    await addEventMedia({
                        eventId: mediaEventId,
                        title: file.name,
                        description: mediaCaption || undefined,
                        type: mediaType,
                        file,
                    });
                    ok++;
                } catch {
                    failed++;
                }
            }

            const visibilityNote =
                " It will appear on your centre page and in the parent Event Gallery after refresh.";

            if (failed > 0 && ok === 0 && !linkSaved) {
                const detail =
                    sizeErrors.length > 0
                        ? sizeErrors.slice(0, 5).join(" ")
                        : mediaType === "image"
                          ? "Use JPG, PNG, WEBP, GIF, or HEIC images (max 1 MB each)."
                          : "Use MP4, WEBM, MOV, or other supported video files.";
                showMediaResult({
                    type: "error",
                    message: `Nothing was uploaded to “${selectedEventTitle}”. ${detail}`,
                });
            } else if (failed > 0) {
                const extra = sizeErrors.length > 0 ? ` ${sizeErrors.slice(0, 3).join(" ")}` : "";
                showMediaResult({
                    type: "warning",
                    message: `${ok} file${ok === 1 ? "" : "s"} uploaded to “${selectedEventTitle}”, but ${failed} failed (wrong type, over 1 MB, or server error).${extra}${visibilityNote}`,
                });
            }

            const successParts: string[] = [];
            if (linkSaved) successParts.push("Video link saved");
            if (ok > 0) {
                await refreshEvents();
                const label = mediaType === "image" ? "photo" : "video";
                successParts.push(`${ok} ${label}${ok === 1 ? "" : "s"} uploaded`);
            }
            if (successParts.length > 0 && failed === 0) {
                const msg = `${successParts.join(" and ")} to “${selectedEventTitle}”.${visibilityNote}`;
                showMediaResult({ type: "success", message: msg });
            }

            if (linkSaved || ok > 0) {
                setMediaCaption("");
                setMediaFiles([]);
                setMediaFileInputKey((k) => k + 1);
                setVideoLinkUrl("");
            }
        } catch (err: any) {
            showMediaResult({
                type: "error",
                message: err?.message || "Upload failed. Please try again.",
            });
        } finally {
            setMediaSubmitting(false);
        }
    };

    const viewing = events.find((e) => e.id === viewId) || null;
    const mediaForViewing = useMemo(() => eventMedia.filter((m) => m.eventId === viewId), [eventMedia, viewId]);
    const mediaForEditing = useMemo(
        () => (editingId ? eventMedia.filter((m) => m.eventId === editingId) : []),
        [eventMedia, editingId],
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold text-orange-900">Event Gallery</h1>
                    <p className="text-sm text-orange-700">
                        Create events and upload photos/videos. They appear on your public centre page under
                        &ldquo;Life at [your centre]&rdquo;.
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                        Photos: <strong>max 1 MB each</strong>, upload <strong>as many as you need</strong> in one go.
                        Videos: paste a <strong>YouTube or Bunny link</strong> and/or <strong>upload MP4 files</strong> (Type → Video).
                    </p>
                    {publicCentrePath && (
                        <p className="text-sm text-orange-800 mt-2">
                            Public page:{" "}
                            <a
                                href={publicCentrePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold underline hover:text-orange-950"
                            >
                                View centre page
                            </a>
                            {" "}
                            (scroll to the gallery — refresh after uploading).
                        </p>
                    )}
                    {events.length === 0 && (
                        <p className="text-sm text-amber-800 mt-1">
                            No events saved for this centre yet. Add an event, then upload at least one photo or video in Add Media.
                        </p>
                    )}
                </div>
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-orange-500 absolute left-3 top-3" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search events"
                        className="w-full rounded-xl border border-orange-200 bg-white py-2.5 pl-10 pr-3 text-sm text-orange-900 focus:border-orange-400 focus:outline-none shadow-sm"
                    />
                </div>
            </header>

            <section ref={editSectionRef} className={`${pastelCard} p-6 space-y-3`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-semibold text-orange-600">{editingId ? "Edit" : "Add"} Event</p>
                        <h2 className="text-lg font-semibold text-orange-900">{editingId ? "Update event details" : "Create a new event"}</h2>
                        {editingId && (
                            <p className="text-xs text-orange-600 mt-1">
                                Update title, date, venue, and notes below. Remove photos or videos in the grid below, or add more in{" "}
                                <strong>Add Media</strong>.
                            </p>
                        )}
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">{events.length} total</span>
                </div>
                {eventError && <p className="text-sm text-red-600">{eventError}</p>}
                <form className="space-y-3" onSubmit={handleSaveEvent}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        <Input label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                        <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving..." : editingId ? "Save Changes" : "Add Event"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={resetForm}>
                            Reset
                        </Button>
                    </div>
                </form>

                {editingId && mediaForEditing.length > 0 && (
                    <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 mb-3">Photos & videos for this event</p>
                        <p className="text-[11px] text-orange-600 mb-3">Tap remove to delete one file from this event (does not delete the event).</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {mediaForEditing.map((m) => (
                                <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden border border-orange-100 bg-white shadow-sm">
                                    {m.type === "video" ? (
                                        <EventGalleryVideo
                                            filePath={m.filePath}
                                            mediaId={Number(m.id)}
                                            accessToken={tokens?.access}
                                            caption={m.title}
                                            className="h-full w-full object-cover"
                                            controls={false}
                                            muted
                                            playsInline
                                            preload="metadata"
                                        />
                                    ) : (
                                        <EventGalleryImage
                                            file={m.filePath}
                                            mediaId={Number(m.id)}
                                            accessToken={tokens?.access}
                                            caption={m.title}
                                            alt={m.title || ""}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                    <button
                                        type="button"
                                        disabled={deletingMediaId !== null}
                                        onClick={async () => {
                                            if (!confirm("Remove this photo or video from the event?")) return;
                                            setDeletingMediaId(m.id);
                                            setMediaAlert(null);
                                            try {
                                                await deleteEventMedia(editingId, m.id);
                                                showMediaResult({ type: "success", message: "Photo or video removed from this event." });
                                            } catch (err: unknown) {
                                                showMediaResult({
                                                    type: "error",
                                                    message: err instanceof Error ? err.message : "Could not remove media.",
                                                });
                                            } finally {
                                                setDeletingMediaId(null);
                                            }
                                        }}
                                        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                        title="Remove from event"
                                        aria-label="Remove from event"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    {(m.description || m.title) && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-1.5">
                                            <p className="text-[10px] text-white truncate">{m.description || m.title}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className={`${pastelCard} p-6 space-y-3`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-semibold text-orange-600">Add Media</p>
                        <h2 className="text-lg font-semibold text-orange-900">
                            {mediaType === "video" ? "Add videos (link or upload)" : "Upload photos"}
                        </h2>
                    </div>
                </div>
                {mediaAlert ? <MediaUploadAlert alert={mediaAlert} /> : null}
                {mediaSubmitting ? (
                    <p className="text-sm text-orange-700 font-medium">Uploading… please wait.</p>
                ) : null}
                <form className="space-y-3" onSubmit={handleUploadMedia}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Event
                            <select
                                value={mediaEventId || ""}
                                onChange={(e) => setMediaEventId(e.target.value || null)}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            >
                                <option value="">Select an event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                        </label>
                        {mediaType === "image" ? (
                            <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                                Files (select any number — max 1 MB each)
                                <input
                                    key={mediaFileInputKey}
                                    type="file"
                                    accept={IMAGE_FILE_ACCEPT}
                                    multiple
                                    onChange={(e) => {
                                        const picked = Array.from(e.target.files || []);
                                        setMediaFiles((prev) => [...prev, ...picked]);
                                        e.target.value = "";
                                    }}
                                    className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                />
                                {mediaFiles.length > 0 && (
                                    <span className="text-[11px] font-normal text-orange-600">
                                        {mediaFiles.length} file{mediaFiles.length === 1 ? "" : "s"} selected · 1 MB max per image ·{" "}
                                        <button
                                            type="button"
                                            className="underline hover:text-orange-800"
                                            onClick={() => {
                                                setMediaFiles([]);
                                                setMediaFileInputKey((k) => k + 1);
                                            }}
                                        >
                                            Clear all
                                        </button>
                                    </span>
                                )}
                            </label>
                        ) : (
                            <>
                                <label className="flex flex-col gap-1 text-xs font-medium text-orange-700 md:col-span-2">
                                    Video link (YouTube or Bunny) — optional
                                    <input
                                        value={videoLinkUrl}
                                        onChange={(e) => setVideoLinkUrl(e.target.value)}
                                        placeholder="https://www.youtube.com/watch?v=… or Bunny iframe embed URL"
                                        className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    />
                                    <span className="text-[11px] font-normal text-orange-600">
                                        Paste a watch link, shorts URL, or full Bunny iframe embed code.
                                    </span>
                                </label>
                                <label className="flex flex-col gap-1 text-xs font-medium text-orange-700 md:col-span-2">
                                    Upload video file(s) — optional
                                    <input
                                        key={mediaFileInputKey}
                                        type="file"
                                        accept={VIDEO_FILE_ACCEPT}
                                        multiple
                                        onChange={(e) => {
                                            const picked = Array.from(e.target.files || []);
                                            setMediaFiles((prev) => [...prev, ...picked]);
                                            e.target.value = "";
                                        }}
                                        className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                    />
                                    {mediaFiles.length > 0 && (
                                        <span className="text-[11px] font-normal text-orange-600">
                                            {mediaFiles.length} video{mediaFiles.length === 1 ? "" : "s"} selected ·{" "}
                                            <button
                                                type="button"
                                                className="underline hover:text-orange-800"
                                                onClick={() => {
                                                    setMediaFiles([]);
                                                    setMediaFileInputKey((k) => k + 1);
                                                }}
                                            >
                                                Clear all
                                            </button>
                                        </span>
                                    )}
                                </label>
                            </>
                        )}
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Type
                            <select
                                value={mediaType}
                                onChange={(e) => {
                                    setMediaType(e.target.value as "image" | "video");
                                    setMediaFiles([]);
                                    setMediaFileInputKey((k) => k + 1);
                                    setVideoLinkUrl("");
                                    setMediaAlert(null);
                                }}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            {mediaType === "video" ? "Caption (optional)" : "Caption (optional, same for all)"}
                            <input
                                value={mediaCaption}
                                onChange={(e) => setMediaCaption(e.target.value)}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                placeholder={
                                    mediaType === "video"
                                        ? "Short label for this video"
                                        : "Short description applied to each file"
                                }
                            />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={mediaSubmitting}>
                            {mediaSubmitting
                                ? "Saving..."
                                : mediaType === "video"
                                  ? videoLinkUrl.trim() && mediaFiles.length > 0
                                      ? "Save link & upload"
                                      : videoLinkUrl.trim()
                                        ? "Save video link"
                                        : mediaFiles.length > 1
                                          ? `Upload ${mediaFiles.length} videos`
                                          : mediaFiles.length === 1
                                            ? "Upload video"
                                            : "Add video"
                                  : mediaFiles.length > 1
                                    ? `Upload ${mediaFiles.length} files`
                                    : "Upload"}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={mediaSubmitting}
                            onClick={() => {
                                setMediaCaption("");
                                setMediaFiles([]);
                                setMediaFileInputKey((k) => k + 1);
                                setVideoLinkUrl("");
                                setMediaEventId(null);
                                setMediaAlert(null);
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </section>

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filtered.map((event) => (
                    <article key={event.id} className={`${pastelCard} p-4 transition hover:shadow-md`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center text-sm font-semibold">
                                    <CalendarRange className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="font-semibold text-orange-900 text-sm">{event.title}</p>
                                    <p className="text-xs text-orange-700 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {event.venue || "—"}
                                    </p>
                                </div>
                            </div>
                            <span className="px-2 py-1 text-[11px] rounded-full bg-orange-50 text-orange-700">{event.date || "Date"}</span>
                        </div>
                        <p className="text-sm text-orange-800 line-clamp-2">{event.notes || "No notes"}</p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => setViewId(event.id)}>
                                <Eye className="w-4 h-4" /> View
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setEditingId(event.id);
                                    const { id, ...rest } = event;
                                    const rawDate = rest.date || "";
                                    const dateOnly = rawDate.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? rawDate.slice(0, 10);
                                    setForm({
                                        title: rest.title || "",
                                        date: dateOnly,
                                        venue: rest.venue || "",
                                        notes: rest.notes || "",
                                    });
                                }}
                            >
                                <Pencil className="w-4 h-4" /> Edit
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                onClick={() => deleteEvent(event.id)}
                            >
                                <Trash2 className="w-4 h-4" /> Delete
                            </Button>
                        </div>
                    </article>
                ))}
                {filtered.length === 0 && <p className="text-sm text-orange-700">No events match your search.</p>}
            </section>

            {viewing && (
                <Modal isOpen onClose={() => setViewId(null)} title="Event details" size="lg">
                    <div className="space-y-4 text-sm text-orange-900 max-h-[min(85vh,720px)] overflow-y-auto pr-1">
                        <div>
                            <p className="text-xl font-semibold text-orange-950">{viewing.title}</p>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-orange-700">
                                <span className="inline-flex items-center gap-1">
                                    <CalendarRange className="w-3.5 h-3.5 shrink-0" />
                                    {viewing.date || "—"}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                    {viewing.venue || "—"}
                                </span>
                            </div>
                            {viewing.notes ? (
                                <p className="mt-3 text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">{viewing.notes}</p>
                            ) : (
                                <p className="mt-3 text-xs text-orange-600 italic">No notes for this event.</p>
                            )}
                        </div>

                        <div className="rounded-xl border border-orange-100 bg-orange-50/40 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 mb-2">Photos & videos</p>
                            {mediaForViewing.length === 0 ? (
                                <p className="text-sm text-orange-700">
                                    No media uploaded yet. Use <strong>Add Media</strong> above, or tap <strong>Edit</strong> on this event.
                                </p>
                            ) : (
                                <>
                                    <p className="text-xs text-orange-700 mb-3">
                                        Tap the trash icon on a thumbnail to remove it from this event.
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {mediaForViewing.map((m) => (
                                            <div
                                                key={m.id}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-orange-100 bg-orange-100/50 shadow-sm"
                                            >
                                                {m.type === "video" ? (
                                                    <EventGalleryVideo
                                                        filePath={m.filePath}
                                                        mediaId={Number(m.id)}
                                                        accessToken={tokens?.access}
                                                        caption={m.title}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <EventGalleryImage
                                                        file={m.filePath}
                                                        mediaId={Number(m.id)}
                                                        accessToken={tokens?.access}
                                                        caption={m.title}
                                                        alt={m.title || "Event"}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                                <button
                                                    type="button"
                                                    disabled={deletingMediaId !== null}
                                                    onClick={async () => {
                                                        if (!viewing?.id || !confirm("Remove this photo or video from the event?")) return;
                                                        setDeletingMediaId(m.id);
                                                        setMediaAlert(null);
                                                        try {
                                                            await deleteEventMedia(viewing.id, m.id);
                                                            showMediaResult({ type: "success", message: "Photo or video removed from this event." });
                                                        } catch (err: unknown) {
                                                            showMediaResult({
                                                                type: "error",
                                                                message: err instanceof Error ? err.message : "Could not remove media.",
                                                            });
                                                        } finally {
                                                            setDeletingMediaId(null);
                                                        }
                                                    }}
                                                    className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                                    title="Remove from event"
                                                    aria-label="Remove from event"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                                {(m.title || m.description) && (
                                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 to-transparent px-2 py-2">
                                                        <p className="text-[11px] text-white truncate">{m.description || m.title}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-1">
                            <Button size="sm" onClick={() => setViewId(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
            {label}
            <input
                {...props}
                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
            />
        </label>
    );
}
