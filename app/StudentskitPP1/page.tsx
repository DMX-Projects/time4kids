import type { Metadata } from "next";
import StudentsKitViewPage from "@/components/students-kit/StudentsKitViewPage";
import { fetchStudentsKitPageBySlug } from "@/lib/students-kit-server";

export async function generateMetadata(): Promise<Metadata> {
    const page = await fetchStudentsKitPageBySlug("pp1");
    return {
        title: `${page.shortLabel} Students Kit AY 2026-27 | T.I.M.E. Kids`,
        description: page.imageAlt,
    };
}

export default async function StudentskitPP1Page() {
    const page = await fetchStudentsKitPageBySlug("pp1");
    return <StudentsKitViewPage page={page} />;
}
