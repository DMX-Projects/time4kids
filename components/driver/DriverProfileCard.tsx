"use client";

import { CreditCard, Hash, Mail, Phone, ShieldCheck } from "lucide-react";
import { mediaUrl } from "@/lib/api-client";

export type DriverProfileData = {
    id: number;
    user: {
        id: number;
        email: string;
        full_name: string;
    };
    phone: string;
    service_number?: string;
    license_number?: string;
    license_document?: string | null;
    vehicle_rc?: string | null;
    vehicle_insurance?: string | null;
    is_active?: boolean;
    created_at?: string;
};

export function DriverProfileCard({
    profile,
    highlighted = false,
}: {
    profile: DriverProfileData;
    highlighted?: boolean;
}) {
    return (
        <div
            className={`rounded-2xl border bg-white p-5 shadow-sm ${
                highlighted ? "border-green-400 ring-2 ring-green-100" : "border-[#E5E7EB]"
            }`}
        >
            <div className="space-y-3">
                <div>
                    <h3 className="text-lg font-bold text-[#111827]">{profile.user?.full_name || "—"}</h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-tight text-blue-600">
                        <ShieldCheck className="h-3 w-3" />
                        Active Driver Account
                    </div>
                </div>

                <div className="space-y-1.5 text-sm text-[#4B5563]">
                    <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-[#9CA3AF]" />
                        <span className="truncate">{profile.user?.email || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#9CA3AF]" />
                        <span>{profile.phone || "—"}</span>
                    </div>
                    {profile.service_number ? (
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-[#9CA3AF]" />
                            <span>Service: {profile.service_number}</span>
                        </div>
                    ) : null}
                    {profile.license_number ? (
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-[#9CA3AF]" />
                            <span>License: {profile.license_number}</span>
                        </div>
                    ) : null}
                </div>

                {(profile.license_document || profile.vehicle_rc || profile.vehicle_insurance) && (
                    <div className="flex flex-wrap gap-2 pt-1">
                        {profile.license_document ? (
                            <a
                                href={mediaUrl(profile.license_document) || profile.license_document}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                            >
                                License doc
                            </a>
                        ) : null}
                        {profile.vehicle_rc ? (
                            <a
                                href={mediaUrl(profile.vehicle_rc) || profile.vehicle_rc}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                            >
                                Vehicle RC
                            </a>
                        ) : null}
                        {profile.vehicle_insurance ? (
                            <a
                                href={mediaUrl(profile.vehicle_insurance) || profile.vehicle_insurance}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[10px] font-bold uppercase text-blue-600 hover:underline"
                            >
                                Insurance
                            </a>
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
}
