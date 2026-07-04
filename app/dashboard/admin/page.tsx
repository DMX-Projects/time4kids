"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AdminRootPage() {
    const { user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (user) {
            if (user.isSuperuser) {
                router.replace("/dashboard/admin/locations");
            } else {
                router.replace("/dashboard/admin/hero-slides");
            }
        }
    }, [user, router]);

    return null;
}
