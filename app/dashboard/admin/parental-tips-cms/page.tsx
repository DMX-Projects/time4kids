"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { ParentParentalTipsCmsPanel } from "@/components/dashboard/ParentParentalTipsCmsPanel";
import { useToast } from "@/components/ui/Toast";

export default function AdminParentalTipsCmsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();

    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-slate-900">Parental Tips</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Publish tips for the <strong>parent app</strong> (web and mobile) — Sidebar → Parental Tips. Centres
                    can also add tips for their parents. Supports PDF, Word, video links, and audio. Optional class
                    filter and publish scope (pan-India, state, city, or specific centres).
                </p>
            </div>
            <ParentParentalTipsCmsPanel mode="admin" authFetch={authFetch} showToast={showToast} franchises={franchises} />
        </div>
    );
}
