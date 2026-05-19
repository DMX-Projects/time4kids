import {
    getStudentsKitPageBySlug,
    type StudentsKitPageConfig,
} from "@/config/students-kit-public-pages";
import { resolveCmsMediaUrl } from "@/lib/api-client";

export type StudentsKitPageApi = {
    slug: string;
    title: string;
    short_label: string;
    public_path: string;
    image_alt: string;
    link_label: string;
    row_key: string;
    academic_year: string;
    image: string | null;
    pdf: string | null;
    order: number;
    is_active: boolean;
};

function apiBaseForServer(): string {
    const internal = (process.env.INTERNAL_API_URL || process.env.DJANGO_DEV_BACKEND_URL || "").replace(/\/$/, "");
    if (internal) return `${internal}/api`;
    const port = process.env.NEXT_PUBLIC_BACKEND_PORT?.trim() || "8000";
    return `http://127.0.0.1:${port}/api`;
}

export function mergeStudentsKitApiWithFallback(
    api: StudentsKitPageApi,
    fallback: StudentsKitPageConfig,
): StudentsKitPageConfig {
    const imageFromCms = api.image ? resolveCmsMediaUrl(api.image) : "";
    const pdfFromCms = api.pdf ? resolveCmsMediaUrl(api.pdf) : "";
    return {
        slug: api.slug || fallback.slug,
        path: api.public_path || fallback.path,
        title: api.title?.trim() || fallback.title,
        shortLabel: api.short_label?.trim() || fallback.shortLabel,
        imageAlt: api.image_alt?.trim() || fallback.imageAlt,
        imageSrc: imageFromCms || fallback.imageSrc,
        pdfSrc: pdfFromCms || fallback.pdfSrc,
    };
}

export async function fetchStudentsKitPageBySlug(slug: string): Promise<StudentsKitPageConfig> {
    const fallback = getStudentsKitPageBySlug(slug);
    if (!fallback) {
        throw new Error(`Unknown students kit slug: ${slug}`);
    }
    try {
        const res = await fetch(`${apiBaseForServer()}/common/students-kit-pages/${slug}/`, {
            next: { revalidate: 60 },
        });
        if (!res.ok) return fallback;
        const data = (await res.json()) as StudentsKitPageApi;
        return mergeStudentsKitApiWithFallback(data, fallback);
    } catch {
        return fallback;
    }
}
