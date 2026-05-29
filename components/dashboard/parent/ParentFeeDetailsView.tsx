"use client";

import { useMemo } from "react";

export type FeeSummaryLine = {
    serial: number;
    fee_type: string;
    total_fee: number;
    discount: number;
    net_payable: number;
    amount_paid: number;
    balance: number;
    due_date: string;
    status: string;
};

export type FeeSummaryPayment = {
    amount_paid: number;
    payment_type: string;
    mode_of_payment: string;
    date_of_payment: string;
    fee_structure_name?: string;
};

export type FeeSummaryPayload = {
    source?: "legacy" | "records" | "empty";
    legacy_configured?: boolean;
    student?: {
        parent_name?: string;
        kid_name?: string;
        centre_name?: string;
        enrollment_date?: string;
        fee_structure_name?: string;
        id_card_no?: string;
        course_name?: string;
    };
    alerts?: {
        dropped_out?: boolean;
        drop_reason?: string;
        refund_done?: boolean;
    };
    lookup_id_card?: string;
    lookup_message?: string;
    lines?: FeeSummaryLine[];
    totals?: {
        total_fee?: number;
        discount?: number;
        net_payable?: number;
        amount_paid?: number;
        balance?: number;
    };
    payments?: FeeSummaryPayment[];
};

function money(n: number | undefined) {
    return Number(n || 0).toFixed(2);
}

function StatusBadge({ status }: { status: string }) {
    const normalized = (status || "").toLowerCase();
    const cls =
        normalized === "paid" || normalized === "waived"
            ? "bg-green-100 text-green-800 border-green-200"
            : normalized === "overdue"
              ? "bg-red-100 text-red-800 border-red-200"
              : "bg-orange-100 text-orange-800 border-orange-200";
    return (
        <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}>
            {status || "Pending"}
        </span>
    );
}

function InfoTable({
    title,
    rows,
}: {
    title: string;
    rows: { label: string; value: string }[];
}) {
    return (
        <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
            <h2 className="text-lg font-semibold text-orange-900 mb-3">{title}</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm border border-orange-100">
                    <thead className="bg-orange-50 text-orange-900">
                        <tr>
                            {rows.map((row) => (
                                <th key={row.label} className="text-left p-2 border border-orange-100">
                                    {row.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            {rows.map((row) => (
                                <td key={row.label} className="p-2 border border-orange-100">
                                    {row.value || "—"}
                                </td>
                            ))}
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>
    );
}

export function ParentFeeDetailsView({ data, loading }: { data: FeeSummaryPayload | null; loading: boolean }) {
    const student = data?.student || {};
    const alerts = data?.alerts || {};
    const lines = data?.lines || [];
    const totals = data?.totals || {};
    const payments = data?.payments || [];

    const hasLines = lines.length > 0;
    const sourceLabel = useMemo(() => {
        if (data?.source === "legacy") return "Live fee records (TiKES)";
        if (data?.source === "records") return "Centre-entered fee records";
        return "";
    }, [data?.source]);

    if (loading) {
        return <p className="text-sm text-orange-700">Loading fee details…</p>;
    }

    if (!hasLines) {
        const idCard = student.id_card_no || data?.lookup_id_card || "";
        return (
            <div className="space-y-4">
                {student.kid_name || idCard ? (
                    <InfoTable
                        title="Student Fee Details"
                        rows={[
                            { label: "Kid's Name", value: student.kid_name || "—" },
                            { label: "Center", value: student.centre_name || "—" },
                            { label: "ID Card No", value: idCard || "—" },
                        ]}
                    />
                ) : null}
                <div className="rounded-2xl border border-orange-100 bg-white p-6 text-sm text-orange-800">
                    <p>No fee details are available yet for this student.</p>
                    {data?.lookup_message ? (
                        <p className="mt-2 text-orange-700">{data.lookup_message}</p>
                    ) : data?.legacy_configured && idCard ? (
                        <p className="mt-2 text-orange-700">
                            TiKES fee database is connected, but there are no fee records for ID card{" "}
                            <span className="font-semibold">{idCard}</span> in{" "}
                            <span className="font-mono text-xs">fee_payment</span>. The child may not have
                            billing set up in TiKES yet, or the ID card on this login may differ from TiKES.
                        </p>
                    ) : data?.legacy_configured === false ? (
                        <p className="mt-2 text-orange-700">
                            Your centre can add fee entries from the franchise dashboard, or Head Office can connect
                            the legacy fee database on the server.
                        </p>
                    ) : null}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {sourceLabel ? (
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{sourceLabel}</p>
            ) : null}

            {alerts.dropped_out ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-900">
                    <p className="font-semibold">This child has dropped out</p>
                    {alerts.drop_reason ? <p className="mt-1 text-sm">Reason: {alerts.drop_reason}</p> : null}
                </div>
            ) : null}

            {alerts.refund_done ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900">
                    <p className="font-semibold">
                        Fee refund has been processed for this student. Subsequent online payment is not available.
                    </p>
                </div>
            ) : null}

            <InfoTable
                title="Student Fee Details"
                rows={[
                    { label: "Kid's Name", value: student.kid_name || "—" },
                    { label: "Center", value: student.centre_name || "—" },
                    { label: "Enrollment Date", value: student.enrollment_date || "—" },
                ]}
            />

            <InfoTable
                title="Fee Structure"
                rows={[
                    { label: "Fee Structure Name", value: student.fee_structure_name || "—" },
                    { label: "ID Card No", value: student.id_card_no || "—" },
                    { label: "Course", value: student.course_name || "—" },
                ]}
            />

            {!alerts.refund_done ? (
                <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
                    <h2 className="text-lg font-semibold text-orange-900 mb-3">Fee Structure &amp; Payment Status</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[960px] text-sm border border-orange-100">
                            <thead className="bg-orange-50 text-orange-900">
                                <tr>
                                    <th className="text-left p-2 border border-orange-100">S. No.</th>
                                    <th className="text-left p-2 border border-orange-100">Fee Type</th>
                                    <th className="text-right p-2 border border-orange-100">Total Fee</th>
                                    <th className="text-right p-2 border border-orange-100">Discount, if any</th>
                                    <th className="text-right p-2 border border-orange-100">Net Payable</th>
                                    <th className="text-right p-2 border border-orange-100">Amount Paid till date</th>
                                    <th className="text-right p-2 border border-orange-100">Balance Payable</th>
                                    <th className="text-left p-2 border border-orange-100">Due Date</th>
                                    <th className="text-left p-2 border border-orange-100">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lines.map((line) => (
                                    <tr key={`${line.serial}-${line.fee_type}`}>
                                        <td className="p-2 border border-orange-100">{line.serial}</td>
                                        <td className="p-2 border border-orange-100">{line.fee_type}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(line.total_fee)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(line.discount)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(line.net_payable)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(line.amount_paid)}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(line.balance)}</td>
                                        <td className="p-2 border border-orange-100">{line.due_date || "—"}</td>
                                        <td className="p-2 border border-orange-100">
                                            <StatusBadge status={line.status} />
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-orange-50 font-semibold text-orange-900">
                                    <td className="p-2 border border-orange-100" />
                                    <td className="p-2 border border-orange-100">Total</td>
                                    <td className="p-2 border border-orange-100 text-right">{money(totals.total_fee)}</td>
                                    <td className="p-2 border border-orange-100 text-right">{money(totals.discount)}</td>
                                    <td className="p-2 border border-orange-100 text-right">{money(totals.net_payable)}</td>
                                    <td className="p-2 border border-orange-100 text-right">{money(totals.amount_paid)}</td>
                                    <td className="p-2 border border-orange-100 text-right">{money(totals.balance)}</td>
                                    <td className="p-2 border border-orange-100" />
                                    <td className="p-2 border border-orange-100" />
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}

            {payments.length > 0 ? (
                <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-4">
                    <h2 className="text-lg font-semibold text-orange-900 mb-3">Payment Details</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-orange-100">
                            <thead className="bg-orange-50 text-orange-900">
                                <tr>
                                    <th className="text-left p-2 border border-orange-100">Date</th>
                                    <th className="text-left p-2 border border-orange-100">Payment Type</th>
                                    <th className="text-left p-2 border border-orange-100">Mode</th>
                                    <th className="text-right p-2 border border-orange-100">Amount Paid</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map((payment, idx) => (
                                    <tr key={`${payment.date_of_payment}-${idx}`}>
                                        <td className="p-2 border border-orange-100">{payment.date_of_payment || "—"}</td>
                                        <td className="p-2 border border-orange-100">{payment.payment_type || "—"}</td>
                                        <td className="p-2 border border-orange-100">{payment.mode_of_payment || "—"}</td>
                                        <td className="p-2 border border-orange-100 text-right">{money(payment.amount_paid)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ) : null}
        </div>
    );
}
