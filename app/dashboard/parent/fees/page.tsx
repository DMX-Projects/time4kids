"use client";

import { useMemo, useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

type Row = {
    id: number;
    fee_structure_name?: string;
    id_card_no?: string;
    course?: string;
    title: string;
    amount: string | number;
    discount?: string | number;
    amount_paid?: string | number;
    due_date: string;
    paid_on?: string | null;
    status: string;
    notes?: string;
    student_name?: string;
};

const normalizeFees = (data: unknown): Row[] => {
    if (Array.isArray(data)) return data as Row[];
    if (data && typeof data === "object") {
        const obj = data as { results?: unknown; data?: unknown; fees?: unknown };
        if (Array.isArray(obj.results)) return obj.results as Row[];
        if (Array.isArray(obj.data)) return obj.data as Row[];
        if (Array.isArray(obj.fees)) return obj.fees as Row[];
    }
    return [];
};

export default function FeesPage() {
    const { authFetch } = useAuth();
    const { parentProfile, linkedStudents, selectedStudentId } = useParentData();
    const [rows, setRows] = useState<Row[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let c = false;
        (async () => {
            try {
                const data = await authFetch<unknown>("/students/parent/fees/");
                if (!c) setRows(normalizeFees(data));
            } catch {
                if (!c) setRows([]);
            } finally {
                if (!c) setLoading(false);
            }
        })();
        return () => {
            c = true;
        };
    }, [authFetch]);

    const selectedStudent = useMemo(() => {
        if (selectedStudentId) {
            return linkedStudents.find((s) => s.id === selectedStudentId) || null;
        }
        return linkedStudents[0] || null;
    }, [linkedStudents, selectedStudentId]);

    const totals = useMemo(() => {
        const totalFee = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);
        const discount = 0;
        const netPayable = totalFee - discount;
        const amountPaid = rows.reduce((sum, r) => (String(r.status).toUpperCase() === "PAID" ? sum + Number(r.amount || 0) : sum), 0);
        const balance = Math.max(netPayable - amountPaid, 0);
        return { totalFee, discount, netPayable, amountPaid, balance };
    }, [rows]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Fees</h1>
                        <p className="text-sm text-orange-700">Pending dues and paid history shared by your centre.</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}
            {!loading && rows.length === 0 && <p className="text-sm text-orange-700">No fee entries yet.</p>}

            {!loading && rows.length > 0 && (
                <div className="space-y-4">
                    <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
                        <h2 className="text-lg font-semibold text-orange-900 mb-3">Student Fee Details</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-orange-100">
                                <thead className="bg-orange-50 text-orange-900">
                                    <tr>
                                        <th className="text-left p-2 border border-orange-100">Kid&apos;s Name</th>
                                        <th className="text-left p-2 border border-orange-100">Center</th>
                                        <th className="text-left p-2 border border-orange-100">Enrollment Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-2 border border-orange-100">{selectedStudent?.name || rows[0]?.student_name || "—"}</td>
                                        <td className="p-2 border border-orange-100">{parentProfile.franchiseName || "—"}</td>
                                        <td className="p-2 border border-orange-100">{selectedStudent?.dateOfBirth || "—"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-orange-100">
                                <thead className="bg-orange-50 text-orange-900">
                                    <tr>
                                        <th className="text-left p-2 border border-orange-100">Fee Structure Name</th>
                                        <th className="text-left p-2 border border-orange-100">ID Card No</th>
                                        <th className="text-left p-2 border border-orange-100">Course</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-2 border border-orange-100">{rows[0]?.fee_structure_name || "—"}</td>
                                        <td className="p-2 border border-orange-100">{rows[0]?.id_card_no || "—"}</td>
                                        <td className="p-2 border border-orange-100">{rows[0]?.course || "—"}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
                        <h2 className="text-lg font-semibold text-orange-900 mb-3">Fee Structure &amp; Payment Status</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm border border-orange-100">
                                <thead className="bg-orange-50 text-orange-900">
                                    <tr>
                                        <th className="text-left p-2 border border-orange-100">S. No.</th>
                                        <th className="text-left p-2 border border-orange-100">Fee Type</th>
                                        <th className="text-right p-2 border border-orange-100">Total Fee</th>
                                        <th className="text-right p-2 border border-orange-100">Discount</th>
                                        <th className="text-right p-2 border border-orange-100">Net Payable</th>
                                        <th className="text-right p-2 border border-orange-100">Amount Paid</th>
                                        <th className="text-right p-2 border border-orange-100">Balance</th>
                                        <th className="text-left p-2 border border-orange-100">Due Date</th>
                                        <th className="text-left p-2 border border-orange-100">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r, idx) => {
                                        const amount = Number(r.amount || 0);
                                        const isPaid = String(r.status).toUpperCase() === "PAID";
                                        const discount = Number(r.discount || 0);
                                        const netPayable = amount - discount;
                                        const paidAmount = Number(r.amount_paid ?? (isPaid ? amount : 0));
                                        const balance = Math.max(netPayable - paidAmount, 0);
                                        return (
                                            <tr key={r.id}>
                                                <td className="p-2 border border-orange-100">{idx + 1}</td>
                                                <td className="p-2 border border-orange-100">{r.title}</td>
                                                <td className="p-2 border border-orange-100 text-right">{amount.toFixed(2)}</td>
                                                <td className="p-2 border border-orange-100 text-right">{discount.toFixed(2)}</td>
                                                <td className="p-2 border border-orange-100 text-right">{netPayable.toFixed(2)}</td>
                                                <td className="p-2 border border-orange-100 text-right">{paidAmount.toFixed(2)}</td>
                                                <td className="p-2 border border-orange-100 text-right">{balance.toFixed(2)}</td>
                                                <td className="p-2 border border-orange-100">{r.due_date || "—"}</td>
                                                <td className="p-2 border border-orange-100">
                                                    <span
                                                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                            isPaid
                                                                ? "bg-green-100 text-green-800 border border-green-200"
                                                                : "bg-orange-100 text-orange-800 border border-orange-200"
                                                        }`}
                                                    >
                                                        {r.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    <tr className="bg-orange-50 font-semibold text-orange-900">
                                        <td className="p-2 border border-orange-100" />
                                        <td className="p-2 border border-orange-100 text-right">Total</td>
                                        <td className="p-2 border border-orange-100 text-right">{totals.totalFee.toFixed(2)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{totals.discount.toFixed(2)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{totals.netPayable.toFixed(2)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{totals.amountPaid.toFixed(2)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{totals.balance.toFixed(2)}</td>
                                        <td className="p-2 border border-orange-100" />
                                        <td className="p-2 border border-orange-100" />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
}
