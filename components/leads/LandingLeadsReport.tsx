"use client";

import { useCallback, useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Calendar, Download, Inbox, MapPin, Phone, Mail, Search } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiUrl, toApiError } from "@/lib/api-client";
import { getStoredReportKey, persistReportKey, withReportKey } from "@/lib/landing-leads-auth";
import { slugify } from "@/lib/utils";

export type LandingLead = {
    id: number;
    name: string;
    mobileno: string;
    mobile: string | null;
    email: string | null;
    state: string | null;
    city: string | null;
    location: string | null;
    enquiry_type: string;
    source: string | null;
    centre_name: string | null;
    centre_phone: string | null;
    centre_email: string | null;
    email_status: string | null;
    created_date: string;
};

type LandingLeadsResponse = {
    count: number;
    city: string | null;
    cities: string[];
    results: LandingLead[];
};

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return iso;
    }
}

function phoneFor(lead: LandingLead) {
    return (lead.mobileno || lead.mobile || "").trim();
}

function leadLocalDateKey(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function exportCsv(leads: LandingLead[], filename: string) {
    const headers = [
        "Name",
        "Mobile",
        "Email",
        "City",
        "State",
        "Location",
        "Centre",
        "Source",
        "Email status",
        "Date",
    ];
    const rows = leads.map((l) => [
        l.name,
        phoneFor(l),
        l.email ?? "",
        l.city ?? "",
        l.state ?? "",
        l.location ?? "",
        l.centre_name ?? "",
        l.source ?? "",
        l.email_status ?? "",
        formatDate(l.created_date),
    ]);
    const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

type Props = {
    citySlug?: string;
    title: string;
};

const DEV_REPORT_KEY = process.env.NEXT_PUBLIC_LANDING_LEADS_REPORT_KEY?.trim() || "";

function LandingLeadsReportInner({ citySlug, title }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { user, authFetch, loading: authLoading } = useAuth();
    const [leads, setLeads] = useState<LandingLead[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [resolvedCity, setResolvedCity] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const urlKey = searchParams.get("key");
    const reportKey = (urlKey || getStoredReportKey() || "").trim() || null;
    const needsKey = !reportKey && !authLoading && user?.role !== "admin";

    useEffect(() => {
        if (urlKey) persistReportKey(urlKey);
    }, [urlKey]);

    useEffect(() => {
        if (reportKey || !DEV_REPORT_KEY) return;
        router.replace(withReportKey(pathname || "/leads/all/", DEV_REPORT_KEY));
    }, [pathname, reportKey, router]);

    const apiCityParam = citySlug?.trim() || "";

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (apiCityParam) params.set("city", apiCityParam);
            if (reportKey) params.set("key", reportKey);
            const query = params.toString();
            const path = `/enquiries/landing-leads/${query ? `?${query}` : ""}`;

            let data: LandingLeadsResponse;
            if (reportKey) {
                const res = await fetch(apiUrl(path), {
                    headers: { "X-Landing-Leads-Key": reportKey },
                });
                if (!res.ok) throw await toApiError(res);
                data = (await res.json()) as LandingLeadsResponse;
            } else if (user?.role === "admin") {
                data = await authFetch<LandingLeadsResponse>(path);
            } else {
                return;
            }

            setLeads(data.results ?? []);
            setCities(data.cities ?? []);
            setResolvedCity(data.city ?? null);
        } catch (e) {
            const msg = e instanceof Error ? e.message : "Failed to load leads";
            setError(
                /403|401|forbidden|invalid|missing report key/i.test(msg)
                    ? "Invalid or missing report key. Open the link with ?key=… (must match LANDING_LEADS_REPORT_KEY in backend .env)."
                    : msg,
            );
        } finally {
            setLoading(false);
        }
    }, [apiCityParam, authFetch, reportKey, user?.role]);

    useEffect(() => {
        if (needsKey) {
            setLoading(false);
            return;
        }
        if (authLoading) return;
        if (!reportKey && user?.role !== "admin") return;
        load();
    }, [authLoading, load, needsKey, reportKey, user?.role]);

    const hasActiveFilters = Boolean(search.trim() || dateFrom || dateTo);

    const filtered = useMemo(() => {
        let rows = leads;

        if (dateFrom) {
            rows = rows.filter((l) => {
                const key = leadLocalDateKey(l.created_date);
                return key && key >= dateFrom;
            });
        }
        if (dateTo) {
            rows = rows.filter((l) => {
                const key = leadLocalDateKey(l.created_date);
                return key && key <= dateTo;
            });
        }

        const q = search.trim().toLowerCase();
        if (!q) return rows;

        return rows.filter((l) => {
            const hay = [
                l.name,
                phoneFor(l),
                l.email,
                l.city,
                l.state,
                l.location,
                l.source,
                l.centre_name,
                formatDate(l.created_date),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return hay.includes(q);
        });
    }, [leads, search, dateFrom, dateTo]);

    const clearFilters = () => {
        setSearch("");
        setDateFrom("");
        setDateTo("");
    };

    const exportName = citySlug
        ? `landing-leads-${citySlug}.csv`
        : "landing-leads-all.csv";

    return (
        <div className="min-h-screen bg-slate-50">
            <header className="border-b border-slate-200 bg-white">
                <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-orange-600">Landing page leads</p>
                            <h1 className="mt-1 text-2xl font-bold text-slate-900">{title}</h1>
                            {!loading && (
                                <p className="mt-1 text-sm text-slate-500">
                                    {filtered.length} lead{filtered.length === 1 ? "" : "s"}
                                    {resolvedCity ? ` in ${resolvedCity}` : ""}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href={withReportKey("/leads/all/", reportKey)}
                                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                                    !citySlug
                                        ? "bg-orange-500 text-white"
                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                }`}
                            >
                                All cities
                            </Link>
                            <button
                                type="button"
                                disabled={!filtered.length}
                                onClick={() => exportCsv(filtered, exportName)}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                                <Download className="h-4 w-4" />
                                Export CSV
                            </button>
                        </div>
                    </div>
                    {cities.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {cities.map((c) => {
                                const slug = slugify(c);
                                const active = citySlug === slug;
                                return (
                                    <Link
                                        key={c}
                                        href={withReportKey(`/leads/${slug}/`, reportKey)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                                            active
                                                ? "bg-orange-500 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                        }`}
                                    >
                                        {c}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                {needsKey && (
                    <div className="mx-auto mb-8 max-w-lg rounded-xl border border-amber-200 bg-amber-50 px-6 py-8 text-center">
                        <h2 className="text-lg font-semibold text-amber-900">Report access key required</h2>
                        <p className="mt-2 text-sm text-amber-800">
                            Add <code className="rounded bg-amber-100 px-1">?key=YOUR_KEY</code> to the URL (must match{" "}
                            <code className="rounded bg-amber-100 px-1">LANDING_LEADS_REPORT_KEY</code> in backend .env).
                        </p>
                        <Link
                            href={withReportKey(
                                pathname || "/leads/all/",
                                DEV_REPORT_KEY || "timekids-local-leads",
                            )}
                            className="mt-4 inline-block rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
                        >
                            Open report with key
                        </Link>
                    </div>
                )}

                {!needsKey && (
                <>
                <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                        <div className="relative min-w-0 flex-1">
                            <label className="mb-1 block text-xs font-medium text-slate-500">Search</label>
                            <Search className="pointer-events-none absolute left-3 top-[2.125rem] h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="search"
                                placeholder="Name, phone, email, location, source..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none ring-orange-500 focus:bg-white focus:ring-2"
                            />
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                            <div>
                                <label htmlFor="leads-date-from" className="mb-1 block text-xs font-medium text-slate-500">
                                    From date
                                </label>
                                <input
                                    id="leads-date-from"
                                    type="date"
                                    value={dateFrom}
                                    max={dateTo || undefined}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-orange-500 focus:bg-white focus:ring-2"
                                />
                            </div>
                            <div>
                                <label htmlFor="leads-date-to" className="mb-1 block text-xs font-medium text-slate-500">
                                    To date
                                </label>
                                <input
                                    id="leads-date-to"
                                    type="date"
                                    value={dateTo}
                                    min={dateFrom || undefined}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none ring-orange-500 focus:bg-white focus:ring-2"
                                />
                            </div>
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="flex items-center justify-center py-20 text-slate-500">
                        <Inbox className="mr-2 h-5 w-5 animate-pulse" />
                        Loading leads…
                    </div>
                )}

                {!loading && !error && filtered.length === 0 && (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center">
                        <Inbox className="mx-auto h-10 w-10 text-slate-300" />
                        <p className="mt-3 text-slate-600">
                            {hasActiveFilters
                                ? "No leads match your search or date filter."
                                : leads.length === 0
                                  ? "No landing-page leads yet."
                                  : "No leads in this view."}
                        </p>
                    </div>
                )}

                {!loading && filtered.length > 0 && (
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Contact</th>
                                        <th className="px-4 py-3">City / Location</th>
                                        <th className="px-4 py-3">Centre</th>
                                        <th className="px-4 py-3">Source</th>
                                        <th className="px-4 py-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((lead) => (
                                        <tr key={lead.id} className="hover:bg-slate-50/80">
                                            <td className="px-4 py-3 font-medium text-slate-900">
                                                {lead.name}
                                            </td>
                                            <td className="px-4 py-3">
                                                {phoneFor(lead) && (
                                                    <a
                                                        href={`tel:${phoneFor(lead)}`}
                                                        className="flex items-center gap-1 text-slate-700 hover:text-orange-600"
                                                    >
                                                        <Phone className="h-3.5 w-3.5" />
                                                        {phoneFor(lead)}
                                                    </a>
                                                )}
                                                {lead.email && (
                                                    <a
                                                        href={`mailto:${lead.email}`}
                                                        className="mt-1 flex items-center gap-1 text-slate-600 hover:text-orange-600"
                                                    >
                                                        <Mail className="h-3.5 w-3.5" />
                                                        {lead.email}
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                <span className="inline-flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                                                    {[lead.city, lead.state].filter(Boolean).join(", ") || "—"}
                                                </span>
                                                {lead.location && (
                                                    <div className="mt-0.5 text-xs text-slate-500">
                                                        {lead.location}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {lead.centre_name || "—"}
                                                {lead.centre_phone && (
                                                    <div className="text-xs text-slate-500">
                                                        {lead.centre_phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-slate-600">
                                                {lead.source || "—"}
                                                {lead.email_status && (
                                                    <div className="text-xs text-slate-400">
                                                        Email: {lead.email_status}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                                                <span className="inline-flex items-center gap-1">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    {formatDate(lead.created_date)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                </>
                )}
            </main>
        </div>
    );
}

export default function LandingLeadsReport(props: Props) {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center text-slate-500">
                    Loading report…
                </div>
            }
        >
            <LandingLeadsReportInner {...props} />
        </Suspense>
    );
}