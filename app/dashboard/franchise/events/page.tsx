"use client";

import { useMemo, useState } from "react";
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
import { PORTAL_CLASS_OPTIONS, portalClassLabel } from "@/config/portal-class-options";

const pastelCard = "bg-white border border-orange-100 rounded-xl shadow-sm";

type MediaAlert = { type: "success" | "error" | "warning"; message: string };

type EventMediaUploadFormProps = {
    events: { id: string; title: string }[];
    mediaEventId: string | null;
    setMediaEventId: (id: string | null) => void;
    showEventSelector: boolean;
    mediaType: "image" | "video";
    setMediaType: (type: "image" | "video") => void;
    mediaFiles: File[];
    setMediaFiles: React.Dispatch<React.SetStateAction<File[]>>;
    mediaFileInputKey: number;
    setMediaFileInputKey: React.Dispatch<React.SetStateAction<number>>;
    videoLinkUrl: string;
    setVideoLinkUrl: (url: string) => void;
    mediaCaption: string;
    setMediaCaption: (caption: string) => void;
    mediaSubmitting: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onReset: () => void;
};

function mediaUploadSubmitLabel(
    mediaType: "image" | "video",
    videoLinkUrl: string,
    mediaFilesCount: number,
    mediaSubmitting: boolean,
): string {
    if (mediaSubmitting) return "Saving...";
    if (mediaType === "video") {
        const hasLink = videoLinkUrl.trim().length > 0;
        if (hasLink && mediaFilesCount > 0) return "Save link & upload";
        if (hasLink) return "Save video link";
        if (mediaFilesCount > 1) return `Upload ${mediaFilesCount} videos`;
        if (mediaFilesCount === 1) return "Upload video";
        return "Add video";
    }
    if (mediaFilesCount > 1) return `Upload ${mediaFilesCount} files`;
    return "Upload";
}

function EventMediaUploadForm({
    events,
    mediaEventId,
    setMediaEventId,
    showEventSelector,
    mediaType,
    setMediaType,
    mediaFiles,
    setMediaFiles,
    mediaFileInputKey,
    setMediaFileInputKey,
    videoLinkUrl,
    setVideoLinkUrl,
    mediaCaption,
    setMediaCaption,
    mediaSubmitting,
    onSubmit,
    onReset,
}: EventMediaUploadFormProps) {
    return (
        <form className="space-y-3" onSubmit={onSubmit}>
            <div className="grid md:grid-cols-2 gap-3">
                {showEventSelector ? (
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
                ) : null}
                {mediaType === "image" ? (
                    <label
                        className={`flex flex-col gap-1 text-xs font-medium text-orange-700 ${showEventSelector ? "" : "md:col-span-2"}`}
                    >
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
                            mediaType === "video" ? "Short label for this video" : "Short description applied to each file"
                        }
                    />
                </label>
            </div>
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={mediaSubmitting}>
                    {mediaUploadSubmitLabel(mediaType, videoLinkUrl, mediaFiles.length, mediaSubmitting)}
                </Button>
                <Button type="button" size="sm" variant="outline" disabled={mediaSubmitting} onClick={onReset}>
                    Reset
                </Button>
            </div>
        </form>
    );
}

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

    const [query, setQuery] = useState("");
    const [addForm, setAddForm] = useState({ title: "", date: "", venue: "", notes: "", className: "" });
    const [editForm, setEditForm] = useState({ title: "", date: "", venue: "", notes: "", className: "" });
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
        const term = query.toLowerCase().trim();
        if (!term) return events;
        return events.filter((e) =>
            [e.title, e.venue, e.date, e.audienceLabel, e.className, portalClassLabel(e.className)]
                .some((f) => (f || "").toLowerCase().includes(term)),
        );
    }, [events, query]);

    const resetAddForm = () => {
        setAddForm({ title: "", date: "", venue: "", notes: "", className: "" });
    };

    const resetMediaUploadFields = (clearEvent = false) => {
        setMediaCaption("");
        setMediaFiles([]);
        setMediaFileInputKey((k) => k + 1);
        setVideoLinkUrl("");
        setMediaType("image");
        setMediaAlert(null);
        if (clearEvent) setMediaEventId(null);
    };

    const closeEditModal = () => {
        setEditingId(null);
        setEditForm({ title: "", date: "", venue: "", notes: "", className: "" });
        setEventError(null);
        resetMediaUploadFields();
    };

    const openEditModal = (event: (typeof events)[number]) => {
        const rawDate = event.date || "";
        const dateOnly = rawDate.match(/^(\d{4}-\d{2}-\d{2})/)?.[1] ?? rawDate.slice(0, 10);
        setEditingId(event.id);
        setMediaEventId(event.id);
        resetMediaUploadFields();
        setEditForm({
            title: event.title || "",
            date: dateOnly,
            venue: event.venue || "",
            notes: event.notes || "",
            className: event.className || "",
        });
        setEventError(null);
    };

    const handleSaveAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!addForm.title.trim()) return;
        if (!addForm.date?.trim()) {
            setEventError("Please choose an event date.");
            return;
        }
        setEventError(null);
        setSubmitting(true);
        try {
            await addEvent(addForm);
            resetAddForm();
            showToast("Event created.", "success");
        } catch (err: unknown) {
            setEventError(err instanceof Error ? err.message : "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingId || !editForm.title.trim()) return;
        if (!editForm.date?.trim()) {
            setEventError("Please choose an event date.");
            return;
        }
        setEventError(null);
        setSubmitting(true);
        try {
            await updateEvent(editingId, editForm);
            showToast("Event updated.", "success");
            closeEditModal();
        } catch (err: unknown) {
            setEventError(err instanceof Error ? err.message : "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteEventFromModal = async () => {
        if (!editingId || !confirm("Delete this event and all its photos/videos?")) return;
        try {
            await deleteEvent(editingId);
            showToast("Event deleted.", "success");
            closeEditModal();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not delete event.", "error");
        }
    };

    const uploadTargetEventId = editingId || mediaEventId;
    const selectedEventTitle = events.find((ev) => ev.id === uploadTargetEventId)?.title || "this event";

    const showMediaResult = (alert: MediaAlert) => {
        setMediaAlert(alert);
        showToast(alert.message, alert.type === "error" ? "error" : alert.type === "warning" ? "info" : "success");
    };

    const handleUploadMedia = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const targetEventId = editingId || mediaEventId;
        if (!targetEventId) {
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
                        eventId: targetEventId,
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
                        eventId: targetEventId,
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
                        Create events class-wise and upload photos/videos. <strong>All classes</strong> events also appear on your public centre page;
                        class-specific events are visible only to parents in that class.
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
                        placeholder="Search events, class, or venue"
                        className="w-full rounded-xl border border-orange-200 bg-white py-2.5 pl-10 pr-3 text-sm text-orange-900 focus:border-orange-400 focus:outline-none shadow-sm"
                    />
                </div>
            </header>

            <section className={`${pastelCard} p-6 space-y-3`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-semibold text-orange-600">Add Event</p>
                        <h2 className="text-lg font-semibold text-orange-900">Create a new event</h2>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">{events.length} total</span>
                </div>
                {eventError && !editingId ? <p className="text-sm text-red-600">{eventError}</p> : null}
                <form className="space-y-3" onSubmit={handleSaveAdd}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={addForm.title} onChange={(e) => setAddForm({ ...addForm, title: e.target.value })} required />
                        <Input label="Date" type="date" required value={addForm.date} onChange={(e) => setAddForm({ ...addForm, date: e.target.value })} />
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700 md:col-span-2">
                            Class
                            <select
                                value={addForm.className}
                                onChange={(e) => setAddForm({ ...addForm, className: e.target.value })}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            >
                                {PORTAL_CLASS_OPTIONS.map((opt) => (
                                    <option key={opt.value || "all"} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <span className="text-[11px] font-normal text-orange-600">
                                Choose &ldquo;All classes&rdquo; for centre-wide and public page gallery.
                            </span>
                        </label>
                        <Input label="Venue" value={addForm.venue} onChange={(e) => setAddForm({ ...addForm, venue: e.target.value })} />
                        <Input label="Notes" value={addForm.notes} onChange={(e) => setAddForm({ ...addForm, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={submitting}>
                            {submitting ? "Saving..." : "Add Event"}
                        </Button>
                        <Button type="button" size="sm" variant="outline" disabled={submitting} onClick={resetAddForm}>
                            Reset
                        </Button>
                    </div>
                </form>
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
                {mediaAlert && !editingId ? <MediaUploadAlert alert={mediaAlert} /> : null}
                {mediaSubmitting && !editingId ? (
                    <p className="text-sm text-orange-700 font-medium">Uploading… please wait.</p>
                ) : null}
                <EventMediaUploadForm
                    events={events}
                    mediaEventId={mediaEventId}
                    setMediaEventId={setMediaEventId}
                    showEventSelector
                    mediaType={mediaType}
                    setMediaType={(type) => {
                        setMediaType(type);
                        setMediaAlert(null);
                    }}
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    mediaFileInputKey={mediaFileInputKey}
                    setMediaFileInputKey={setMediaFileInputKey}
                    videoLinkUrl={videoLinkUrl}
                    setVideoLinkUrl={setVideoLinkUrl}
                    mediaCaption={mediaCaption}
                    setMediaCaption={setMediaCaption}
                    mediaSubmitting={mediaSubmitting}
                    onSubmit={handleUploadMedia}
                    onReset={() => resetMediaUploadFields(true)}
                />
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
                                    <span className="mt-1 inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700 border border-orange-100">
                                        {portalClassLabel(event.className)}
                                    </span>
                                </div>
                            </div>
                            <span className="px-2 py-1 text-[11px] rounded-full bg-orange-50 text-orange-700">{event.date || "Date"}</span>
                        </div>
                        <p className="text-sm text-orange-800 line-clamp-2">{event.notes || "No notes"}</p>
                        <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" onClick={() => setViewId(event.id)}>
                                <Eye className="w-4 h-4" /> View
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditModal(event)}>
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

            {editingId && (
                <Modal isOpen onClose={closeEditModal} title="Edit event" size="lg" placement="center">
                    <div className="space-y-5">
                    <form id="edit-event-form" className="space-y-5" onSubmit={handleSaveEdit}>
                        {eventError ? <p className="text-sm text-red-600">{eventError}</p> : null}
                        <div className="grid md:grid-cols-2 gap-3">
                            <Input
                                label="Title"
                                value={editForm.title}
                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                required
                            />
                            <Input
                                label="Date"
                                type="date"
                                required
                                value={editForm.date}
                                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                            />
                            <label className="flex flex-col gap-1 text-xs font-medium text-orange-700 md:col-span-2">
                                Class
                                <select
                                    value={editForm.className}
                                    onChange={(e) => setEditForm({ ...editForm, className: e.target.value })}
                                    className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                >
                                    {PORTAL_CLASS_OPTIONS.map((opt) => (
                                        <option key={opt.value || "all"} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <Input
                                label="Venue"
                                value={editForm.venue}
                                onChange={(e) => setEditForm({ ...editForm, venue: e.target.value })}
                            />
                            <Input
                                label="Notes"
                                value={editForm.notes}
                                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            />
                        </div>

                    </form>

                        <div className="rounded-xl border border-orange-100 bg-orange-50/60 p-4 space-y-4">
                            <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 mb-1">
                                Photos & videos for this event
                            </p>
                            <p className="text-[11px] text-orange-600">
                                Remove items you no longer need, or upload more photos and videos below.
                            </p>
                            </div>
                            {mediaForEditing.length === 0 ? (
                                <p className="text-sm text-orange-700">No media yet for this event.</p>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {mediaForEditing.map((m) => (
                                        <div
                                            key={m.id}
                                            className="flex flex-col rounded-lg overflow-hidden border border-orange-100 bg-white shadow-sm"
                                        >
                                            <div className="relative aspect-square">
                                                {m.type === "video" || m.type === "url" ? (
                                                    <EventGalleryVideo
                                                        filePath={m.filePath}
                                                        mediaId={m.type === "url" ? undefined : Number(m.id)}
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
                                            </div>
                                            <div className="flex items-center justify-between gap-2 px-2 py-2 border-t border-orange-50">
                                                <span className="text-[10px] font-semibold uppercase text-orange-700">
                                                    {m.type === "url" ? "Link" : m.type === "video" ? "Video" : "Photo"}
                                                </span>
                                                <button
                                                    type="button"
                                                    disabled={deletingMediaId !== null}
                                                    onClick={async () => {
                                                        if (!confirm("Remove this file from the event?")) return;
                                                        setDeletingMediaId(m.id);
                                                        try {
                                                            await deleteEventMedia(editingId, m.id);
                                                            showToast("File removed.", "success");
                                                        } catch (err: unknown) {
                                                            showToast(
                                                                err instanceof Error ? err.message : "Could not remove file.",
                                                                "error",
                                                            );
                                                        } finally {
                                                            setDeletingMediaId(null);
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="pt-4 border-t border-orange-100 space-y-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                                        Add photos or videos
                                    </p>
                                    <p className="text-[11px] text-orange-600 mt-0.5">
                                        Photos: max 1 MB each. Videos: YouTube/Bunny link and/or MP4 upload.
                                    </p>
                                </div>
                                {mediaAlert ? <MediaUploadAlert alert={mediaAlert} /> : null}
                                {mediaSubmitting ? (
                                    <p className="text-sm text-orange-700 font-medium">Uploading… please wait.</p>
                                ) : null}
                                <EventMediaUploadForm
                                    events={events}
                                    mediaEventId={editingId}
                                    setMediaEventId={setMediaEventId}
                                    showEventSelector={false}
                                    mediaType={mediaType}
                                    setMediaType={(type) => {
                                        setMediaType(type);
                                        setMediaAlert(null);
                                    }}
                                    mediaFiles={mediaFiles}
                                    setMediaFiles={setMediaFiles}
                                    mediaFileInputKey={mediaFileInputKey}
                                    setMediaFileInputKey={setMediaFileInputKey}
                                    videoLinkUrl={videoLinkUrl}
                                    setVideoLinkUrl={setVideoLinkUrl}
                                    mediaCaption={mediaCaption}
                                    setMediaCaption={setMediaCaption}
                                    mediaSubmitting={mediaSubmitting}
                                    onSubmit={handleUploadMedia}
                                    onReset={() => resetMediaUploadFields()}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-orange-100">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="!text-red-600 !border-red-200 hover:!bg-red-50"
                                onClick={() => void handleDeleteEventFromModal()}
                            >
                                <Trash2 className="w-4 h-4" /> Delete event
                            </Button>
                            <div className="flex gap-2">
                                <Button type="button" size="sm" variant="outline" onClick={closeEditModal}>
                                    Cancel
                                </Button>
                                <Button form="edit-event-form" type="submit" size="sm" disabled={submitting}>
                                    {submitting ? "Saving…" : "Save changes"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {viewing && (
                <Modal isOpen onClose={() => setViewId(null)} title="Event details" size="lg" placement="center">
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
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-800 border border-orange-100">
                                    {portalClassLabel(viewing.className)}
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
                                                {m.type === "video" || m.type === "url" ? (
                                                    <EventGalleryVideo
                                                        filePath={m.filePath}
                                                        mediaId={m.type === "url" ? undefined : Number(m.id)}
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
