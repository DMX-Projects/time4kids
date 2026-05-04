"use client";
import { useAuth } from "@/components/auth/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const dynamic = "force-dynamic";

export default function DriverLoginPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user?.role === "driver") {
            router.replace("/driver/trip");
        }
    }, [user, loading, router]);

    if (loading) return null; // Or a spinner

    return <LoginPageContent variant="driver" />;
}
