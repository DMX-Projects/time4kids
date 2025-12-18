"use client";

import { useState } from "react";
import { Plus, Image, Video } from "lucide-react";
import Button from "@/components/ui/Button";
import { useSchoolData } from "@/components/dashboard/shared/SchoolDataProvider";

export default function AddEventsPage() {
    const { addEvent, addEventMedia, events } = useSchoolData();
    const [form, setForm] = useState({ title: "", date: "", venue: "", notes: "" });
    const [mediaForm, setMediaForm] = useState({ title: "", url: "", type: "image", eventId: "", description: "" });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        addEvent(form);
        setForm({ title: "", date: "", venue: "", notes: "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleMediaSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!mediaForm.url.trim()) return;
        addEventMedia(mediaForm);
        setMediaForm({ title: "", url: "", type: "image", eventId: "", description: "" });
    };

    return (
        <div className="space-y-6">
            <Section id="add-event" title="Add Event" description="Publish new events for parents and staff." icon={<Plus className="w-5 h-5 text-orange-500" />}>
                <form className="space-y-3" onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
                        <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                        <Input label="Venue" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                        <Input label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Publish</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setForm({ title: "", date: "", venue: "", notes: "" })}>Reset</Button>
                    </div>
                </form>
            </Section>

            <Section
                id="add-media"
                title="Add Event Media"
                description="Upload image or video links for events. Parents will view these in their gallery."
                icon={mediaForm.type === "video" ? <Video className="w-5 h-5 text-orange-500" /> : <Image className="w-5 h-5 text-orange-500" />}
            >
                <form className="space-y-3" onSubmit={handleMediaSubmit}>
                    <div className="grid md:grid-cols-2 gap-3">
                        <Input label="Title" value={mediaForm.title} onChange={(e) => setMediaForm({ ...mediaForm, title: e.target.value })} />
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Type
                            <select
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={mediaForm.type}
                                onChange={(e) => setMediaForm({ ...mediaForm, type: e.target.value })}
                            >
                                <option value="image">Image</option>
                                <option value="video">Video</option>
                            </select>
                        </label>
                        <Input label="Media URL" value={mediaForm.url} onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })} required />
                        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
                            Event (optional)
                            <select
                                className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                                value={mediaForm.eventId}
                                onChange={(e) => setMediaForm({ ...mediaForm, eventId: e.target.value })}
                            >
                                <option value="">Unlinked</option>
                                {events.map((ev) => (
                                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                                ))}
                            </select>
                        </label>
                        <Input label="Description (optional)" value={mediaForm.description} onChange={(e) => setMediaForm({ ...mediaForm, description: e.target.value })} />
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm">Add Media</Button>
                        <Button type="button" size="sm" variant="outline" onClick={() => setMediaForm({ title: "", url: "", type: "image", eventId: "", description: "" })}>Reset</Button>
                    </div>
                </form>
            </Section>
        </div>
    );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-orange-700">
            {label}
            <input {...props} className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none" />
        </label>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}
