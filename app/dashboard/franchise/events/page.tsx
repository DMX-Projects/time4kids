"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarRange, Eye, MapPin, Pencil, Search, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

const pastelCard = "bg-white border border-orange-100 rounded-xl shadow-sm";

export default function FranchiseEventsPage() {
    const { events, eventMedia, addEvent, updateEvent, deleteEvent, addEventMedia, deleteEventMedia } = useSchoolData();

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

    const [error, setError] = useState<string | null>(null);
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
            setError("Please choose an event date.");
            return;
        }
        setError(null);
        setSubmitting(true);
        try {
            if (editingId) {
                await updateEvent(editingId, form);
            } else {
                await addEvent(form);
            }
            resetForm();
        } catch (err: any) {
            setError(err?.message || "Unable to save event");
        } finally {
            setSubmitting(false);
        }
    };

    const handleUploadMedia = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!mediaEventId) {
            setError("Select an event before uploading media");
            return;
        }
        if (mediaFiles.length === 0) {
            setError("Choose one or more files to upload");
            return;
        }
        setError(null);
        setMediaSubmitting(true);
        try {
            let ok = 0;
            let failed = 0;
            for (const file of mediaFiles) {
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
            if (failed > 0 && ok === 0) {
                setError("Unable to upload media. Please try again.");
            } else if (failed > 0) {
                setError(`Uploaded ${ok} file(s); ${failed} failed.`);
            }
            setMediaCaption("");
            setMediaFiles([]);
            setMediaFileInputKey((k) => k + 1);
        } catch (err: any) {
            setError(err?.message || "Unable to upload media");
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
                    <h1 className="text-2xl font-semibold text-orange-900">Events</h1>
                    <p className="text-sm text-orange-700">Create, update, and showcase events with rich media.</p>
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
                                Update title, date, venue, and notes below. Remove individual files from the gallery under this event, or add more in{" "}
                                <strong>Add Media</strong>. You can also use{" "}
                                <Link href="/dashboard/franchise/gallery/" className="font-semibold underline hover:text-orange-800">
                                    Centre Gallery
                                </Link>{" "}
                                for the full-screen manager.
                            </p>
                        )}
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">{events.length} total</span>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
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
                                        <video src={m.url} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                                    ) : (
                                        // eslint-disable-next-line @next/next/no-img-element -- dynamic franchise URLs
                                        <img src={m.url} alt="" className="h-full w-full object-cover" />
                                    )}
                                    <button
                                        type="button"
                                        disabled={deletingMediaId !== null}
                                        onClick={async () => {
                                            if (!confirm("Remove this photo or video from the event?")) return;
                                            setDeletingMediaId(m.id);
                                            setError(null);
                                            try {
                                                await deleteEventMedia(editingId, m.id);
                                            } catch (err: unknown) {
                                                setError(err instanceof Error ? err.message : "Could not remove media");
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
                        <h2 className="text-lg font-semibold text-orange-900">Upload photos or videos</h2>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
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
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Files {mediaType === "image" ? "(multiple photos)" : "(multiple videos)"}
                            <input
                                key={mediaFileInputKey}
                                type="file"
                                accept={mediaType === "image" ? "image/*" : "video/*"}
                                multiple
                                onChange={(e) => setMediaFiles(Array.from(e.target.files || []))}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            />
                            {mediaFiles.length > 0 && (
                                <span className="text-[11px] font-normal text-orange-600">
                                    {mediaFiles.length} file{mediaFiles.length === 1 ? "" : "s"} selected
                                </span>
                            )}
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Type
                            <select
                                value={mediaType}
                                onChange={(e) => {
                                    setMediaType(e.target.value as "image" | "video");
                                    setMediaFiles([]);
                                    setMediaFileInputKey((k) => k + 1);
                                }}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Caption (optional, same for all)
                            <input
                                value={mediaCaption}
                                onChange={(e) => setMediaCaption(e.target.value)}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                placeholder="Short description applied to each file"
                            />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={mediaSubmitting}>
                            {mediaSubmitting
                                ? "Uploading..."
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
                                setMediaEventId(null);
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
                                    No media uploaded yet. Open{" "}
                                    <Link
                                        href="/dashboard/franchise/gallery/"
                                        className="font-semibold text-orange-800 underline hover:text-orange-950"
                                        onClick={() => setViewId(null)}
                                    >
                                        Centre Gallery
                                    </Link>{" "}
                                    for this centre, pick the event, then use <strong>Manage Media</strong> to upload or delete files.
                                </p>
                            ) : (
                                <>
                                    <p className="text-xs text-orange-700 mb-3">
                                        To <strong>remove</strong> a photo or video, go to{" "}
                                        <Link
                                            href="/dashboard/franchise/gallery/"
                                            className="font-semibold underline hover:text-orange-900"
                                            onClick={() => setViewId(null)}
                                        >
                                            Centre Gallery
                                        </Link>{" "}
                                        → <strong>Manage Media</strong> → hover a thumbnail and tap the trash icon.
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {mediaForViewing.map((m) => (
                                            <div
                                                key={m.id}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-orange-100 bg-orange-100/50 shadow-sm"
                                            >
                                                {m.type === "video" ? (
                                                    <video src={m.url} className="h-full w-full object-cover" controls playsInline preload="metadata" />
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={m.url} alt={m.title || "Event"} className="h-full w-full object-cover" />
                                                )}
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
                            <Link
                                href="/dashboard/franchise/gallery/"
                                className="font-semibold inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border-2 border-primary-500 text-primary-600 hover:bg-primary-50 transition-all"
                            >
                                Open Centre Gallery
                            </Link>
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
