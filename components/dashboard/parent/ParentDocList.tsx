"use client";

import { useEffect, useState } from "react";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { mediaUrl } from "@/lib/api-client";

type DocRow = { id: number; title: string; file: string };

export function ParentDocList({
    category,
    title,
    description,
    emptyMessage = "Nothing uploaded yet. Your centre can add PDFs from the franchise portal.",
}: {
    category: string;
    title: string;
    description: string;
    emptyMessage?: string;
}) {
    const { authFetch } = useAuth();
    const [docs, setDocs] = useState<DocRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await authFetch<DocRow[]>(`/documents/parent/documents/category/${category}/`);
                if (!cancelled) setDocs(Array.isArray(data) ? data : []);
            } catch {
                if (!cancelled) setDocs([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [authFetch, category]);

    return (
        <div className="space-y-6">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">{title}</h1>
                        <p className="text-sm text-orange-700">{description}</p>
                    </div>
                </div>
            </section>

            {loading && <p className="text-sm text-orange-700">Loading…</p>}

            <ul className="space-y-3">
                {docs.map((d) => (
                    <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-100 bg-white p-4 shadow-sm">
                        <span className="font-medium text-orange-900 text-sm">{d.title}</span>
                        <a
                            href={mediaUrl(d.file)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-xs font-semibold text-orange-800 border border-orange-100 hover:bg-orange-100"
                        >
                            <Download className="w-4 h-4" />
                            View / download
                        </a>
                    </li>
                ))}
            </ul>

            {!loading && docs.length === 0 && (
                <section className="rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 p-6 space-y-3">
                    <p className="text-sm text-orange-900 font-medium">{emptyMessage}</p>
                    <p className="text-xs text-orange-800 leading-relaxed">
                        This area is working — there are no files from your centre yet. When your preschool uploads a document in the
                        franchise portal, it will appear here with a download link.
                    </p>
                </section>
            )}
        </div>
    );
}
