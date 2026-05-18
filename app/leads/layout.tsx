import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Landing leads | T.I.M.E. Kids",
    robots: { index: false, follow: false },
};

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
    return children;
}
