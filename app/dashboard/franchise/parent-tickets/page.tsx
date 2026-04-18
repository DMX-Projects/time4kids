"use client";

import { LifeBuoy } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { FranchiseParentTicketsPanel } from "@/components/dashboard/franchise/FranchiseParentTicketsPanel";
import { useToast } from "@/components/ui/Toast";

export default function FranchiseParentTicketsPage() {
    const { authFetch } = useAuth();
    const { showToast } = useToast();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-[#111827] flex items-center gap-2">
                    <LifeBuoy className="w-7 h-7 text-orange-500" />
                    Parent support tickets
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Parents use <strong className="text-[#111827]">Support</strong> after signing in through the parent login. Reply to their messages here — this is not
                    part of the parent sign-in screen.
                </p>
            </div>
            <FranchiseParentTicketsPanel authFetch={authFetch} showToast={showToast} />
        </div>
    );
}
