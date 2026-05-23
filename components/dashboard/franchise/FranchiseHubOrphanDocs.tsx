"use client";

import type { FranchiseHubDoc } from "@/components/dashboard/franchise/FranchiseResourceFileRow";
import { FranchiseResourceFileRow } from "@/components/dashboard/franchise/FranchiseResourceFileRow";

export function FranchiseHubOrphanDocs({
    groups,
}: {
    groups: Map<string, FranchiseHubDoc[]>;
}) {
    if (groups.size === 0) return null;

    const entries = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

    return (
        <section className="mt-6 space-y-4 rounded-xl border border-dashed border-slate-300/80 bg-slate-50/80 p-4 sm:p-5">
            <div>
                <h2 className="text-base font-semibold text-slate-900">Additional uploads</h2>
                <p className="mt-1 text-sm text-slate-600">
                    Files shared by head office that are not listed in the checklist above.
                </p>
            </div>
            {entries.map(([heading, docs]) => (
                <div key={heading} className="space-y-2">
                    <h3 className="rounded-full border border-slate-300/55 bg-slate-200/95 px-4 py-2 text-sm font-semibold font-serif text-[#f58220]">
                        {heading}
                    </h3>
                    <div className="space-y-2 pl-1 sm:pl-2">
                        {docs.map((doc) => (
                            <FranchiseResourceFileRow key={doc.id} doc={doc} />
                        ))}
                    </div>
                </div>
            ))}
        </section>
    );
}
