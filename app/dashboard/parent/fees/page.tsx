"use client";

import { useEffect, useState } from "react";
import { CreditCard } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import {
    ParentFeeDetailsView,
    type FeeSummaryPayload,
} from "@/components/dashboard/parent/ParentFeeDetailsView";

export default function FeesPage() {
    const { authFetch } = useAuth();
    const [data, setData] = useState<FeeSummaryPayload | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const summary = await authFetch<FeeSummaryPayload>("/students/parent/fees/summary/");
                if (!cancelled) setData(summary);
            } catch {
                if (!cancelled) setData(null);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch]);

    return (
        <div className="space-y-6">
            {(data?.student?.parent_name || data?.student?.kid_name) && !loading ? (
                <p className="text-lg font-semibold text-slate-800">
                    Welcome {data?.student?.parent_name || "Parent"}
                </p>
            ) : null}

            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Fee</h1>
                        <p className="text-sm text-orange-700">Pending dues and paid history shared by your centre.</p>
                    </div>
                </div>
            </section>

            <ParentFeeDetailsView data={data} loading={loading} />
        </div>
    );
}
