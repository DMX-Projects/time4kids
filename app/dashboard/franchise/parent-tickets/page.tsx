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
                    Parent Support
                </h1>
                <p className="text-sm text-[#374151] mt-1">
                    Parents raise tickets from <strong className="text-[#111827]">Support</strong> in the parent login sidebar. Reply to their messages here.
                </p>
            </div>
            <FranchiseParentTicketsPanel authFetch={authFetch} showToast={showToast} />
        </div>
    );
}
