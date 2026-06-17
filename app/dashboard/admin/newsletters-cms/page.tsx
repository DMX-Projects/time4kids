"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { useAdminData } from "@/components/dashboard/admin/AdminDataProvider";
import { ParentNewsletterCmsPanel } from "@/components/dashboard/ParentNewsletterCmsPanel";
import { useToast } from "@/components/ui/Toast";

export default function AdminNewslettersCmsPage() {
    const { authFetch } = useAuth();
    const { franchises } = useAdminData();
    const { showToast } = useToast();

    return (
        <div className="space-y-6">
            <div className="max-w-2xl">
                <h1 className="text-2xl font-semibold text-slate-900">Newsletters</h1>
                <p className="mt-2 text-sm text-slate-600">
                    Uploads go to the <strong>real parent login app</strong> (web and Android) — same API parents use under
                    Sidebar → Newsletter. Choose pan-India, state, city, or specific centres; optional class filter limits
                    which parents see each item. The list below is for head-office tracking, not the parent app UI.
                </p>
            </div>
            <ParentNewsletterCmsPanel mode="admin" authFetch={authFetch} showToast={showToast} franchises={franchises} />
        </div>
    );
}
