"use client";

import Link from "next/link";
import { ClipboardCheck, FileCheck2 } from "lucide-react";

export default function ApproverDashboardPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Approver dashboard</h1>
                <p className="text-sm text-slate-600 mt-1">
                    Review franchise social uploads and indent requests. Full admin tools stay on the Admin account.
                </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
                <Link
                    href="/dashboard/approver/updates"
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-200 hover:shadow transition-all"
                >
                    <ClipboardCheck className="w-8 h-8 text-amber-600 mb-3" />
                    <h2 className="font-semibold text-slate-900">Social media approvals</h2>
                    <p className="text-sm text-slate-600 mt-1">Approve or reject centre uploads.</p>
                </Link>
                <Link
                    href="/dashboard/approver/indents"
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-amber-200 hover:shadow transition-all"
                >
                    <FileCheck2 className="w-8 h-8 text-amber-600 mb-3" />
                    <h2 className="font-semibold text-slate-900">Indent approvals</h2>
                    <p className="text-sm text-slate-600 mt-1">Process indent requests from centres.</p>
                </Link>
            </div>
        </div>
    );
}
