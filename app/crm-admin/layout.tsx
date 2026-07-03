import type { Metadata } from "next";
import "./crm-admin.css";

export const metadata: Metadata = {
    title: "CRM Admin | T.I.M.E. Kids",
    robots: { index: false, follow: false },
};

export default function CrmAdminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
