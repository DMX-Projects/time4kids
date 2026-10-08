"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { X } from "lucide-react";
import api from "@/lib/crmApi";
import { SearchableSelect } from "@/components/crm/SearchableSelect";
import type { CrmTeamUser } from "@/components/crm/CrmUsersList";

type TeamLead = {
    id: string;
    kind: string;
    kindLabel: string;
    name: string;
    mobile: string;
    state: string;
    city: string;
    status: string;
    isOpen: boolean;
    createdAt: string | null;
};

type LeadFilter = "open" | "all";

const statusLabel = (s: string) => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const dateLabel = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

type Props = {
    userId: number;
    /** Logged-in user's email (lower-case); the backend refuses to disable your own login. */
    myEmail: string;
    /** Opened from "Disable Login" while the user still had open leads. */
    deactivateAfter?: boolean;
    onClose: () => void;
    /** Called after leads are transferred or the login is disabled, so the Users list can refresh. */
    onChanged: () => void;
};

export default function CrmUserLeadsModal({ userId, myEmail, deactivateAfter = false, onClose, onChanged }: Props) {
    const [owner, setOwner] = useState<CrmTeamUser | null>(null);
    const [leads, setLeads] = useState<TeamLead[]>([]);
    const [targets, setTargets] = useState<CrmTeamUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<LeadFilter>("open");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [targetId, setTargetId] = useState("");
    const [busy, setBusy] = useState(false);

    const load = () => {
        setLoading(true);
        api.get(`/team/${userId}/leads`)
            .then((res) => {
                setOwner(res.data?.user ?? null);
                setLeads(Array.isArray(res.data?.leads) ? res.data.leads : []);
                setTargets(Array.isArray(res.data?.transferTargets) ? res.data.transferTargets : []);
                setSelected(new Set());
            })
            .catch((err) => toast.error(err?.response?.data?.message || "Could not load leads."))
            .finally(() => setLoading(false));
    };

    useEffect(load, [userId]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape" && !busy) onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [busy, onClose]);

    const visible = useMemo(() => (filter === "open" ? leads.filter((l) => l.isOpen) : leads), [leads, filter]);
    const openCount = leads.filter((l) => l.isOpen).length;
    const targetOptions = targets.map((t) => ({
        value: String(t.id),
        label: t.designation ? `${t.name} — ${t.designation}` : t.name,
    }));
    const targetName = targets.find((t) => String(t.id) === targetId)?.name ?? "";
    const allVisibleSelected = visible.length > 0 && visible.every((l) => selected.has(l.id));

    const toggle = (id: string) =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });

    const toggleAll = () =>
        setSelected((prev) => {
            const next = new Set(prev);
            if (allVisibleSelected) visible.forEach((l) => next.delete(l.id));
            else visible.forEach((l) => next.add(l.id));
            return next;
        });

    const deactivate = async (force = false) => {
        if (!owner) return;
        try {
            await api.post(`/team/${owner.id}/status`, { active: false, force });
            toast.success(`Login disabled for ${owner.name}`);
            onChanged();
            onClose();
        } catch (err: any) {
            const data = err?.response?.data || {};
            if (err?.response?.status === 409 && data.needsTransfer) {
                if (window.confirm(`${data.message}\n\nDisable login anyway? Their open leads will stay under their name.`)) {
                    await deactivate(true);
                }
            } else {
                toast.error(data.message || "Could not disable the login.");
            }
        }
    };

    const transfer = async () => {
        if (!owner || !targetId) {
            toast.error("Select who should receive the leads.");
            return;
        }
        const count = selected.size;
        if (!count) return;
        const noun = count === 1 ? "lead" : "leads";
        if (!window.confirm(`Transfer ${count} ${noun} from ${owner.name} to ${targetName}?`)) return;

        setBusy(true);
        try {
            const res = await api.post(`/team/${owner.id}/transfer`, { toUserId: targetId, leadIds: Array.from(selected) });
            const moved = Number(res.data?.moved || 0);
            toast.success(`${moved} ${moved === 1 ? "lead" : "leads"} transferred to ${targetName}`);
            onChanged();
            const remainingOpen = openCount - leads.filter((l) => l.isOpen && selected.has(l.id)).length;
            if (deactivateAfter && owner.isActive && remainingOpen === 0) {
                if (window.confirm(`All open leads moved. Disable login for ${owner.name} now?`)) {
                    await deactivate();
                    return;
                }
            }
            load();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Transfer failed.");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !busy) onClose();
            }}
        >
            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col rounded-xl bg-white shadow-xl">
                <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{owner?.name || "Loading..."}</h3>
                        {owner && (
                            <p className="mt-0.5 text-sm text-gray-600">
                                {[owner.designation, owner.email].filter(Boolean).join(" · ")} ·{" "}
                                <span className={owner.isActive ? "text-green-700" : "text-gray-500"}>
                                    {owner.isActive ? "Active" : "Inactive"}
                                </span>
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {owner?.isActive && owner.email.trim().toLowerCase() !== myEmail && (
                            <button
                                type="button"
                                disabled={busy}
                                onClick={() => void deactivate()}
                                title={`Stop ${owner.name} from logging in to the CRM (their leads are kept)`}
                                className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                Disable Login
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={busy}
                            aria-label="Close"
                            className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-60"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-3 border-b border-gray-100 px-5 py-4">
                    {deactivateAfter && owner?.isActive && openCount > 0 && (
                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            Transfer {owner.name}&apos;s {openCount} open leads to another user, then disable their login.
                        </div>
                    )}
                    <p className="text-sm text-gray-600">
                        Move leads to another team member: pick who should receive them, tick the leads below (the top box ticks all), then
                        click <strong>Transfer</strong>.
                    </p>
                    <div className="flex flex-col gap-3 md:flex-row md:items-end">
                        <div className="flex-1 md:max-w-sm">
                            <label className="mb-1.5 block text-sm font-semibold text-gray-700">Transfer to</label>
                            <SearchableSelect options={targetOptions} value={targetId} onChange={setTargetId} placeholder="Select user" searchable />
                        </div>
                        <button
                            type="button"
                            disabled={busy || !selected.size || !targetId}
                            onClick={() => void transfer()}
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                        >
                            Transfer ({selected.size})
                        </button>
                    </div>
                    <div className="flex gap-2">
                        {(["open", "all"] as LeadFilter[]).map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setFilter(f)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                {f === "open" ? `Open (${openCount})` : `All (${leads.length})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-auto px-5 py-3">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-white">
                            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="py-2 pr-3">
                                    <input type="checkbox" checked={allVisibleSelected} onChange={toggleAll} aria-label="Select all" />
                                </th>
                                <th className="py-2 pr-3">Name</th>
                                <th className="py-2 pr-3">Type</th>
                                <th className="py-2 pr-3">Mobile</th>
                                <th className="py-2 pr-3">State / City</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2">Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">Loading...</td>
                                </tr>
                            )}
                            {!loading && visible.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-gray-500">No leads.</td>
                                </tr>
                            )}
                            {!loading &&
                                visible.map((l) => (
                                    <tr key={l.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2.5 pr-3">
                                            <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} aria-label={`Select ${l.name}`} />
                                        </td>
                                        <td className="py-2.5 pr-3">
                                            <Link href={`/crm-admin/leads/${l.id}`} className="font-medium text-blue-700 hover:underline">
                                                {l.name || "—"}
                                            </Link>
                                        </td>
                                        <td className="py-2.5 pr-3 text-gray-700">{l.kindLabel}</td>
                                        <td className="py-2.5 pr-3 text-gray-700">{l.mobile || "—"}</td>
                                        <td className="py-2.5 pr-3 text-gray-700">{[l.state, l.city].filter(Boolean).join(" / ") || "—"}</td>
                                        <td className="py-2.5 pr-3">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${l.isOpen ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                                                {statusLabel(l.status)}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-gray-600">{dateLabel(l.createdAt)}</td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
