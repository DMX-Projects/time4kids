
'use client';

import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";

type FranchiseDoc = {
    id: number;
    title: string;
    description: string;
    file: string;
    display_title?: string;
    academic_year?: string;
};

export default function FranchiseReferralIncentivesPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();

    const [docs, setDocs] = useState<FranchiseDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await authFetch<any>("/documents/franchise/documents/category/FRANCHISE_REFERRAL_INCENTIVES/");
                setDocs(Array.isArray(data) ? data : []);
            } catch {
                showToast("Could not load Franchise Referral Incentives documents. Please try again.", "error");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <h1 className="text-2xl font-semibold text-[#111827]">Franchise Referral Incentives</h1>
                <p className="text-sm text-[#374151]">Referral slabs, approval steps, and payout trackers.</p>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : docs.length === 0 ? (
                <div className="bg-[#fffaf0] border border-[#E5E7EB] rounded-2xl p-5 text-sm text-[#374151]">
                    No Franchise Referral Incentives documents found for your centre yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {docs.map((doc) => (
                        <div key={doc.id} className="flex items-start justify-between gap-4 border border-[#E5E7EB] rounded-2xl p-4 bg-white">
                            <div>
                                <p className="text-sm font-semibold text-[#111827]">{doc.display_title || doc.title}</p>
                                {doc.description ? <p className="text-xs text-[#6B7280] mt-1">{doc.description}</p> : null}
                            </div>

                            <a
                                href={mediaUrl(doc.file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#74C0FC] text-white hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#74C0FC] focus-visible:ring-offset-2"
                            >
                                View
                                <FileText className="w-4 h-4" />
                            </a>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-[#6B7280]">
                These documents come from the Resource Hub document library.
            </p>
        </div>
    );
}

