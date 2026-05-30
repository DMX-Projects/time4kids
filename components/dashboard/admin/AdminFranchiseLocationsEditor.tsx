"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useAdminData, type AdminFranchise } from "@/components/dashboard/admin/AdminDataProvider";

type LocationFormState = {
    name: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    address: string;
    phone: string;
    email: string;
    status: string;
};

const emptyForm: LocationFormState = {
    name: "",
    city: "",
    state: "",
    country: "India",
    postalCode: "",
    address: "",
    phone: "",
    email: "",
    status: "Active",
};

function franchiseToForm(fr: AdminFranchise): LocationFormState {
    return {
        name: fr.name || "",
        city: fr.city || fr.region || "",
        state: fr.state || "",
        country: fr.country || "India",
        postalCode: fr.postalCode || "",
        address: fr.address || "",
        phone: fr.phone || "",
        email: fr.email || "",
        status: fr.status || "Active",
    };
}

function matchesSearch(fr: AdminFranchise, query: string): boolean {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
        fr.name,
        fr.city,
        fr.region,
        fr.state,
        fr.country,
        fr.address,
        fr.phone,
        fr.email,
        fr.postalCode,
    ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    return haystack.includes(q);
}

function truncate(text: string, max = 56): string {
    const t = text.trim();
    if (t.length <= max) return t;
    return `${t.slice(0, max - 1)}…`;
}

export function AdminFranchiseLocationsEditor() {
    const searchParams = useSearchParams();
    const {
        franchises,
        stats,
        updateFranchise,
        deleteFranchise,
        reloadFranchises,
        refreshLocations,
        refreshStats,
        franchisesLoadError,
    } = useAdminData();
    const { showToast } = useToast();

    const [searchInput, setSearchInput] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [editing, setEditing] = useState<AdminFranchise | null>(null);
    const [form, setForm] = useState<LocationFormState>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setInitialLoading(true);
            try {
                await Promise.all([reloadFranchises(), refreshStats()]);
            } finally {
                if (!cancelled) setInitialLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
        // Reload full centre list once when this page opens
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const city = searchParams.get("city")?.trim();
        const id = searchParams.get("id")?.trim();
        if (city) {
            setSearchInput(city);
            setAppliedSearch(city);
        }
        if (id && franchises.length > 0) {
            const match = franchises.find((f) => f.id === id);
            if (match) {
                setEditing(match);
                setForm(franchiseToForm(match));
            }
        }
    }, [searchParams, franchises]);

    const filtered = useMemo(() => {
        const list = [...franchises].sort((a, b) => {
            const cityCmp = (a.city || a.region || "").localeCompare(b.city || b.region || "");
            if (cityCmp !== 0) return cityCmp;
            return (a.name || "").localeCompare(b.name || "");
        });
        if (!appliedSearch.trim()) return list;
        return list.filter((fr) => matchesSearch(fr, appliedSearch));
    }, [franchises, appliedSearch]);

    const runSearch = () => setAppliedSearch(searchInput.trim());

    const clearSearch = () => {
        setSearchInput("");
        setAppliedSearch("");
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await Promise.all([reloadFranchises(), refreshLocations(), refreshStats()]);
            showToast("Centre list refreshed.", "success");
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Refresh failed.", "error");
        } finally {
            setRefreshing(false);
        }
    };

    const dbTotal = stats.franchises || franchises.length;
    const loadIncomplete = dbTotal > 0 && franchises.length < dbTotal;

    const openEdit = (fr: AdminFranchise) => {
        setEditing(fr);
        setForm(franchiseToForm(fr));
    };

    const closeEdit = () => {
        setEditing(null);
        setForm(emptyForm);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editing) return;
        if (!form.name.trim()) {
            showToast("Centre name is required.", "error");
            return;
        }
        const phoneDigits = form.phone.replace(/\D/g, "");
        if (phoneDigits && phoneDigits.length !== 10) {
            showToast("Phone must be exactly 10 digits.", "error");
            return;
        }

        setSaving(true);
        try {
            await updateFranchise(editing.id, {
                name: form.name.trim(),
                region: form.city.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                country: form.country.trim(),
                postalCode: form.postalCode.trim(),
                address: form.address.trim(),
                phone: phoneDigits,
                email: form.email.trim(),
                status: form.status,
            });
            await refreshLocations();
            showToast("Saved — changes are live on the site.", "success");
            closeEdit();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not save.", "error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!editing) return;
        if (!window.confirm(`Delete "${editing.name}" permanently? This cannot be undone.`)) return;
        setDeleting(true);
        try {
            await deleteFranchise(editing.id);
            await refreshLocations();
            showToast("Centre deleted.", "success");
            closeEdit();
        } catch (err: unknown) {
            showToast(err instanceof Error ? err.message : "Could not delete.", "error");
        } finally {
            setDeleting(false);
        }
    };

    const activeCount = filtered.filter((f) => (f.status || "").toLowerCase() === "active").length;
    const inactiveCount = filtered.length - activeCount;

    if (initialLoading && franchises.length === 0) {
        return (
            <div className="flex min-h-[50vh] items-center justify-center p-8">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 md:p-8">
            <div>
                <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold text-gray-900 md:text-3xl">
                    <MapPin className="h-8 w-8 text-orange-500" />
                    Franchise centres
                </h1>
                <p className="max-w-3xl text-sm text-gray-600 md:text-base">
                    Search, add, and edit every centre — name, address, phone, city, and status. Changes save
                    straight to the server and show on{" "}
                    <Link href="/locate-centre" className="font-medium text-orange-600 underline" target="_blank">
                        Locate a Centre
                    </Link>
                    , public school pages, and the locations directory.
                </p>
            </div>

            {franchisesLoadError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {franchisesLoadError}
                </div>
            )}

            {loadIncomplete && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    Showing <strong>{franchises.length}</strong> of <strong>{dbTotal}</strong> centres in the database.
                    Deploy the latest backend and click <strong>Refresh</strong> to load all rows (including centres
                    whose login user was removed).
                </div>
            )}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-gray-200 bg-gray-50 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">All centres</h2>
                        <p className="text-sm text-gray-500">
                            {!appliedSearch
                                ? `${franchises.length} of ${dbTotal} in database`
                                : `${filtered.length} matching search`}
                            {inactiveCount > 0
                                ? ` · ${activeCount} active · ${inactiveCount} inactive`
                                : filtered.length > 0
                                  ? ` · all active`
                                  : ""}
                            {appliedSearch ? ` · “${appliedSearch}”` : ""}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative flex min-w-0 flex-1 items-center gap-2 sm:flex-none">
                            <div className="relative min-w-[200px] flex-1 sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="search"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            runSearch();
                                        }
                                    }}
                                    placeholder="Name, city, state, address, phone…"
                                    className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                />
                            </div>
                            <Button type="button" size="sm" onClick={runSearch} className="shrink-0">
                                Search
                            </Button>
                            {appliedSearch ? (
                                <Button type="button" size="sm" variant="outline" onClick={clearSearch}>
                                    Clear
                                </Button>
                            ) : null}
                        </div>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => void handleRefresh()}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2"
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Link
                            href="/dashboard/admin/add-franchise"
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-700"
                        >
                            <Plus className="h-4 w-4" />
                            Add centre
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Centre
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    City / State
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Phone
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Address
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                        {appliedSearch
                                            ? "No centres match your search."
                                            : "No franchise centres yet. Add one to get started."}
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((fr) => (
                                    <tr key={fr.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <div className="text-sm font-semibold text-gray-900">{fr.name}</div>
                                            <div className="text-xs text-gray-500">{fr.email || "—"}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                            <div>{fr.city || fr.region || "—"}</div>
                                            <div className="text-xs text-gray-500">{fr.state || "—"}</div>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                            {fr.phone || "—"}
                                        </td>
                                        <td className="max-w-xs px-4 py-3 text-sm text-gray-600">
                                            {fr.address ? truncate(fr.address) : "—"}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                                    (fr.status || "").toLowerCase() === "active"
                                                        ? "bg-emerald-50 text-emerald-700"
                                                        : "bg-amber-50 text-amber-700"
                                                }`}
                                            >
                                                {fr.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 text-right">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(fr)}
                                                className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal
                isOpen={editing != null}
                onClose={closeEdit}
                title={editing ? `Edit centre — ${editing.name}` : "Edit centre"}
                size="lg"
            >
                <form className="space-y-4" onSubmit={handleSave}>
                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Centre name" required>
                            <input
                                className={inputClass}
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                required
                            />
                        </Field>
                        <Field label="Status">
                            <select
                                className={inputClass}
                                value={form.status}
                                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                            >
                                <option>Active</option>
                                <option>Inactive</option>
                                <option>Pending</option>
                                <option>On Hold</option>
                            </select>
                        </Field>
                        <Field label="City">
                            <input
                                className={inputClass}
                                value={form.city}
                                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))}
                            />
                        </Field>
                        <Field label="State">
                            <input
                                className={inputClass}
                                value={form.state}
                                onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
                            />
                        </Field>
                        <Field label="Country">
                            <input
                                className={inputClass}
                                value={form.country}
                                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                            />
                        </Field>
                        <Field label="Postal code">
                            <input
                                className={inputClass}
                                value={form.postalCode}
                                onChange={(e) => setForm((p) => ({ ...p, postalCode: e.target.value }))}
                            />
                        </Field>
                        <Field label="Phone (10 digits)">
                            <input
                                className={inputClass}
                                value={form.phone}
                                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))}
                                inputMode="numeric"
                                placeholder="9876543210"
                            />
                        </Field>
                        <Field label="Contact email">
                            <input
                                type="email"
                                className={inputClass}
                                value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                            />
                        </Field>
                    </div>

                    <Field label="Full address">
                        <textarea
                            className={`${inputClass} min-h-[88px]`}
                            rows={3}
                            value={form.address}
                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            placeholder="Street, area, landmark…"
                        />
                    </Field>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3">
                        <div className="flex gap-2">
                            <Button type="submit" size="sm" disabled={saving || deleting}>
                                {saving ? "Saving…" : "Save to server"}
                            </Button>
                            <Button type="button" variant="outline" size="sm" onClick={closeEdit} disabled={saving || deleting}>
                                Cancel
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-600 hover:bg-red-50"
                            onClick={() => void handleDelete()}
                            disabled={saving || deleting}
                        >
                            <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                            {deleting ? "Deleting…" : "Delete centre"}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100";

function Field({
    label,
    required,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
            <span>
                {label}
                {required ? <span className="text-orange-600"> *</span> : null}
            </span>
            {children}
        </label>
    );
}
