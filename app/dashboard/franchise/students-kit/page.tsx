
'use client';

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    FranchiseResourceFileRow,
    type FranchiseHubDoc,
} from "@/components/dashboard/franchise/FranchiseResourceFileRow";

export default function StudentsKitPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();

    const [docs, setDocs] = useState<FranchiseHubDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await authFetch<any>("/documents/franchise/documents/category/STUDENTS_KIT/");
                setDocs(Array.isArray(data) ? data : []);
            } catch {
                showToast("Could not load Students Kit documents. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [authFetch, showToast]);

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#111827]">Students Kit</h1>
                <p className="text-sm text-[#374151]">Checklists, inventory, and distribution guidelines.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : docs.length === 0 ? (
                <div className="bg-[#fffaf0] border border-[#E5E7EB] rounded-2xl p-5 text-sm text-[#374151]">
                    No Students Kit documents found for your centre yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {docs.map((doc) => (
                        <FranchiseResourceFileRow key={doc.id} doc={doc} />
                    ))}
                </div>
            )}

            <p className="text-xs text-[#6B7280]">
                Shared by HO for your centre.
            </p>
        </div>
    );
}

