import type { Metadata } from "next";
import StudentsKitViewPage from "@/components/students-kit/StudentsKitViewPage";
import { getStudentsKitPageBySlug } from "@/config/students-kit-public-pages";
import { fetchStudentsKitPageBySlug } from "@/lib/students-kit-server";

export async function generateMetadata(): Promise<Metadata> {
    const page = await fetchStudentsKitPageBySlug("play-group");
    return {
        title: `${page.shortLabel} Students Kit AY 2026-27 | T.I.M.E. Kids`,
        description: page.imageAlt,
    };
}

export default async function StudentskitPlayGroupPage() {
    const page = await fetchStudentsKitPageBySlug("play-group");
    return <StudentsKitViewPage page={page} />;
}
