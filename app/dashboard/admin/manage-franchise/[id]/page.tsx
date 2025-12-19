"use client";

import { useParams } from "next/navigation";
import { ManageFranchiseView } from "../page";

export default function ManageFranchiseDetailPage() {
    const params = useParams<{ id: string }>();
    return <ManageFranchiseView initialFranchiseId={params?.id} />;
}
