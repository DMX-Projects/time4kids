"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { AccessLoading } from "@/components/auth/AccessLoading";

/** Visiting `/dashboard` sends users to `/dashboard/{role}` after auth is ready. */
export default function DashboardRootPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.replace("/login/");
            return;
        }
        router.replace(`/dashboard/${user.role}`);
    }, [loading, user, router]);

    return <AccessLoading />;
}
