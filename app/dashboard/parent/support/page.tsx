"use client";

import { FormEvent, useEffect, useState } from "react";
import { LifeBuoy } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import Button from "@/components/ui/Button";

type Ticket = { id: number; subject: string; body: string; status: string; franchise_reply?: string; created_at?: string };

export default function SupportPage() {
    const { authFetch } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            const data = await authFetch<Ticket[]>("/students/parent/tickets/");
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, [authFetch]);

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!subject.trim() || !body.trim()) return;
        setSending(true);
        try {
            await authFetch("/students/parent/tickets/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
            });
            setSubject("");
            setBody("");
            await load();
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <LifeBuoy className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Support</h1>
                        <p className="text-sm text-orange-700">Raise a ticket for your centre. They can reply here when updated.</p>
                    </div>
                </div>
            </section>

            <form onSubmit={onSubmit} className="rounded-2xl border border-orange-100 bg-white p-4 space-y-3 shadow-sm">
                <h2 className="text-sm font-semibold text-orange-900">New ticket</h2>
                <label className="block text-xs font-medium text-orange-700">
                    Subject
                    <input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 text-sm"
                        required
                    />
                </label>
                <label className="block text-xs font-medium text-orange-700">
                    Message
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        className="mt-1 w-full rounded-lg border border-orange-200 px-3 py-2 text-sm"
                        required
                    />
                </label>
                <Button type="submit" size="sm" disabled={sending} className="bg-[#FF922B] text-white">
                    {sending ? "Sending…" : "Submit ticket"}
                </Button>
            </form>

            <div>
                <h2 className="text-sm font-semibold text-orange-900 mb-2">Your tickets</h2>
                {loading && <p className="text-sm text-orange-700">Loading…</p>}
                {!loading && tickets.length === 0 && <p className="text-sm text-orange-700">No tickets yet.</p>}
                <ul className="space-y-3">
                    {tickets.map((t) => (
                        <li key={t.id} className="rounded-xl border border-orange-100 bg-white p-4 shadow-sm space-y-2">
                            <div className="flex flex-wrap justify-between gap-2">
                                <span className="font-semibold text-orange-900">{t.subject}</span>
                                <span className="text-xs text-orange-600">{t.status}</span>
                            </div>
                            <p className="text-sm text-orange-800 whitespace-pre-wrap">{t.body}</p>
                            {t.franchise_reply && (
                                <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-sm text-orange-900">
                                    <span className="text-xs font-bold uppercase text-orange-600">Centre reply</span>
                                    <p className="mt-1 whitespace-pre-wrap">{t.franchise_reply}</p>
                                </div>
                            )}
                            {t.created_at && <p className="text-[11px] text-orange-500">{new Date(t.created_at).toLocaleString()}</p>}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
