"use client";



import { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";

import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

import {

    ParentFeeDetailsView,

    type FeeSummaryPayload,

} from "@/components/dashboard/parent/ParentFeeDetailsView";



export default function FeesPage() {

    const { authFetch } = useAuth();

    const { selectedStudent, hasMultipleChildren, studentScopeReady, scopedApiPath } = useParentData();

    const [data, setData] = useState<FeeSummaryPayload | null>(null);

    const [loading, setLoading] = useState(true);



    useEffect(() => {

        if (!studentScopeReady) return;

        let cancelled = false;

        (async () => {

            setLoading(true);

            try {

                const summary = await authFetch<FeeSummaryPayload>(

                    scopedApiPath("/students/parent/fees/summary/"),

                );

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

    }, [authFetch, scopedApiPath, studentScopeReady, selectedStudent?.id]);



    return (

        <div className="space-y-6">

            {!loading ? (

                <h1 className="text-lg font-semibold text-slate-800">

                    {hasMultipleChildren && selectedStudent

                        ? `Fees — ${selectedStudent.name}`

                        : `Welcome ${data?.student?.parent_name || "Parent"}`}

                </h1>

            ) : null}



            <ParentFeeDetailsView data={data} loading={loading} />

        </div>

    );

}

