import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Content Admin | T.I.M.E. Kids",
    robots: { index: false, follow: false },
};

export default function ContentAdminLayout({ children }: { children: React.ReactNode }) {
    return children;
}
