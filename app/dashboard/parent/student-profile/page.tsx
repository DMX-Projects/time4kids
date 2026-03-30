"use client";

import type React from "react";
import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function ParentDetailsPage() {
    const { user } = useAuth();
    const { parentProfile, parentProfileLoading } = useParentData();

    return (
        <div className="space-y-6">
            <Section
                id="parent-details"
                title="Parent / guardian details"
                description="Your contact information on file with the centre. Student records are managed by the school."
                icon={<User className="w-5 h-5 text-orange-600" />}
            >
                <p className="text-sm text-orange-700">
                    To change your phone, address, or name, use{" "}
                    <Link href="/dashboard/parent/profile" className="font-semibold text-orange-800 underline underline-offset-2">
                        Edit contact details
                    </Link>
                    .
                </p>
            </Section>

            <div className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm space-y-4">
                {parentProfileLoading ? (
                    <p className="text-sm text-orange-700">Loading your details…</p>
                ) : (
                    <dl className="grid gap-4 text-sm text-orange-900">
                        <div className="flex flex-wrap gap-2 border-b border-orange-50 pb-3">
                            <dt className="font-semibold text-orange-700 min-w-[8rem]">Name</dt>
                            <dd>{parentProfile.name || user?.fullName || "—"}</dd>
                        </div>
                        <div className="flex flex-wrap gap-2 border-b border-orange-50 pb-3">
                            <dt className="font-semibold text-orange-700 min-w-[8rem]">Email</dt>
                            <dd>{parentProfile.email || user?.email || "—"}</dd>
                        </div>
                        <div className="flex flex-wrap gap-2 border-b border-orange-50 pb-3">
                            <dt className="font-semibold text-orange-700 min-w-[8rem]">Mobile</dt>
                            <dd>{parentProfile.phone || "—"}</dd>
                        </div>
                        <div className="flex flex-wrap gap-2 border-b border-orange-50 pb-3">
                            <dt className="font-semibold text-orange-700 min-w-[8rem]">City</dt>
                            <dd>{parentProfile.city || "—"}</dd>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <dt className="font-semibold text-orange-700 min-w-[8rem]">Address</dt>
                            <dd className="max-w-xl whitespace-pre-wrap">{parentProfile.address || "—"}</dd>
                        </div>
                        {(parentProfile.franchiseName || parentProfile.franchisePhone || parentProfile.franchiseEmail) && (
                            <div className="rounded-xl bg-orange-50/80 border border-orange-100 p-4 mt-2 space-y-1">
                                <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Your centre</p>
                                {parentProfile.franchiseName && <p className="text-sm text-orange-900">{parentProfile.franchiseName}</p>}
                                {parentProfile.franchisePhone && (
                                    <p className="text-sm text-orange-800">
                                        Phone: <a href={`tel:${parentProfile.franchisePhone}`}>{parentProfile.franchisePhone}</a>
                                    </p>
                                )}
                                {parentProfile.franchiseEmail && (
                                    <p className="text-sm text-orange-800">
                                        Email: <a href={`mailto:${parentProfile.franchiseEmail}`}>{parentProfile.franchiseEmail}</a>
                                    </p>
                                )}
                            </div>
                        )}
                    </dl>
                )}
            </div>
        </div>
    );
}

function Section({ id, title, description, icon, children }: { id: string; title: string; description: string; icon: React.ReactNode; children?: React.ReactNode }) {
    return (
        <section id={id} className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-3">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">{icon}</div>
                <div>
                    <h2 className="text-lg font-semibold text-orange-900">{title}</h2>
                    <p className="text-sm text-orange-700">{description}</p>
                </div>
            </div>
            {children && <div>{children}</div>}
        </section>
    );
}
