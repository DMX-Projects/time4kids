"use client";

import { useRouter } from "next/navigation";
import { Settings, LogOut } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useParentData } from "@/components/dashboard/parent/ParentDataProvider";

export default function ParentSettingsPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const { parentProfile, updateParentProfile, parentProfileLoading } = useParentData();
    const muted = Boolean(parentProfile.notifications_muted);

    const toggleMute = async () => {
        await updateParentProfile({ notifications_muted: !muted });
    };

    const onLogout = () => {
        logout();
        router.replace("/login/");
    };

    return (
        <div className="space-y-6 max-w-lg">
            <section className="bg-white border border-orange-100 rounded-2xl shadow-sm p-6 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-orange-900">Settings</h1>
                        <p className="text-sm text-orange-700">Logout and notification preferences for this portal.</p>
                    </div>
                </div>
            </section>

            <div className="rounded-2xl border border-orange-100 bg-white p-4 space-y-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="font-medium text-orange-900 text-sm">Mute announcement highlights</p>
                        <p className="text-xs text-orange-700">Stops emphasis on notification-style alerts in the app (content still available).</p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={muted}
                        disabled={parentProfileLoading}
                        onClick={() => void toggleMute()}
                        className={`relative h-8 w-14 rounded-full transition-colors ${muted ? "bg-orange-400" : "bg-gray-200"}`}
                    >
                        <span
                            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-transform ${muted ? "left-7" : "left-1"}`}
                        />
                    </button>
                </div>
            </div>

            <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                <Button
                    type="button"
                    onClick={onLogout}
                    className="w-full bg-[#FF922B] hover:brightness-105 text-white flex items-center justify-center gap-2"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </Button>
            </div>
        </div>
    );
}
