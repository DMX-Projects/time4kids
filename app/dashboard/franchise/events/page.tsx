"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Eye, Image as ImageIcon, MapPin, Pencil, Search, Trash2, Video } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

const pastelCard = "bg-white border border-orange-100 rounded-xl shadow-sm";

export default function FranchiseEventsPage() {
    const { events, eventMedia, addEvent, updateEvent, deleteEvent, addEventMedia } = useSchoolData();

    const [query, setQuery] = useState("");
    const [form, setForm] = useState({ title: "", date: "", venue: "", notes: "" });
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewId, setViewId] = useState<string | null>(null);

    const [mediaEventId, setMediaEventId] = useState<string | null>(null);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaType, setMediaType] = useState<"image" | "video">("image");
    const [mediaCaption, setMediaCaption] = useState("");

    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [mediaSubmitting, setMediaSubmitting] = useState(false);

    const filtered = useMemo(() => {
        const term = query.toLowerCase();
        return events.filter((e) => [e.title, e.venue, e.date].some((f) => (f || "").toLowerCase().includes(term)));
    }, [events, query]);

    const resetForm = () => {
        setForm({ title: "", date: "", venue: "", notes: "" });
        setEditingId(null);
    };

    const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.title.trim()) return;
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
        if (!mediaFile) {
            setError("Choose a file to upload");
            return;
        }
        setError(null);
        setMediaSubmitting(true);
        try {
            await addEventMedia({
                eventId: mediaEventId,
                title: mediaFile.name,
                description: mediaCaption,
                type: mediaType,
                file: mediaFile,
            });
            setMediaCaption("");
            setMediaFile(null);
            setMediaEventId(null);
        } catch (err: any) {
            setError(err?.message || "Unable to upload media");
        } finally {
            setMediaSubmitting(false);
        }
    };

    const viewing = events.find((e) => e.id === viewId) || null;
    const mediaForViewing = useMemo(() => eventMedia.filter((m) => m.eventId === viewId), [eventMedia, viewId]);

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

            <section className={`${pastelCard} p-6 space-y-3`}>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs uppercase font-semibold text-orange-600">{editingId ? "Edit" : "Add"} Event</p>
                        <h2 className="text-lg font-semibold text-orange-900">{editingId ? "Update event details" : "Create a new event"}</h2>
                    </div>
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-50 text-orange-700">{events.length} total</span>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <form className="space-y-3" onSubmit={handleSaveEvent}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
                            File
                            <input
                                type="file"
                                accept="image/*,video/*"
                                onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Type
                            <select
                                value={mediaType}
                                onChange={(e) => setMediaType(e.target.value as "image" | "video")}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Caption (optional)
                            <input
                                value={mediaCaption}
                                onChange={(e) => setMediaCaption(e.target.value)}
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                placeholder="Short description"
                            />
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={mediaSubmitting}>
                            {mediaSubmitting ? "Uploading..." : "Upload"}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={mediaSubmitting}
                            onClick={() => {
                                setMediaCaption("");
                                setMediaFile(null);
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
                                    setForm({
                                        title: rest.title || "",
                                        date: rest.date || "",
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
                <Modal isOpen onClose={() => setViewId(null)} title="Event details">
                    <div className="space-y-2 text-sm text-orange-900">
                        <p className="text-lg font-semibold">{viewing.title}</p>
                        <p className="text-xs text-orange-700">{viewing.date}</p>
                        <p className="text-xs text-orange-700">{viewing.venue}</p>
                        <p className="text-sm text-orange-800">{viewing.notes}</p>
                        <div className="grid gap-2 md:grid-cols-2 pt-2">
                            {mediaForViewing.map((m) => (
                                <div key={m.id} className="border border-orange-100 rounded-lg p-2 flex items-center gap-2">
                                    {m.type === "video" ? (
                                        <Video className="w-4 h-4 text-orange-600" />
                                    ) : (
                                        <ImageIcon className="w-4 h-4 text-orange-600" />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-sm text-orange-900 truncate">{m.title || m.url.split("/").pop()}</p>
                                        {m.description && <p className="text-[11px] text-orange-700 truncate">{m.description}</p>}
                                    </div>
                                    <a href={m.url} target="_blank" rel="noreferrer" className="text-xs text-orange-600 hover:underline">
                                        Open
                                    </a>
                                </div>
                            ))}
                            {mediaForViewing.length === 0 && <p className="text-xs text-orange-700">No media yet.</p>}
                        </div>
                        <div className="flex gap-2 pt-3">
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
