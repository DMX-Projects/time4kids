import type { Metadata } from "next";
import React from "react";
import "./crm-admin.css";
import { CrmLayoutWrapper } from "@/components/crm/CrmLayoutWrapper";

export const metadata: Metadata = {
    title: "CRM Admin | T.I.M.E. Kids",
    robots: { index: false, follow: false },
};

export default function CrmAdminLayout({ children }: { children: React.ReactNode }) {
    return <CrmLayoutWrapper>{children}</CrmLayoutWrapper>;
}
