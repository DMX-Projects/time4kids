"use client";

import React, { useCallback, useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { jsonHeaders } from "@/lib/api-client";
import { LayoutTemplate } from "lucide-react";
import {
    DEFAULT_FOOTER_PAGE_DATA,
    mergeFooterPageData,
    type FooterContactPatch,
    type FooterPageData,
    type FooterSocialPatch,
} from "@/config/footer-defaults";

const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 font-semibold text-slate-900">{title}</div>
            <div className="p-4 space-y-3">{children}</div>
        </div>
    );
}

export default function AdminFooterContentPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState(DEFAULT_FOOTER_PAGE_DATA);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const raw = (await authFetch("/common/page-content/footer/")) as FooterPageData;
            setData(mergeFooterPageData(raw));
        } catch (e: unknown) {
            setData(DEFAULT_FOOTER_PAGE_DATA);
            setError(e instanceof Error ? e.message : "Load failed");
        } finally {
            setLoading(false);
        }
    }, [authFetch]);

    useEffect(() => {
        load();
    }, [load]);

    const save = async () => {
        setMessage(null);
        setError(null);
        setSaving(true);
        try {
            await authFetch("/common/page-content/footer/", {
                method: "PUT",
                headers: jsonHeaders(),
                body: JSON.stringify(data),
            });
            setMessage("Saved. Refresh the site footer to see changes.");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Save failed");
        } finally {
            setSaving(false);
        }
    };

    const updateSocial = (patch: FooterSocialPatch) =>
        setData((p) => ({ ...p, social: { ...p.social, ...patch } }));

    const updateContact = (patch: FooterContactPatch) =>
        setData((p) => ({ ...p, contact: { ...p.contact, ...patch } }));

    if (loading) {
        return <p className="text-sm text-slate-600">Loading footer content...</p>;
    }

    return (
        <div className="max-w-3xl space-y-6 pb-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <LayoutTemplate className="h-7 w-7 text-orange-500" />
                        Footer content
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Edits the site footer and Contact page Connect With Us block.
                    </p>
                </div>
                <Button onClick={save} disabled={saving}>
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            {message ? <p className="text-sm text-green-700">{message}</p> : null}

            <Section title="About text (under logo)">
                <label className={labelClass}>Description</label>
                <textarea
                    className={inputClass + " min-h-[100px]"}
                    value={data.about_text}
                    onChange={(e) => setData((p) => ({ ...p, about_text: e.target.value }))}
                />
            </Section>

            <Section title="Contact Us (footer column)">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Email</label>
                        <input
                            className={inputClass}
                            value={data.contact.email}
                            onChange={(e) => updateContact({ email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone (display)</label>
                        <input
                            className={inputClass}
                            value={data.contact.phone}
                            onChange={(e) => updateContact({ phone: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone link (tel:)</label>
                        <input
                            className={inputClass}
                            value={data.contact.phone_tel}
                            onChange={(e) => updateContact({ phone_tel: e.target.value })}
                            placeholder="tel:+914040088300"
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Location label</label>
                        <input
                            className={inputClass}
                            value={data.contact.location_label}
                            onChange={(e) => updateContact({ location_label: e.target.value })}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Homepage footer phone only">
                <p className="text-xs text-slate-500 mb-2">
                    On the homepage footer, this number is shown instead of the office phone above.
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className={labelClass}>Phone (display)</label>
                        <input
                            className={inputClass}
                            value={data.homepage_phone}
                            onChange={(e) => setData((p) => ({ ...p, homepage_phone: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Phone link (tel:)</label>
                        <input
                            className={inputClass}
                            value={data.homepage_phone_tel}
                            onChange={(e) => setData((p) => ({ ...p, homepage_phone_tel: e.target.value }))}
                        />
                    </div>
                </div>
            </Section>

            <Section title="Connect With Us - social links">
                <div className="space-y-3">
                    <div>
                        <label className={labelClass}>Facebook URL</label>
                        <input
                            className={inputClass}
                            value={data.social.facebook}
                            onChange={(e) => updateSocial({ facebook: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>Instagram URL</label>
                        <input
                            className={inputClass}
                            value={data.social.instagram}
                            onChange={(e) => updateSocial({ instagram: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className={labelClass}>YouTube URL</label>
                        <input
                            className={inputClass}
                            value={data.social.youtube}
                            onChange={(e) => updateSocial({ youtube: e.target.value })}
                            placeholder="https://youtu.be/..."
                        />
                    </div>
                </div>
            </Section>

            <Section title="QR code">
                <label className={labelClass}>Scan to connect - URL</label>
                <input
                    className={inputClass}
                    value={data.qr_code_url}
                    onChange={(e) => setData((p) => ({ ...p, qr_code_url: e.target.value }))}
                />
            </Section>
        </div>
    );
}
