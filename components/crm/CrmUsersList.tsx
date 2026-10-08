"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";
import { UserPlus, Users } from "lucide-react";
import api from "@/lib/crmApi";
import { normalizeRole, useAuth } from "@/components/auth/AuthProvider";
import { AccessLoading } from "@/components/auth/AccessLoading";
import { isCrmSuperAdminUser } from "@/lib/crmSuperAdmin";
import CrmUserLeadsModal from "@/components/crm/CrmUserLeads";
import CrmUserFormModal, { type CrmTeamFormOptions } from "@/components/crm/CrmUserFormModal";

export type CrmTeamUser = {
    id: number;
    name: string;
    fullName: string;
    email: string;
    designation: string;
    phone: string;
    states: string;
    cities: string;
    reportsToId: number | null;
    reportsToName: string;
    handlesFranchise: boolean;
    handlesAdmission: boolean;
    sheetConfigured: boolean;
    canEdit: boolean;
    isActive: boolean;
    isSuperAdmin: boolean;
};

type StatusFilter = "active" | "inactive";

export function CrmSuperAdminOnly({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && !user) router.replace("/crm-admin/login");
    }, [loading, user, router]);

    if (loading || !user) return <AccessLoading />;
    if (normalizeRole(user.role) !== "crm" || !isCrmSuperAdminUser(user)) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center px-4">
                <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                    <h1 className="text-lg font-bold text-gray-900">Users page not available</h1>
                    <p className="mt-2 text-sm text-gray-600">Only CRM Super Admins can manage users.</p>
                    <Link href="/crm-admin" className="btn-primary mt-5 inline-block !py-2 !px-4 text-sm">
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        );
    }
    return <>{children}</>;
}

function UsersTable() {
    const { user: me } = useAuth();
    const myEmail = (me?.email || "").trim().toLowerCase();
    const [users, setUsers] = useState<CrmTeamUser[]>([]);
    const [leadsFor, setLeadsFor] = useState<{ userId: number; deactivateAfter: boolean } | null>(null);
    const [formOptions, setFormOptions] = useState<CrmTeamFormOptions | null>(null);
    const [formFor, setFormFor] = useState<{ user: CrmTeamUser | null } | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
    const [busyId, setBusyId] = useState<number | null>(null);

    const load = () => {
        setLoading(true);
        api.get("/team")
            .then((res) => {
                setUsers(Array.isArray(res.data?.users) ? res.data.users : []);
                setFormOptions(res.data?.formOptions ?? null);
            })
            .catch((err) => toast.error(err?.response?.data?.message || "Could not load users."))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users.filter((u) => {
            if (statusFilter === "active" && !u.isActive) return false;
            if (statusFilter === "inactive" && u.isActive) return false;
            if (!q) return true;
            return [u.name, u.email, u.designation, u.states].some((v) => v.toLowerCase().includes(q));
        });
    }, [users, search, statusFilter]);

    const setActive = async (u: CrmTeamUser, active: boolean) => {
        if (!active && !window.confirm(`Disable login for ${u.name}? They will no longer be able to log in to the CRM. Their leads are kept.`)) return;
        setBusyId(u.id);
        try {
            await api.post(`/team/${u.id}/status`, { active });
            toast.success(active ? `Login enabled for ${u.name}` : `Login disabled for ${u.name}`);
            load();
        } catch (err: any) {
            const data = err?.response?.data || {};
            if (err?.response?.status === 409 && data.needsTransfer) {
                if (window.confirm(`${data.message}\n\nOpen their leads now to transfer them?`)) {
                    setLeadsFor({ userId: u.id, deactivateAfter: true });
                }
            } else {
                toast.error(data.message || "Could not update the user.");
            }
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <Toaster position="top-center" />
            <div className="mb-6 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-blue-700" />
                    <h1 className="text-xl font-bold text-gray-800 md:text-2xl">Users</h1>
                </div>
                <button
                    type="button"
                    disabled={!formOptions}
                    onClick={() => setFormFor({ user: null })}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                    <UserPlus className="h-4 w-4" />
                    Add User
                </button>
            </div>

            <div className="rounded-xl bg-white p-6 shadow-lg">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, email, designation, state"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm md:max-w-sm"
                    />
                    <div className="flex gap-2">
                        {(["active", "inactive"] as StatusFilter[]).map((f) => (
                            <button
                                key={f}
                                type="button"
                                onClick={() => setStatusFilter(f)}
                                className={`rounded-lg px-3 py-1.5 text-sm font-medium capitalize ${statusFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs uppercase tracking-wide text-gray-500">
                                <th className="py-2 pr-3">Name</th>
                                <th className="py-2 pr-3">Designation</th>
                                <th className="py-2 pr-3">Email</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-gray-500">Loading...</td>
                                </tr>
                            )}
                            {!loading && visible.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-center text-gray-500">No users found.</td>
                                </tr>
                            )}
                            {!loading &&
                                visible.map((u) => (
                                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50">
                                        <td className="py-2.5 pr-3 font-medium text-gray-900">{u.name}</td>
                                        <td className="py-2.5 pr-3 text-gray-700">{u.designation || "—"}</td>
                                        <td className="py-2.5 pr-3 text-gray-600">{u.email}</td>
                                        <td className="py-2.5 pr-3">
                                            <span
                                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}
                                            >
                                                {u.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setLeadsFor({ userId: u.id, deactivateAfter: false })}
                                                    title={`See ${u.name}'s leads and move them to another team member`}
                                                    className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    View / Transfer Leads
                                                </button>
                                                {u.canEdit && formOptions && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormFor({ user: u })}
                                                        title={`Change ${u.name}'s details, states or password`}
                                                        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                {u.email.trim().toLowerCase() !== myEmail && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === u.id}
                                                        onClick={() => void setActive(u, !u.isActive)}
                                                        title={
                                                            u.isActive
                                                                ? `Stop ${u.name} from logging in to the CRM (their leads are kept)`
                                                                : `Allow ${u.name} to log in to the CRM again`
                                                        }
                                                        className={`rounded-lg px-3 py-1 text-xs font-medium text-white disabled:opacity-60 ${u.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
                                                    >
                                                        {u.isActive ? "Disable Login" : "Enable Login"}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {leadsFor && (
                <CrmUserLeadsModal
                    userId={leadsFor.userId}
                    myEmail={myEmail}
                    deactivateAfter={leadsFor.deactivateAfter}
                    onClose={() => setLeadsFor(null)}
                    onChanged={load}
                />
            )}

            {formFor && formOptions && (
                <CrmUserFormModal
                    options={formOptions}
                    user={formFor.user}
                    onClose={() => setFormFor(null)}
                    onSaved={load}
                />
            )}
        </div>
    );
}

export default function CrmUsersList() {
    return (
        <CrmSuperAdminOnly>
            <UsersTable />
        </CrmSuperAdminOnly>
    );
}
