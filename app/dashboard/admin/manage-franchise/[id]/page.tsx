"use client";

import { useParams } from "next/navigation";
import { ManageFranchiseView } from "@/components/dashboard/admin/ManageFranchiseView";

export default function ManageFranchiseDetailPage() {
    const params = useParams<{ id: string }>();
    return <ManageFranchiseView initialFranchiseId={params?.id} />;
}
