"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { LifeBuoy, Phone, Mail } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";
import { jsonHeaders } from "@/lib/api-client";
import Button from "@/components/ui/Button";

type Ticket = { id: number; subject: string; body: string; status: string; franchise_reply?: string; created_at?: string };

export default function SupportPage() {
    const { authFetch } = useAuth();
    const { parentProfile } = useParentData();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitOk, setSubmitOk] = useState(false);

    const load = async () => {
        setLoading(true);
        setLoadError(null);
        try {
            const data = await authFetch<Ticket[]>("/students/parent/tickets/");
            setTickets(Array.isArray(data) ? data : []);
        } catch {
            setTickets([]);
            setLoadError("Could not load tickets. Check your connection or try again in a moment.");
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
        setSubmitError(null);
        setSubmitOk(false);
        try {
            await authFetch("/students/parent/tickets/", {
                method: "POST",
                headers: jsonHeaders(),
                body: JSON.stringify({ subject: subject.trim(), body: body.trim() }),
            });
            setSubject("");
            setBody("");
            setSubmitOk(true);
            await load();
        } catch {
            setSubmitError("Could not send your ticket. If this keeps happening, use the centre contact details below or call the school.");
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
                        <p className="text-sm text-orange-700">
                            Raise a ticket for your centre. Staff can reply here; you’ll see status and replies on each ticket.
                        </p>
                    </div>
                </div>
            </section>

            {(parentProfile.franchisePhone || parentProfile.franchiseEmail) && (
                <section className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4 shadow-sm space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">Your centre</p>
                    {parentProfile.franchiseName && (
                        <p className="text-sm font-medium text-orange-900">{parentProfile.franchiseName}</p>
                    )}
                    <div className="flex flex-col gap-2 text-sm text-orange-800">
                        {parentProfile.franchisePhone?.trim() && (
                            <a
                                href={`tel:${parentProfile.franchisePhone.replace(/\s/g, "")}`}
                                className="inline-flex items-center gap-2 hover:text-orange-950"
                            >
                                <Phone className="w-4 h-4 shrink-0" />
                                {parentProfile.franchisePhone}
                            </a>
                        )}
                        {parentProfile.franchiseEmail?.trim() && (
                            <a
                                href={`mailto:${parentProfile.franchiseEmail}`}
                                className="inline-flex items-center gap-2 hover:text-orange-950 break-all"
                            >
                                <Mail className="w-4 h-4 shrink-0" />
                                {parentProfile.franchiseEmail}
                            </a>
                        )}
                    </div>
                    <Link href="/contact" className="text-xs font-medium text-orange-700 underline underline-offset-2 hover:text-orange-900">
                        Main website contact
                    </Link>
                </section>
            )}

            {loadError && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3" role="alert">
                    {loadError}
                </p>
            )}

            <form onSubmit={onSubmit} className="rounded-2xl border border-orange-100 bg-white p-4 space-y-3 shadow-sm">
                <h2 className="text-sm font-semibold text-orange-900">New ticket</h2>
                {submitOk && (
                    <p className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                        Ticket sent. Your centre will review it soon.
                    </p>
                )}
                {submitError && (
                    <p className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-lg px-3 py-2" role="alert">
                        {submitError}
                    </p>
                )}
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
                {!loading && !loadError && tickets.length === 0 && (
                    <p className="text-sm text-orange-700">No tickets yet. Submit one above or call your centre.</p>
                )}
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
